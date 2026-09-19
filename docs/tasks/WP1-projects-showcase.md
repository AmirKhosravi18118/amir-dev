# WP1 — Projects showcase: auto-rotating carousel + view-all modal

Status: in flight | Epic issue: created alongside this spec | PRs: ci-gates → T001

## Problem

The projects section stacks four full cards vertically — long to scroll, no
showcase feel. The owner wants the site to **advertise the products**: a visitor
should immediately see each project big, live and clickable, with the section
cycling itself, and be able to open a clean full list on demand.

## Owner decisions baked in (approved in owner session 2026-09-19 — recorded here so the trail is complete)

1. Horizontal carousel; one project per slide; arrows left/right.
2. Autoplay every **7 seconds**, wraps around.
3. **View all** control opens a modal listing every project vertically, styled.
4. New projects are appended at the end of the slide list by future tasks —
   numbering, dots and the modal must update automatically (contract §4).
5. "Advertising" angle: every slide carries a prominent live CTA + LIVE chip;
   the section lead states that every project is live and open to try.

## PR + claim map

| PR | Branch | Contents |
| --- | --- | --- |
| ci gates | `ci/gates-smoke` | workflow + lint/format/inline-js/audit + Playwright smoke scaffold + `shot.png` into repo |
| T001 | `feat/T001-projects-carousel` | the carousel per docs/tasks/T001-projects-carousel.md |

## Out of scope

- Real product screenshots replacing poster mockups (future WP when owner
  supplies them).
- Any new project data (append-only via future tasks).
- LinkedIn / social links (owner decision: contact stays email + phone).
