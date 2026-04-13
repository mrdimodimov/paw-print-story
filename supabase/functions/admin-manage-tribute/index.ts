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

    const { action, tribute_id, slug, data } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "action required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "toggle_visibility") {
      if (!tribute_id || typeof data?.is_public !== "boolean") {
        return new Response(JSON.stringify({ error: "tribute_id and data.is_public required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from("public_tributes")
        .update({ is_public: data.is_public })
        .eq("id", tribute_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, is_public: data.is_public }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "edit") {
      if (!tribute_id || !data) {
        return new Response(JSON.stringify({ error: "tribute_id and data required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateFields: Record<string, unknown> = {};
      if (data.pet_name) updateFields.pet_name = data.pet_name;
      if (data.story) updateFields.story = data.story;

      if (Object.keys(updateFields).length === 0) {
        return new Response(JSON.stringify({ error: "No fields to update" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from("public_tributes")
        .update(updateFields)
        .eq("id", tribute_id);

      if (error) throw error;

      // Also update tributes table if slug is available
      if (slug) {
        await supabaseAdmin
          .from("tributes")
          .update({
            ...(data.pet_name ? { pet_name: data.pet_name } : {}),
            ...(data.story ? { tribute_story: data.story } : {}),
          })
          .eq("slug", slug);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Admin manage error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
