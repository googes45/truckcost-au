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
- NHVR official notice channel design documented in-app as strictly one-way publish-only; not activated pending formal NHVR arrangement.

## Important limitations
- **Cloud account beta:** email/password authentication and per-account workspace sync use Supabase in Sydney. A browser copy and JSON export are also available. Fleet/tenant sharing and an audit trail are not implemented.
- **No app-level encryption at rest:** anyone with access to the unlocked device/browser profile may be able to access the workspace. Exported JSON backups are plain files.
- **Not a compliance system:** the manual diary is not an NHVR-approved Electronic Work Diary and does not calculate legal fatigue limits. GPS may stop when backgrounded or locked.
- **Not accounting or tax advice:** calculations are estimates based on entered information.
- **Weighbridge reports:** site information can be incomplete or stale. Driver reports remain private to each account; the shared live feed and moderation workflow are not connected yet. Confirm access and operating status with the operator.
- **Receipt handling:** details are manually entered; no OCR/accounting integration is connected. Selected images are not uploaded or retained as attachments.
- **External links:** Google Maps, NHVR and NMI links are third-party services with their own terms and privacy practices.

Read the [Privacy Policy](privacy.html) and [Terms of Use](terms.html).

## QA
Automated regression and full inline JavaScript syntax checks run in GitHub Actions:
https://github.com/googes45/truckcost-au/actions

Automated tests do not replace hands-on Android/iOS browser testing, accessibility review, security review or independent calculation validation.

## Publication status
**Private cloud-account beta — not ready for paid public launch.** Email/password accounts and a per-account cloud workspace are now connected. Shared driver content, subscription billing, payment webhooks, fleet/tenant roles, ATO SBR registration and approved BAS lodgement integration, NHVR publisher agreement and isolated publisher permissions, production monitoring, formal backup/restore testing, app-store packaging, privacy/security review and operational support remain before commercial launch.

## Lifetime free access for invited users

The owner can grant selected people lifetime complimentary access by email. They receive the normal app link (`https://googes45.github.io/truckcost-au/`), create an account with that exact email address, and their grant is automatically attached when they register. Their account shows **LIFETIME FREE ACCESS**. The owner manages grants and revocations in the private Supabase SQL Editor using the owner-only instructions in `admin/lifetime-access.sql`. Do not share that SQL workflow with invited users. This entitlement is prepared for subscription billing; payment processing is not live yet.

## First-time authentication configuration

Before testing new account registration, open the [Supabase Auth URL configuration](https://supabase.com/dashboard/project/yxbuafwhfyxyrfvzbzpb/auth/url-configuration). Set the Site URL to `https://googes45.github.io/truckcost-au/` and add `https://googes45.github.io/truckcost-au/**` to the Redirect URLs allow list. Email confirmation must be enabled and the confirmation email template should use the Supabase confirmation URL. This dashboard setting cannot be changed through the connected project tools.

## Development
Requires Node.js 22+.
```bash
npm test
```
The app is static and has no application build step.
