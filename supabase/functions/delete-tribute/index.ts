import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminKey = req.headers.get("x-admin-key");
    const expectedKey = Deno.env.get("ADMIN_DASHBOARD_KEY");

    if (!adminKey || !expectedKey || adminKey !== expectedKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tribute_id, slug } = await req.json();

    if (!tribute_id && !slug) {
      return new Response(JSON.stringify({ error: "tribute_id or slug required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: Record<string, unknown> = {};

    // Soft-delete by slug first (primary identifier)
    if (slug) {
      const { error: ptError } = await supabaseAdmin
        .from("public_tributes")
        .update({ is_deleted: true })
        .eq("slug", slug);
      results.public_tributes_by_slug = ptError ? ptError.message : "soft-deleted";

      const { error: tError } = await supabaseAdmin
        .from("tributes")
        .update({ is_deleted: true })
        .eq("slug", slug);
      results.tributes_by_slug = tError ? tError.message : "soft-deleted";
    }

    // Fallback: soft-delete by tribute_id
    if (tribute_id) {
      const { error: ptError } = await supabaseAdmin
        .from("public_tributes")
        .update({ is_deleted: true })
        .eq("id", tribute_id);
      results.public_tributes_by_id = ptError ? ptError.message : "soft-deleted";

      const { error: tError } = await supabaseAdmin
        .from("tributes")
        .update({ is_deleted: true })
        .eq("id", tribute_id);
      results.tributes_by_id = tError ? tError.message : "soft-deleted";
    }

    console.log("Soft-delete results:", JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Delete error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
