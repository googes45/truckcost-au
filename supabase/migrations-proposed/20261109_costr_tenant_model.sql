-- COSTR AU cross-industry tenant model, REVIEW-ONLY migration.
-- Do not execute against production until a backup, auth design, and security review.
-- Existing TruckingCostr tables are intentionally untouched.
create schema if not exists costr;

create table if not exists costr.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  created_at timestamptz not null default now()
);

create table if not exists costr.memberships (
  organisation_id uuid not null references costr.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','operator','viewer')),
  created_at timestamptz not null default now(),
  primary key (organisation_id,user_id)
);

create table if not exists costr.assets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references costr.organisations(id) on delete cascade,
  industry text not null check (industry in ('trucking','heavy','rail','aviation')),
  label text not null check (length(trim(label)) between 1 and 160),
  created_at timestamptz not null default now(),
  unique (id, organisation_id, industry)
);

create table if not exists costr.jobs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references costr.organisations(id) on delete cascade,
  asset_id uuid,
  industry text not null check (industry in ('trucking','heavy','rail','aviation')),
  label text not null check (length(trim(label)) between 1 and 160),
  revenue_cents bigint not null default 0 check (revenue_cents >= 0),
  cost_cents bigint not null default 0 check (cost_cents >= 0),
  created_at timestamptz not null default now(),
  foreign key (asset_id, organisation_id, industry) references costr.assets(id, organisation_id, industry)
);

create index if not exists costr_memberships_user_idx on costr.memberships(user_id);
create index if not exists costr_assets_org_idx on costr.assets(organisation_id);
create index if not exists costr_jobs_org_idx on costr.jobs(organisation_id);

alter table costr.organisations enable row level security;
alter table costr.memberships enable row level security;
alter table costr.assets enable row level security;
alter table costr.jobs enable row level security;

-- SECURITY DEFINER avoids recursive membership RLS evaluation.
-- search_path locked down; function is scoped to the authenticated user.
create or replace function costr.is_member(target_organisation uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from costr.memberships m
    where m.organisation_id = target_organisation
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function costr.can_edit(target_organisation uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from costr.memberships m
    where m.organisation_id = target_organisation
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','operator')
  );
$$;

revoke all on function costr.is_member(uuid) from public;
revoke all on function costr.can_edit(uuid) from public;
grant usage on schema costr to authenticated;
grant execute on function costr.is_member(uuid) to authenticated;
grant execute on function costr.can_edit(uuid) to authenticated;

-- Read-only membership and organisation visibility. Membership creation and
-- organisation bootstrap must use a separately reviewed server-only procedure.
create policy org_member_select on costr.organisations
  for select to authenticated using (costr.is_member(id));
create policy membership_self_select on costr.memberships
  for select to authenticated using (user_id = (select auth.uid()));
create policy asset_member_select on costr.assets
  for select to authenticated using (costr.is_member(organisation_id));
create policy asset_editor_insert on costr.assets
  for insert to authenticated with check (costr.can_edit(organisation_id));
create policy asset_editor_update on costr.assets
  for update to authenticated using (costr.can_edit(organisation_id))
  with check (costr.can_edit(organisation_id));
create policy job_member_select on costr.jobs
  for select to authenticated using (costr.is_member(organisation_id));
create policy job_editor_insert on costr.jobs
  for insert to authenticated with check (costr.can_edit(organisation_id));
create policy job_editor_update on costr.jobs
  for update to authenticated using (costr.can_edit(organisation_id))
  with check (costr.can_edit(organisation_id));

grant select on costr.organisations, costr.memberships to authenticated;
grant select, insert, update on costr.assets, costr.jobs to authenticated;

-- Explicitly no DELETE policy; deletion workflows require separate review.
-- The costr schema is not automatically exposed through Supabase Data API.
-- Test with at least two real auth users and organisations before any deployment.
