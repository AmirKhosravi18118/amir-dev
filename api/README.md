# amir-khosravi.de API

Lean, stdlib-only Go API for the static site. One binary, three endpoints,
config via env only.

## Endpoints

| Method | Path          | Purpose |
|--------|---------------|---------|
| POST   | `/api/contact`| Contact form: validate, store, owner email, auto-reply, signed forward to AK Studio |
| POST   | `/api/event`  | Anonymous analytics forwarder to AK Studio (never stored) |
| GET    | `/api/health` | `{"status":"ok",...}` + db ping result |
| GET    | `/api/csrf`   | Issues the `csrf_token` cookie used for double-submit CSRF |

### POST /api/contact

Body: `{name, email, type, budget, message, consent, website, ts}`

- `name` 2-120 chars, `email` valid, `type` in `project|collaboration`,
  `budget` in `<5k|5k-10k|10k-25k|>25k|not_sure`, `message` 10-4000 chars,
  `consent` must be `true`, `ts` unix seconds not older than 3s and not in
  the future (>2s skew rejected).
- `website` is a honeypot: if filled, a generic 200 is returned and nothing
  is stored or forwarded.
- CSRF: header `X-CSRF-Token` must equal the `csrf_token` cookie (double
  submit, constant-time compare).
- Rate limit: 5 requests/min per IP (in-memory token bucket, per instance).
- Cross-origin `Origin` headers are rejected (same-origin deployment only).

### POST /api/event

Body: `{type, name, ts}`. `type` allowlist: `page_view`, `cta_request_project`,
`whatsapp_click`, `copy_email`, `gallery_open`, `gallery_next`, `qr_scan`,
`form_submit`, `linkedin_click`, `lang_switch`, `web_vitals`. Events are
forwarded signed to AK Studio and **never stored**. If the request carries
`X-Do-Not-Track: 1`, a `202` no-op is returned.

## Storage

- With `DATABASE_URL` set: Postgres via `github.com/jackc/pgx/v5/stdlib`;
  the `inquiries` table is created if missing (`id bigserial, created_at,
  name, email, type, budget, message, ip_hash, status`).
- Without: JSON-lines fallback at `STORE_FILE`
  (default `/var/lib/amir-site/inquiries.jsonl`) with a loud startup warning.
  Each line is one inquiry JSON object with the same fields.

`ip_hash` = sha256(ip + IP_SALT). No raw IPs, no PII in logs anywhere.

## Email

- Owner notification to `CONTACT_TO` via `SMTP_HOST:SMTP_PORT`
  (`SMTP_USER`/`SMTP_PASS`, STARTTLS-capable `net/smtp`).
- If SMTP is unconfigured, or the send fails, the inquiry is marked
  `status=pending_email` **after** being persisted and retried by a
  background loop every 60s until delivered (`status=emailed`). Email
  failures can never lose an inquiry.
- Auto-reply to the sender: German by default, English when
  `Accept-Language` prefers `en`.

## AK Studio forwarding

Every stored inquiry (event `inquiry.new`) and every analytics event is
POSTed to `STUDIO_INGEST_URL` with:

- `X-AK-Timestamp`: unix seconds
- `X-AK-Signature`: `hex(HMAC-SHA256(INGEST_KEY_AMIRSITE, "<timestamp>.<raw body>"))`

Receivers must reject signatures whose timestamp is older than 5 minutes
(replay window). Forward failures are logged and non-blocking.

## Security

- Body limit 32 KB; server timeouts (`ReadHeaderTimeout` 5s, read/write/idle
  timeouts); 16 KB header limit.
- Security headers middleware: `nosniff`, `X-Frame-Options: DENY`,
  CSP `default-src 'none'`, HSTS, `Cache-Control: no-store`.
- CSRF double-submit; cross-origin POST rejection; no CORS.
- Fail-fast: exits non-zero if `PORT` is missing, or Postgres is unreachable
  at startup while `DATABASE_URL` is set.

## Configuration

Copy `.env.example` and set the values in your process manager / container
env. There are no config files or flags; unset optional vars degrade
gracefully (documented above).

## Development

```
go vet ./...
go test ./...
go build .
```

## Deploy notes

- Build a static binary: `CGO_ENABLED=0 go build -o amir-api .`
- Run behind a reverse proxy that sets `X-Forwarded-For` (used for rate
  limiting and IP hashing); the proxy must strip/overwrite it from clients.
- Provision `STORE_FILE` directory (or Postgres DB) writable by the runtime
  user. On systemd, set `StateDirectory=amir-site` for the default path.
- Health check for orchestration: `GET /api/health` returns 200 when the
  store is reachable, 503 when Postgres is down.
- Rotate `INGEST_KEY_AMIRSITE` and `IP_SALT` together with the AK Studio
  deployment; changing `IP_SALT` invalidates all previously hashed IPs.
- Back up the Postgres `inquiries` table (or the JSONL file) — it is the
  only durable record of contact inquiries.
