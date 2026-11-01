-- Defense in depth: private billing tables remain inaccessible to browser roles.
-- The backend service role uses its privileged database role to access these tables.
alter table private.billing_subscriptions enable row level security;
alter table private.billing_events enable row level security;
