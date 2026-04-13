import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tier → Stripe price mapping
const PRICE_MAP: Record<string, string> = {
  story: "price_1TCJDnARgBHSP9WgiwqVne4i",
  pack: "price_1TCJEtARgBHSP9WgM5KoUffT",
  legacy: "price_1TCJIEARgBHSP9WgICRP1Ws5",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tierId, tributeId, tributeSlug } = await req.json();

    if (!tierId || !PRICE_MAP[tierId]) {
      throw new Error("Invalid tier");
    }
    if (!tributeId) {
      throw new Error("Tribute ID is required");
    }

    // Fetch tribute data for metadata
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: tribute, error: fetchError } = await supabaseAdmin
      .from("tributes")
      .select("pet_name, tribute_story, slug")
      .eq("id", tributeId)
      .single();

    if (fetchError) {
      console.error("Failed to fetch tribute for metadata:", fetchError);
    }

    const metadataSlug = tributeSlug || tribute?.slug || tributeId;
    const metadataName = tribute?.pet_name || "Unknown";
    // Stripe metadata values max 500 chars
    const metadataContent = (tribute?.tribute_story || "").substring(0, 500);

    console.log("Creating Stripe session with metadata:", {
      slug: metadataSlug,
      name: metadataName,
      tribute_id: tributeId,
      tier_id: tierId,
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://paw-print-story.lovable.app";

    const successUrl = tributeSlug
      ? `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&slug=${encodeURIComponent(tributeSlug)}`
      : `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&id=${encodeURIComponent(tributeId)}`;

    const cancelUrl = tributeSlug
      ? `${origin}/tribute/s/${tributeSlug}?tier=${tierId}`
      : `${origin}/tribute/${tributeId}?tier=${tierId}`;

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: PRICE_MAP[tierId], quantity: 1 }],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tribute_id: tributeId,
        tier_id: tierId,
        slug: metadataSlug,
        name: metadataName,
        content: metadataContent,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
