# T003 — site: products.html storefront page + nav tab

Status: ready | Est: 1d | PR 1 of WP2 (phase 2)

## Goal

A standalone, professional **Products** page (`products.html`) presenting all
five products as a coherent platform storefront — plus a nav tab on index.html
— so recruiters see ops maturity and users get one clean product entry. Works
with current URLs; the phase-1 domain swap later changes only the URLs.

## Files (create/modify ONLY these)

- products.html (new — handcrafted like index.html, same visual language)
- index.html (nav link + i18n keys `nav.products` only)
- tests-ci/products.spec.ts (new)
- .prettierignore (add products.html — same justification as traps #7)
- package.json (check:js gains products.html)
- .github/workflows/ci.yml (path filters gain products.html)
- docs/platform-runbook.md (new — Caddy add-app procedure, phase-1 ready)
- docs/tasks/T003-products-storefront.md (Status line)
- docs/tasks/WP2-product-platform.md (Status line)

## Spec

- Same design system as index.html (dark, Inter, glass cards, same CSS
  variables) — self-contained single file, zero dependencies (ADR-001).
- Sections: page hero ("products platform" angle, EN+DE) → product grid (5
  cards: cover image, name, what, status chip LIVE/BETA/CLIENT, tags,
  "Open app/site" + GitHub(private) buttons — same hrefs as the carousel) →
  **"The platform behind it"** strip (Oracle Cloud VPS · Caddy auto-TLS ·
  GitHub Actions CI/CD · uptime monitoring · GDPR/EU hosting) → back-to-portfolio CTA.
- Bilingual via the same dictionary engine pattern (CONTRACT §2): `I18N` +
  `data-i18n`, en inline as default, `setLang` persisted to localStorage —
  language choice shared with index.html via the same `lang` key.
- Nav on index.html gains "Products" → products.html (i18n key `nav.products`).

Required test cases (products.spec.ts):

| #   | Scenario            | Assertion                                            |
| --- | ------------------- | ---------------------------------------------------- |
| 1   | load /products.html | 5 product cards, zero console errors                 |
| 2   | all images          | naturalWidth > 0                                     |
| 3   | live links          | one anchor per product with the app's URL            |
| 4   | DE toggle           | hero + card copy switch to German                    |
| 5   | index nav           | "Products" link present, href products.html          |
| 6   | ops strip           | platform section lists VPS/Caddy/CI monitoring facts |

## Verify (paste output in PR)

npm run lint && npm run format:check && npm run check:js && npx playwright test

## Out of scope

Domain purchase/wiring (WP2 phase 0/1), accounts, analytics, app code changes.
