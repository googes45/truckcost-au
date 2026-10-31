# TruckCost AU — local beta

TruckCost AU is a mobile-first prototype for truck operating costs, job profitability, vehicle records and receipt review.

## Current release

This branch hardens the original prototype for a controlled **local beta**:

- Local workspace storage is versioned and validated.
- No fake cloud or authentication claims are shown in the UI.
- Australian-local dates are used instead of UTC date truncation.
- Job, fuel, toll, driver and other-cost calculations are kept explicit.
- Vehicle cost/km includes recorded direct costs plus annual finance, insurance and registration inputs.
- JSON backup and restore is available from the More screen.
- PWA caching uses a versioned cache and network-first updates so deployments do not remain stale.
- Calculation regression tests run in GitHub Actions.

## Publish a test version with GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Select **Deploy from a branch**, choose `main` (or the branch you are testing), and `/ (root)`.
3. Save and wait for GitHub Pages to publish.
4. Open the published HTTPS address.
5. On Android Chrome, use **Install app** / **Add to Home screen** if offered.

## Important: this is not production SaaS yet

The browser application still has **no server-side authentication, authorisation, cloud database, multi-device sync, audit logging or subscription billing**. Anyone with access to a browser profile can potentially access its local data. Do not use it as the sole system of record for confidential customer, vehicle or financial information.

Receipt capture is a manual review workflow; it is not verified OCR or accounting integration.

Before a production launch, the next milestone should add:

1. A real authentication provider and server-side authorisation.
2. A secure database with tenant/business isolation and backups.
3. Server-side validation for financial records.
4. Automated browser/end-to-end tests in addition to calculation tests.
5. Auditing, roles and data-retention controls.
6. Verified accounting and OCR integrations.
7. Monitoring, error reporting and a controlled beta with real-world trucking scenarios.

## Development

Requires Node.js 22+ for tests.

```bash
npm test
```

The repository contains only test tooling; the application itself remains a static PWA and does not require a build step.
