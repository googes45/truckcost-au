import { admin, appUrl, liveMode, priceId, stripe, webhookSecret } from "../_shared/stripe-billing.ts";

const headers = {
  "Access-Control-Allow-Origin": new URL(appUrl).origin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};
const reply = (body: unknown, status = 200) => Response.json(body, { headers, status });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (!["GET", "POST"].includes(req.method)) return reply({ error: "method_not_allowed" }, 405);
  const authorization = req.headers.get("Authorization") ?? "";
  const token = /^Bearer\s+(\S+)$/i.exec(authorization)?.[1];
  if (!token) return reply({ error: "authentication_required" }, 401);
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user || user.is_anonymous) return reply({ error: "invalid_session" }, 401);

  const enabled = Boolean(stripe && liveMode && webhookSecret && Deno.env.get("STRIPE_CHECKOUT_ENABLED") === "true");
  try {
    const { data: entitlement, error } = await admin.rpc("get_entitlement_snapshot", { p_user_id: user.id });
    if (error) throw error;
    if (!enabled || !stripe) return req.method === "GET"
      ? reply({ enabled, entitlement })
      : reply({ error: "checkout_unavailable" }, 503);
    const { data: existingCustomer, error: customerError } = await admin.rpc("get_stripe_billing_customer", {
      p_user_id: user.id,
      p_environment: "production",
    });
    if (customerError) throw customerError;
    if (req.method === "GET") return reply({ enabled, entitlement, hasStripeCustomer: Boolean(existingCustomer) });

    const { action } = await req.json().catch(() => ({}));
    if (action === "manage") {
      if (!existingCustomer) return reply({ error: "no_web_subscription" }, 409);
      const portal = await stripe.billingPortal.sessions.create({ customer: existingCustomer, return_url: appUrl });
      return reply({ url: portal.url });
    }
    if (action !== "subscribe") return reply({ error: "invalid_action" }, 400);
    if (entitlement?.entitlements?.includes("diary")) return reply({ error: "already_has_access" }, 409);

    if (existingCustomer) {
      const subscriptions = await stripe.subscriptions.list({ customer: existingCustomer, status: "all", limit: 100 });
      if (subscriptions.data.some(({ status }) => !["canceled", "incomplete_expired"].includes(status))) {
        return reply({ error: "manage_existing_subscription" }, 409);
      }
    }

    const expiresAt = Math.floor(Date.now() / 3600000) * 3600 + 7200;
    const idempotencyKey = "diary-monthly:" + user.id + ":" + expiresAt;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(idempotencyKey));
    const suffix = Array.from(new Uint8Array(digest).slice(0, 8), byte => String.fromCharCode(97 + byte % 26)).join("");
    const session = await stripe.checkout.sessions.create({
      integration_identifier: "truckingcostr-diary-" + suffix,
      mode: "subscription",
      automatic_tax: { enabled: true },
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existingCustomer ? { customer: existingCustomer, customer_update: { address: "auto" },
        billing_address_collection: "required" } : { customer_email: user.email }),
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id, app_product_id: "diary_monthly" } },
      success_url: appUrl + "?billing=success",
      cancel_url: appUrl + "?billing=cancelled",
      expires_at: expiresAt,
    }, { idempotencyKey });
    return reply({ url: session.url });
  } catch (error) {
    console.error("Stripe billing request failed", error instanceof Error ? error.name : "unknown");
    return reply({ error: "billing_unavailable" }, 503);
  }
});
