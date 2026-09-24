# Platform runbook — adding a product subdomain (WP2 phase 1)

> Executed on the VPS (details in local-only `PORTFOLIO_CONTEXT.md`).
> Prerequisite: the owner's real domain, DNS pointing at the VPS IP.

## One-time domain wiring (phase 0 → 1)

1. Buy the domain (IONOS/Netcup, ~10 €/yr). Set DNS A record → VPS IP.
2. Main Caddyfile: import the per-site vhost files (pattern already exists).
3. Resume site vhost: `amir-khosravi.de` + `www.` redirect — serve the same
   webroot the site is served from today (zero content changes).
4. `caddy validate && systemctl reload caddy` → verify TLS issuance in logs.

## Adding a new product (each, ~10 minutes)

1. Deploy the app (its own port, e.g. Docker/systemd unit on the VPS).
2. Create `/etc/caddy/<sub>.amir-khosravi.de.Caddyfile`:
   ```
   <sub>.amir-khosravi.de {
       reverse_proxy 127.0.0.1:<port>
   }
   ```
3. Add the import line to the main Caddyfile, then:
   `caddy validate && systemctl reload caddy` — Caddy fetches TLS automatically.
4. Verify: `curl -I https://<sub>.amir-khosravi.de` → 200/302.
5. Update the product's URL in `index.html` carousel + `products.html`
   (one-line change each), CI green, deploy, verify 200 live.
6. Append the subdomain to the job-agent site-monitor list (daily.yml).

## Migration order once the domain exists

1. Resume site (lowest risk, immediate branding win).
2. Nelurio (flagship; keep the old URL as a temporary redirect).
3. Finello (GitHub Pages → either move to the VPS or link stays GH Pages).
4. NexDeutsch, Washhalle (internal-ish apps; redirect old URLs).
5. Old duckdns/sslip.io hostnames stay as 301 redirects for a grace period.

## Known constraints (honest)

- Single VPS = single point of failure. Mitigations in place: daily automated
  uptime monitoring with alerts (job-agent daily.yml), file-level backup of
  webroots before each deploy, all apps re-deployable from their repos.
- Shared auth/SSO is deliberately NOT in place yet (WP2 phase 3, data-driven).
