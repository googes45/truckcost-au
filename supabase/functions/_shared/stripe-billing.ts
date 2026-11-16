import Stripe from "npm:stripe@23.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.89.0";

export const appUrl = "https://googes45.github.io/truckcost-au/";
export const priceId = Deno.env.get("STRIPE_DIARY_PRICE_ID") ?? "price_1UcUVW720DwPWJwXNZM7ygx8";
export const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
export const stripe = stripeKey ? new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() }) : null;
export const liveMode = /^(?:sk|rk)_live_/.test(stripeKey ?? "");
export const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
export const cryptoProvider = Stripe.createSubtleCryptoProvider();
