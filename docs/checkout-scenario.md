# CHECKOUT SCENARIO — Nelurio Suite store (0→100) · v1.0 · 2026-09-29

> Owner order: the nelurio.com platform tunnel is the ONLY sales channel.
> Users arrive from the portfolio (showcase) → nelurio.com → trial or buy.
> In-app purchase is REMOVED everywhere; apps only DISPLAY the user's version
> (free / premium) fetched from /api/v1/entitlements.

## 1. Funnel (the whole story)

1. Visitor on amir-khosravi.de sees a project (showcase) → clicks
   "View in Nelurio Suite ↗" → lands on nelurio.com/#p-<slug>.
2. On the library card: two CTAs — "Start 1-month free trial" (→ app
   subdomain, sign in/up, trial starts via entitlements API) and
   "Buy product" (→ nelurio.com/checkout.html?app=<slug>).
3. Checkout page: order summary (app, plan, price), account email,
   country (EU / Iran), payment method (PayPal · Card via Stripe ·
   Zarinpal for Iran), → continue to provider → payment completes.
4. Payment confirmed (provider webhook / manual while keys pending) →
   entitlement set premium → user's app shows Premium (display only).

## 2. Plans & prices (OWNER-EDITABLE defaults — set in checkout config)

| app        | monthly | yearly (2 months free) |
|------------|---------|------------------------|
| nelurio    | €4.99   | €49.90                 |
| finello    | €2.99   | €29.90                 |
| nexdeutsch | €3.49   | €34.90                 |
| washhalle  | €9.99   | €99.90                 |

Trial: 30 days free per app, once, no card required (already live via
/api/v1/entitlements).

## 3. Payment providers

| Provider      | Covers                     | Status |
|---------------|----------------------------|--------|
| PayPal        | EU + global PayPal balance | link ready — owner connects account |
| Stripe Checkout | Visa/Mastercard/debit, SEPA — EU-wide | link ready — owner connects account (Stripe Payment Links, no backend needed) |
| Zarinpal      | Iran (IRR)                 | owner needs an Iranian merchant account; else NOWPayments (crypto) fallback — decision pending owner |

Checkout page is config-driven: `checkout-config.js` holds each provider's
payment link per app+plan. Missing link = option shows "coming soon" —
never a fake payment.

## 4. Data & endpoints (phased)

- Phase NOW (no backend): config-driven redirect links; manual activation by
  owner (email confirmation of payment → GrantPremium via admin endpoint).
- Phase NEXT (owner keys ready): Stripe/PayPal webhooks → POST
  /api/v1/webhooks/payment → auto GrantPremium; invoice email.
- Phase LATER: unified platform account (one login for the whole library).

## 5. Acceptance criteria (QA)

1. From amir-khosravi.de card click → lands on the exact product in
   nelurio.com library.
2. Library card "Buy product" → checkout page pre-filled with that app.
3. Trial CTA → app subdomain; app shows "Trial running" (entitlements).
4. Checkout: all 3 methods visible; configured ones redirect to a REAL
   provider link; unconfigured ones show "coming soon" (never fake-success).
5. EN/DE/FA + RTL all correct on library and checkout; 44px CTAs; mobile ok.
6. Zero in-app purchase buttons across the 4 apps; apps display version only
   ("Free / Trial — Xd / Premium") + a "Manage at nelurio.com" link.
