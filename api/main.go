// Command amir-api is the lean production API for amir-khosravi.de.
// Stdlib only (plus github.com/jackc/pgx/v5/stdlib for Postgres).
package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/mail"
	"net/smtp"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib" // register the "pgx" database/sql driver
)

// ---------------------------------------------------------------- config

type config struct {
	port      string
	dbURL     string
	storeFile string
	ipSalt    string

	smtpHost, smtpPort, smtpUser, smtpPass, contactTo string

	studioURL  string
	ingestKey  string
	studio2URL string
	studio2Key string
}

func loadConfig() config {
	ipSalt := os.Getenv("IP_SALT")
	if ipSalt == "" {
		b := make([]byte, 16)
		if _, err := rand.Read(b); err != nil {
			log.Fatalf("config: cannot generate IP_SALT: %v", err)
		}
		ipSalt = hex.EncodeToString(b)
		log.Printf("WARNING: IP_SALT not set; generated ephemeral salt (ip_hash values will change on restart)")
	}
	return config{
		port:       os.Getenv("PORT"),
		dbURL:      os.Getenv("DATABASE_URL"),
		storeFile:  envOr("STORE_FILE", "/var/lib/amir-site/inquiries.jsonl"),
		ipSalt:     ipSalt,
		smtpHost:   os.Getenv("SMTP_HOST"),
		smtpPort:   envOr("SMTP_PORT", "587"),
		smtpUser:   os.Getenv("SMTP_USER"),
		smtpPass:   os.Getenv("SMTP_PASS"),
		contactTo:  os.Getenv("CONTACT_TO"),
		studioURL:  os.Getenv("STUDIO_INGEST_URL"),
		ingestKey:  os.Getenv("INGEST_KEY_AMIRSITE"),
		studio2URL: os.Getenv("STUDIO2_INGEST_URL"),
		studio2Key: os.Getenv("INGEST_KEY_STUDIO"),
	}
}

func envOr(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

// ---------------------------------------------------------------- domain

const (
	maxBodyBytes = 32 << 10
	maxFillTS    = 6 * time.Hour   // contact form ts older than this = stale/replay
	minHumanFill = 2 * time.Second // filled faster than this = likely a bot
	maxFutureTS  = 2 * time.Minute // small clock-skew allowance
	csrfCookie   = "csrf_token"
)

var (
	budgets = map[string]bool{"<5k": true, "5k-10k": true, "10k-25k": true, ">25k": true, "not_sure": true}
	types   = map[string]bool{"project": true, "collaboration": true}

	eventTypes = map[string]bool{
		"page_view": true, "cta_request_project": true, "whatsapp_click": true,
		"copy_email": true, "gallery_open": true, "gallery_next": true,
		"qr_scan": true, "form_submit": true, "linkedin_click": true,
		"lang_switch": true, "web_vitals": true,
	}
)

type inquiry struct {
	ID        int64  `json:"id"`
	CreatedAt string `json:"created_at"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Type      string `json:"type"`
	Budget    string `json:"budget"`
	Message   string `json:"message"`
	IPHash    string `json:"ip_hash"`
	Status    string `json:"status"`
}

// ---------------------------------------------------------------- store

type store interface {
	SaveInquiry(in *inquiry) error
	UpdateStatus(id int64, status string) error
	PendingEmails() ([]inquiry, error)
	Ping() error
}

// ---- Postgres store

type pgStore struct{ db *sql.DB }

func newPGStore(dsn string) (*pgStore, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(8)
	db.SetConnMaxIdleTime(5 * time.Minute)
	if err := db.Ping(); err != nil {
		return nil, err
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS inquiries (
		id BIGSERIAL PRIMARY KEY,
		created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
		name TEXT NOT NULL,
		email TEXT NOT NULL,
		type TEXT NOT NULL,
		budget TEXT NOT NULL,
		message TEXT NOT NULL,
		ip_hash TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'new'
	)`)
	if err != nil {
		return nil, err
	}
	return &pgStore{db: db}, nil
}

func (p *pgStore) SaveInquiry(in *inquiry) error {
	return p.db.QueryRow(
		`INSERT INTO inquiries (created_at, name, email, type, budget, message, ip_hash, status)
		 VALUES (now(), $1,$2,$3,$4,$5,$6,$7) RETURNING id, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SSOF')`,
		in.Name, in.Email, in.Type, in.Budget, in.Message, in.IPHash, in.Status,
	).Scan(&in.ID, &in.CreatedAt)
}

func (p *pgStore) UpdateStatus(id int64, status string) error {
	_, err := p.db.Exec(`UPDATE inquiries SET status=$2 WHERE id=$1`, id, status)
	return err
}

func (p *pgStore) PendingEmails() ([]inquiry, error) {
	rows, err := p.db.Query(`SELECT id, to_char(created_at,'YYYY-MM-DD"T"HH24:MI:SSOF'), name, email, type, budget, message, ip_hash, status
		FROM inquiries WHERE status='pending_email' ORDER BY id LIMIT 100`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []inquiry
	for rows.Next() {
		var in inquiry
		if err := rows.Scan(&in.ID, &in.CreatedAt, &in.Name, &in.Email, &in.Type, &in.Budget, &in.Message, &in.IPHash, &in.Status); err != nil {
			return nil, err
		}
		out = append(out, in)
	}
	return out, rows.Err()
}

func (p *pgStore) Ping() error { return p.db.Ping() }

// ---- JSON-lines file store (fallback)

type fileStore struct {
	path string
	mu   sync.Mutex
}

func newFileStore(path string) (*fileStore, error) {
	if err := os.MkdirAll(dirOf(path), 0o700); err != nil {
		return nil, err
	}
	return &fileStore{path: path}, nil
}

func dirOf(p string) string {
	if i := strings.LastIndexAny(p, `/\`); i > 0 {
		return p[:i]
	}
	return "."
}

func (f *fileStore) SaveInquiry(in *inquiry) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	fp, err := os.OpenFile(f.path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	defer fp.Close()
	if in.ID == 0 {
		in.ID = time.Now().UnixNano()
	}
	if in.CreatedAt == "" {
		in.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}
	b, err := json.Marshal(in)
	if err != nil {
		return err
	}
	_, err = fp.Write(append(b, '\n'))
	return err
}

func (f *fileStore) UpdateStatus(id int64, status string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	b, err := os.ReadFile(f.path)
	if err != nil {
		return err
	}
	var out bytes.Buffer
	sc := bufio.NewScanner(bytes.NewReader(b))
	for sc.Scan() {
		var in inquiry
		if json.Unmarshal(sc.Bytes(), &in) == nil && in.ID == id {
			in.Status = status
			nb, _ := json.Marshal(in)
			out.Write(nb)
		} else {
			out.Write(sc.Bytes())
		}
		out.WriteByte('\n')
	}
	return os.WriteFile(f.path, out.Bytes(), 0o600)
}

func (f *fileStore) PendingEmails() ([]inquiry, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	b, err := os.ReadFile(f.path)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var out []inquiry
	sc := bufio.NewScanner(bytes.NewReader(b))
	for sc.Scan() {
		var in inquiry
		if json.Unmarshal(sc.Bytes(), &in) == nil && in.Status == "pending_email" {
			out = append(out, in)
		}
	}
	return out, nil
}

func (f *fileStore) Ping() error {
	f.mu.Lock()
	defer f.mu.Unlock()
	fp, err := os.OpenFile(f.path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	return fp.Close()
}

// ---------------------------------------------------------------- rate limiter (token bucket, per-IP)

type rateLimiter struct {
	mu      sync.Mutex
	buckets map[string]*tokenBucket
	rate    float64 // tokens per second
	burst   float64
}

type tokenBucket struct{ tokens, last float64 }

func newRateLimiter(perMinute, burst int) *rateLimiter {
	return &rateLimiter{
		buckets: map[string]*tokenBucket{},
		rate:    float64(perMinute) / 60.0,
		burst:   float64(burst),
	}
}

func (rl *rateLimiter) Allow(key string) bool {
	now := float64(time.Now().UnixNano()) / 1e9
	rl.mu.Lock()
	defer rl.mu.Unlock()
	b, ok := rl.buckets[key]
	if !ok {
		if len(rl.buckets) > 100_000 { // crude bound against memory abuse
			rl.buckets = map[string]*tokenBucket{}
		}
		b = &tokenBucket{tokens: rl.burst, last: now}
		rl.buckets[key] = b
	}
	b.tokens += (now - b.last) * rl.rate
	if b.tokens > rl.burst {
		b.tokens = rl.burst
	}
	b.last = now
	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}

// ---------------------------------------------------------------- mailer

type mailer struct {
	cfg config
}

func (m *mailer) configured() bool {
	return m.cfg.smtpHost != "" && m.cfg.contactTo != ""
}

func (m *mailer) send(from, to, subject, body string) error {
	addr := net.JoinHostPort(m.cfg.smtpHost, m.cfg.smtpPort)
	hdr := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nDate: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n",
		from, to, subject, time.Now().Format(time.RFC1123Z))
	auth := smtp.PlainAuth("", m.cfg.smtpUser, m.cfg.smtpPass, m.cfg.smtpHost)
	return smtp.SendMail(addr, auth, from, []string{to}, []byte(hdr+body))
}

const (
	ownerSubject   = "Neue Anfrage ueber amir-khosravi.de"
	ownerBody      = "Neue Anfrage (%s):\n\nName: %s\nE-Mail: %s\nTyp: %s\nBudget: %s\n\n%s\n"
	replySubjectDE = "Danke fuer Ihre Nachricht"
	replyBodyDE    = "Hallo %s,\n\nvielen Dank fuer Ihre Nachricht ueber amir-khosravi.de. Ich habe Ihre Anfrage erhalten und melde mich in der Regel innerhalb von 24 Stunden bei Ihnen.\n\nViele Gruesse\nAmir Khosravi\n"
	replySubjectEN = "Thanks for your message"
	replyBodyEN    = "Hi %s,\n\nthank you for reaching out via amir-khosravi.de. I received your inquiry and usually reply within 24 hours.\n\nBest regards\nAmir Khosravi\n"
)

func wantsEnglish(acceptLanguage string) bool {
	en, de := -1.0, -1.0
	for _, part := range strings.Split(acceptLanguage, ",") {
		q := 1.0
		if i := strings.Index(part, ";q="); i >= 0 {
			if v, err := strconv.ParseFloat(strings.TrimSpace(part[i+3:]), 64); err == nil {
				q = v
			}
			part = part[:i]
		}
		tag := strings.ToLower(strings.TrimSpace(part))
		switch {
		case tag == "en" || strings.HasPrefix(tag, "en-"):
			en = q
		case tag == "de" || strings.HasPrefix(tag, "de-"):
			de = q
		}
	}
	return en > de // default (no headers) is German
}

// ---------------------------------------------------------------- signed forwarding to AK Studio

// SignEvent produces the X-AK-Timestamp and X-AK-Signature values for a payload.
// Signature = hex(HMAC-SHA256(key, "<timestamp>.<raw body>")). Consumers reject
// signatures whose timestamp is older than 5 minutes (replay window).
func SignEvent(key string, timestamp string, body []byte) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(timestamp))
	mac.Write([]byte("."))
	mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}

func (s *server) forwardSigned(payload any, path string) {
	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("studio forward: marshal: %v", err)
		return
	}
	dests := []struct{ url, key, label string }{
		{s.cfg.studioURL, s.cfg.ingestKey, "studio"},
		{s.cfg.studio2URL, s.cfg.studio2Key, "studio2"},
	}
	for _, d := range dests {
		if d.url == "" || d.key == "" {
			continue // destination disabled by config
		}
		s.postSigned(d.url, d.key, d.label, path, body)
	}
}

func (s *server) postSigned(url, key, label, path string, body []byte) {
	ts := strconv.FormatInt(time.Now().Unix(), 10)
	req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, strings.TrimRight(url, "/")+path, bytes.NewReader(body))
	if err != nil {
		log.Printf("%s forward: %v", label, err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-AK-Timestamp", ts)
	req.Header.Set("X-AK-Signature", SignEvent(key, ts, body))
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("%s forward failed (non-blocking): %v", label, err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		log.Printf("%s forward: unexpected status %d", label, resp.StatusCode)
	}
}

// ---------------------------------------------------------------- server

type server struct {
	cfg     config
	store   store
	mail    *mailer
	limiter *rateLimiter
	retryQ  *retryQueue
}

func newServer(cfg config) (*server, error) {
	var st store
	if cfg.dbURL != "" {
		pg, err := newPGStore(cfg.dbURL)
		if err != nil {
			return nil, fmt.Errorf("postgres: %w", err)
		}
		st = pg
		log.Printf("store: postgres")
	} else {
		fs, err := newFileStore(cfg.storeFile)
		if err != nil {
			return nil, fmt.Errorf("file store: %w", err)
		}
		st = fs
		log.Printf("**********************************************************************")
		log.Printf("*** WARNING: DATABASE_URL is NOT set. Inquiries are written to the ***")
		log.Printf("*** JSON-lines file %q. This is a FALLBACK — configure ***", cfg.storeFile)
		log.Printf("*** DATABASE_URL before production use.                            ***")
		log.Printf("**********************************************************************")
	}
	return &server{
		cfg:     cfg,
		store:   st,
		mail:    &mailer{cfg: cfg},
		limiter: newRateLimiter(5, 5),
		retryQ:  &retryQueue{},
	}, nil
}

// ---- middleware

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		h.Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		h.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		h.Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

func (s *server) methodCheck(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		w.Header().Set("Allow", method)
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return false
	}
	return true
}

// reject cross-origin POSTs (site is same-origin; CORS is intentionally unsupported)
func (s *server) originCheck(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	u, err := url.Parse(origin)
	if err != nil || u.Host != r.Host {
		http.Error(w, "cross-origin requests are not allowed", http.StatusForbidden)
		return false
	}
	return true
}

// clientIP prefers the first X-Forwarded-For entry (deploy behind a trusted
// reverse proxy that sets it), else the TCP peer address.
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if i := strings.Index(xff, ","); i >= 0 {
			xff = xff[:i]
		}
		return strings.TrimSpace(xff)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func (s *server) ipHash(ip string) string {
	sum := sha256.Sum256([]byte(ip + s.cfg.ipSalt))
	return hex.EncodeToString(sum[:])
}

func (s *server) csrfCheck(w http.ResponseWriter, r *http.Request) bool {
	hdr := r.Header.Get("X-CSRF-Token")
	ck, err := r.Cookie(csrfCookie)
	if err != nil || hdr == "" || ck.Value == "" ||
		subtle.ConstantTimeCompare([]byte(hdr), []byte(ck.Value)) != 1 {
		http.Error(w, "csrf token mismatch", http.StatusForbidden)
		return false
	}
	return true
}

// ---- handlers

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Type    string `json:"type"`
	Budget  string `json:"budget"`
	Message string `json:"message"`
	Consent bool   `json:"consent"`
	Website string `json:"website"` // honeypot
	TS      int64  `json:"ts"`      // unix seconds
}

func (s *server) handleContact(w http.ResponseWriter, r *http.Request) {
	if !s.methodCheck(w, r, http.MethodPost) || !s.originCheck(w, r) || !s.csrfCheck(w, r) {
		return
	}
	if !s.limiter.Allow(clientIP(r)) {
		w.Header().Set("Retry-After", "60")
		http.Error(w, "too many requests", http.StatusTooManyRequests)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	var req contactRequest
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&req); err != nil {
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}

	// Honeypot: bots fill hidden fields. Return generic success, store nothing.
	if req.Website != "" {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
		return
	}

	if errs := validateContact(req, time.Now()); len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"ok": false, "errors": errs})
		return
	}

	in := &inquiry{
		Name:    strings.TrimSpace(req.Name),
		Email:   strings.TrimSpace(req.Email),
		Type:    req.Type,
		Budget:  req.Budget,
		Message: strings.TrimSpace(req.Message),
		IPHash:  s.ipHash(clientIP(r)),
		Status:  "new",
	}
	if !s.mail.configured() {
		in.Status = "pending_email"
	}
	if err := s.store.SaveInquiry(in); err != nil {
		log.Printf("store inquiry failed: %v", err) // no PII logged
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	log.Printf("inquiry stored: id=%d status=%s type=%s", in.ID, in.Status, in.Type)

	// Owner email; on failure queue for the 60s retry loop — the inquiry is
	// already persisted, so email problems can never lose it.
	if in.Status == "new" {
		if err := s.sendOwnerMail(*in); err != nil {
			log.Printf("owner email failed for id=%d, marking pending_email: %v", in.ID, err)
			in.Status = "pending_email"
			_ = s.store.UpdateStatus(in.ID, "pending_email")
		}
	}
	if in.Status == "pending_email" {
		s.retryQ.add(*in)
	}

	// Auto-reply to the sender (DE default, EN if preferred).
	lang := "de"
	if wantsEnglish(r.Header.Get("Accept-Language")) {
		lang = "en"
	}
	go s.sendAutoReply(*in, lang)

	// Signed, non-blocking forward to AK Studio (receiver: POST /ingest/v1/inquiry).
	go s.forwardSigned(map[string]any{
		"name":    in.Name,
		"email":   in.Email,
		"type":    in.Type,
		"budget":  in.Budget,
		"message": in.Message,
	}, "/inquiry")

	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "id": in.ID})
}

func validateContact(req contactRequest, now time.Time) []string {
	var errs []string
	n := strings.TrimSpace(req.Name)
	if len(n) < 2 || len(n) > 120 {
		errs = append(errs, "name must be 2-120 characters")
	}
	if _, err := mail.ParseAddress(strings.TrimSpace(req.Email)); err != nil || !strings.Contains(req.Email, "@") {
		errs = append(errs, "email is not valid")
	}
	if !types[req.Type] {
		errs = append(errs, "type must be project or collaboration")
	}
	if !budgets[req.Budget] {
		errs = append(errs, "budget has an invalid value")
	}
	m := strings.TrimSpace(req.Message)
	if len(m) < 10 || len(m) > 4000 {
		errs = append(errs, "message must be 10-4000 characters")
	}
	if !req.Consent {
		errs = append(errs, "consent is required")
	}
	if req.TS <= 0 {
		errs = append(errs, "ts is required")
	} else {
		// Clients may send seconds or milliseconds; normalise to seconds.
		sec := req.TS
		if sec > 1e12 { // ms epoch (~from 2001-09 onward)
			sec /= 1000
		}
		ts := time.Unix(sec, 0)
		if ts.After(now.Add(maxFutureTS)) {
			errs = append(errs, "ts is in the future")
		} else if now.Sub(ts) > maxFillTS {
			errs = append(errs, "ts is too old (possible replay)")
		} else if now.Sub(ts) < minHumanFill {
			errs = append(errs, "ts is too fast (likely a bot)")
		}
	}
	return errs
}

func (s *server) sendOwnerMail(in inquiry) error {
	from := s.cfg.smtpUser
	if from == "" {
		from = s.cfg.contactTo
	}
	return s.mail.send(from, s.cfg.contactTo, ownerSubject,
		fmt.Sprintf(ownerBody, in.CreatedAt, in.Name, in.Email, in.Type, in.Budget, in.Message))
}

func (s *server) sendAutoReply(in inquiry, lang string) {
	from := s.cfg.smtpUser
	if from == "" {
		from = s.cfg.contactTo
	}
	subject, body := replySubjectDE, fmt.Sprintf(replyBodyDE, in.Name)
	if lang == "en" {
		subject, body = replySubjectEN, fmt.Sprintf(replyBodyEN, in.Name)
	}
	if err := s.mail.send(from, in.Email, subject, body); err != nil {
		log.Printf("auto-reply failed for id=%d (non-fatal): %v", in.ID, err)
	}
}

// ---- email retry loop

type retryQueue struct {
	mu    sync.Mutex
	items []inquiry
}

func (q *retryQueue) add(in inquiry) {
	q.mu.Lock()
	q.items = append(q.items, in)
	q.mu.Unlock()
}

func (q *retryQueue) drain() []inquiry {
	q.mu.Lock()
	defer q.mu.Unlock()
	out := q.items
	q.items = nil
	return out
}

func (s *server) runEmailRetryLoop(ctx context.Context) {
	go func() {
		t := time.NewTicker(60 * time.Second)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				s.retryPendingOnce()
			}
		}
	}()
}

func (s *server) retryPendingOnce() {
	// Reload persisted pending rows (DB store) plus anything queued in memory.
	pending, err := s.store.PendingEmails()
	if err != nil {
		log.Printf("retry loop: load pending: %v", err)
	}
	seen := map[int64]bool{}
	var batch []inquiry
	for _, in := range append(s.retryQ.drain(), pending...) {
		if in.ID != 0 && seen[in.ID] {
			continue
		}
		seen[in.ID] = true
		batch = append(batch, in)
	}
	for _, in := range batch {
		if err := s.sendOwnerMail(in); err != nil {
			log.Printf("retry: owner email still failing for id=%d", in.ID)
			s.retryQ.add(in) // re-queue for next tick
			continue
		}
		if err := s.store.UpdateStatus(in.ID, "emailed"); err != nil {
			log.Printf("retry: update status id=%d: %v", in.ID, err)
		} else {
			log.Printf("retry: owner email delivered for id=%d", in.ID)
		}
	}
}

// ---- event ingest forwarder

type eventRequest struct {
	Type string `json:"type"`
	Name string `json:"name"`
	TS   int64  `json:"ts"`
}

func (s *server) handleEvent(w http.ResponseWriter, r *http.Request) {
	if !s.methodCheck(w, r, http.MethodPost) || !s.originCheck(w, r) {
		return
	}
	if r.Header.Get("X-Do-Not-Track") == "1" {
		// Respect Do-Not-Track: acknowledge but forward/store nothing.
		writeJSON(w, http.StatusAccepted, map[string]bool{"ok": true, "forwarded": false})
		return
	}
	if !s.limiter.Allow("event:" + clientIP(r)) {
		w.Header().Set("Retry-After", "60")
		http.Error(w, "too many requests", http.StatusTooManyRequests)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	var ev eventRequest
	if err := json.NewDecoder(r.Body).Decode(&ev); err != nil {
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}
	if !eventTypes[ev.Type] {
		http.Error(w, "unknown event type", http.StatusBadRequest)
		return
	}
	if len(ev.Name) > 128 || ev.TS <= 0 {
		http.Error(w, "invalid event fields", http.StatusBadRequest)
		return
	}
	go s.forwardSigned(map[string]any{
		"type":   ev.Type,
		"name":   ev.Name,
		"ts":     ev.TS,
		"source": "amirsite",
	}, "/event")
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true, "forwarded": true})
}

// ---- health

func (s *server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if !s.methodCheck(w, r, http.MethodGet) {
		return
	}
	dbStatus := "file-fallback"
	if s.cfg.dbURL != "" {
		if err := s.store.Ping(); err != nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "degraded", "db": "down"})
			return
		}
		dbStatus = "up"
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "db": dbStatus})
}

// ---- csrf token endpoint (client fetches a token, echoes it in header+cookie)

func (s *server) handleCSRF(w http.ResponseWriter, r *http.Request) {
	if !s.methodCheck(w, r, http.MethodGet) {
		return
	}
	if ck, err := r.Cookie(csrfCookie); err != nil || ck.Value == "" {
		b := make([]byte, 24)
		if _, err := rand.Read(b); err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		http.SetCookie(w, &http.Cookie{
			Name: csrfCookie, Value: hex.EncodeToString(b),
			Path: "/", SameSite: http.SameSiteStrictMode, Secure: true,
			MaxAge: 86400,
		})
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ---- plumbing

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func routes(s *server) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/contact", s.handleContact)
	mux.HandleFunc("POST /api/event", s.handleEvent)
	mux.HandleFunc("GET /api/health", s.handleHealth)
	mux.HandleFunc("GET /api/csrf", s.handleCSRF)
	return mux
}

func main() {
	cfg := loadConfig()
	if cfg.port == "" {
		log.Fatal("FATAL: PORT env var is required (fail-fast)")
	}
	srv, err := newServer(cfg)
	if err != nil {
		log.Fatalf("FATAL: %v", err)
	}
	srv.retryPendingOnce() // pick up pending_email rows from previous runs

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	srv.runEmailRetryLoop(ctx)

	hs := &http.Server{
		Addr:              net.JoinHostPort("", cfg.port),
		Handler:           securityHeaders(routes(srv)),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      20 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    16 << 10,
	}
	log.Printf("listening on :%s", cfg.port)
	if err := hs.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("server: %v", err)
	}
}
