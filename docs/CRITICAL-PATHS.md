# CRITICAL-PATHS — amir-khosravi.de rebuild (firewall Phase 0)

Audited 2026-11-15, before first deploy of the rebuild. These are the paths that
must never break; Phase 2 smoke tests cover each one.

| # | Path | Breaks what | Test |
|---|------|-------------|------|
| 1 | Home renders: hero portrait below headline, tiles, promise block | First impression + funnel entry | Playwright smoke DE/EN |
| 2 | Language switch DE ↔ EN, no layout shift, persisted | DE/EN visitors | smoke |
| 3 | Gallery opens (tile click / deep link `?project=&shot=`), action buttons order (live→platform→similar, one primary) | Proof-of-work showcase | unit (gallery-actions) + smoke |
| 4 | Contact submit → `POST /api/contact` → stored (Postgres/JSONL) → owner email (or `pending_email` retry) → auto-reply | **Primary goal: inquiries** | Go integration tests + live probe |
| 5 | Ingest accepted: signed forward to AK Studio (`inquiry.new`, events) with HMAC-SHA256 ts+body, 5-min replay window | Studio analytics reconciliation | Go golden HMAC test |
| 6 | Sitemap valid, equals built pages, hreflang pairs, canonical, robots | SEO / search visibility | `site/tests/check-build.mjs` seo-integrity |
| 7 | `/qr` renders printable QR → `?utm_source=qr&utm_medium=card` | Business-card funnel | link check + smoke |

Non-critical but guarded: cookie banner (none — cookieless analytics), floating
contact button choices, 404, reduced-motion.
