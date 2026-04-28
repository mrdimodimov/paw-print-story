const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const { email, name, petName } = await req.json();

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!petName || typeof petName !== "string") {
      return new Response(JSON.stringify({ success: false, error: "petName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeName = (name && typeof name === "string") ? name : "there";
    const safePet = String(petName).replace(/[<>]/g, "");
    const safeGreet = String(safeName).replace(/[<>]/g, "");

    const html = `
      <div style="font-family: Arial, sans-serif; color: #3d2817; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">Hi ${safeGreet},</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          We're gently crafting <strong>${safePet}</strong>'s tribute right now. 🐾
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          You'll receive another email the moment it's ready to view and share.
        </p>
        <p style="font-size: 14px; color: #6b5544; margin: 24px 0 0;">
          With care,<br/>The VellumPet Team
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VellumPet <noreply@vellumpet.com>",
        to: [email],
        subject: "Your tribute is being created 🐾",
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Resend API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data?.id ?? null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-confirmation-email error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
