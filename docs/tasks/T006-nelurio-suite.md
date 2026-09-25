# T006 — platform: "Nelurio Suite" product-library landing page

Status: done (PR #21, merged 2026-09-25; smoke 30/30; deployed — live preview at
`amir.nelurio.duckdns.org/nelurio.html`; moves to the `nelurio.com` apex at
migration per the updated runbook) | Depends: T004, T005 | Est: 1d | PR 1 of WP4

## Goal

Give the product platform (owner decision 2026-09-25: **Nelurio = the library
brand, flagship study app keeps the Nelurio name**) its own landing page with a
visual identity coordinated with the resume site, the library/account logic a
customer needs to discover → try → sign up, and analytics wired to the owner's
GA4 property (separate web stream so platform data never pollutes portfolio
data). The page ships as `nelurio.html`, deploys to the current webroot as a
live preview, and moves to the `nelurio.com` apex when the owner's domains
provision (runbook updated in the same PR).

## Files (create/modify ONLY these)

- nelurio.html (new — single-file static page, same engine patterns as index.html)
- tests-ci/platform.spec.ts (new smoke cases)
- package.json (lint + check:js file lists gain nelurio.html)
- .prettierignore (nelurio.html exempt — same rationale as index.html, traps #7)
- docs/platform-runbook.md (domain map: amir-khosravi.de, nelurio.com apex,
  app./finello./nexdeutsch./washhalle. subdomains, nelurio.de → 301 nelurio.com,
  OAuth redirect final URL, deploy step for the platform webroot)
- docs/tasks/T005-google-oauth.md (redirect URI line: final URL is
  `https://app.nelurio.com/api/v1/auth/oauth/google/callback`, origin
  `https://app.nelurio.com` — platform domain is nelurio.com, not amir-khosravi.de)
- docs/tasks/T006-nelurio-suite.md (this spec)

## Spec

- **Identity (coordinated, not cloned):** same token system as index.html
  (`--bg:#0d0b1d; --acc:#8b6cff; --acc2:#4d8df7`, Inter 300–900, same card/line/
  muted values), own favicon/logo mark: violet rounded square with "N",
  wordmark "Nelurio". English inline as default (CONTRACT §2).
- **i18n:** the same dictionary engine (`setLang`, `localStorage.lang`,
  `data-i18n`), keys namespaced `nl.*` — every key carries BOTH en and de.
- **Sections:** hero (badge "NELURIO SUITE · BY AMIR KHOSRAVI" → link back to
  the resume via relative `/`), product library grid `#products` (5 `.prod`
  cards, covers reused from the repo: shot/finello/washhalle/nexdeutsch/
  saadtattoo.png, status chips: beta/green/client), "How it works" `#how`
  (pick an app → create your account — email or Google Sign-in where offered —
  your data stays yours / GDPR delete anytime; honesty note: accounts are
  per-app today, one platform login is planned), platform ops strip `#platform`
  (one VPS, Caddy auto-TLS, CI/CD, 24/7 monitoring, consent-first analytics),
  roadmap chips (`#roadmap`: unified login, Pro tiers — explicitly labelled
  "planned", no fake checkout buttons), footer with Impressum/Privacy links
  (→ the Nelurio app's legal pages) and the builder link back to `/`.
- **Honest CTAs:** live products link to their real URLs (same hrefs as
  products.html); the flagship's CTA is "Open app" (its real auth exists);
  subscriptions are shown as planned, not sold.
- **Analytics:** the T004 consent layer verbatim (EN/DE banner, consent mode v2
  denied-by-default, gtag only after opt-in) with
  `<html data-ga-id="G-M5C9K1JWH4">` — GA4 web stream "Nelurio Platform"
  (stream ID 15842112317) created in the owner's property `amir-khosravi.de`
  (555984228) on 2026-09-25, separate from the "Portfolio" stream.

Required test cases (tests-ci/platform.spec.ts):

| #   | Scenario                  | Assertion                                                                   |
| --- | ------------------------- | --------------------------------------------------------------------------- |
| 1   | loads                     | h1 "Nelurio", 5 product cards, zero console errors                          |
| 2   | every card is real        | each `.prod` has a status chip and an https "open" link                     |
| 3   | DE toggle                 | hero + card copy switch to German, persists over reload                     |
| 4   | consent (GTM intercepted) | banner visible, zero gtag scripts → accept → gtag injected, consent=granted |
| 5   | structure                 | #how, #platform, #roadmap present; footer legal + builder links present     |

## Verify (paste output in PR)

```bash
npm run lint && npm run format:check && npm run check:js && npm audit --audit-level=high && npx playwright test
```

## Out of scope

Real billing/subscriptions (WP2 phase 3, data-driven); changing index.html or
the carousel; moving any app URL (migration lands with the domains per
runbook); new visual assets (covers reused); nelurio.de redirect config
(runbook documents it, executed at provisioning).
