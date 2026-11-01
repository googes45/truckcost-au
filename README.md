# TruckingCostr AU — public beta

TruckingCostr AU is a mobile-first Australian truck operating-cost and job-record PWA. This release is a **public beta for evaluation**, not production SaaS or an approved compliance product.

## Open the beta
https://googes45.github.io/truckcost-au/

On Android Chrome, use **Install app** / **Add to Home screen** if offered.

## Current features
- Truck records, running costs, fuel fills and measured full-tank fuel intervals.
- Job estimates, revenue, direct costs and disclosed overhead calculations.
- Tyre lifecycle records and servicing reminders.
- Internal operating-cost and job-margin calculations; no accountant-ready report export in this beta.
- JSON workspace backup and restore.
- GPS trip recorder and manual driver diary with limitations disclosed in-app.
- National public weighbridge directory plus a separately labelled roadside inspection location starter list.
- Account-private joke board and driver weighbridge status records (shared public feed is not live yet).
- Private in-app ATO/BAS due-date reminders (user-entered dates only; no ATO data connection or lodgement in this beta).
- Proposed subscriptions: Diary Truckie $5/month; Owner-Driver $14.99/month and Fleet Boss $39.99/month, both including diary access. Prices are AUD, proposed GST-inclusive where GST applies; billing and entitlement enforcement are not live.
- NHVR official notice channel design documented in-app as strictly one-way publish-only; not activated pending formal NHVR arrangement.

## Important limitations
- **Cloud account beta:** email/password authentication and per-account workspace sync use Supabase in Sydney. A browser copy and JSON export are also available. Fleet/tenant sharing and an audit trail are not implemented.
- **No app-level encryption at rest:** anyone with access to the unlocked device/browser profile may be able to access the workspace. Exported JSON backups are plain files.
- **Not a compliance system:** the manual diary is not an NHVR-approved Electronic Work Diary and does not calculate legal fatigue limits. GPS may stop when backgrounded or locked.
- **Not accounting or tax advice:** calculations are estimates based on entered information.
- **Weighbridge reports:** site information can be incomplete or stale. Driver reports remain private to each account; the shared live feed and moderation workflow are not connected yet. Confirm access and operating status with the operator.
- **Receipt handling:** details are manually entered; no OCR/accounting integration is connected. Selected images are not uploaded or retained as attachments.
- **External links:** Google Maps, NHVR and NMI links are third-party services with their own terms and privacy practices.

Read the [Privacy Policy](privacy.html), [Terms of Use](terms.html) and [account deletion instructions](delete-account.html).

## QA
Automated regression, inline JavaScript syntax and web-asset packaging checks run in GitHub Actions:
https://github.com/googes45/truckcost-au/actions

Automated tests do not replace hands-on Android/iOS browser testing, accessibility review, security review or independent calculation validation.

## Publication status
**Private cloud-account beta — not ready for paid public launch.** Email/password accounts and a per-account cloud workspace are now connected. Shared driver content, subscription billing, payment webhooks, fleet/tenant roles, ATO SBR registration and approved BAS lodgement integration, NHVR publisher agreement and isolated publisher permissions, production monitoring, formal backup/restore testing, app-store packaging, privacy/security review and operational support remain before commercial launch.

## Lifetime free access for invited users

The owner can grant selected people lifetime complimentary access by email. They receive the normal app link (`https://googes45.github.io/truckcost-au/`), create an account with that exact email address, and their grant is automatically attached when they register. Their account shows **LIFETIME FREE ACCESS**. The owner manages grants and revocations in the private Supabase SQL Editor using the owner-only instructions in `admin/lifetime-access.sql`. Do not share that SQL workflow with invited users. This entitlement is prepared for subscription billing; payment processing is not live yet.

## First-time authentication configuration

Before testing new account registration, open the [Supabase Auth URL configuration](https://supabase.com/dashboard/project/yxbuafwhfyxyrfvzbzpb/auth/url-configuration). Set the Site URL to `https://googes45.github.io/truckcost-au/` and add `https://googes45.github.io/truckcost-au/**` to the Redirect URLs allow list. Email confirmation must be enabled and the confirmation email template should use the Supabase confirmation URL. This dashboard setting cannot be changed through the connected project tools.

## Development and native packaging
Requires Node.js 22+.
```bash
npm install
npm test
npm run build:web
```
The Capacitor 8 configuration, native GPS bridge, native authentication deep-link handling and repeatable web-asset packaging are now in the repository. GitHub Actions generates Android and iOS native projects and attempts unsigned debug/simulator builds. These are engineering/test builds only: Android debug APKs are not Play Store release bundles, and iOS simulator apps are not signed App Store archives. The generated native projects are not yet store-ready.

- Android build workflow: https://github.com/googes45/truckcost-au/actions/workflows/native-android.yml
- iOS simulator workflow: https://github.com/googes45/truckcost-au/actions/workflows/native-ios.yml

Before testing native account creation, add `truckingcostrau://auth/callback` to the Supabase Auth Redirect URLs allow-list as well as the existing GitHub Pages URL. The native app still needs real-device testing of confirmation links, GPS permissions, file export/restore and foreground/background behaviour, purchase integrations, signing, store metadata and a real-device review. Apple may reject a simple website wrapper under App Review Guideline 4.2; native capabilities and a polished app-specific experience must be demonstrated.

## Subscription backend preparation

A private server-managed billing schema has been applied to Supabase and the authenticated `billing-entitlement` Edge Function is deployed. It verifies the caller's Supabase session and returns the server-calculated entitlement snapshot. Anonymous and authenticated browser roles cannot execute the underlying entitlement SQL function or access private billing tables. No Apple/Google purchase verification, store notifications, checkout, or paid-feature enforcement is connected yet; no customer can be charged. See [native billing implementation](docs/native-billing-implementation.md) and [subscriptions/GST setup](docs/subscriptions-and-gst.md).
