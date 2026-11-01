import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authorization = req.headers.get("Authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return json({ error: "authentication_required" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "server_configuration_error" }, 503);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error: authError } = await admin.auth.getUser(match[1]);
  if (authError || !data.user) return json({ error: "invalid_session" }, 401);

  // Remove any lifetime-free invitation record linked to this account as
  // part of the deletion request. No user-supplied ID or email is trusted.
  const { error: grantError } = await admin
    .from("lifetime_access_grants")
    .delete()
    .eq("user_id", data.user.id);
  if (grantError) {
    console.error("Account grant cleanup failed", grantError.message);
    return json({ error: "account_deletion_failed" }, 500);
  }

  // The account ID is taken only from the verified bearer token. The client
  // cannot nominate another user for deletion. User-owned workspace, jokes,
  // reports and subscriptions are removed by their database foreign keys.
  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error("Account deletion failed", deleteError.message);
    return json({ error: "account_deletion_failed" }, 500);
  }

  return json({ deleted: true });
});
