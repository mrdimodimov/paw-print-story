import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ status: "alive" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
