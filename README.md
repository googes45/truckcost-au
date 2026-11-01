# TruckingCostr AU — public beta

TruckingCostr AU is a mobile-first Australian truck operating-cost and job-record PWA. This release is a **public beta for evaluation**, not production SaaS or an approved compliance product.

## Open the beta
https://googes45.github.io/truckcost-au/

On Android Chrome, use **Install app** / **Add to Home screen** if offered.

## Current features
- Truck records, running costs, fuel fills and measured full-tank fuel intervals.
- Job estimates, revenue, direct costs and disclosed overhead calculations.
- Tyre lifecycle records and servicing reminders.
- Finance/reporting views and CSV export.
- JSON workspace backup and restore.
- GPS trip recorder and manual driver diary with limitations disclosed in-app.
- National public weighbridge directory plus a separately labelled roadside inspection location starter list.
- Local-only joke board and driver weighbridge status reports.

## Important limitations
- **Local-only storage:** records are kept in the browser profile. No server-side accounts, authentication, cloud database, multi-device sync, central backups, audit trail or business/tenant isolation.
- **No app-level encryption at rest:** anyone with access to the unlocked device/browser profile may be able to access the workspace. Exported JSON backups are plain files.
- **Not a compliance system:** the manual diary is not an NHVR-approved Electronic Work Diary and does not calculate legal fatigue limits. GPS may stop when backgrounded or locked.
- **Not accounting or tax advice:** calculations are estimates based on entered information.
- **Weighbridge reports:** site information can be incomplete or stale. Driver status reports are local only and not shared. Confirm access and operating status with the operator.
- **Receipt handling:** details are manually entered; no OCR/accounting integration is connected. Selected images are not uploaded or retained as attachments.
- **External links:** Google Maps, NHVR and NMI links are third-party services with their own terms and privacy practices.

Read the [Privacy Policy](privacy.html) and [Terms of Use](terms.html).

## QA
Automated regression and full inline JavaScript syntax checks run in GitHub Actions:
https://github.com/googes45/truckcost-au/actions

Automated tests do not replace hands-on Android/iOS browser testing, accessibility review, security review or independent calculation validation.

## Publication status
**Public beta candidate — not production-ready SaaS.** A commercial launch with accounts, shared driver content, subscriptions or confidential business records requires a real backend, authentication, authorisation, tenant isolation, server-side validation, backups, monitoring, moderation, privacy/security review and operational support.

## Development
Requires Node.js 22+.
```bash
npm test
```
The app is static and has no application build step.
