# HANDOVER — living handover log (newest entry on top)

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
