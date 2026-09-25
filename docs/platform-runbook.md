# Platform runbook — domains & product subdomains (WP2 phase 1 + WP4)

> Executed on the VPS (details in local-only `PORTFOLIO_CONTEXT.md`).
> Prerequisite: the owner's real domains, DNS pointing at the VPS IP.
>
> **Domain architecture (owner decision 2026-09-25):** the resume site is
> personal-brand; the products live on the **Nelurio** platform domain — never
> under the personal name. Domains ordered at Netcup 2026-09-25:
> `amir-khosravi.de`, `nelurio.com`, `nelurio.de` (brand protection).

## Domain map (the frozen target state)

| Hostname                              | Serves                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `amir-khosravi.de` + `www.`→apex      | Resume site (same webroot as today, `/var/www/nelurio/amir/`)                                           |
| `nelurio.com`                         | **Nelurio Suite library landing** (`nelurio.html` → its own webroot, e.g. `/var/www/nelurio/platform/`) |
| `nelurio.de`                          | 301 → `https://nelurio.com` (brand protection, nothing hosted)                                          |
| `app.nelurio.com`                     | Nelurio flagship app (web + `/api/v1` proxy to the Go API)                                              |
| `finello.nelurio.com`                 | 301 → GitHub Pages URL (or hosted later)                                                                |
| `nexdeutsch.nelurio.com`              | NexDeutsch app                                                                                          |
| `washhalle.nelurio.com`               | Washhalle app                                                                                           |
| old `*.duckdns.org` / `sslip.io` URLs | 301 redirects for a grace period                                                                        |

## One-time domain wiring (phase 0 → 1)

1. DNS (done at the registrar): for EACH of the three domains an `A` record on
   `@` and a wildcard `A` on `*` → VPS IP. (Wildcard covers every future
   product subdomain without touching DNS again.)
2. Main Caddyfile: import the per-site vhost files (pattern already exists).
3. Resume vhost: `amir-khosravi.de` + `www.` redirect — serve the same webroot
   as today (zero content changes).
4. Platform vhost: `nelurio.com` — serve the platform webroot
   (`nelurio.html` as its index + the cover PNGs). The page works unchanged:
   its internal links are relative (`/` = the resume link is
   `https://amir-khosravi.de` once set — flip at migration, one line).
5. Brand vhost: `nelurio.de` — `redir https://nelurio.com permanent`.
6. `caddy validate && systemctl reload caddy` → verify TLS issuance in logs,
   then 200 on all three hosts.

## Adding a new product (each, ~10 minutes)

1. Deploy the app (its own port, e.g. Docker/systemd unit on the VPS).
2. Create `/etc/caddy/<sub>.nelurio.com.Caddyfile`:
   ```
   <sub>.nelurio.com {
       reverse_proxy 127.0.0.1:<port>
   }
   ```
3. Add the import line to the main Caddyfile, then:
   `caddy validate && systemctl reload caddy` — Caddy fetches TLS automatically
   (the wildcard DNS is already in place).
4. Verify: `curl -I https://<sub>.nelurio.com` → 200/302.
5. Update the product's URL in `index.html` carousel, `products.html` AND its
   card in `nelurio.html` (one-line change each), CI green, deploy, verify 200.
6. Add a card for the product in the `nelurio.html` library grid
   (`article.prod` + `n{N}.*` i18n keys, en+de) if it is customer-facing.
7. Append the subdomain to the job-agent site-monitor list (daily.yml).

## Migration order once the domains resolve

1. Resume site → `amir-khosravi.de` (lowest risk, immediate branding win).
2. Platform landing → `nelurio.com` + `nelurio.de` redirect.
3. Nelurio flagship → `app.nelurio.com` (web + API proxy; keep the old URL as
   a temporary redirect).
4. Finello (GitHub Pages → either move to the VPS or the library card links
   stays GH Pages), NexDeutsch, Washhalle → their `*.nelurio.com` subdomains.
5. Update every product href in `nelurio.html` + `products.html` + the
   carousel, and the OAuth client (below), in one CI'd PR; deploy; verify.
6. Old duckdns/sslip.io hostnames stay as 301 redirects for a grace period.

## OAuth (WP3/T005) — final URLs after migration

- Google Cloud OAuth client (owner's console step, checklist in
  `docs/tasks/T005-google-oauth.md`): authorized JavaScript origin
  `https://app.nelurio.com`; authorized redirect URI
  `https://app.nelurio.com/api/v1/auth/oauth/google/callback`
  (Caddy proxies `/api/v1` to the Go API port; `APIPublicBaseURL` env moves
  accordingly). Until the domain lands, the duckdns URLs keep working — add
  both URI pairs in the Google client if configured early.
- The library page's account story ("Google Sign-in where offered") becomes
  literally true for the flagship with this step.

## Known constraints (honest)

- Single VPS = single point of failure. Mitigations in place: daily automated
  uptime monitoring with alerts (job-agent daily.yml), file-level backup of
  webroots before each deploy, all apps re-deployable from their repos.
- Shared auth/SSO is deliberately NOT in place yet (WP2 phase 3, data-driven);
  accounts live per app — the library page says so honestly.
- The `nelurio.html` preview lives in the resume webroot
  (`amir.nelurio.duckdns.org/nelurio.html`) until `nelurio.com` provisions;
  then it moves to the platform webroot and gets an `index.html` copy there.
