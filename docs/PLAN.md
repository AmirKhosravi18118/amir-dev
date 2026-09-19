# PLAN — amir-dev portfolio site

## Scope

Personal portfolio of Amir Khosravi (developer & BWL student, Wiesbaden), live
at `https://amir.nelurio.duckdns.org`. Audience: recruiters and potential users
of the shipped products. The site doubles as a **showcase for the products
themselves** — every project card leads to a live, usable app.

## Stack & architecture (ADR-001)

- Single static `index.html` — handwritten HTML/CSS/JS, zero dependencies, zero
  build. Inter font via Google Fonts CDN. Dark theme, glass cards.
- Bilingual DE/EN via the `I18N` dictionary engine (ADR-002, CONTRACT §2).
- Scroll-reveal via IntersectionObserver; `prefers-reduced-motion` respected.
- `cv_print.html` → headless Chrome → `Amir_Khosravi_CV.pdf`.
- Repo tooling (node-based, dev/CI only): htmlhint, prettier (scoped), inline-JS
  syntax check, npm audit, Playwright hermetic smoke via local http-server.

## CI / test policy (CONTRACT §5, CONTRIBUTING)

Three jobs per PR and on `main`: `lint` (format check + htmlhint + inline-JS),
`audit` (all deps + prod-only, high+), `e2e-smoke` (Playwright against a static
server; boots, no console errors, i18n invariants, carousel behavior, images).
Actions pinned by commit SHA; no `continue-on-error`; artifacts on failure only.

## Work packages

- **WP1 — Projects showcase** (current): auto-rotating carousel (7 s), arrows,
  dots, progress bar, view-all modal; smoke coverage. See
  `docs/tasks/WP1-projects-showcase.md`.
- Future candidates (owner will trigger, not committed): real screenshots
  replacing poster mockups; LinkedIn link; custom domain `amir-khosravi.de`
  wiring; additional projects appended to the carousel.

## Out of scope (explicit)

| Not doing | Why |
| --- | --- |
| Framework / build step / bundler | ADR-001 — the site is deliberately handcrafted |
| Backend / CMS / analytics | Static by design; GDPR-cheap |
| Secrets in repo | Server details live in local-only `PORTFOLIO_CONTEXT.md` |
| Auto-deploy from CI | Deploy is a deliberate manual step after merge (CONTRACT §5) |
| New social/contact channels | Owner decision: email + phone only |

## Deployment

Post-merge, changed files are copied individually to the VPS webroot and the
live URL is verified (details in local `PORTFOLIO_CONTEXT.md`).
