# OWNER-SETUP — amir-khosravi.de rebuild (what only the owner can supply)

> Agent-filled where verified data existed (name, address Frankfurter Str. 19,
> 65189 Wiesbaden, contact email). Everything below is still owner-owned.

## Must fill / confirm before or shortly after go-live

| Item | Where | Status |
|---|---|---|
| WhatsApp number | env `WHATSAPP_NUMBER` at deploy → `wa.me` links (FAB + contact section). Rows auto-hide while unset. | ⬜ owner |
| Owner phone in Impressum | optional (email suffices legally); line removed until number supplied | ⬜ owner |
| USt-IdNr. | currently "Kleinunternehmerregelung" — replace if registered | ⬜ owner |
| Impressum/Datenschutz legal review | texts are agent templates (marked "owner/lawyer review required") | ⬜ owner/lawyer |
| SMTP credentials | env `SMTP_HOST/PORT/USER/PASS` + `CONTACT_TO` in `/etc/amir-site/api.env` — until then inquiries store with `status=pending_email` and auto-retry, nothing is lost | ⬜ owner |
| Ingest key | `INGEST_KEY_AMIRSITE` (must equal AK Studio's per-site key) | agent can generate on request |
| AK Studio ingest URL | `STUDIO_INGEST_URL` (AK Studio signed ingest endpoint) | pending Studio build (PROMPT 1) |
| Search Console + Bing verification | both domains, sitemap submit | ⬜ owner |

## Deploy
- `scripts/deploy-amir-site.sh` (VPS): rsync artifact → atomic swap → API build + systemd restart → caddy validate → healthcheck → auto-rollback.
- Service env file: `/etc/amir-site/api.env` (`PORT`, `DATABASE_URL`, SMTP, `INGEST_KEY_AMIRSITE`, `STUDIO_INGEST_URL`, `IP_SALT`).
- Systemd unit: `amir-api.service` (created at deploy).

## Known pending platform items
- POSTGRES: uses nelurio `DATABASE_URL` (separate `inquiries` table) or JSONL fallback `/var/lib/amir-site/inquiries.jsonl`.
- Lighthouse budgets + full Playwright matrix (360/390/820/1280 DE+EN): scheduled as Phase 2 nightly once CI minutes reset.
