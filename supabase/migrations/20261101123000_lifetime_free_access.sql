-- Lifetime complimentary access grants for selected TruckingCostr AU users.
-- Execute once in the production Supabase project. Access is read-only from the app.
-- Owners manage grants only through the Supabase SQL editor or a future secured admin tool.

create table if not exists public.lifetime_access_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid unique references auth.users(id) on delete set null,
  grant_type text not null default 'lifetime_free'
    check (grant_type = 'lifetime_free'),
  reason text not null default '' check (char_length(reason) <= 240),
  granted_at timestamptz not null default now(),
  granted_by text not null default 'owner',
  revoked_at timestamptz,
  revoked_by text,
  constraint lifetime_access_email_normalised check (email = lower(trim(email)))
);

create index if not exists lifetime_access_active_user_idx
  on public.lifetime_access_grants(user_id)
  where revoked_at is null;

alter table public.lifetime_access_grants enable row level security;
revoke all on public.lifetime_access_grants from anon, authenticated;
grant select on public.lifetime_access_grants to authenticated;

create policy "Users can view their own lifetime access"
  on public.lifetime_access_grants for select to authenticated
  using (
    revoked_at is null
    and (
      user_id = (select auth.uid())
      or email = lower(((select auth.jwt()) ->> 'email'))
    )
  );

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.attach_lifetime_access_grant()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.email is not null then
    update public.lifetime_access_grants
       set user_id = new.id
     where email = lower(trim(new.email))
       and user_id is null
       and revoked_at is null;
  end if;
  return new;
end;
$$;

revoke all on function private.attach_lifetime_access_grant() from public, anon, authenticated;

drop trigger if exists attach_lifetime_access_grant_after_auth_insert on auth.users;
create trigger attach_lifetime_access_grant_after_auth_insert
after insert on auth.users
for each row execute function private.attach_lifetime_access_grant();

drop trigger if exists attach_lifetime_access_grant_after_email_update on auth.users;
create trigger attach_lifetime_access_grant_after_email_update
after update of email on auth.users
for each row execute function private.attach_lifetime_access_grant();
