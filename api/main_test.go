package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"testing"
	"time"
)

// ---------------------------------------------------------------- helpers

type capturedForward struct {
	timestamp string
	signature string
	body      []byte
}

type testEnv struct {
	srv    *server
	mux    *http.ServeMux
	studio *httptest.Server
	fwd    func() []capturedForward
	storeF string
}

func newTestEnv(t *testing.T) *testEnv {
	t.Helper()
	var forwards []capturedForward
	studio := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		b, _ := io.ReadAll(r.Body)
		forwards = append(forwards, capturedForward{
			timestamp: r.Header.Get("X-AK-Timestamp"),
			signature: r.Header.Get("X-AK-Signature"),
			body:      b,
		})
		w.WriteHeader(200)
	}))
	t.Cleanup(studio.Close)

	storeFile := filepath.Join(t.TempDir(), "inquiries.jsonl")
	srv, err := newServer(config{
		storeFile: storeFile,
		ipSalt:    "test-salt",
		studioURL: studio.URL,
		ingestKey: "test-ingest-key",
	})
	if err != nil {
		t.Fatalf("newServer: %v", err)
	}
	return &testEnv{
		srv:    srv,
		mux:    routes(srv),
		studio: studio,
		storeF: storeFile,
		fwd:    func() []capturedForward { return forwards },
	}
}

// getCSRF fetches a token via GET /api/csrf and returns cookie + token.
func (e *testEnv) getCSRF(t *testing.T) (string, string) {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, "/api/csrf", nil)
	req.RemoteAddr = "203.0.113.1:1111"
	rec := httptest.NewRecorder()
	e.mux.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("csrf endpoint: %d", rec.Code)
	}
	for _, ck := range rec.Result().Cookies() {
		if ck.Name == csrfCookie {
			return ck.Name + "=" + ck.Value, ck.Value
		}
	}
	t.Fatal("no csrf cookie set")
	return "", ""
}

type contactOpt func(*contactRequest, *http.Request)

func (e *testEnv) postContact(t *testing.T, mutate func(*contactRequest), opts ...contactOpt) *httptest.ResponseRecorder {
	t.Helper()
	cookie, token := e.getCSRF(t)
	body := contactRequest{
		Name:    "Jane Doe",
		Email:   "jane@example.com",
		Type:    "project",
		Budget:  "5k-10k",
		Message: "I would like to work with you on a new portfolio site.",
		Consent: true,
		TS:      time.Now().Unix(),
	}
	if mutate != nil {
		mutate(&body)
	}
	payload, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/api/contact", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-CSRF-Token", token)
	req.Header.Set("Cookie", cookie)
	req.RemoteAddr = "203.0.113.1:1234"
	for _, o := range opts {
		o(&body, req)
	}
	rec := httptest.NewRecorder()
	e.mux.ServeHTTP(rec, req)
	return rec
}

func (e *testEnv) storedCount(t *testing.T) int {
	t.Helper()
	b, err := os.ReadFile(e.storeF)
	if os.IsNotExist(err) {
		return 0
	}
	if err != nil {
		t.Fatal(err)
	}
	return bytes.Count(b, []byte("\n"))
}

// ---------------------------------------------------------------- tests

func TestContactHappyPath(t *testing.T) {
	e := newTestEnv(t)
	rec := e.postContact(t, nil)
	if rec.Code != 200 {
		t.Fatalf("status = %d, body = %s", rec.Code, rec.Body.String())
	}
	if got := e.storedCount(t); got != 1 {
		t.Fatalf("stored records = %d, want 1", got)
	}
	raw, _ := os.ReadFile(e.storeF)
	var in inquiry
	if err := json.Unmarshal(bytes.TrimSpace(raw), &in); err != nil {
		t.Fatal(err)
	}
	if in.Name != "Jane Doe" || in.Status != "pending_email" { // SMTP unset in tests
		t.Fatalf("stored inquiry = %+v", in)
	}
	if len(in.IPHash) != 64 {
		t.Fatalf("ip_hash length = %d, want 64", len(in.IPHash))
	}
	if in.IPHash == "203.0.113.1" || bytes.Contains(raw, []byte("203.0.113.1")) {
		t.Fatal("raw IP stored — must be hashed")
	}
	// signed forward to studio
	var fw []capturedForward
	deadline := time.Now().Add(2 * time.Second)
	for len(fw) == 0 && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
		fw = e.fwd()
	}
	if len(fw) != 1 {
		t.Fatalf("forwards = %d, want 1", len(fw))
	}
	var payload map[string]any
	if err := json.Unmarshal(fw[0].body, &payload); err != nil {
		t.Fatal(err)
	}
	if payload["type"] != "inquiry.new" || payload["email"] != "jane@example.com" {
		t.Fatalf("forward payload = %v", payload)
	}
	key := "test-ingest-key"
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(fw[0].timestamp))
	mac.Write([]byte("."))
	mac.Write(fw[0].body)
	if got := hex.EncodeToString(mac.Sum(nil)); got != fw[0].signature {
		t.Fatalf("signature mismatch: got %s want %s", fw[0].signature, got)
	}
	ts, err := strconv.ParseInt(fw[0].timestamp, 10, 64)
	if err != nil || time.Since(time.Unix(ts, 0)) > 5*time.Minute {
		t.Fatalf("forward timestamp outside 5-min replay window: %v", fw[0].timestamp)
	}
}

func TestSignEventGolden(t *testing.T) {
	// Independently precomputed:
	// printf '%s' '1700000000.{"type":"inquiry.new","name":"Test","email":"a@b.de"}' \
	//   | openssl dgst -sha256 -hmac 'golden-key' -hex
	const want = "6689701481b8f80a2052dcfc2e15fa3b9d28fc0119db47bd6d93249c787a4fe4"
	got := SignEvent("golden-key", "1700000000", []byte(`{"type":"inquiry.new","name":"Test","email":"a@b.de"}`))
	if got != want {
		t.Fatalf("SignEvent = %s, want %s", got, want)
	}
}

func TestContactValidationFailures(t *testing.T) {
	cases := map[string]func(*contactRequest){
		"name too short":    func(c *contactRequest) { c.Name = "A" },
		"name too long":     func(c *contactRequest) { c.Name = string(bytes.Repeat([]byte("x"), 121)) },
		"invalid email":     func(c *contactRequest) { c.Email = "not-an-email" },
		"invalid type":      func(c *contactRequest) { c.Type = "spam" },
		"invalid budget":    func(c *contactRequest) { c.Budget = "millions" },
		"message too short": func(c *contactRequest) { c.Message = "short" },
		"message too long":  func(c *contactRequest) { c.Message = string(bytes.Repeat([]byte("x"), 4001)) },
		"no consent":        func(c *contactRequest) { c.Consent = false },
		"stale ts":          func(c *contactRequest) { c.TS = time.Now().Add(-10 * time.Second).Unix() },
		"future ts":         func(c *contactRequest) { c.TS = time.Now().Add(10 * time.Second).Unix() },
		"missing ts":        func(c *contactRequest) { c.TS = 0 },
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			e := newTestEnv(t)
			rec := e.postContact(t, mutate)
			if rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400 (body=%s)", rec.Code, rec.Body.String())
			}
			if got := e.storedCount(t); got != 0 {
				t.Fatalf("stored records = %d, want 0", got)
			}
		})
	}
}

func TestContactHoneypotGenericSuccessNoStore(t *testing.T) {
	e := newTestEnv(t)
	rec := e.postContact(t, func(c *contactRequest) { c.Website = "http://spam.example" })
	if rec.Code != 200 {
		t.Fatalf("status = %d, want 200 (generic success)", rec.Code)
	}
	if got := e.storedCount(t); got != 0 {
		t.Fatalf("honeypot hit stored %d records, want 0", got)
	}
	if n := len(e.fwd()); n != 0 {
		t.Fatalf("honeypot hit forwarded %d events, want 0", n)
	}
}

func TestContactRateLimit(t *testing.T) {
	e := newTestEnv(t)
	// First request already consumed one token in other tests use fresh env; here
	// the bucket starts with 5 tokens, so requests 1-5 pass, 6th is limited.
	for i := 0; i < 5; i++ {
		rec := e.postContact(t, func(c *contactRequest) { c.Message = fmt.Sprintf("rate limit probe number %d long enough", i) })
		if rec.Code != 200 {
			t.Fatalf("request %d: status = %d, want 200", i+1, rec.Code)
		}
	}
	rec := e.postContact(t, func(c *contactRequest) { c.Message = "request number six should hit the limit now" })
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("6th request status = %d, want 429", rec.Code)
	}
}

func TestContactCSRFMismatch(t *testing.T) {
	e := newTestEnv(t)
	rec := e.postContact(t, nil, func(c *contactRequest, r *http.Request) {
		r.Header.Set("X-CSRF-Token", "wrong-token")
	})
	if rec.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want 403", rec.Code)
	}
	if got := e.storedCount(t); got != 0 {
		t.Fatalf("stored records = %d, want 0", got)
	}
}

func TestContactCrossOriginRejected(t *testing.T) {
	e := newTestEnv(t)
	rec := e.postContact(t, nil, func(c *contactRequest, r *http.Request) {
		r.Header.Set("Origin", "https://evil.example")
	})
	if rec.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want 403", rec.Code)
	}
}

func TestEventAllowlistAndForward(t *testing.T) {
	e := newTestEnv(t)
	// rejected type
	rec := postEvent(t, e, `{"type":"keylog_dump","name":"x","ts":1}`)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("unknown event status = %d, want 400", rec.Code)
	}
	// accepted type
	rec = postEvent(t, e, fmt.Sprintf(`{"type":"page_view","name":"home","ts":%d}`, time.Now().Unix()))
	if rec.Code != 200 {
		t.Fatalf("valid event status = %d (body=%s)", rec.Code, rec.Body.String())
	}
	deadline := time.Now().Add(2 * time.Second)
	for len(e.fwd()) == 0 && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	fw := e.fwd()
	if len(fw) != 1 {
		t.Fatalf("forwards = %d, want 1", len(fw))
	}
	if e.storedCount(t) != 0 {
		t.Fatal("events must never be stored")
	}
}

func TestEventDoNotTrack(t *testing.T) {
	e := newTestEnv(t)
	cookie, token := e.getCSRF(t)
	_ = cookie
	req := httptest.NewRequest(http.MethodPost, "/api/event", bytes.NewBufferString(`{"type":"page_view","name":"home","ts":1}`))
	req.Header.Set("X-Do-Not-Track", "1")
	req.Header.Set("X-CSRF-Token", token)
	req.RemoteAddr = "203.0.113.9:9"
	rec := httptest.NewRecorder()
	e.mux.ServeHTTP(rec, req)
	if rec.Code != http.StatusAccepted {
		t.Fatalf("status = %d, want 202", rec.Code)
	}
	if n := len(e.fwd()); n != 0 {
		t.Fatalf("DNT event forwarded %d times, want 0", n)
	}
}

func postEvent(t *testing.T, e *testEnv, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/event", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.RemoteAddr = "203.0.113.9:9"
	rec := httptest.NewRecorder()
	e.mux.ServeHTTP(rec, req)
	return rec
}

func TestHealth(t *testing.T) {
	e := newTestEnv(t)
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rec := httptest.NewRecorder()
	e.mux.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status = %d", rec.Code)
	}
	var out map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if out["status"] != "ok" {
		t.Fatalf("body = %v", out)
	}
	if out["db"] != "file-fallback" {
		t.Fatalf("db status = %q, want file-fallback", out["db"])
	}
}

func TestSecurityHeadersPresent(t *testing.T) {
	e := newTestEnv(t)
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rec := httptest.NewRecorder()
	securityHeaders(e.mux).ServeHTTP(rec, req)
	h := rec.Header()
	for k, want := range map[string]string{
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options":        "DENY",
		"Cache-Control":          "no-store",
	} {
		if h.Get(k) != want {
			t.Fatalf("header %s = %q, want %q", k, h.Get(k), want)
		}
	}
}

func TestBodyTooLarge(t *testing.T) {
	e := newTestEnv(t)
	cookie, token := e.getCSRF(t)
	big := bytes.Repeat([]byte("a"), 33<<10)
	req := httptest.NewRequest(http.MethodPost, "/api/contact", bytes.NewReader(big))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-CSRF-Token", token)
	req.Header.Set("Cookie", cookie)
	req.RemoteAddr = "203.0.113.2:2"
	rec := httptest.NewRecorder()
	e.mux.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("oversized body status = %d, want 400", rec.Code)
	}
}

func TestWantsEnglish(t *testing.T) {
	cases := map[string]bool{
		"":            false, // default DE
		"de-DE,de;q=": false,
		"de-DE,de;q=0.9": false,
		"en-US,en;q=0.9,de;q=0.8": true,
		"en;q=0.5,de;q=1.0":       false,
		"fr":                      false,
	}
	for al, want := range cases {
		if got := wantsEnglish(al); got != want {
			t.Fatalf("wantsEnglish(%q) = %v, want %v", al, got, want)
		}
	}
}
