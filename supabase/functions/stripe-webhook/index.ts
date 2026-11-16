import { admin, cryptoProvider, liveMode, priceId, stripe, webhookSecret } from "../_shared/stripe-billing.ts";

const events = new Set([
  "checkout.session.completed", "checkout.session.async_payment_succeeded",
  "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted",
  "invoice.paid", "invoice.payment_failed",
]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  if (!stripe || !webhookSecret) return new Response(null, { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response(null, { status: 400 });

  let event;
  const payload = await req.text();
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret, undefined, cryptoProvider);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (event.livemode !== liveMode) return new Response(null, { status: 400 });
  if (!events.has(event.type)) return new Response(null, { status: 204 });

  const object = event.data.object;
  const reference = object.object === "subscription" ? object.id
    : object.object === "checkout.session" ? object.subscription
    : object.object === "invoice" ? object.parent?.subscription_details?.subscription
    : null;
  const subscriptionId = typeof reference === "string" ? reference : reference?.id;
  if (!subscriptionId) return new Response(null, { status: 204 });

  try {
    const checkedAt = new Date().toISOString();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.supabase_user_id;
    const item = subscription.items.data.find(({ price }) => price.id === priceId);
    if (!item || subscription.metadata.app_product_id !== "diary_monthly" ||
        !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(userId ?? "")) {
      return new Response(null, { status: 204 });
    }

    const statuses: Record<string, string> = {
      active: "active", trialing: "active", past_due: "billing_retry", canceled: "expired",
      incomplete: "pending", incomplete_expired: "expired", unpaid: "on_hold", paused: "on_hold",
    };
    const { error } = await admin.rpc("record_stripe_diary_subscription", {
      p_user_id: userId,
      p_subscription_id: subscription.id,
      p_customer: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      p_status: statuses[subscription.status] ?? "pending",
      p_period_start: new Date(item.current_period_start * 1000).toISOString(),
      p_period_end: new Date(item.current_period_end * 1000).toISOString(),
      p_auto_renew: !subscription.cancel_at_period_end && !subscription.cancel_at && subscription.status !== "canceled",
      p_environment: liveMode ? "production" : "sandbox",
      p_checked_at: checkedAt,
    });
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Stripe subscription reconciliation failed", event.id, error instanceof Error ? error.name : "database_error");
    return new Response(null, { status: 503 });
  }
});
