# AGENT HANDOFF — The Operating System (portable edition)

> **To the human:** give this file to your coding agent verbatim (drop it in the
> repo root and say "read AGENT-HANDOFF.md and set my project up this way"). It
> is self-contained and stack-agnostic — applicable to any modern software
> project (web app, API, CLI, library; any language).
>
> **To the agent:** read this top-to-bottom before writing any code. It is a
> complete engineering operating system — GitHub-centric workflow, CI
> guardrails, heavy linting, and a three-level testing pyramid — distilled from
> a production monorepo where **nine work packages were shipped entirely by AI
> agents through PRs** under exactly these rules. Nothing here is theoretical;
> every rule exists because skipping it burned real time somewhere. Where the
> doc shows a concrete tool, it is an _example_: §5.3 maps every gate to the
> equivalent tool for the common stacks.

---

## 0. The model in one paragraph

Every unit of work is a **task spec file in the repo** mirrored by a **GitHub
issue**. Agents claim the issue before coding, implement on a branch touching
ONLY the files the spec lists, run the full local verification ladder, and open a
PR whose body carries the **verify-command output as evidence**. CI (GitHub
Actions) re-runs everything — format, lint, build, unit + integration tests with
the race/sanitizer of your stack, dependency audit, and a hermetic e2e smoke
suite — and the PR merges only when green. Specs, decisions, traps, and handover
state all live as committed markdown, so a fresh agent session can pick up where
the last one stopped with zero verbal context. GitHub is the single source of
truth: issues are the task board, PRs are the evidence log, CI is the bouncer.

## 1. Non-negotiables (the contract)

1. **No code lands without a PR** — even solo/agent work. The main branch is
   only ever updated via merge.
2. **No merge without CI green.** The workflow file is the enforcer, not
   anyone's discipline.
3. **Every task = issue + spec file, spec before code.** If there is no spec,
   writing the spec is the first task.
4. **Claim before you code:** comment on the issue with your branch name + the
   files you will touch, before the first commit.
5. **Evidence on done:** the PR body carries the actual output of the spec's
   Verify commands. "Tests pass" without pasted output is not evidence.
6. **Touch ONLY files listed in the spec.** A new dependency not named in the
   spec = STOP and ask on the issue.
7. **Never edit generated code.** Regenerate it with the pinned generator
   version instead.
8. **Ambiguity → ask on the issue; never guess silently.**
9. **No `continue-on-error`, no `|| true`, anywhere in CI.** A gate that can be
   red-but-green is worse than no gate — it teaches everyone to ignore gates.
10. **Traps get written down the day they burn you** (living list in
    CONTRIBUTING.md — see §9).

---

## 2. Day-1 repo artifacts (create these before any feature code)

| Artifact                         | Role                                                                                                                                                                                                                                     | Who may change it                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `CONTRIBUTING.md`                | Operating contract for humans AND agents: branch model, claim protocol, agent rules, traps list                                                                                                                                          | anyone, via PR                                                        |
| `docs/PLAN.md`                   | Self-contained master plan: scope, stack, architecture, CI/test policy, timeline, explicit out-of-scope table                                                                                                                            | owner-approved PRs                                                    |
| `docs/EXECUTION.md`              | Work-package breakdown + the task-spec template (§2.1)                                                                                                                                                                                   | owner-approved PRs                                                    |
| `docs/CONTRACT.md`               | **Frozen interface contract** — for an HTTP API: every endpoint's method, path, auth, exact JSON shapes. For other systems: the schema/IDL/event/CLI contract. Implementing agents code against it, never invent shapes, never extend it | owner-approved PRs only, committed BEFORE the code that implements it |
| `docs/tasks/T###-slug.md`        | One spec file per task (template §2.1)                                                                                                                                                                                                   | spec'd just-in-time per work package, then frozen                     |
| `docs/tasks/WP#-slug.md`         | One umbrella spec per work package: problem, owner decisions baked in, PR + claim map, out-of-scope                                                                                                                                      | owner-approved before coding starts                                   |
| `docs/HANDOVER.md`               | Living handover, newest entry on top — state, evidence, as-built notes, traps, next up                                                                                                                                                   | updated at every milestone                                            |
| `docs/decisions/ADR-NNN-slug.md` | Lightweight ADRs, ~20 lines each                                                                                                                                                                                                         | via PR                                                                |

The point of `CONTRACT.md` being frozen _before_ implementation and off-limits
to implementing agents: contract debates happen once, in the open, on the issue —
not per-PR, and not invented mid-code. Same for work-package decisions: the
umbrella spec records **"owner decisions baked in"** numbered, and the agent asks
for approval/veto on the epic issue _before_ starting (see the claim example in
§3.3).

### 2.1 Task spec template (`docs/tasks/T###-slug.md`)

```markdown
# T### — <area>: <one-line what>

Status: draft|ready|done | Depends: T### | Est: 0.5d | PR n of WP#

## Goal

One sentence.

## Files (create/modify ONLY these)

- path/to/source_file
- path/to/test_file

## Spec

Exact signatures / SQL / behavior — enough detail that an agent never guesses:
function signatures with input→output contracts
Required test cases (ALL must appear):
explicit table rows / scenario list

## Verify (paste output in PR)

<the exact commands that prove this task, e.g. unit + integration + lint>

## Out of scope

Explicitly named non-goals (so nothing creeps silently).
```

Why "Files (create/modify ONLY these)" matters: it makes parallel agents
file-disjoint by construction, and code review becomes a diff-vs-spec check.

---

## 3. GitHub as the spine — `gh` CLI conventions

### 3.1 Bootstrap (once)

```bash
gh repo create OWNER/REPO --private --source=. --remote=origin --push
gh repo edit --delete-branch-on-merge --enable-issues

# working-set labels (one per area of the codebase — adjust names to the repo)
for l in backend frontend infra ci e2e; do gh label create $l --color 0e8a16; done
# keep the defaults: bug, enhancement, documentation, question, ...
```

### 3.2 Issue model

- **One issue per task**, one **epic issue per work package**.
- Titles are mechanically parseable:
  - epic: `[WP8] Admin surface: orders board, reports, feature flags`
  - task: `[WP8/T205] Admin orders board UI: list, detail, transitions`
- Labels: exactly one area label (`backend`/`frontend`/`infra`/`ci`/`e2e` or
  your equivalents), plus `bug`/`enhancement` where apt.
- The issue body mirrors the md spec 1:1 (it links the spec file). Stale issues
  get closed **with an evidence comment**, never silently deleted — the board
  must stay truthful.
- Design decisions are requested/approved **on the issue** (numbered list,
  "veto/approve before I start coding"). Approvals given in chat get recorded
  back on the issue so the trail is complete.

### 3.3 Claim-before-code (the conflict map for parallel work)

Comment on the issue **before the first commit**:

```markdown
**Claim:** branch `feat/T119-cleanup-jobs`; files:

- backend/orders/{expire.go,queries.sql,generated/,orders_integration_test.go}
- backend/config/{config.go,config_test.go}
- backend/cmd/jobs/main.go
- docs/tasks/WP9-* (Status lines)
```

On an epic, the claim doubles as the approval request — list the design
decisions and ask for veto before coding.

### 3.4 Branches, commits, PRs

- Branch: `feat/T###-slug` (or `fix/...`, `docs/...`) off an up-to-date main.
- Commit + PR title: `feat(T###): ...`, `fix(ci): ...`, `docs: ...`.
- PR body skeleton (evidence-on-done):

```markdown
Closes #30, closes #31 (WP8 PR 1 — epic #28). Specs: docs/tasks/T116-....md, ...
Contract frozen in docs/CONTRACT.md (committed first — docs(wp8), owner-approved on #28).

## What ships

- <bullet per task: exact behavior, endpoints, edge cases>

## Verify

- lint: 0 issues (pinned version)
- format check clean, build clean
- full unit + integration suite — ALL GREEN (paste output / counts)
- <required-case list from the specs, each with actual output numbers>
```

- Merge: **merge commit** (`gh pr merge --merge --delete-branch`), so the PR
  number is greppable in history forever.
- After merge: update the task files' `Status:` lines to done, add the
  `HANDOVER.md` entry, and let `Closes #N` close the issues.

### 3.5 Daily cheatsheet

```bash
gh issue list --state open                          # the board
gh issue view N --comments                          # spec + decisions + claims
gh issue comment N --body "..."                     # claim / ask / evidence
gh issue create --title "[WP9/T119] ..." --label backend --body-file spec.md
gh pr create --title "feat(T119): ..." --body-file pr.md
gh pr checks --watch                                # gate until CI verdicts
gh pr merge N --merge --delete-branch
gh api repos/:owner/:repo/labels                    # anything not covered above
```

`gh` (authenticated) is assumed available; if a sandbox blocks it, that is an
environment problem to surface to the human, not a reason to skip the PR flow.

---

## 4. CI guardrails — the workflow shape

Per-PR CI has three jobs, regardless of stack:

1. **lint-test** (per language area): format check → lint → build → unit +
   integration tests (race/sanitizer on, container-backed packages serialized).
2. **audit**: dependency vulnerability audit, run **twice** — all deps and
   prod-only — failing on high+.
3. **e2e-smoke** (gated on a successful build): boot the app **hermetically**
   (fixture/mock mode, zero external services), run the smoke suite, upload the
   report + traces **on failure only**.

The rules that shape the workflow file — all stack-independent:

1. **Actions pinned by commit SHA**, never floating tags — and the linter
   version is pinned too (`latest` drifts; your config is verified against a
   specific version).
2. **Path filters always include the workflow file itself** (workflow changes
   re-run CI), and each job path-filters to the tree it owns.
3. `concurrency: <group per ref>` with `cancel-in-progress: true` — superseded
   pushes don't queue.
4. **Timeout on every job** — no hung job eats runners.
5. **No `continue-on-error`, no `|| true`** — a flaky gate gets _fixed_, never
   muted.
6. Caches keyed by the real lockfile paths, per package directory.
7. **Artifacts on failure only** (HTML report + traces), short retention (3–7
   days).
8. **Self-skipping test honesty check** — `t.Skip()`-style skips make test
   runners exit 0 even when _everything_ skipped, so any dedicated integration
   gate must count declared vs actually-passed tests (§6.2).
9. Shell steps avoid `[ -n "$x" ] && cmd` idioms (exit 1 under `set -e` when
   empty) — use explicit `if` guards; use `xargs -r` equivalents so empty
   inputs don't run a bare command.
10. Builds in CI run in **hermetic mode**: the app must build and boot without
    live dependencies (mock/fixture layer behind an env flag). This is
    load-bearing for the e2e job — if your app has no mock mode, building one
    is a first-week task.

Skeleton (adapt tooling per §5.3; one such job-block per language in a
monorepo):

```yaml
name: CI
on:
  push:
    branches: [main]
    paths: ["src-a/**", "src-b/**", "e2e/**", ".github/workflows/ci.yml"]
  pull_request:
    paths: ["src-a/**", "src-b/**", "e2e/**", ".github/workflows/ci.yml"]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-test: # × per language area, working-directory: <area>
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@<sha>
      - uses: setup-<toolchain>@<sha> # version FROM the lockfile, cache on it
      - run: <fmt check> # fail on diff, never auto-fix in CI
      - run: <lint> # pinned linter version
      - run: <build>
      - run:
          <unit + integration tests> # sanitizers on; container-backed
          # suites serialized (-p 1 / single
          # process) to avoid reaper races

  audit:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@<sha>
      - run: <audit --level high> # twice: all deps AND prod-only

  e2e-smoke:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: [<build job>]
    steps:
      - uses: actions/checkout@<sha>
      - run: <build app in hermetic/mock mode>
      - run: <install e2e toolchain + browsers>
      - run: <smoke suite>
      - uses: actions/upload-artifact@<sha> # report + traces, if: failure()
```

Also plan (add when they become real): a **manual-only production image build**
workflow (`workflow_dispatch`, never auto-triggered) and a **full-stack e2e**
workflow (nightly/pre-release against a real stack, not per-PR).

---

## 5. Heavy linting — fix code, never mute gates

### 5.1 Policy (stack-independent)

- The lint gate must be **real and clean**. When the linter surfaces findings,
  the default is **fixing the code** — input-size limits, integer bounds
  checks, complexity splits, tightened file permissions, handled
  `Close`/rollback paths, dropped deprecated APIs — not widening the config.
- Every exclusion is **narrow and comment-justified**, and points at the reason
  (e.g. "required for i18n string literals; see CONTRIBUTING traps #2").
- Security-linter suppressions (`#nosec`-style) only with a written
  justification on the same line.
- Formatting is **not** the linter's job: a separate, dedicated format-check
  step that fails on any diff (`fmt -l`, `--check`, never auto-fix in CI).
- **Version pinning everywhere**: the same linter version in CI and locally.
  If the linter can't install locally (blocked network), CI is the lint gate —
  say so in the PR; never skip the gate silently.
- Dependency audit findings are **never loosened silently**: patch via
  lockfile overrides/resolutions to the fixed version. Most `audit` tools exit
  nonzero on any finding — that's a feature.

### 5.2 What "heavy" means concretely

At minimum, all of: formatter-as-gate; a general correctness linter; a
security/static-analysis pass; complexity limit (~30 cyclomatic, tuned per
codebase); strict typing (a `typecheck` script separate from build —
`tsc --noEmit`, `mypy`, strict compiler warnings-as-errors); err/exception
handling checks; unused/dead code detection. Exclusions rare, narrow, justified.

### 5.3 Stack adapter (pick your row; equivalent gate for gate)

| Gate                                   | Go                                                                 | TypeScript/JS                                                 | Python                           | Rust                           | JVM                                      |
| -------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- | -------------------------------- | ------------------------------ | ---------------------------------------- |
| Format check                           | `gofmt -l .`                                                       | `prettier --check` / `biome format`                           | `ruff format --check`            | `cargo fmt --check`            | spotless/fmt-maven-plugin `check`        |
| Lint                                   | `golangci-lint` (bodyclose, errcheck, gosec, gocyclo, staticcheck) | `eslint` (flat config, framework preset) + `knip` (dead code) | `ruff check` + `bandit`          | `clippy -- -D warnings`        | Error Prone / SpotBugs + detekt (kotlin) |
| Type check                             | (compiler)                                                         | `tsc --noEmit` as its own `typecheck` script                  | `mypy` (strict on your packages) | (compiler)                     | compiler `-Werror` set                   |
| Unit/integration runner                | `go test -race`                                                    | `vitest`/`jest`                                               | `pytest`                         | `cargo test` / `cargo nextest` | surefire/failsafe                        |
| Dependency audit (×2, all + prod-only) | `govulncheck ./...`                                                | `yarn audit --audit-level high` (+ `--groups dependencies`)   | `pip-audit`                      | `cargo audit` / `cargo deny`   | OWASP dependency-check                   |

Exemplar config (the Go set from the source project — this shape, translated):

```yaml
# golangci — narrow, justified exclusions only
version: "2"
linters:
  enable: [bodyclose, errcheck, gosec, gocyclo, staticcheck]
  settings:
    gocyclo: { min-complexity: 30 }
  exclusions:
    rules:
      - linters: [staticcheck]
        # <justification comment required — this one covers i18n literals
        #  that a naive rule flags; see CONTRIBUTING traps #2>
        text: "ST1018"
      - path: _test\.go
        linters: [errcheck]
```

---

## 6. Heavy testing — the pyramid

### 6.1 Unit tests

- Table-driven / parametrized, **race/sanitizer always on** (`-race`, ASAN/LSAN
  where the stack supports it).
- Mandatory on anything with logic: money/math, normalization/validation utils,
  auth flows, import/diff logic, third-party protocol flows (implement the
  provider's contract against a fake, hit the real one only in e2e).
- **Skip testing CRUD plumbing** — no coverage-percent vanity targets. Quality
  without ceremony.
- Third parties behind an **interface + fake driver** (e.g. a mock payment
  gateway that auto-finalizes): tests never depend on live external services.

### 6.2 Integration tests

- Named distinctly (`*_integration_test.go` / `tests/integration/` /
  `test_integration.py`), **self-skipping** when the env var is absent
  (`RUN_INTEGRATION_TESTS`, `INTEGRATION=1` …) — so unit runs stay fast without
  Docker, and CI arms them explicitly.
- Against **real infrastructure** (containerized DB/queue via testcontainers or
  compose), not mocks of it.
- Because self-skip makes runners exit 0 even when everything skipped, any
  dedicated integration gate adds the **honesty check** — count declared vs
  proved:

```bash
declared=$(grep -rhE '^func Test[A-Za-z0-9_]+\(t \*testing\.T\)' pkg/*_integration_test.go | wc -l)
go test -v -run Integration ./pkg/ | tee /tmp/out
proved=$(grep -c -- '--- PASS:' /tmp/out)
[ "$declared" -ge 1 ] && [ "$proved" -eq "$declared" ] || { echo "silent skip detected"; exit 1; }
```

(Translate the grep to your runner's declaration/report format — pytest:
collect-only count vs `-v` passed count; jest: listed vs passed. The invariant
is what matters.)

- CI splits suites: container-backed ones **serialized** (`-p 1` / single
  worker) to avoid container-reaper races, the rest parallel.
- Tests seed **their own fixtures** (own rows, unique identifiers) — never
  order against shared dev data; shared state starves parallel specs.

### 6.3 E2E — the two-suite pattern (hermetic smoke + full-stack)

Two suites, two scopes, stated honestly in every spec header:

| Suite          | Config                                    | Needs                                          | What it proves                                                                                                |
| -------------- | ----------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **CI smoke**   | `ci` config (`yarn test`-equivalent)      | hermetic/mock-mode prod build only, zero infra | the built artifact boots: core flows, i18n/layout invariants, no server errors on public routes, a11y ratchet |
| **Full-stack** | main config (`yarn test:full`-equivalent) | live backend + DB + seeded data                | real wiring: auth walls, admin surfaces, third-party drivers                                                  |

CI runs only the smoke suite per PR. The full suite runs locally/pre-release —
per-PR full-stack e2e would make CI slow and flaky; the smoke/full split is the
guardrail balance. For a web frontend of any backend stack, Playwright is the
default choice; for an API-only project, the same pattern applies one level
down (boot the real server against a real DB, drive it with an HTTP test suite).

Smoke config (hermetic — boots the built app itself; web example):

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
export default defineConfig({
  testDir: "./tests-ci",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-ci" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    channel: "chromium", // full chromium (headless shell is a separate download)
    screenshot: "only-on-failure",
  },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 7"] } }], // mobile-first if the product is
  webServer: {
    command: "yarn --cwd ../frontend start", // serve the HERMETIC build
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PORT: String(PORT) },
  },
});
```

Full-stack config (health-gated, serialized, evidence-rich):

```ts
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://web:3000";
export default defineConfig({
  testDir: "./tests",
  // global-setup waits for the backend health endpoint before any test runs —
  // read health from the backend directly, not through the web origin's proxy.
  globalSetup: "./support/global-setup.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Single worker: authed fixtures share one login (resend cooldowns are
  // per-identity — parallel logins would rate-limit).
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry", // cheap when green, rich when flaky
    channel: "chromium",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...devices["Pixel 7"],
  },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 7"] } }],
});
```

E2E discipline (each rule paid for by a real flake or false-green):

- **Health-gated global setup** — no test starts until the stack answers.
- **Auth fixtures drive the real login UI once**, persist the session, and —
  critically — **re-validate cached sessions by probing the API with the stored
  cookie/token** (200 = reuse, else discard + re-login). A stored credential's
  _presence_ is not proof of a live session; a stale artifact slipping past the
  gate poisons the whole run.
- **Seed directly into the DB** (idempotent `INSERT … ON CONFLICT DO NOTHING`
  style) for accounts you need; drive everything else through the UI.
- **Unique identifiers per run** (e.g. `0912` + `Date.now()%10^7` phones) to
  dodge cooldowns and cross-run collisions; never re-drive an auth wall inside
  its cooldown window.
- **A11y ratchet** (web): axe serious+critical violations counted per page,
  stored in a committed `a11y-baseline.json`; counts may only go DOWN; the
  baseline has an `expires` date (~30 days) after which the gate fails on
  purpose so recorded debt can't fossilize. Re-record deliberately:
  `UPDATE_BASELINE=1 <smoke run> -g a11y`.
- **Mobile-first device** (Pixel 7) when the product is mobile-first.
- **Locator hygiene**: strict locator modes mean selector regexes must be tight
  (a pattern matching main content AND footer is a spec bug — scope to a
  region).
- **Dev-server reload**: a dev-mode server can compile-and-reload mid-test,
  silently discarding typed input — test against prod builds, or double-navigate
  and assert every fill "stuck".
- **One happy path is the regression backbone**: the single end-to-end user
  journey (e.g. search → item → cart → checkout → confirm → status page).
  That one spec catches most real breakage; guard specs (empty state, invalid
  input, 404, auth bounce) surround it.
- **Async third-party writes are tasks, not results**: an HTTP 202 can still
  fail later — always wait-and-check the task's final status, never assert on
  the submit response alone; and never assert read-model/search results
  synchronously after a write — poll.

### 6.4 Local gate ladder (run ALL before every push)

Generic shape — one line per gate, the exact commands pinned per repo in its
CONTRIBUTING/Makefile:

```bash
<fmt check> && <lint> && <build>                     # static gates
<unit tests>                                          # fast suite
<integration tests, env-armed, serialized>            # real infra (Docker)
<frontend: typecheck && lint && unit && build>        # if a frontend exists
<e2e smoke against a hermetic build>                  # always
<e2e full-stack>                                      # when the task touched real wiring
```

Wrap groups in `make` targets (or `just`/`package.json` scripts) with a
self-documenting `help` target. If a local tool can't be installed (blocked
network), say so in the PR and let CI be that gate — never skip silently.

---

## 7. The agent operating loop (fresh session → merged PR)

Follow this mechanically, every session:

1. **Bootstrap your context** (reading order matters):
   `CONTRIBUTING.md` (rules + traps) → `docs/HANDOVER.md` top entry (state +
   next up) → the task spec files → the `docs/CONTRACT.md` section you'll
   implement against. Never trust memory of a previous session; the docs ARE
   the memory.
2. **Pick work from the board**: `gh issue list --state open`. If the task has
   no spec file yet, writing the spec (umbrella WP doc + per-task files + issues)
   IS the first task, ending in an owner approval request on the epic.
3. **Claim**: comment branch + files on the issue (§3.3). Wait for approval on
   specs that carry design decisions.
4. **Branch**: `git checkout main && git pull && git checkout -b feat/T###-slug`.
5. **Implement strictly within the spec's file list.** Ambiguity → `gh issue
comment` and stop that thread of work; pick up a different file meanwhile if
   possible. Generated code: run the pinned generator, never hand-edit.
6. **Run the full local gate ladder** (§6.4). Fix until clean — including lint
   findings in code, not config.
7. **PR**: title `feat(T###): …`, body with `Closes #N` + What ships + Verify
   (pasted output, real numbers).
8. **Watch the gates**: `gh pr checks --watch`. Fix forward with `fix(ci)` /
   `fix(lint)` commits on the same branch. A flaky test gets diagnosed and
   fixed (e.g. wait for a client-side-navigation-committed state before
   asserting), never retried-until-green or muted.
9. **After merge**: update task `Status:` lines to done (+ as-built notes where
   reality deviated from spec), add the `HANDOVER.md` entry (template below),
   confirm issues auto-closed, delete the branch.
10. **Log traps** the same day (§9).

### HANDOVER entry format (newest on top, updated in place)

```markdown
## 2026-09-07 — WP8 admin surface delivered (PRs #37, #38, #39)

- **What is now live end-to-end**: ...
- **Verified**: <exact commands + counts: "full suite ALL GREEN", "smoke 20/20", "lint 0 issues">
- **As-built**: deviations from spec, patterns the next agent must reuse
- **New traps (all burned real time)**: ...
- **Next up**: ...
```

When a milestone ends and a new one starts, the newest entry may open with a
**fresh-session bootstrap** — a numbered "You are a fresh session. Do this in
order: 1. read this file, then CONTRIBUTING, then these specs; 2. claim on issue
#N; 3. env/runbook; 4. sequence + branch map" plus a "State you inherit"
paragraph. This is how agent-to-agent continuity survives with zero verbal
context.

---

## 8. Parallel agents (worktrees + file isolation)

- **One git worktree per concurrent writing agent**:
  `git worktree add ../repo-T119 -b feat/T119-…`; remove after merge.
- **Private build caches per worktree** (a shared cache corrupts under
  concurrent builds): `GOCACHE=$PWD/.gocache`, per-worktree `node_modules` /
  `target/` / `.venv`. Don't commit them.
- Claims are the conflict map: file lists in specs must not overlap across
  concurrent tasks. When two modules genuinely need the same underlying
  resource (e.g. the same DB tables), each writes its own access path rather
  than two agents editing one file.
- One PR per agent/branch; merge in dependency order; regenerate shared
  generated-code after merges.

## 9. Traps list (living, in CONTRIBUTING.md — add every real cost)

Format: numbered, bold title, one short paragraph each — symptom AND diagnosis
shortcut. Real examples from the source project, kept only to show the expected
detail level (write yours in your own domain's terms):

1. **Unit confusion at a currency boundary** (DB stores minor units as
   integers, UI displays major units): one wrong direction = 10× error; the
   conversion happens in exactly one place.
2. **Invisible characters in user text** (e.g. zero-width non-joiner in Persian,
   combining marks, non-breaking spaces): naive string compares fail; normalize
   in pipelines; lint exemption documented.
3. **Read models lag writes** (search indexer drains async ~≤1 s after the DB
   commit): never assert search results synchronously after a write — poll.
4. **Stale dev servers squat on ports**: an old process answers with OLD code
   (mystery 404s, auth bounces); a failed bind only logs in the NEW process's
   log. Check the port listener table first; kill by pid (name-matching kill
   patterns rarely match build-temp paths).

Rule of thumb: if a gotcha cost more than ~15 minutes, it goes in the list the
same day.

## 10. Adoption paths

**Bootstrapping a new repo:** create the §2 artifacts (CONTRIBUTING + PLAN +
execution plan + CONTRACT stub + empty tasks/HANDOVER) → `gh repo create` +
labels (§3.1) → land the CI workflow + lint configs **with the FIRST code** (a
repo whose first PR runs its gates starts as it means to continue) → the
hermetic/mock mode + e2e scaffold as its own early work package → then feature
work packages, spec'd just-in-time, one epic each.

**Retrofitting an existing repo:** same order, as separate PRs —

1. `docs: CONTRIBUTING + plan/handover artifacts`;
2. `ci: workflow + lint configs` (expect it red; that's the point);
3. `fix(lint): resolve surfaced findings` in code, per §5 policy;
4. close the honesty gaps the new gates expose (silently-skipped integration
   tests, missing smoke specs) as their own tasks;
5. only then new features under the full loop.
   Existing work gets reflected onto issues (one per open thread, closed with
   evidence when done) so the board becomes truthful on day one.

---

_Source: harvested from a production monorepo (Go + Postgres + Meilisearch
backend, Next.js frontend, Playwright e2e, GitHub Actions) where nine work
packages and 14 PRs were shipped entirely by agent sessions under these rules —
then de-specialized. The Go/yarn/Playwright snippets that remain are examples of
the shape, not requirements._
