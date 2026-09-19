# CONTRACT — frozen interface contract

> Owner-approved changes only, via PR, committed BEFORE the code that implements
> them. Implementing agents code against this file; never invent shapes, never
> extend it silently.

## 1. Product shape

- The live site is a **static, dependency-free `index.html`** (+ root assets)
  served by Caddy. No framework, no build step, no bundler. This is ADR-001 and
  is not negotiable for this repo.
- Public entry points: `index.html`, `Amir_Khosravi_CV.pdf`, `amir.jpg`,
  `{nexdeutsch,washhalle,saadtattoo,shot}.png`. `cv_print.html` is the source of
  truth for the CV (regenerate the PDF from it; see CONTRIBUTING traps).
- Section ids and nav anchors (stable, external links may point at them):
  `#top` (hero), `#projects`, `#skills`, `#certificates`, `#about`, `#contact`.

## 2. i18n engine (v2 dictionary engine — the load-bearing contract)

- One dictionary: `const I18N = { "<key>": {"en": "...", "de": "..."}, ... }`.
- Every element with `data-i18n="<key>"` MUST have a dictionary entry containing
  BOTH `en` and `de`. The HTML contains the **English text inline as default**,
  so the page renders correctly with JavaScript disabled.
- `data-i18n-aria="<key>"` — same lookup, result written to the element's
  `aria-label` (for controls whose visible child is an SVG icon).
- `setLang(l)` with `l ∈ {"en","de"}` and nothing else. Effects, in order:
  1. sets `<html data-lang>` and `<html lang>`;
  2. toggles `.is-active` on `#btn-en` / `#btn-de`;
  3. replaces `textContent` of every `[data-i18n]`;
  4. replaces `aria-label` of every `[data-i18n-aria]`;
  5. persists `localStorage.lang`.
- **Forbidden:** the old `data-en=` / `data-de=` attribute-span approach. It
  silently vanished content on language switch once (ADR-002). Never reintroduce.
- DOM created dynamically (clones, rendered lists) that carries `data-i18n` must
  either be created before the first `setLang` run, or `setLang` must be invoked
  again after creation. The projects modal (§4) relies on this.

## 3. Content policies (owner decisions, recorded 2026-09)

- Contact section: **email + phone only**. No social links unless the owner adds
  them on an issue.
- Tone: show ability without overclaiming; the "honest boundaries" block in
  `#about` is deliberate and stays.
- Private repos: link buttons are labeled "(private)" / "(privat)".
  "Open live app/site" buttons exist only for apps that are actually deployed.
- Cover images live in the repo root as PNG. `.f-img` elements carry
  `data-name="<Project>"` used by the CSS `imgerr` fallback when an image fails
  to load.

## 4. Projects carousel (frozen for T001 — owner decisions baked in)

- **The slide list is the single source of truth.** The children of
  `#carTrack` (`article.proj`, document order = display order) define the
  projects. Numbering chips (`.pnum`), dots (`.car-dot`), the progress bar and
  the view-all modal rows all derive from that list at runtime.
  **Adding a project = append one `article.proj` at the end of `#carTrack` and
  add `p{N}.what` / `p{N}.build` keys (en + de) to `I18N`.** Nothing else.
- Controls/DOM ids (stable, tests rely on them):
  `#projCarousel` (region, `aria-roledescription="carousel"`),
  `#carTrack`, `.car-prev`, `.car-next`, `#carDots` (one `.car-dot` per slide),
  `.car-progress > #carBar` (autoplay progress, width %),
  `#viewAllBtn` (opens `#projModal`), `#projModal` (`role="dialog"`,
  `aria-modal`, labelled by `#pmTitle`), `#pmList` (vertical list, clones of the
  slides).
- Behavior:
  - autoplay `DUR = 7000` ms, wraps around, only advances while the carousel is
    in the viewport, the tab is visible, no pointer hover / focus inside, and
    the modal is closed;
  - manual navigation (arrows, dots, swipe ≥ 44px) moves immediately and resets
    the timer;
  - `prefers-reduced-motion: reduce` → slide changes are instant (no transition
    animation); the timer itself stays on (explicit owner decision);
  - modal: opens on `#viewAllBtn`, closes on ESC, backdrop click, and the ✕
    button (`[data-close]`); `document.body` scroll is locked while open; focus
    moves into the modal on open and back to the opener on close.
- i18n keys owned by this contract: `proj.viewall`, `proj.prev`, `proj.next`,
  `pm.title`, `pm.sub`, `pm.close`, plus per-project `p{N}.what` / `p{N}.build`.

## 5. Deploy contract

- Only files that changed are copied **individually** into the webroot on the
  VPS. Never `rsync --delete` the folder — the server directory is not a mirror
  of the repo.
- Host, key path and webroot path live in the local-only
  `PORTFOLIO_CONTEXT.md` (gitignored). They must never appear in committed
  files.
- After any deploy: verify HTTP 200 on the live URL before reporting done.
