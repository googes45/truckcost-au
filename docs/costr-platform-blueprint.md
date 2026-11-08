# COSTR AU — multi-industry platform blueprint
Status: proposed architecture; not an implemented product or approved compliance solution.
Owner-directed project: TruckingCostr AU remains the flagship. Preserve all existing branding concepts and beta features.

## Product family
- **TruckingCostr AU:** Australian trucking, owner-drivers, fleets; truck and job costs, fuel fill intervals, trip records, private driver diary, weighbridge directory.
- **HeavyCostr AU:** cranes, lifting, tilt trays, mining and earthmoving; equipment hourly cost, mobilisation/demobilisation, standby, crew, lifting accessories, maintenance, utilisation, project margin.
- **RailCostr AU:** freight operators and contractors; locomotive hours, fuel, crew, train consist, tonne-km, access charges, maintenance reserves, rail job margin.
- **AeroCostr AU:** cargo, charter and helicopters; flight hours, fuel, crew, landing/handling fees, maintenance reserves, dispatch cost and flight margin.

## Architecture decision
Separate branded apps and distribution listings, with a shared versioned calculation library and common backend components. Use separate tenant-scoped datasets and product-specific permissions. Never infer one industry's compliance approval from another. Keep existing TruckingCostr code and URLs stable.

## Shared entities
Organisation, user, role, entitlement, equipment/vehicle, meter reading, cost entry, cost category, fuel purchase, job, job segment, rate card, document reference, audit event, billing record. Each operational record must carry an organisation ID; each industry-specific extension uses its own schema and validation.

## Calculation contracts
- Money stored as integer minor units or fixed-precision decimals; never use floating-point as the ledger source of truth.
- GST-exclusive and GST-inclusive amounts tracked distinctly; effective GST registration date and jurisdiction are explicit inputs.
- Distinguish estimated vs actual cost, finance cashflow vs depreciation, billable vs nonbillable utilisation.
- Trucking: cost/km and per-job profit; fuel L/100km measured from complete fill intervals.
- Heavy: cost/hour, mobilisation cost, project contribution.
- Rail: cost/locomotive-hour, cost/train-km, cost/tonne-km.
- Aviation: cost/flight-hour and per-flight contribution, reserves for maintenance.
- Every calculation requires units, period, source inputs, rounding rule, and tests.

## Delivery stages
1. Protect the flagship: establish green regression suite, backups, privacy/security review and launch gates; do not promise paid release before payment and compliance work.
2. Extract pure costing functions into a tested shared library with stable interfaces; avoid changing deployed calculations until parity tests pass.
3. HeavyCostr pilot with 2-3 real operator workflows; validate quote and utilisation calculations.
4. RailCostr prototype after specialist rail requirements discovery.
5. AeroCostr prototype after specialist aviation requirements discovery.
6. Implement separate store listings, product-specific onboarding, entitlements and support.

## Compliance and truth-in-advertising
- Driver's diary is not an NHVR-approved Electronic Work Diary unless formally approved; do not advertise it as approved.
- Do not claim NHVR endorsement, live ATO/BAS lodgement, or official data access until authorised and working.
- Rail and aviation regulatory records are distinct and must be separately assessed by qualified specialists.
- “Aussie Made” and “Truckie Approved” require substantiation before use as factual marketing claims.
- Proposed product and parent-brand names require trademark clearance; no ownership or registration is presumed.

## Brand system
Master identity: black / deep navy / silver / Australian gold. Use a detailed road-train hero for campaigns and merchandise; a simplified readable icon for small app sizes. Retain existing concept artwork; do not overwrite it. Product-specific symbols: truck, crane hook, locomotive, aircraft. Preserve “Know Your Costs. Own Your Road.” for TruckingCostr AU. Do not use government seals or imply official approval.

## Launch gates per product
Unit and integration tests; tenant isolation tests; accessible mobile UX; backups and restore drills; security/privacy review; billing verification and GST treatment; customer support process; appropriate industry compliance and marketing review; signed app-store release.

## Immediate implementation work
- Write baseline test fixtures for truck costing before extraction.
- Specify common data model and migration strategy.
- Prototype HeavyCostr calculations separately from the production beta.
- Collect validated rail and aviation cost requirements before coding regulatory workflows.
