# HANDOVER — living handover log (newest entry on top)

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
