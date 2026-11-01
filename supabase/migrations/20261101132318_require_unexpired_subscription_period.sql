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
      and s.current_period_end is not null
      and s.current_period_end > now()
    order by case s.product_id when 'fleet_monthly' then 3 when 'owner_monthly' then 2 else 1 end desc,
             s.current_period_end desc
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
