create policy "Service role manages billing subscriptions"
on private.billing_subscriptions
for all
to service_role
using (true)
with check (true);

create policy "Service role manages billing events"
on private.billing_events
for all
to service_role
using (true)
with check (true);
