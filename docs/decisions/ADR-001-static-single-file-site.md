# ADR-001 — Static single-file site, no framework, no build

Status: accepted (carried over from project history; reconfirmed 2026-09-19)

## Context

The portfolio must be trivially deployable (scp a few files to a Caddy vroot),
fast, and maintainable by a single person plus AI agents without tool churn.

## Decision

One handwritten `index.html` (+ root assets). No framework, no bundler, no build
step. Fonts via CDN. All JS is small, inline, dependency-free.

## Consequences

- CI "build" is a no-op; gates are static checks + hermetic smoke instead.
- Tooling (prettier, htmlhint, Playwright) is dev/CI-only and must never become
  a runtime dependency.
- Formatting tools are scoped away from `index.html` (CONTRIBUTING traps #7).
