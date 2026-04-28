import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Supabase env not configured");

    const { tributeId } = await req.json().catch(() => ({}));

    if (!tributeId || typeof tributeId !== "string" || !/^[0-9a-f-]{36}$/i.test(tributeId)) {
      return json({ success: false, error: "Invalid tributeId" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Cooldown: block re-sends within 2 minutes of any prior confirmation attempt
    // (covers sent, pending, and failed rows so retries don't hammer Resend).
    const COOLDOWN_MS = 2 * 60 * 1000;
    const cutoffIso = new Date(Date.now() - COOLDOWN_MS).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from("email_send_log")
      .select("id, created_at, status")
      .eq("template_name", "confirmation")
      .contains("metadata", { tribute_id: tributeId })
      .gte("created_at", cutoffIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentErr) {
      console.warn("Cooldown check failed (continuing):", recentErr.message);
    }
    if (recent) {
      return json({
        success: true,
        skipped: true,
        reason: "cooldown",
        message: "Recently sent",
      });
    }

    // 1. Tribute (pet name + slug)
    const { data: tribute, error: tErr } = await supabase
      .from("tributes")
      .select("id, pet_name, slug, owner_name")
      .eq("id", tributeId)
      .maybeSingle();
    if (tErr) throw new Error(`Tribute fetch failed: ${tErr.message}`);
    if (!tribute) return json({ success: false, error: "Tribute not found" }, 404);

    // 2. Email (server-side only)
    const { data: emailRow, error: eErr } = await supabase
      .from("tribute_emails")
      .select("email")
      .eq("tribute_id", tributeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (eErr) throw new Error(`Email lookup failed: ${eErr.message}`);
    const email = emailRow?.email;
    if (!email) return json({ success: false, error: "No email on file for tribute" }, 404);

    // 3. Manage token + canonical slug from public_tributes
    const { data: publicRow, error: pErr } = await supabase
      .from("public_tributes")
      .select("slug, custom_slug, manage_token")
      .eq("tribute_id", tributeId)
      .maybeSingle();
    if (pErr) throw new Error(`Public tribute lookup failed: ${pErr.message}`);

    const manageToken = publicRow?.manage_token;
    const slug = publicRow?.custom_slug || publicRow?.slug || tribute.slug;
    if (!manageToken || !slug) {
      return json({ success: false, error: "Tribute is missing manage token or slug" }, 409);
    }

    // 4. Race-safe idempotency: insert a "pending" row first.
    // A unique partial index on (metadata->>'tribute_id') WHERE template_name='confirmation'
    // AND status <> 'failed' guarantees only one in-flight or sent row per tribute.
    const { data: pendingRow, error: pendingErr } = await supabase
      .from("email_send_log")
      .insert({
        recipient_email: email,
        template_name: "confirmation",
        status: "pending",
        metadata: { tribute_id: tributeId, type: "confirmation" },
      })
      .select("id")
      .single();

    if (pendingErr) {
      // Postgres unique violation = another invocation already claimed this tribute.
      if ((pendingErr as { code?: string }).code === "23505") {
        return json({ success: true, skipped: true, reason: "already_sent" });
      }
      throw new Error(`Idempotency reservation failed: ${pendingErr.message}`);
    }

    const logId = pendingRow.id;

    const manageUrl = `https://vellumpet.com/memorial/manage/${encodeURIComponent(slug)}?token=${encodeURIComponent(manageToken)}`;
    const safePet = escapeHtml(tribute.pet_name || "your pet");
    const safeGreet = escapeHtml(tribute.owner_name || "there");
    const safeUrl = escapeHtml(manageUrl);

    const petName = tribute.pet_name || "your pet";
    const greetName = tribute.owner_name || "there";
    const text = `Hi ${greetName},

We're gently crafting ${petName}'s tribute right now. 🐾

You can manage the memorial — update photos, edit details, or change privacy — anytime using your private link below.

Manage Your Memorial:
${manageUrl}

Keep this email safe — the link is your private key to manage ${petName}'s memorial.

With care,
The VellumPet Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #3d2817; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">Hi ${safeGreet},</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          We're gently crafting <strong>${safePet}</strong>'s tribute right now. 🐾
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          You can manage the memorial — update photos, edit details, or change privacy — anytime using your private link below.
        </p>
        <p style="text-align: center; margin: 0 0 24px;">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer"
             style="display: inline-block; background-color: #8b5a3c; background-image: linear-gradient(135deg, #8b5a3c, #6b4423); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 16px; mso-padding-alt: 0;">
            Manage Your Memorial
          </a>
        </p>
        <p style="font-size: 13px; color: #6b5544; line-height: 1.6; margin: 0 0 8px;">
          Or copy this link into your browser:
        </p>
        <p style="font-size: 13px; color: #6b5544; word-break: break-all; margin: 0 0 24px;">
          <a href="${safeUrl}" style="color: #6b5544;">${safeUrl}</a>
        </p>
        <p style="font-size: 13px; color: #8a7560; margin: 24px 0 0;">
          Keep this email safe — the link is your private key to manage ${safePet}'s memorial.
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
        text,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      // Release the idempotency slot so a future retry can succeed.
      await supabase
        .from("email_send_log")
        .update({
          status: "failed",
          error_message: `Resend API failed [${response.status}]: ${JSON.stringify(data).slice(0, 500)}`,
        })
        .eq("id", logId);
      throw new Error(`Resend API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    // Promote the pending row to sent and store the provider message id.
    const { error: updateErr } = await supabase
      .from("email_send_log")
      .update({ status: "sent", message_id: data?.id ?? null })
      .eq("id", logId);
    if (updateErr) {
      console.warn("email_send_log status update failed:", updateErr.message);
    }

    return json({ success: true, id: data?.id ?? null });
  } catch (error) {
    console.error("send-confirmation-email error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, 500);
  }
});
