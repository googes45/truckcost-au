import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: corsHeaders,
    });
  }

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token || token === authorization) {
    return new Response(JSON.stringify({ error: "authentication_required" }), {
      status: 401, headers: corsHeaders,
    });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ error: "server_configuration_error" }), {
      status: 503, headers: corsHeaders,
    });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify the bearer token against Supabase Auth; never trust a user ID supplied by the caller.
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: "invalid_session" }), {
      status: 401, headers: corsHeaders,
    });
  }

  const { data, error } = await admin.rpc("get_entitlement_snapshot", {
    p_user_id: authData.user.id,
  });
  if (error) {
    console.error("Entitlement lookup failed", error.message);
    return new Response(JSON.stringify({ error: "entitlement_unavailable" }), {
      status: 503, headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ entitlement: data }), {
    status: 200,
    headers: { ...corsHeaders, "Cache-Control": "no-store" },
  });
});
