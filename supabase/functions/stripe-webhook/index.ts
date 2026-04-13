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
  console.log("METADATA:", session.metadata);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const tributeId = session.metadata?.tribute_id;
  const planType = session.metadata?.tier_id;

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

  // --- 1) Update tributes table ---
  const { data: existing } = await supabaseAdmin
    .from("tributes")
    .select("is_paid, slug")
    .eq("id", tributeId)
    .single();

  if (existing?.is_paid) {
    console.log(`Tribute ${tributeId} already marked as paid, skipping`);
  } else {
    const updateData: Record<string, unknown> = {
      is_paid: true,
      stripe_session_id: session.id,
    };
    if (planType) updateData.tier_name = planType;

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

  // --- 2) Update public_tributes: just unlock (is_paid + is_public) by tribute_id ---
  const { error: ptError } = await supabaseAdmin
    .from("public_tributes")
    .update({ is_paid: true, is_public: true })
    .eq("tribute_id", tributeId);

  if (ptError) {
    console.error("Failed to update public_tributes:", ptError);
  } else {
    console.log(`public_tributes unlocked for tribute_id: ${tributeId}`);
  }

  // --- 3) Send payment confirmation email (non-blocking) ---
  try {
    // Fetch tribute data for the email
    const { data: ptData } = await supabaseAdmin
      .from("public_tributes")
      .select("pet_name, slug")
      .eq("tribute_id", tributeId)
      .maybeSingle();

    const petName = ptData?.pet_name || session.metadata?.pet_name || "your pet";
    const slug = ptData?.slug || session.metadata?.slug;

    // Find recipient email from tribute_emails
    const { data: emailData } = await supabaseAdmin
      .from("tribute_emails")
      .select("email")
      .eq("tribute_id", tributeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const recipientEmail = emailData?.email || session.customer_details?.email;

    if (recipientEmail) {
      await supabaseAdmin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "payment-confirmation",
          recipientEmail,
          idempotencyKey: `payment-confirm-${tributeId}-${session.id}`,
          templateData: {
            petName,
            slug,
            tributeId,
          },
        },
      });
      console.log(`Payment confirmation email queued for ${recipientEmail}`);
    } else {
      console.warn("No recipient email found for payment confirmation");
    }
  } catch (emailErr) {
    // Never block the webhook response on email failure
    console.error("Failed to send payment confirmation email:", emailErr);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
