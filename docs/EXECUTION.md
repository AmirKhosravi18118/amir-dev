# EXECUTION — work packages & task specs

## Current work packages

### WP1 — Projects showcase carousel (in flight)

Epic spec: `docs/tasks/WP1-projects-showcase.md` · Task specs:
`docs/tasks/T001-projects-carousel.md`

| Task                  | One-liner                                                                          | Status                  |
| --------------------- | ---------------------------------------------------------------------------------- | ----------------------- |
| CI-gates prerequisite | workflow + lint/format/audit + smoke scaffold                                      | part of WP1 PR sequence |
| T001                  | Projects carousel: slides, arrows, dots, 7 s autoplay, view-all modal, smoke tests | ready                   |

## Task spec template

New tasks copy this skeleton (keep every heading, fill every field):

```markdown
# T### — <area>: <one-line what>

Status: draft|ready|done | Depends: T### | Est: 0.5d | PR n of WP#

## Goal

One sentence.

## Files (create/modify ONLY these)

- path/to/source_file
- path/to/test_file

## Spec

Exact signatures / markup ids / behavior — enough detail that an agent never
guesses.
Required test cases (ALL must appear):
explicit table rows / scenario list

## Verify (paste output in PR)

<the exact commands that prove this task>

## Out of scope

Explicitly named non-goals (so nothing creeps silently).
```
