# WP2 — Product platform: one brand, storefront + app subdomains

Status: in flight | Phases 0–4 per owner-approved analysis (2026-09-25)

## Problem / vision

The owner wants the portfolio to double as a **platform**: all products on one
hosting base, presented as a coherent product portfolio that impresses
companies (ops maturity, creativity, tooling fluency). Approved architecture:

- Resume site stays a **static storefront** — never gains accounts/app state.
- Apps live as **subdomains of one real domain** on the same Oracle VPS
  (Caddy). No new hosting cost.
- Shared accounts/SSO are explicitly **Phase 3, data-driven** — not built now.
- Prerequisite for the subdomain branding: the owner buys a real domain
  (~10 €/yr). Everything else is buildable domain-agnostic **now**.

## Phases

| Phase | Content                                                                              | Status              |
| ----- | ------------------------------------------------------------------------------------ | ------------------- |
| 0     | Owner buys domain (IONOS/Netcup, ~10 €/yr) — only owner-executable step              | blocked on owner    |
| 1     | Caddy vhosts for app subdomains + DNS + URL swap (runbook: docs/platform-runbook.md) | ready, blocked by 0 |
| 2     | **Products storefront page** (static, EN/DE, no accounts) + nav tab                  | **this WP, now**    |
| 3     | Shared auth/SSO — only if real users demand it                                       | not started         |
| 4     | Privacy-friendly analytics (self-hosted GoatCounter) for traction proof              | not started         |

## Tasks

- T003 — products.html storefront + nav + CI/tests (this phase-2 delivery,
  domain-agnostic; URL swap later is a one-file change).

## Out of scope

Accounts on the static site; a second platform brand/domain; auto-purchasing
the domain; touching app codebases.
