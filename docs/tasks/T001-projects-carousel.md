# T001 — site: projects carousel (slides, autoplay, view-all modal)

Status: ready | Depends: ci-gates PR | Est: 1d | PR 2 of WP1

## Goal

Replace the vertically stacked project cards with the carousel frozen in
docs/CONTRACT.md §4: big single-project slides, prev/next arrows, dots, 7 s
autoplay with progress bar, and a View-all modal listing every project.

## Files (create/modify ONLY these)

- index.html
- tests-ci/carousel.spec.ts
- docs/tasks/T001-projects-carousel.md (Status line)
- docs/tasks/WP1-projects-showcase.md (Status line)

## Spec

Markup (inside `#projects`, after the unchanged kicker/h2/lead — `proj.lead`
copy is updated to the count-agnostic showcase wording):

- `#projCarousel.carousel.reveal` wrapping: `.car-btn.car-prev`,
  `.car-viewport > #carTrack` (the four existing `article.proj` blocks, in the
  same order, minus their `reveal` classes, plus `.pnum` / `.live-chip` spans
  inside each `.f-img` which gains `data-name` + `onerror` fallback),
  `.car-btn.car-next`, and `.car-bar` = `#carDots` + `.car-progress > #carBar`
  + `#viewAllBtn` (`data-i18n="proj.viewall"`).
- `#projModal` (hidden by default): `.pmodal-bg[data-close]` +
  `.pmodal-panel[role=dialog][aria-modal]` labelled by `#pmTitle`
  (`data-i18n="pm.title"`), `.pm-sub` (`data-i18n="pm.sub"`), `.pm-close`
  (`[data-close]`, `data-i18n-aria="pm.close"`), `#pmList` (populated by JS
  cloning every slide).
- CSS: `.car-*` (viewport overflow hidden, flex track, transform slide
  transition, circular glass arrow buttons, dots with active pill, 3 px progress
  track), `.pnum` / `.live-chip` chips, `.f-img.imgerr::after` fallback
  (`content:attr(data-name)`), `.pmodal*` (fixed overlay, blurred backdrop,
  scrollable panel, 90°-rotating close button), mobile media-query tweaks
  (arrows shrink ≤860 px, progress hidden ≤560 px). Slides must NOT lift on
  hover (overflow clipping) — border glow + image zoom only.

i18n keys added to `I18N` (en + de, both mandatory):

- `proj.lead` — rewritten, count-agnostic, "every project is live and open to
  try" advertising angle.
- `proj.viewall` (View all / Alle ansehen), `proj.prev`, `proj.next`,
  `pm.title` (All projects / Alle Projekte), `pm.sub`, `pm.close`.

Behavior (all constants and conditions exactly as frozen in CONTRACT §4):

- `DUR = 7000`; rAF-driven elapsed timer; `dt` clamped to 100 ms per frame.
  Advance only when: carousel in viewport (IO ≥ .2) AND tab visible AND no
  pointer hover/focus inside AND modal closed. Manual nav resets elapsed.
- `go(i,user)`: `idx = ((i % N) + N) % N`; `#carTrack` transform
  `translateX(-idx*100%)`; dots `.is-active` toggled; `.pnum` shows
  zero-padded slide number.
- `prefers-reduced-motion` → `.rm` class, no track transition (timer stays).
- Touch: `touchstart`/`touchend` on `#carTrack`, |dx| > 44 px navigates;
  `touch-action: pan-y`.
- Keyboard: ← / → on `#projCarousel` navigate and preventDefault.
- Modal: open on `#viewAllBtn` (body scroll locked, focus → `.pm-close`);
  close on ESC / `[data-close]` (backdrop + ✕); focus returns to opener;
  `hidden` re-applied after the fade-out timeout. Modal slides are clones —
  `setLang(current)` re-invoked after cloning (CONTRACT §2).

Required test cases (ALL must appear in tests-ci/carousel.spec.ts):

| # | Scenario | Assertion |
| --- | --- | --- |
| 1 | load `#projects` | 4 slides in `#carTrack`, 4 dots, slide 1 visible |
| 2 | click `.car-next` ×2, `.car-prev` ×1 | visible project title follows Nelurio→Washhalle→NexDeutsch order; active dot follows |
| 3 | click dot 4 | Saad Tattoo slide visible, dot 4 active |
| 4 | no interaction, wait ≤ 9 s | slide index advances by itself (autoplay) |
| 5 | click `#viewAllBtn` | `#projModal` visible, `#pmList` lists 4 projects, body scroll locked |
| 6 | press ESC | modal hidden, focus back on `#viewAllBtn` |
| 7 | toggle DE | `#pmTitle` + slide `.what` text switch to German; reload keeps DE |
| 8 | all `<img>` on page | every image loads (`naturalWidth > 0`) incl. `shot.png` |

## Verify (paste output in PR)

```bash
npm run lint && npm run format:check && npm run check:js
npm audit --audit-level=high && npm audit --audit-level=high --omit=dev
npx playwright test
```

## Out of scope

- New projects, real screenshots, LinkedIn, hero copy beyond `proj.lead`.
- Any change to other sections, the CV, or deploy tooling.
