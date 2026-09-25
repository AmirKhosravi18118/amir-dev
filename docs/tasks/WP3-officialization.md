# WP3 — Officialization: analytics, Google OAuth, domain-grade trust

Status: in flight | Owner goal: "مرحله به مرحله به رسمی شدن" (get step by step
more official), approved 2026-09-25

## Scope

1. **T004 — consent-gated analytics (this repo, ships now).** The site targets
   German companies → GDPR/TTDSG applies. Google Analytics (or any stats)
   therefore ships **consent-gated**: nothing loads before the visitor opts in,
   choice persisted, decline honored. The layer activates the moment the owner
   provides a GA4 Measurement ID (`data-ga-id` on `<html>`); until then it is
   inert and ships no banner.
2. **T005 — Google Sign-in (OAuth), platform-wide pattern, first app: Nelurio.**
   Nelurio is one of the platform's own products (owner framing, 2026-09-25) —
   it gets Google Sign-in first and its implementation becomes the reusable
   pattern for the platform's other apps.
   **Implemented in the Nelurio repo** (`nelurio@385ce67`, Google + Apple,
   authorization-code flow, stdlib JWKS id_token verification, account
   linking by verified email, frontend provider buttons) and **frozen as
   spec + activation runbook in docs/tasks/T005-google-oauth.md**. Remaining:
   owner's Google Cloud OAuth client ID/secret → VPS env → restart → verify.
   Client secrets live in VPS env, never in git.
3. **Domain (WP2 phase 0)** — remains the single owner-executable step for
   trust-grade branding.

## Out of scope

Ad personalization (permanently denied in consent defaults); analytics on
client apps (Saad Tattoo — Wix-managed); any third-party cookie.
