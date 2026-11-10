# Fleet accounts — implementation status (10 November 2026)

## Implemented in Supabase production
Migration `fleet_accounts_members_vehicles_rls` applied to project `yxbuafwhfyxyrfvzbzpb`.
- `fleets`: owner-bound fleet account, name and timestamps.
- `fleet_members`: membership with driver/manager labels. Fleet owners control memberships; members can read their own membership and leave.
- `fleet_vehicles`: fleet-specific vehicle register. Only fleet owner can create/edit/delete vehicles; members can read their fleet's vehicles.
- Row-level security (RLS) enabled on all three tables. Authenticated roles granted access, with policies restricting row visibility and writes.
- Schema and policy existence verified after migration. No existing `user_workspaces` rows modified.

## Not yet shipped or tested end-to-end
- Fleet UI, invitations, accepting invitations, role administration, and real driver/manager workflows.
- Tenant-isolation tests with two distinct signed-in users.
- Shared jobs and work diary records scoped to fleet.
- Billing, payment provider, webhooks, subscription enforcement, GST invoices, device provisioning.
- NHVR approval for an Electronic Work Diary. Current diary is not an approved EWD.

## Commercial pricing — proposals only
100 trucks software-only: AUD $3,100/month.
Device-inclusive 100 trucks: AUD $7,900/month illustrative, 24-month minimum, subject to supplier quotes, service-level terms, data and device economics. No active checkout.

## Security follow-up
Supabase security advisor flags leaked-password protection disabled. See https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

Do not advertise multi-tenant fleet support as production-ready until integration and isolation tests pass.
