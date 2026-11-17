const headers = {
  "Access-Control-Allow-Origin": "https://googes45.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method === "GET") return Response.json({ enabled: false }, { headers });
  if (req.method === "POST") {
    return Response.json({ error: "checkout_retired" }, { headers, status: 410 });
  }
  return Response.json({ error: "method_not_allowed" }, { headers, status: 405 });
});
