# Amir Khosravi — Developer Portfolio & Product Platform

**[amir-khosravi.de](https://amir-khosravi.de)** · **[nelurio.com](https://nelurio.com)** · Iran · DE (C1) / EN (B2) / FA (native)

> Solo-built, live-in-production SaaS platform + personal portfolio. This repository
> is the source of the portfolio site and the ops tooling around the platform.

## Live products — one platform, four apps

| Product | URL | What it is |
|---|---|---|
| **Nelurio** | [app.nelurio.com](https://app.nelurio.com) | AI study platform: task planner, spaced repetition, AI tutor, focus timer, daily briefings |
| **NexDeutsch** | [nexdeutsch.nelurio.com](https://nexdeutsch.nelurio.com) | German vocabulary learning with spaced practice |
| **Finello** | [finello.nelurio.com](https://finello.nelurio.com) | Personal finance for students: budget calendar, expense tracking |
| **Washhalle** | [washhalle.nelurio.com](https://washhalle.nelurio.com) | Operations suite running for a real car-wash business |

All four share one Go backend, one Postgres database and one owner console
([admin.nelurio.com](https://admin.nelurio.com)) — a Wix-Studio-style management
panel with live system monitoring, guided integrations and bilingual DE/FA UI.

## What this repo contains

- **Portfolio site** — [amir-khosravi.de](https://amir-khosravi.de), handwritten
  HTML/CSS (no framework where none is needed), incl. my ATS-safe CV
- **Store funnel** — pricing, cart checkout with PayPal + Iran-region Toman
  pricing (live EUR→IRR rate), consent-first analytics
- **Ops tooling** — `tools/` rate watchdog, audits, CI workflows

## Engineering in brief

- **Backend:** Go (chi), Postgres (Neon), PBKDF2 auth, CSRF, rate limiting
- **Frontend:** React 19 + Vite (app + admin), handwritten HTML/CSS (marketing)
- **Infra:** one self-operated VPS — Caddy auto-TLS, systemd services, PR-gated
  deploys (vet + test + build before install), pinned-worktree releases
- **Quality:** PR/CI flow on every change, i18n across 10 languages, 44px tap
  targets, honest-data law (no fake numbers anywhere in the UI)
- **Ops:** daily cron automations, Telegram alerting, live external-service probes

## Repository layout

```
site/               amir-khosravi.de (static, DE/EN, project case studies)
*.html + legal/     nelurio.com store funnel (pricing, checkout, account, legal)
api/                contact API (Go) with tests and .env.example
tests-ci/           Playwright end-to-end tests
.github/ .githooks/ CI workflows and the pre-push guard (no direct push to main)
scripts/            repeatable deploy, artifact push, CI contract check
tools/              watchdogs, audits and mock-up generators
docs/               engineering standard, contracts, ADRs, task briefs, handover
```

Local-only artefacts (QC screenshots, generated previews) are git-ignored; see `.gitignore`.

## Contact

**Amir Khosravi** — [amir-khosravi.de](https://amir-khosravi.de) ·
[LinkedIn](https://www.linkedin.com/in/amir-khosravi18118) ·
a.h.khosravi1383@gmail.com

© 2026 Amir Khosravi
