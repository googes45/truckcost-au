# TruckingCostr AU — Fleet subscriptions and supplied devices (draft)
Updated 10 November 2026. **Planning proposal only; not a live offer, published price list, or activated billing.**

## Package design
All fleet tiers include access to the manual digital driver diary (NOT an NHVR-approved Electronic Work Diary), operating-cost tools, fuel records, jobs and maintenance tracking. Shared fleet accounts, permissions, billing, device management and approved EWD compliance are **not implemented** and must be completed before sale.

| Tier | Included trucks | Proposed monthly software fee (AUD, GST inclusive if applicable) |
|---|---:|---:|
| Small Fleet | 5 | $149 |
| Growing Fleet | 10 | $279 |
| Fleet 25 | 25 | $649 |
| Fleet 50 | 50 | $1,199 |
| Fleet 100 | 100 | $2,299 |
| Enterprise | 101+ | Custom quote |

Prices are **illustrative starting points**, not validated against willingness to pay or competitors. Additional trucks beyond tier limits require a higher tier or negotiated enterprise contract. Do not charge a fleet customer separately for the $5 manual diary feature.

## Device supply: separate economics
Owner preference: TruckingCostr AU should supply devices for fleet customers. Device procurement, shipping, installation, replacement, data connectivity, warranty, breakage, loss and mobile device management must be costed and contracted. Until supplier quotes are secured, do **not** represent hardware as included at the above software-only prices.

Illustrative 100-truck hardware scenario (assumptions, NOT supplier quotes):
- 100 devices × $250 = $25,000 capital cost
- 100 mounts/chargers × $60 = $6,000
- Setup and shipping × $50 per truck = $5,000
- Total upfront hardware and deployment = **$36,000**
- Amortisation over 24 months = **$1,500/month**, before financing, loss and replacements
- Connectivity at $15/truck/month = **$1,500/month**
- Device management/support allowance at $8/truck/month = **$800/month**
- Total indicative device-related monthly cost = **$3,800/month** before taxes, platform fees, software infrastructure, staff and margin.

A bundled 100-truck monthly contract at $2,299 would be **loss-making on these device assumptions**. If devices are included, price hardware separately upfront or build a minimum-term bundle that covers at least $3,800/month of device-related costs **plus** software, overhead and profit. Example: $2,299 software + $3,800 device cost = $6,099/month break-even on these limited cost categories; a viable quoted price must be higher and based on real supplier bids.

## Contract and product requirements before taking orders
1. Verify GST registration effective date and storefront tax handling; do not assume it is already active.
2. Get written device, SIM/data, installation and MDM supplier quotes; confirm device suitability and GPS/background restrictions.
3. Decide device ownership, 24/36-month minimum term, deposit, return, damage and replacement policies.
4. Build and security-test multi-tenant fleet roles, per-driver access, invitations, audit logging and data isolation.
5. Implement verified subscription checkout, entitlement enforcement, invoicing, renewals and cancellations.
6. Obtain any required NHVR EWD approval before representing the diary as an approved replacement for a written work diary.
7. Pilot with a small fleet and validate real operating costs before public launch.

## Decision pending
Approve actual fleet prices and choose between **devices purchased upfront** and **devices bundled under a minimum-term agreement**. Neither is activated in the current beta.
