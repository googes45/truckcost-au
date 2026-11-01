# TruckingCostr AU — publication readiness
Updated: 1 November 2026

## Release decision
**The current website is a public beta, not a production SaaS release and not an approved compliance product. Paid launch is not ready.**

Published PWA: https://googes45.github.io/truckcost-au/

## Verified repository capabilities
- Mobile-first static PWA with manifest, icons and service-worker cache.
- Supabase email/password authentication and per-account workspace sync are wired into the beta. This is not yet a claim of production-grade security or tenant isolation.
- Local JSON backup/restore and CSV export functions.
- Truck, job, fuel, cost, tyre, maintenance, trip, manual diary, weigh-location and jokes workflows.
- Private ATO/BAS due-date reminders; no ATO connection, verified BAS preparation or lodgement.
- Public Privacy Policy and Terms of Use.
- Automated calculation regression tests and inline JavaScript syntax checks in GitHub Actions.

## Latest automated deployment check
For commit `9cfc9ef685e6237fa7b79d5c1bc2a44a2d935887`:
- GitHub Actions test run 41310277250: **success**.
- GitHub Pages deployment run 41310276790: **success**.
- These automated checks do not replace real-device testing or store review.

## Required hands-on beta checks
1. Android Chrome: sign-up, sign-in, sign-out, demo workspace, add/save/reload records, cloud sync, JSON export/import, navigation, links, install prompt and service-worker update.
2. Desktop browser: authentication, workspace sync, data export/restore and responsive layout.
3. Accessibility: keyboard focus, labels, contrast, zoom and screen-reader basics.
4. Verify privacy and terms pages on the deployed site.
5. Test account isolation with two separate test accounts; confirm one account cannot read or overwrite another account's workspace.

## Not delivered — do not advertise as live
- Subscription purchases, payment processing, webhooks or paid-feature entitlement enforcement.
- Native iOS or Android app projects, store builds or store approval.
- Fleet/tenant roles, multi-user invitations and shared fleet workspaces.
- Shared public joke board, shared weighbridge reports or moderation tools.
- Approved EWD or legal fatigue calculation.
- ATO SBR connection, verified BAS preparation or direct BAS lodgement.
- NHVR publishing portal, NHVR agreement or technically isolated NHVR publisher permissions.
- Complete/current guaranteed roadside inspection station directory.
- OCR or connected accounting integration.

## Lifetime-free access status
The Supabase invitation/grant table and email-matching attachment mechanism are prepared. The beta can display a lifetime-free grant, but that grant is not yet connected to a complete server-enforced paid-feature gate. Do not promise full paid-plan access until the trusted entitlement service described in `docs/native-billing-implementation.md` is implemented and tested.

## Production SaaS gates
Before handling confidential customer/business data at scale:
- Independently verify every exposed table's RLS policies and cross-account isolation.
- Implement server-side authorisation for every privileged action and validate inputs server-side.
- Confirm encryption in transit and assess sensitive data at rest; the app itself does not encrypt browser/local workspace data.
- Configure automated backups and successfully complete restore drills.
- Implement retention/deletion controls, audit logs, monitoring, incident response and support procedures.
- Complete independent security testing and privacy/legal review.
- Test account recovery, session expiry, data export and deletion.
- Validate all financial calculations independently; job estimates depend on user-entered figures and may not represent actual net profit.

## Important operational limitations
- Browser-local data can be lost if browser data is cleared; users should export and securely retain backups.
- Exported JSON backups are plain files.
- Manual driver diary is not an NHVR-approved EWD and does not calculate legal fatigue limits.
- GPS may stop when backgrounded or locked, depending on device/browser.
- Weighbridge and driver status information may be incomplete or stale; user reports are not an authoritative operating-status source.
- NHVR official notices remain a planned one-way publish-only channel only; no partnership or live publisher access is claimed.
- ATO/BAS reminders are user-entered and are not official ATO notices.
- Jokes and weighbridge reports are not a shared moderated community feed in this release.
- Third-party map, NHVR and NMI pages have their own terms and privacy practices.
