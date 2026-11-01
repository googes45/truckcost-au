# TruckingCostr AU — native billing implementation specification

Updated: 1 November 2026

## Current state

- The published product is a static Progressive Web App hosted on GitHub Pages.
- A Capacitor 8 native packaging scaffold is now in the repository, including `@capacitor/geolocation`, `@capacitor/app`, native GPS bridging, custom-scheme auth callback handling and Android/iOS GitHub Actions build workflows. The workflows generate native projects in CI; generated projects are not committed or yet validated on physical devices.
- The app displays proposed plan prices, but no customer can purchase a subscription, be charged, or receive paid-plan access.
- Supabase email/password authentication and per-account workspace sync are present in the beta.
- Lifetime complimentary grants can be attached to accounts and displayed, but they are **not yet connected to a server-enforced paid-feature access gate**.
- Do not represent this specification as an implemented payment system.

## Product catalogue to configure

Use one monthly subscription group per platform, with equivalent benefits and clear renewal terms.

| Internal plan | Proposed AU price (GST-inclusive where taxable) | Store product ID | Entitlement key |
|---|---:|---|---|
| Diary Truckie | $5.00/month | `diary_monthly` | `diary` |
| Owner-Driver | $14.99/month | `owner_monthly` | `owner` |
| Fleet Boss | $39.99/month | `fleet_monthly` | `fleet` |

Free Truckie remains available without payment. Do not sell Fleet Boss until fleet user roles, invitations, sharing and tenant isolation are implemented and tested. The manual diary is not an approved EWD.

## Recommended delivery sequence

### 1. Native application packaging

The initial Capacitor packaging scaffold has been added. The next step is to run and fix the generated CI builds, then create and maintain:
- an iOS Xcode project with StoreKit 2 purchase handling;
- an Android project with the current Google Play Billing Library;
- separate development, sandbox/test and production configurations;
- app identifiers, signing, versioning, icons, screenshots and store metadata.

The current GitHub Actions workflows are intended to produce an Android debug APK and an unsigned iOS simulator app for engineering checks. These outputs are not store-release packages. Native GPS is bridged through the Capacitor Geolocation plugin, and native email confirmation uses `truckingcostrau://auth/callback`. Add that exact URI to the Supabase Auth Redirect URLs allow-list before testing native account creation. Before store distribution, prove GPS, location permissions, authentication callbacks, file backup/restore and foreground/background behaviour on physical devices. Background tracking is not implemented. A wrapper alone does not make the current PWA store-ready. Apple guideline 4.2 also requires meaningful app-specific utility beyond a repackaged website.

### 2. Store purchase flow

**Apple**
- Configure auto-renewable subscriptions in App Store Connect using the product IDs above.
- Use StoreKit 2 to load localised products, show the price/period from the store, purchase, restore and display current subscription state.
- Handle transaction updates and verified signed transaction data.
- Configure App Store Server Notifications V2 and validate notifications on the backend.
- Provide a visible subscription-management route and clear renewal/cancellation terms.

**Google Play**
- Configure subscriptions and monthly base plans in Play Console using matching product IDs.
- Use the supported Play Billing Library in the Android application.
- Send purchase tokens to the backend for verification using the Google Play Developer API.
- Configure Real-time Developer Notifications (RTDN), process subscription state changes and acknowledge purchases as required.
- Provide a clear subscription-management route.

The app must show store-returned pricing and billing periods, not hard-coded local price strings at checkout. Do not route store-distributed digital feature subscriptions through Stripe as a way around store billing rules.

### 3. Trusted entitlement service

Implement server-side verification before granting paid access. The browser must never be able to set its own plan, mark a payment as successful or write an entitlement record.

Backend responsibilities:
- Verify Apple signed transactions and notification signatures with Apple's documented server APIs.
- Verify Google purchase tokens and subscription state with Google's Developer API.
- Verify webhook/notification authenticity, reject replayed or malformed events, and make event processing idempotent.
- Bind every verified purchase to the authenticated TruckingCostr AU account, with an explicit account-change/recovery process.
- Store provider, product ID, provider transaction/reference identifiers, current status, start/end/expiry times, environment and last verification time.
- Process active, grace-period, billing-retry, cancelled-but-still-active, expired, refunded, revoked and chargeback states correctly.
- Reconcile periodically with each store; notifications alone are not a complete source of truth.
- Keep provider secrets and service-role credentials in server-side secrets only.

### 4. Entitlement and lifetime-free rules

The server-side access decision must be the single authority:

1. An active, non-revoked lifetime-free grant gives the explicitly granted account the approved complimentary entitlements.
2. Otherwise, an active verified subscription gives only the entitlements mapped to that product.
3. Otherwise, the account receives Free Truckie access.
4. Expired, refunded, revoked or unverified purchases must not unlock paid features.
5. Client UI may display the server result but cannot change it.

The existing `lifetime_access_grants` table is a prepared invitation/grant mechanism. Its presence and the current “LIFETIME FREE ACCESS” label do not yet prove a complete paid-feature bypass. Connect it to the same trusted entitlement decision before telling invitees that all paid features are unlocked.

### 5. Testing before live charges

Use Apple sandbox/TestFlight and Google Play licence testers/internal testing. Test:
- first purchase, duplicate tap and interrupted purchase;
- renewal and price/plan change;
- cancellation with access through paid-through date;
- billing retry, grace period and account hold where applicable;
- expiry, refund, revocation and chargeback;
- restore purchases, reinstall and sign-in on a second device;
- account switching and attempts to attach another person's purchase;
- lifetime-free grant, revocation and exact email matching;
- offline start, backend outage and delayed notification delivery;
- tax-inclusive display, localised prices, customer receipts and BAS reconciliation.

Do not enable live products until the tests pass and the store review build is complete.

## Store-policy references checked 1 November 2026

- Apple App Review Guidelines, especially 2.1, 3.1.1 and 3.1.2: https://developer.apple.com/app-store/review/guidelines/
- Apple auto-renewable subscriptions / StoreKit: https://developer.apple.com/app-store/subscriptions/
- Google Play payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- Google Play Billing integration architecture: https://developer.android.com/google/play/billing
- Google Play subscription policy and disclosure requirements: https://support.google.com/googleplay/android-developer/answer/18265346

## Release gate

**Paid launch remains blocked** until native iOS/Android builds, store products, verified server-side purchases, entitlement enforcement, lifetime-free bypass, cancellation/restore handling, security review, tax reconciliation and successful store review are all complete.
