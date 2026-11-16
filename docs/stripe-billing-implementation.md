# TruckingCostr AU — Stripe billing integration

## Status (16 Nov 2026)
- Stripe **sandbox** product: `prod_VdXXGjHvb5bdIG`
- Stripe **sandbox** monthly driver price: `price_1UcGSE5JeiS9pdDYkHFBec5C` (AUD 5.00, GST inclusive, recurring monthly)
- Stripe tax code: `txcd_10103001` (SaaS business use)
- Production Supabase tables: `billing_subscriptions`, `stripe_webhook_events`, `customer_theme_preferences`.
- `billing_subscriptions` is read-only for authenticated clients. Only verified server events can change it.
- `customer_theme_preferences` is writable by authenticated users only when their server-managed subscription is active or trialing.
- Customer theme selector implemented in `theme-settings.js` on the design branch.
- Checkout, webhook and billing-portal Edge Function **source files are committed** under `supabase/functions/`, but **none is deployed**. Subscription UI is disabled until configured. Do not represent billing as operational.

## Remaining prerequisites
1. Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as **Supabase Edge Function secrets** (never commit or place in browser code).
2. Deploy and test the committed server-side checkout session endpoint: validate JWT with Supabase Auth, fetch allowlisted price ID from server config, use `client_reference_id=user.id`, subscription mode, and trusted success/cancel URLs.
3. Deploy and test the committed Stripe webhook endpoint with raw request body + Stripe signature verification, reject invalid signatures, idempotency log and server-side lookup of Stripe subscription status. Handle `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Never grant access on browser redirect.
4. Deploy and test the committed customer portal endpoint authenticated by Supabase JWT, find the Stripe customer from the server-managed billing record.
5. Test checkout, renewals, cancellation, payment failure, retries, wrong user IDs and webhook replay in sandbox.
6. Verify GST registration details and configure Stripe Tax registrations and address/tax settings as appropriate before live checkout. Sandbox price is GST-inclusive, not proof that Stripe Tax is configured.
7. For Apple/Google native distribution, review platform billing requirements independently.
8. Decide fleet tiers and equipment supply commercial terms before creating fleet prices.
9. Deploy only after passing end-to-end tests and confirming the live Stripe account is available.

## Security invariants
- No client-controlled `is_paid`, `status` or `stripe_customer_id` writes.
- Webhook signature verification is mandatory and uses the exact raw payload.
- Subscription access derives from Stripe-verified records, not the Checkout success URL.
- Never put a Stripe secret key, webhook signing secret or Supabase service-role key in GitHub Pages.
- Stripe sandbox and live IDs are not interchangeable.

## Implementation code committed
- `supabase/functions/billing-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/billing-portal/index.ts`
- `billing-settings.js` (checkout deliberately disabled)
- `theme-settings.js` (paid theme settings)

## Deployment checklist
- Confirm secrets are saved in Supabase project and Stripe sandbox key is used with sandbox price only.
- Configure `STRIPE_DRIVER_PRICE_ID=price_1UcGSE5JeiS9pdDYkHFBec5C` in sandbox; use a distinct live price in live mode.
- Deploy `billing-checkout` and `billing-portal` with JWT verification enabled; deploy `stripe-webhook` with JWT verification disabled **only because Stripe signature verification is implemented in its handler**.
- Register exact webhook endpoint in Stripe sandbox, subscribe to supported events, save generated `whsec_` secret in Supabase, test using Stripe sandbox events.
- Enable billing UI buttons only after successful end-to-end test; do not merge to main prematurely.
- Review webhook event ordering and multiple subscription recovery, and reconcile against Stripe's API before launch.
