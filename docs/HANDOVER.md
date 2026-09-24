# HANDOVER — living handover log (newest entry on top)

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
