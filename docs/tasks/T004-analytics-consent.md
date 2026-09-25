# T004 — site: consent-gated analytics layer (GA4-ready, GDPR-safe)

Status: ready | Est: 0.5d | PR 1 of WP3

## Goal

Ship the analytics plumbing that becomes active only when (a) a GA4
Measurement ID is configured via `<html data-ga-id="G-…">` and (b) the visitor
consents. GDPR/TTDSG-safe by construction: consent mode v2 defaults denied, no
script before opt-in, decline persisted and honored.

## Files (create/modify ONLY these)

- index.html, products.html (identical layer: CSS block, banner markup, JS block)
- tests-ci/analytics.spec.ts
- docs/tasks/T004-analytics-consent.md (Status)
- docs/tasks/WP3-officialization.md (created alongside)

## Spec

- `<html … data-ga-id="">` — empty today; the owner's real `G-…` flips it on
  at deploy (no other change).
- Banner `#consentBanner` (hidden, `role="dialog"`): text `cons.text` +
  `#consent-accept` (`cons.accept`) + `#consent-decline` (`cons.decline`) —
  i18n keys added to both pages' dictionaries (en+de).
- `window.initAnalytics()` (idempotent, exposed for tests): reads `data-ga-id`;
  no ID → no-op. consent `localStorage.analytics_consent`:
  `granted` → inject gtag.js immediately; `denied` → nothing;
  undecided → show banner.
- Inject: consent mode v2 defaults (ad_* and analytics_storage denied) →
  `gtag/js?id=…` → `config` → `consent update` analytics_storage granted.
- Buttons: accept → persist granted + inject + hide; decline → persist denied
  - hide (no script ever).

Required test cases (tests-ci/analytics.spec.ts, googletagmanager.com
route-intercepted for hermeticity):

| #   | Scenario                            | Assertion                                                     |
| --- | ----------------------------------- | ------------------------------------------------------------- |
| 1   | default (no ID)                     | banner hidden, zero googletagmanager scripts                  |
| 2   | ID set via addInitScript, undecided | banner visible, no gtag script                                |
| 3   | accept                              | gtag script in head, consent=granted persisted, banner hidden |
| 4   | decline + reload                    | never any gtag script, consent=denied persisted               |
| 5   | lang=de + ID                        | banner shows German text                                      |

## Verify

npm run lint && npm run format:check && npm run check:js && npx playwright test

## Out of scope

Real Measurement ID (owner), OAuth (T005, Nelurio repo), consent on client sites.
