# T002 — site: CV redesign (Canva-style professional template)

Status: done (PR #7, merged 2026-09-24; single A4 page verified; deployed, live 200)

## Goal

Owner-directed: professional Canva-grade CV for the site's "Download CV (PDF)"
button, with photo and full details. Design reference browsed live in the
Canva professional-resume gallery; implemented in code (no login, no
watermark, ATS-parseable real text).

## As-built

- Deep navy-violet sidebar (brand-consistent): photo, contact incl. GitHub,
  languages with level bars, certificates, tools chips.
- Main: profile, five live projects (Finello added — was missing), tech
  stack, working style, education, availability footer.
- Single A4 enforced (iterating spacing until Chrome prints exactly 1 page).
- PDF regenerated with headless Chrome + `--virtual-time-budget=8000`
  (Inter CDN needs the budget; absolute `file:///` photo src per traps #3).
