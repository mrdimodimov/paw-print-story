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

  // Only handle checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const tributeId = session.metadata?.tribute_id;
  const planType = session.metadata?.tier_id;

  // Only process paid sessions with a tribute ID
  if (session.payment_status !== "paid" || !tributeId) {
    console.log("Skipping: not paid or missing tribute_id", {
      payment_status: session.payment_status,
      tributeId,
    });
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Idempotency check: skip if already paid
  const { data: existing } = await supabaseAdmin
    .from("tributes")
    .select("is_paid")
    .eq("id", tributeId)
    .single();

  if (existing?.is_paid) {
    console.log(`Tribute ${tributeId} already marked as paid, skipping`);
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Update tribute with payment data
  const updateData: Record<string, unknown> = {
    is_paid: true,
    stripe_session_id: session.id,
  };
  if (planType) {
    updateData.tier_name = planType;
  }

  const { error } = await supabaseAdmin
    .from("tributes")
    .update(updateData)
    .eq("id", tributeId);

  if (error) {
    console.error("Failed to update tribute:", error);
    return new Response("Database update failed", { status: 500 });
  }

  console.log(`Tribute ${tributeId} marked as paid via webhook (plan: ${planType})`);

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
