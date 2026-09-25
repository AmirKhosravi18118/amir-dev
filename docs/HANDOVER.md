# HANDOVER — living handover log (newest entry on top)

## 2026-09-25 (latest) — WP4/T006: "Nelurio Suite" library landing live (PR #21) + domains ordered

- **What landed:** `nelurio.html` — the product-library landing with the
  platform identity coordinated with the resume site (same token family, own
  "N" mark), 5-product grid (real covers + honest status chips + real hrefs),
  the accounts story (per-app accounts today, unified login planned — no fake
  checkout), ops strip, roadmap chips, i18n EN/DE, and the T004 consent layer
  wired to **GA4 web stream #2 "Nelurio Platform" (`G-M5C9K1JWH4`, stream 15842112317)** created in property 555984228 — platform data separate from
  portfolio data. `docs/platform-runbook.md` now freezes the two-domain
  architecture (resume = `amir-khosravi.de`, platform = `nelurio.com` apex,
  `nelurio.de` → 301, apps on `*.nelurio.com`, final OAuth URLs); T005's
  redirect-URI line corrected accordingly.
- **Owner state:** all three domains **ordered at Netcup** (2,21 €/mo =
  26,52 €/yr incl. VAT; order in manual new-customer review). Post-order
  server/hosting upsells correctly declined. Next owner-side step:
  provisioning email → then DNS `A @` + `A *` → 92.5.111.34 for each domain
  (owner-supervised agent click-through in the IAB pane is the established
  pattern).
- **Verified:** local gates + smoke **30/30** (5 new platform cases), CI green
  (lint/audit/e2e 49s), merged PR #21, deployed preview — live 200 at
  `amir.nelurio.duckdns.org/nelurio.html`; in-browser check: consent persisted
  → gtag auto-injected with the stream-2 ID.
- **As-built:** the hero h1 is brand-first ("Nelurio Suite") — the first test
  draft assumed a statement-h1 and failed; brand-in-h1 is the correct pattern
  for a platform landing. QC recipe for scroll-reveal pages: Playwright
  context with `reducedMotion: "reduce"` + fullPage screenshot (naive
  full-page shots show reveal-hidden content, known trap).
- **Next up:** domains provision → execute the runbook migration (vhosts + TLS
  → resume to `amir-khosravi.de` → library to `nelurio.com` + `.de` redirect →
  app subdomains → href flip PR → 301s) → then the OAuth client checklist
  (T005) against the final `app.nelurio.com` URLs.

## 2026-09-25 (latest) — Analytics ACTIVATED: GA4 live on both pages (PR #18)

- **Live:** `data-ga-id="G-3EYMYY7KCD"` ships on index.html + products.html —
  the one-attribute activation frozen in the T004 spec. GA4: account
  `amir-khosravi.de` (409471058), property `amir-khosravi.de` (555984228),
  web stream "Portfolio" (15841969369), timezone Germany, currency EUR,
  event-data retention 14 months, consent mode v2 denied-by-default (gtag
  loads only after opt-in). Created in the owner's GA console during a
  supervised browser session; console work driven end-to-end by agent.
- **Verified:** local gates + smoke 25/25 (5 rewritten analytics cases) and CI
  green (lint/audit/e2e); deployed file-by-file; live 200 with the attribute
  present; in-browser live check: banner visible with zero gtag scripts →
  Accept → `gtag/js?id=G-3EYMYY7KCD` injected, consent=granted persisted →
  property Realtime receiving hits.
- **As-built:** the analytics tests assumed "no ID in prod" (route-rewrite
  injected a test ID); with the real ID shipped they were rewritten — the
  synthetic no-ID case now STRIPS the attribute (regex ` data-ga-id="[^"]*"`),
  keeping the inert path covered for future changes. Realtime showed US
  entries alongside our German test visit — likely Google's own tag-verification
  probes; not investigated further.
- **Side observation for the owner:** his pre-existing GA4 property for
  www.saadtattoo.de (account "Google Ads Account" 396293654, property 539626310) reports in **US Dollar** and has no industry set — worth switching
  to EUR if he looks at that dashboard.
- **Next up (owner-only, unchanged):** ① Google Cloud OAuth client for Nelurio
  (checklist in docs/tasks/T005-google-oauth.md); ② domain `amir-khosravi.de`
  (Netcup ~5–6 €/yr) → WP2 phase 1 runbook.

## 2026-09-25 — WP3/T005 spec closed: Google Sign-in frozen + activation runbook (PR #16)

- **What landed:** docs/tasks/T005-google-oauth.md — the frozen spec for
  Google Sign-in on Nelurio (first platform app) documenting the flow AS BUILT
  in nelurio-code@385ce67: authorization-code flow, `nelurio_oauth_state`
  cookie (10 min, HttpOnly, constant-time compare), stdlib-only JWKS
  id_token verification (RS256/iss/aud/exp), account linking rules
  ((provider,subject) → same-email link → passwordless create), frontend
  provider buttons, error-code → i18n mapping — plus the owner activation
  checklist (Google Cloud client → `/etc/nelurio/nelurio.env` → restart).
- **Verified:** local gates green (lint/format/check:js/audit/smoke 25/25);
  live `GET /api/v1/auth/oauth/providers` returns google:false — the layer is
  inert until the owner's keys land, exactly like the consent layer.
- **As-built:** the WP3 draft in this file previously described an
  `auth/google/*` + userinfo-endpoint plan; the real nelurio implementation
  standardized on `auth/oauth/{provider}/*` + JWKS-verified id_token (already
  in nelurio's frozen CONTRACT). The spec records as-built, not the draft.
- **Next up (owner inputs pending — all three are ~10-minute steps):**
  ① GA4 Measurement ID → `data-ga-id` on both pages, deploy; ② Google Cloud
  OAuth client → `/etc/nelurio/nelurio.env` + API restart (checklist in T005
  spec); ③ domain `amir-khosravi.de` → WP2 phase 1 runbook.

## 2026-09-25 (later) — WP3/T004 live: consent-gated analytics layer (PR #13)

- **Live:** consent banner layer on index.html + products.html (EN/DE, consent
  mode v2 denied-by-default, gtag only after opt-in, decline persisted).
  **Inert until the owner's GA4 Measurement ID is placed in `<html
data-ga-id>`** — that one attribute is the whole activation step. Live 200.
- **Verified:** smoke 25/25 (5 analytics cases), lint/audit green, CI green.
- **As-built:** products.html gained the global `[hidden]{display:none!important}`
  rule it was missing (banner display:flex overrode hidden — real bug).
  **New trap #11:** Playwright `addInitScript` runs before documentElement
  exists — setting html attributes there crashes; inject test state by
  route-rewriting the served HTML instead (see tests-ci/analytics.spec.ts).
- **Next up (owner inputs pending):** ① GA4 Measurement ID → set data-ga-id,
  deploy, done; ② Google Cloud OAuth client (Nelurio as platform app, T005) →
  implement in the Nelurio repo; ③ domain purchase (WP2 phase 0).

## 2026-09-25 — WP2 phase 2 live: products.html storefront (PR #10)

- **Live:** products.html — the platform storefront (5 products, status chips,
  per-product proof notes, ops strip: VPS/Caddy/CI/monitoring/testing/GDPR,
  EN+DE). index.html nav has a Products tab. Live 200 verified.
- **Verified:** local + CI smoke 20/20 (6 new products cases), lint/audit green.
- **As-built:** standalone page mirrors index.html's design system and i18n
  engine; prettier-exempt like index.html; check:js covers 5 script blocks now.
  WP2 phase 1 is frozen in docs/platform-runbook.md — when the owner's domain
  arrives, follow it (vhosts → migration order → URL swap in index/products +
  job-agent monitor list).
- **Next up:** owner buys the domain (phase 0 — only owner step) → phase 1
  migration; Telegram token still pending (30 s owner step); phases 3/4 are
  data-driven, do not start without real user demand.

## 2026-09-24 — T002 CV redesign live + job-agent runs on GitHub Actions (PC-off)

- **Live:** new CV PDF (Canva-style, 1 page, Finello included) on the site's
  Download button (live 200). Job-agent: `.github/workflows/daily.yml` runs
  08:00 Berlin on GitHub — collect → digest → commits results to the repo →
  monitors the portfolio (alerts via Telegram + issue when down). Verified by
  a successful manual dispatch run.
- **Blocked on owner (30 s):** Telegram bot token — BotFather `/newbot` in
  their desktop Telegram. Then: local.json + `npm run setup:telegram` +
  `gh secret set TELEGRAM_TOKEN/TELEGRAM_CHAT_ID` on job-agent → digests flow
  to Telegram. Computer Use (desktop control) is NOT available in ZCode
  sessions on this host — do not retry it.
- **As-built:** telegram config resolves env vars first (Actions secrets),
  local.json second. Canva itself cannot be edited without the owner's login;
  "Canva template" requests are best served by browsing the public gallery for
  the layout and re-implementing in cv_print.html.
- **Next up:** Telegram wiring (above); SMTP auto-send remains roadmap;
  weekly stats digest optional.

## 2026-09-22 — WP1 shipped end-to-end: carousel + Finello live (PRs #1, #4, #5)

- **What is now live end-to-end (after deploy):** the projects section is a
  5-slide showcase carousel (7 s autoplay with progress bar, arrows, dots,
  swipe, keyboard, wrap) + a view-all modal listing all projects vertically.
  **Finello** (React 19 · TS · Tailwind 4, GitHub Pages) is slide 5 with its
  generated cover. Copy says five products everywhere (hero.sub, lead,
  about.shipS — EN+DE). CI enforces prettier/htmlhint/inline-js/audit +
  14-scenario Playwright smoke on every PR; `shot.png` now lives in the repo.
- **Verified:** PR #4 and #5 CI fully green (lint 14 s, audit 13 s, e2e-smoke
  43 s); local smoke 14/14; spec cases 1–8 all pass (evidence in PR #5 body).
- **As-built:** slide list = `#carTrack` children; dots/pnum/progress/modal all
  derive from it at runtime. Autoplay gate: in-viewport ∧ tab-visible ∧ no
  hover/focus ∧ modal closed. Modal clones get `setLang` re-run. The
  `#carTrack .proj` selector (not bare `.proj`) is required in tests — modal
  clones double every selector (burned once, see tests comments).
- **New traps:** (9) prettier runs AFTER every manual md edit — one CI lint
  failure came from editing a table post-format; (10) headless screenshots of
  the carousel: autoplay is IO-gated, so anchor-URL + reduced-motion shots show
  slide 1 reliably (test 4 must scrollIntoView first).
- **Next up:** deploy merged main to the VPS (file-by-file: index.html,
  finello.png) + verify 200. Then: future projects append per CONTRACT §4;
  real screenshots replacing covers when the owner supplies them.
- **Fresh-session bootstrap:** 1) AGENT-HANDOFF.md → CONTRIBUTING.md → this
  file; 2) `gh issue list --state open`; 3) write spec → issue → claim →
  branch → PR; 4) deploy is post-merge, file-by-file, verify 200.

## 2026-09-19 — Operating system adopted; WP1 starting

- **State you inherit:** the repo now runs the AGENT-HANDOFF.md operating
  system (PR-only `main`, task specs + issues, CI gates). Artifacts landed in
  PR "docs: operating-system artifacts". Labels exist: `site` `docs` `ci`
  `deploy` `e2e`. CI arrives in the next PR (workflow + htmlhint/prettier/
  inline-JS gates + npm audit + Playwright hermetic smoke).
- **What is live end-to-end:** unchanged site (stacked project cards), deployed
  on the VPS. The carousel (WP1/T001) is specced and frozen in
  docs/CONTRACT.md §4 — implement against that contract, nothing else.
- **Verified:** n/a (docs-only change; first CI run happens with the CI PR).
- **As-built:** `PORTFOLIO_CONTEXT.md` (credentials, server details) is
  deliberately untracked/gitignored — local-only source for deploy specifics.
- **Next up:** CI PR → then T001 (claim on its issue first) → deploy merged
  `index.html` to the VPS and verify 200.
- **Fresh-session bootstrap:** 1) read AGENT-HANDOFF.md, then CONTRIBUTING.md,
  then this file; 2) `gh issue list --state open`; 3) claim on the T001 issue
  with branch + files; 4) follow docs/CONTRACT.md §4 exactly.
