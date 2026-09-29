# 🏗️ ENGINEERING STANDARD — the product tunnel (v1.0, 2026-09-28)

> **This is THE standard.** Every product that wants to appear in the Nelurio
> Suite library (nelurio.com) must pass through this document — 100%, no
> exceptions, no shortcuts. Source: CODE-FIREWALL-PROMPT (adopted from the
> hamneshin project analysis, owner-approved 2026-09-28).
> CEO enforces; the violation ledger (AGENT_COMPANY.md) records every breach.

## The tunnel rule

**No product enters the library without all of these:**

1. Engineering OS adopted in its repo: `CONTRIBUTING.md` + `docs/PLAN.md` +
   `docs/EXECUTION.md` + `docs/CONTRACT.md` (frozen API surface) +
   `docs/HANDOVER.md` — per AGENT-HANDOFF.md.
2. CI on every PR: format-check → lint → build → tests → dependency audit ×2
   → hermetic smoke. No `continue-on-error`, no `|| true`, actions SHA-pinned.
3. Critical-path smoke tests (login, navigation, form-save) — red PR = no merge.
4. Architecture boundary rules as tests (core never imports domains).
5. Quality ledger `quality-baseline.d/` (append-only) once the repo has tests.
6. One task = one PR with pasted verify output (evidence-on-done).
7. Live on the platform: vhost under `*.nelurio.com` (runbook recipe) + card
   in `nelurio.html` (i18n en+de, real status chip, honest CTA).

## Repo-type gate maps (minimum per stack)

| Gate | Go | TS/JS static site | TS/JS app |
|---|---|---|---|
| format | gofmt -l | prettier --check (exempt handcrafted HTML) | prettier --check |
| lint | go vet + golangci-lint | htmlhint | eslint flat |
| build | go build | — (no build) | tsc/vite build |
| tests | go test -race | playwright smoke | vitest + playwright |
| audit | govulncheck | npm audit ×2 | npm audit ×2 |
| guards | scripts/ci/check-*.sh with --self-test | check-inline-js, link integrity | bundle-size, env-contract |

## Daily rules (top of every coding session in any project)

1. Before push: run the repo's full local gate ladder. Red = stop.
2. Touch ONLY the files the task lists. Side-"improvements" = separate issue.
3. New dependency = STOP: spec it on the task first.
4. Every behavior change proven by a test that was red before, green after.
5. No silent behavior: missing critical dependency = fail loudly, never
   warn-and-continue.
6. Frozen contracts only via `contracts/` or CONTRACT.md; golden fixtures
   regenerate consciously.
7. User-facing text from the i18n catalog (en+de both).
8. No logging of tokens/OTP/passwords/private messages.
9. One task = one PR; PR body carries verify output.
10. Lessons learned land in AGENTS.md / the violation ledger the same day.

## Rollout status (2026-09-28)

| Repo | OS docs | CI | smoke | guards | ledger |
|---|---|---|---|---|---|
| amir-dev (portfolio) | ✅ | ✅ | ✅ 30 | partial (check-inline-js) | — |
| nelurio-code | ✅ | ✅ | partial | — | — |
| job-agent | — | ✅ daily | — | — | — |
| finello | partial | ✅ (GH Pages CI) | — | — | — |

Missing rows become tasks in the owning repo — CEO schedules them; no product
feature work jumps the queue ahead of closing a red row.
