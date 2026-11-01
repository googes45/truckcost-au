# TruckCost AU — publication readiness
Updated: 1 November 2026

## Release decision
**Suitable for a clearly labelled public beta only after current automated checks and hands-on smoke testing pass. Not approved for production SaaS or regulated/compliance use.**

Published PWA: https://googes45.github.io/truckcost-au/

## Completed in repository
- Mobile-first static PWA, manifest, icons and versioned service-worker cache.
- Local-only status disclosed; no fake cloud account or sync claims.
- JSON backup/restore, CSV exports and local data reset.
- Job, fuel, cost, tyre, maintenance, trip, diary, weigh-location and joke workflows.
- Explicit limitations for fatigue diary, GPS background operation, manual receipt entry and unshared driver reports.
- Public Privacy Policy and Terms of Use linked in the app.
- Automated regression tests and full inline JavaScript syntax parsing.

## Required before announcing public beta
1. Latest GitHub Actions tests pass.
2. Latest Pages deployment succeeds and serves the latest commit.
3. Android Chrome smoke test: launch, demo workspace, add/save records, backup export/restore, navigation, external links, install prompt and service-worker update.
4. Desktop browser smoke test.
5. Keyboard focus, labels, contrast, zoom and screen-reader basics.
6. Confirm deployed privacy/terms match the deployed app.

## Not delivered — do not advertise as available
- Real user accounts or secure authentication.
- Cloud database, shared jokes, shared weighbridge reports or multi-device sync.
- Subscription billing, paid plans or business/driver roles.
- Server-side audit trail, tenant isolation or automated backups.
- OCR, accounting integration or verified receipt extraction.
- Approved EWD or legal fatigue calculation.
- Guaranteed complete/current national roadside inspection station directory.

## Production SaaS gates
Before handling confidential customer/business data at scale: implement a maintained backend and authentication provider; enforce server-side authorisation and tenant isolation; validate input server-side; encrypt transport and sensitive data; implement secrets management, backups and restore drills, retention/deletion controls, audit logs, monitoring, incident response, moderation/abuse handling, security testing and privacy/legal review.

## Operating assumptions
- Browser local storage is not encrypted by this app and can be lost when browser data is cleared.
- Users must export and securely retain backups.
- Job estimates depend on user-entered figures and may not represent actual net profit.
- Jokes and weighbridge status reports remain on the current device only.
- Third-party map, NHVR and NMI pages have their own terms and privacy policies.
