# Build brief — amir-khosravi.de rebuild (binding)

Source of truth: `D:\Z.Ai\portfolio\prototype\khosravi-redesign.html` (tab "amir-khosravi.de": markup lines 444–595, gallery overlay 812–830, CSS lines 10–830, JS 830–1207). Project data already extracted + validated: `site/js/projects-data.js` (9 projects, `PROJECTS`, `STORY`, `AREA` — reuse it, never retype).

Design law (CSS custom properties ONLY, zero hardcoded colours outside :root):
`--bg:#0B0B0C; --panel:#17171A; --cream:#EDE6D8; --mute:#9B958A; --gold:#C9A96E; --gold2:#E6CFA0; --ink-on-gold:#1B1600;` Manrope (self-hosted) + Cormorant Garamond italic; square corners, hairlines, easing `cubic-bezier(.2,.7,.2,1)`.

Hard rules:
- Token budget is tight: no exploratory reading beyond the files named here. Write files once, correctly.
- `prefers-reduced-motion` disables tilt/parallax/auto-advance marquee/marquee motion.
- 44px min touch targets; visible `:focus-visible` outline; skip link; one H1 per page.
- No console.log, no hardcoded user-visible text outside i18n catalogs (`site/i18n/de.json`, `en.json` — every user-visible string gets `data-t` key + catalog entry in BOTH languages).
- No external third-party requests at all. Fonts self-hosted (subset WOFF2; if font files cannot be generated locally, use system-font fallback stack declared in tokens and note it).
- Promise block (exact, DE): "1 Monat testen und 3 Monate kostenlose Nachbetreuung nach dem Launch — zusätzlich zu deinen gesetzlichen Rechten." (EN: "1 month testing and 3 months free aftercare after launch, in addition to your statutory rights.") Never imply it replaces statutory warranty.
- Gallery action buttons: reuse `prototype/gallery-actions.js` logic verbatim (`site/js/gallery-actions.js` already copied). Order: live → platform → similar; exactly one primary; test file `site/tests/gallery-actions.test.cjs` must keep passing (`node --test site/tests`).
- Hero: portrait `img/amir-cutout6.webp`, ~600px wide desktop, headline BELOW the portrait (never over it), AVIF/WebP w/ width+height, `fetchpriority="high"`, preloaded. Alt: "Amir Khosravi, digital developer in Wiesbaden".
- Floating contact button: WhatsApp (`https://wa.me/` + env-injected number placeholder `__WHATSAPP__` replaced at deploy), email copy, "Projekt anfragen" scroll; analytics events `whatsapp_click`, `copy_email`, `cta_request_project` via `navigator.sendBeacon('/api/event', …)` — fire-and-forget, never block UI, respect `Do Not Track`.
- Contact form posts JSON to `/api/contact` (field names: name,email,type,budget,message,consent + honeypot `website` + `ts`). Client-side validation + accessible error/success states, no layout jump.
- All pages: unique `<title>` (<60 chars) + meta description (<155), canonical, hreflang pair (`de` + `en` + `x-default`→de), OG/Twitter tags, JSON-LD where listed. Pages: `index.html`, `projekte/index.html`, `projekte/<slug>/index.html` ×9 (indexable text = task/solution/tech/story from projects-data), `impressum.html`, `datenschutz.html`, `qr.html`, `404.html`.
- Keep it handcrafted HTML (repo standard exempts it from prettier); small ES modules; total page weight target <600 KB before gallery images.
- Everything under `D:\Z.Ai\portfolio\site\`. Do NOT touch anything outside `site/`.
- When done: run `node --test site/tests` and `node site/tests/check-build.mjs` (create this: verifies every `data-t` key exists in both catalogs, no `#hex` outside tokens.css, every page has canonical+hreflang+one H1, all internal hrefs resolve to existing files). All green before reporting.
- Report back: file list, test output summary, any placeholders the owner must fill (WhatsApp number, contact email → env `CONTACT_EMAIL` placeholder `__CONTACT_EMAIL__`, Impressum fields `__OWNER_*__`).
