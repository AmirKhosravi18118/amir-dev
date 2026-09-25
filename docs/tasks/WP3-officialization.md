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
   Nelurio = Go API (cookie sessions, `internal/api` + `internal/store`) +
   React `AuthProvider`. Plan: OAuth 2.0 authorization-code flow with Google
   as IdP — `GET /auth/google/start` (state+PKCE cookie) → Google consent →
   `GET /auth/google/callback` (verify state, fetch token, read userinfo,
   upsert user by google sub, issue the existing session cookie). Frontend:
   "Mit Google anmelden" button in `AuthProvider`/login screen. Blocked on
   owner: Google Cloud project + OAuth client ID/secret (authorized origin =
   Nelurio URL; redirect = `/auth/google/callback`). Client secrets live in
   VPS env, never in git.
3. **Domain (WP2 phase 0)** — remains the single owner-executable step for
   trust-grade branding.

## Out of scope

Ad personalization (permanently denied in consent defaults); analytics on
client apps (Saad Tattoo — Wix-managed); any third-party cookie.
