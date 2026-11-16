create or replace function public.record_stripe_diary_subscription(
  p_user_id uuid, p_subscription_id text, p_customer text, p_status text,
  p_period_start timestamptz, p_period_end timestamptz, p_auto_renew boolean,
  p_environment text, p_checked_at timestamptz
)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into private.billing_subscriptions as existing (
    user_id, provider, product_id, provider_transaction_id, provider_account_ref,
    status, current_period_start, current_period_end, auto_renew_enabled, environment, verified_at
  )
  select p_user_id, 'web', 'diary_monthly', p_subscription_id, p_customer,
         p_status, p_period_start, p_period_end, p_auto_renew, p_environment, p_checked_at
  where p_environment = 'production'
    and exists (select 1 from auth.users where id = p_user_id)
  on conflict (provider, provider_transaction_id) do update set
    status = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    auto_renew_enabled = excluded.auto_renew_enabled,
    verified_at = excluded.verified_at,
    updated_at = now()
  where existing.user_id = excluded.user_id
    and existing.environment = excluded.environment
    and existing.verified_at <= excluded.verified_at;
$$;

create or replace function public.get_stripe_billing_customer(p_user_id uuid, p_environment text)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select provider_account_ref
  from private.billing_subscriptions
  where user_id = p_user_id and provider = 'web' and environment = p_environment
    and provider_account_ref is not null
  order by verified_at desc
  limit 1;
$$;

revoke all on function public.record_stripe_diary_subscription(uuid,text,text,text,timestamptz,timestamptz,boolean,text,timestamptz) from public, anon, authenticated;
revoke all on function public.get_stripe_billing_customer(uuid,text) from public, anon, authenticated;
grant execute on function public.record_stripe_diary_subscription(uuid,text,text,text,timestamptz,timestamptz,boolean,text,timestamptz) to service_role;
grant execute on function public.get_stripe_billing_customer(uuid,text) to service_role;
