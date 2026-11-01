-- Private, server-managed subscription records. No browser role can read or write these rows.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('apple','google','web')),
  product_id text not null check (product_id in ('diary_monthly','owner_monthly','fleet_monthly')),
  provider_transaction_id text not null,
  provider_original_transaction_id text,
  provider_account_ref text,
  status text not null check (status in ('pending','active','grace_period','billing_retry','cancelled','expired','refunded','revoked','on_hold')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  auto_renew_enabled boolean,
  environment text not null default 'production' check (environment in ('sandbox','production')),
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_transaction_id)
);
create index if not exists billing_subscriptions_user_status_idx
  on private.billing_subscriptions(user_id, status, current_period_end desc);

create table if not exists private.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('apple','google','web')),
  provider_event_id text not null,
  event_type text not null,
  payload_sha256 text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  unique (provider, provider_event_id)
);

revoke all on private.billing_subscriptions, private.billing_events from public, anon, authenticated;
grant select, insert, update, delete on private.billing_subscriptions, private.billing_events to service_role;

create or replace function public.get_entitlement_snapshot(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with grant_check as (
    select exists (
      select 1 from public.lifetime_access_grants g
      where g.user_id = p_user_id and g.grant_type = 'lifetime_free' and g.revoked_at is null
    ) as lifetime_free
  ),
  current_subs as (
    select s.product_id, s.status, s.current_period_end, s.provider
    from private.billing_subscriptions s
    where s.user_id = p_user_id
      and s.status in ('active','grace_period','cancelled')
      and (s.current_period_end is null or s.current_period_end > now())
    order by case s.product_id when 'fleet_monthly' then 3 when 'owner_monthly' then 2 else 1 end desc,
             s.current_period_end desc nulls last
  ),
  chosen as (select * from current_subs limit 1)
  select jsonb_build_object(
    'plan', case
      when (select lifetime_free from grant_check) then 'lifetime_free'
      else coalesce((select case product_id when 'fleet_monthly' then 'fleet'
        when 'owner_monthly' then 'owner' when 'diary_monthly' then 'diary' end from chosen), 'free')
    end,
    'lifetime_free', (select lifetime_free from grant_check),
    'entitlements', case
      when (select lifetime_free from grant_check) then jsonb_build_array('diary','owner','fleet')
      when exists(select 1 from chosen where product_id = 'fleet_monthly') then jsonb_build_array('diary','owner','fleet')
      when exists(select 1 from chosen where product_id = 'owner_monthly') then jsonb_build_array('diary','owner')
      when exists(select 1 from chosen where product_id = 'diary_monthly') then jsonb_build_array('diary')
      else jsonb_build_array()
    end,
    'subscription_status', (select status from chosen),
    'period_end', (select current_period_end from chosen),
    'provider', (select provider from chosen),
    'checked_at', now()
  );
$$;
revoke all on function public.get_entitlement_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.get_entitlement_snapshot(uuid) to service_role;
