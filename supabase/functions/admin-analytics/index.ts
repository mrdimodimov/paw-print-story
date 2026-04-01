import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Simple founder-mode check via header
  const authHeader = req.headers.get("x-admin-key");
  const ADMIN_KEY = Deno.env.get("ADMIN_DASHBOARD_KEY") || "vellum_admin_2026";
  if (authHeader !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Fetch tributes with tester_source
    const { data: tributes, error: tErr } = await supabase
      .from("tributes")
      .select("id, pet_name, pet_type, breed, tier_name, tester_source, created_at, is_paid, slug, tribute_story, photo_urls, form_data, owner_name, years_of_life, title")
      .order("created_at", { ascending: false })
      .limit(500);

    if (tErr) throw tErr;

    // Fetch analytics events
    const { data: events, error: eErr } = await supabase
      .from("analytics_events")
      .select("id, event_name, tester_source, tribute_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (eErr) throw eErr;

    return new Response(JSON.stringify({ tributes, events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
