# T005 — platform/Nelurio: Google Sign-in (OAuth) — frozen spec + activation runbook

Status: done (spec + activation runbook; OAuth code already as-built in
nelurio-code@385ce67; activation blocked on owner's Google Cloud OAuth client) |
Depends: — | Est: 0.5d | PR 2 of WP3

## Goal

Freeze the Google Sign-in design for Nelurio — the first app of the product
platform (owner framing, 2026-09-25) — so that (a) the implementation in the
Nelurio repo is documented against one frozen source of truth, (b) the flow
becomes the reusable pattern for the platform's other apps, and (c) the only
remaining step (owner's OAuth client keys) is a mechanical checklist.

## Files (create/modify ONLY these)

- docs/tasks/T005-google-oauth.md (this spec — created by this PR)
- docs/tasks/WP3-officialization.md (T005 section: as-built pointer)
- docs/HANDOVER.md (top entry)

## Spec

**Implementation home:** `AmirKhosravi18118/nelurio` (local
`D:\Z.Ai\nelurio-code`), commit `385ce67` — NOT in this static-site repo. The
API surface is already frozen in nelurio's `docs/CONTRACT.md`
(`/auth/oauth/providers`, `/auth/oauth/{provider}/start|callback`).

### Flow (authorization-code, Google first; Apple rides the same pattern)

1. Frontend `AuthPage.tsx` fetches `GET /api/v1/auth/oauth/providers` →
   `{google:bool, apple:bool}`; "Continue with Google" button renders disabled
   until `google:true`.
2. `GET /api/v1/auth/oauth/google/start?locale=<de|en>` (rate-limited
   40/15min/IP): generates a 24-byte random state, stores `state|locale` in
   cookie `nelurio_oauth_state` (10 min, HttpOnly, Secure, Path=
   `/api/v1/auth/oauth`, SameSite=None — Lax fallback on plain-HTTP dev), 302
   to Google consent (`scope=openid email profile`, `hl=<locale>`).
   Unconfigured provider → 302 to app `/?oauthError=provider_not_configured`.
3. Google redirects to `GET /api/v1/auth/oauth/google/callback` (Apple uses
   POST `form_post` — same handler reads code/state from query or form).
   Constant-time state compare; cookie cleared on first hit. Mismatch →
   `?oauthError=oauth_state_mismatch`; user denial → `provider_denied`.
4. Backend exchanges code at the token endpoint, verifies the `id_token`
   against the provider JWKS with the Go stdlib only (RS256 signature, issuer
   `https://accounts.google.com`, audience = client_id, expiry). No new
   module dependency in go.mod.
5. User resolution, in order: (provider, subject) match → sign in; else a
   password account with the same email is linked to the identity
   (`LinkOAuth`, only when `oauth_subject` IS NULL — migration
   `002_oauth_feedback.sql` added `auth_provider`/`oauth_subject`); else
   `CreateOAuthUser` creates a passwordless account (empty password hash,
   email_verified=true, interface_locale from the state cookie).
6. Normal session issued (existing cookie sessions + CSRF) → 302 to app
   `/?oauthWelcome=1`. Failure codes surfaced on the app URL and mapped to
   i18n keys `auth.oauthNotConfigured` / `auth.oauthError`.

### Configuration (VPS `/etc/nelurio/nelurio.env`, never in git)

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Apple optional:
`APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_CLIENT_SECRET` or
`APPLE_PRIVATE_KEY`). Redirect URI derives from `APIPublicBaseURL` → today
`https://nelurio-api.duckdns.org/api/v1/auth/oauth/google/callback`; app
origin `https://nelurio.duckdns.org`. Final URLs after the platform migration
(owner decision 2026-09-25: platform domain is `nelurio.com`):
origin `https://app.nelurio.com`, redirect URI
`https://app.nelurio.com/api/v1/auth/oauth/google/callback` (full map in
`docs/platform-runbook.md`; configure both URI pairs if set up early).

### Owner activation checklist (the ONLY remaining step — ~10 min)

1. console.cloud.google.com → create/select project (platform project — this
   client becomes the platform's OAuth pattern template).
2. OAuth consent screen: External, scopes `openid email profile`, app name
   Nelurio + support email.
3. Credentials → Create credentials → OAuth client ID → Web application:
   Authorized JavaScript origins `https://nelurio.duckdns.org` AND (post-
   migration) `https://app.nelurio.com`; Authorized redirect URIs
   `https://nelurio-api.duckdns.org/api/v1/auth/oauth/google/callback` AND
   `https://app.nelurio.com/api/v1/auth/oauth/google/callback`.
4. Copy client ID + secret into `/etc/nelurio/nelurio.env`
   (`GOOGLE_CLIENT_ID=…`, `GOOGLE_CLIENT_SECRET=…`), restart the API service.
5. Verify (commands below): providers flag flips to true, real browser login
   creates/links the account.

### Verification checklist

| #   | Check                                       | Expected                                                      |
| --- | ------------------------------------------- | ------------------------------------------------------------- |
| 1   | `curl -s $API/api/v1/auth/oauth/providers`  | today `{"data":{"google":false,"apple":false}}` (inert)       |
| 2   | after keys + restart                        | `google:true`                                                 |
| 3   | `GET /auth/oauth/google/start` unconfigured | 302 → `?oauthError=provider_not_configured`, no external call |
| 4   | real browser flow                           | Google consent → session cookie → app loads `?oauthWelcome=1` |
| 5   | same-email password account                 | OAuth sign-in links it (no duplicate user row)                |

## Verify (paste output in PR)

```bash
npm run lint && npm run format:check && npm run check:js && npm audit --audit-level=high && npx playwright test
curl -s https://nelurio-api.duckdns.org/api/v1/auth/oauth/providers
```

## Out of scope

Apple activation (implemented, stays unconfigured until wanted); PKCE
(Google confidential-web-client flow above does not require it); shared SSO
across platform apps (WP2 phase 3, data-driven); any change to nelurio-code
in this repo's PR; storing client secrets anywhere but the VPS env file.
