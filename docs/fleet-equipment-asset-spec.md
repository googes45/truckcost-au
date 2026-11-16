# Fleet HQ — Equipment Asset Expansion

## Categories
Truck, Trailer, Dolly, Forklift, Pallet jack, Heavy machinery, Other equipment.

## Test case: empty truck
Input: {"category":"Truck","asset":"","make":"","registration":"","serial":"","capacity":"","status":"Active"}
Expected: reject with 'Fleet asset number is required.'; do not write to Supabase.

## Proposed data model
Create a new `fleet_assets` table with id (uuid), fleet_id (uuid), category (text), asset_number (text), make_model (text nullable), registration (text nullable), serial_number (text nullable), capacity (text nullable), status (text), created_at (timestamp). Require nonblank asset_number, valid category and status, unique (fleet_id, asset_number), and fleet-scoped RLS for owners/authorised members. Do not use the existing truck-only `fleet_vehicles` table as a substitute without a migration plan.

## Acceptance tests
- Empty/whitespace asset number rejected without database insert.
- All seven categories can be selected.
- Unregistered equipment can be saved with an asset number and no registration.
- Duplicate asset numbers in the same fleet rejected; other fleets may reuse the same number.
- Users cannot read or modify another fleet's assets without membership permission.
- Existing truck records are preserved and migration is tested before rollout.
- Fleet subscription counts powered trucks only, not trailers or other equipment.

## Implementation status
Specification and test case only. No production database migration or application UI change has been deployed.
