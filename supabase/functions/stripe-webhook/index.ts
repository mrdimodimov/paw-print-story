import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("EVENT TYPE:", event.type);

  // Only handle checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    console.log("Ignoring event type:", event.type);
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log("SESSION:", JSON.stringify(session, null, 2));
  console.log("METADATA:", session.metadata);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // --- 1) Update tributes table (existing logic) ---
  const tributeId = session.metadata?.tribute_id;
  const planType = session.metadata?.tier_id;

  if (session.payment_status === "paid" && tributeId) {
    const { data: existing } = await supabaseAdmin
      .from("tributes")
      .select("is_paid")
      .eq("id", tributeId)
      .single();

    if (existing?.is_paid) {
      console.log(`Tribute ${tributeId} already marked as paid, skipping update`);
    } else {
      const updateData: Record<string, unknown> = {
        is_paid: true,
        stripe_session_id: session.id,
      };
      if (planType) {
        updateData.tier_name = planType;
      }

      const { error: updateError } = await supabaseAdmin
        .from("tributes")
        .update(updateData)
        .eq("id", tributeId);

      if (updateError) {
        console.error("Failed to update tribute:", updateError);
      } else {
        console.log(`Tribute ${tributeId} marked as paid (plan: ${planType})`);
      }
    }
  } else {
    console.log("Skipping tribute update: not paid or missing tribute_id", {
      payment_status: session.payment_status,
      tributeId,
    });
  }

  // --- 2) Insert into public_tributes if slug metadata present ---
  const slug = session.metadata?.slug;
  const petName = session.metadata?.name;
  const content = session.metadata?.content;
  const email = session.customer_details?.email;

  if (!slug) {
    console.error("No slug in session metadata — skipping public_tributes insert");
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const insertData = {
    slug,
    pet_name: petName || "Unknown",
    story: content || "",
    tier_id: planType || "story",
  };

  console.log("Inserting into public_tributes:", insertData);

  const { data: insertResult, error: insertError } = await supabaseAdmin
    .from("public_tributes")
    .insert(insertData)
    .select();

  if (insertError) {
    console.error("INSERT ERROR:", insertError);
  } else {
    console.log("INSERT RESULT:", insertResult);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
