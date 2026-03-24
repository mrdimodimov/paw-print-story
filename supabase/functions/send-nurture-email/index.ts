import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

const BASE_URL = "https://paw-print-story.lovable.app";
const SENDER_DOMAIN = "notify.vellumpet.com";
const BRAND_NAME = "VellumPet";
const PRIMARY_COLOR = "#6B5744"; // warm brown from logo

// ─── Email Templates ───────────────────────────────────────────────

function tributeUrl(tributeId: string): string {
  return `${BASE_URL}/tribute/${tributeId}`;
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Georgia','Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
  <tr><td style="padding:32px 40px 24px;text-align:center;">
    <span style="font-size:24px;">🐾</span>
    <span style="font-size:20px;font-weight:600;color:#2a2017;margin-left:8px;font-family:'Georgia',serif;">${BRAND_NAME}</span>
  </td></tr>
  <tr><td style="padding:0 40px 32px;">
    ${body}
  </td></tr>
  <tr><td style="padding:20px 40px;border-top:1px solid #ede8e0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9a9085;">You received this because you saved a tribute on ${BRAND_NAME}.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
<tr><td style="background:${PRIMARY_COLOR};border-radius:8px;padding:14px 32px;">
  <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;font-family:'Georgia',serif;">${text}</a>
</td></tr></table>`;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

function email1(petName: string, tId: string): EmailTemplate {
  return {
    subject: "Your pet's tribute is saved",
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">Your tribute has been safely saved</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        ${petName}'s tribute is ready and waiting for you.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        You can come back anytime to view, edit, or download it.
      </p>
      ${ctaButton("View Your Tribute", tributeUrl(tId))}
    `),
  };
}

function email2(petName: string, tId: string): EmailTemplate {
  return {
    subject: "You started something meaningful",
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">You started something meaningful</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        You began creating a tribute for ${petName}.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        Your story is still waiting.
      </p>
      ${ctaButton("Continue Your Tribute", tributeUrl(tId))}
    `),
  };
}

function email3(petName: string, tId: string): EmailTemplate {
  return {
    subject: "Every pet deserves to be remembered",
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">Every pet deserves to be remembered</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        A tribute is a simple way to preserve those memories.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        ${petName}'s tribute is still available.
      </p>
      ${ctaButton("Finish Your Tribute", tributeUrl(tId))}
    `),
  };
}

const templates: Record<number, (petName: string, tributeId: string) => EmailTemplate> = {
  1: email1,
  2: email2,
  3: email3,
};

// ─── Handlers ──────────────────────────────────────────────────────

/** Enqueue a single nurture email via pgmq */
async function enqueueNurtureEmail(
  sb: ReturnType<typeof getSupabaseClient>,
  recipientEmail: string,
  emailNumber: number,
  petName: string,
  tributeId: string,
  sequenceId: string,
) {
  const tpl = templates[emailNumber](petName, tributeId);
  const payload = {
    to: recipientEmail,
    subject: tpl.subject,
    html: tpl.html,
    from: `${BRAND_NAME} <hello@${SENDER_DOMAIN}>`,
    sequence_id: sequenceId,
    email_number: emailNumber,
  };

  await sb.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  });

  // Log
  await sb.from("email_send_log").insert({
    recipient_email: recipientEmail,
    template_name: `nurture_email_${emailNumber}`,
    status: "pending",
    metadata: { tribute_id: tributeId, sequence_id: sequenceId },
  });
}

/** Called immediately when a user saves their email — sends email 1 and creates sequence rows */
async function handleTrigger(
  sb: ReturnType<typeof getSupabaseClient>,
  tributeEmailId: string,
  email: string,
  tributeId: string,
  petName: string,
) {
  // Check if sequence rows already exist
  const { data: existing } = await sb
    .from("tribute_email_sequence")
    .select("id")
    .eq("tribute_email_id", tributeEmailId)
    .eq("email_number", 1);

  if (existing && existing.length > 0) return; // already triggered

  // Create sequence rows for emails 1, 2, 3
  const rows = [1, 2, 3].map((n) => ({
    tribute_email_id: tributeEmailId,
    email,
    tribute_id: tributeId,
    pet_name: petName,
    email_number: n,
  }));

  const { data: inserted } = await sb
    .from("tribute_email_sequence")
    .insert(rows)
    .select("id, email_number");

  if (!inserted) return;

  // Send email 1 immediately
  const seq1 = inserted.find((r: any) => r.email_number === 1);
  if (seq1) {
    await enqueueNurtureEmail(sb, email, 1, petName, tributeId, seq1.id);
    await sb
      .from("tribute_email_sequence")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", seq1.id);
  }
}

/** Called by cron — checks for due emails 2 and 3 */
async function handleCron(sb: ReturnType<typeof getSupabaseClient>) {
  const now = new Date();

  // Get unsent, not-stopped sequence entries for emails 2 and 3
  const { data: pending } = await sb
    .from("tribute_email_sequence")
    .select("*")
    .is("sent_at", null)
    .eq("stopped", false)
    .in("email_number", [2, 3])
    .limit(50);

  if (!pending || pending.length === 0) return { processed: 0 };

  let processed = 0;

  for (const row of pending) {
    const createdAt = new Date(row.created_at);
    const hoursSince = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Email 2: send after 8 hours (midpoint of 6-12)
    // Email 3: send after 36 hours (midpoint of 24-48)
    const minHours = row.email_number === 2 ? 8 : 36;
    if (hoursSince < minHours) continue;

    // Check stop conditions: has email 1 been marked stopped?
    const { data: stopped } = await sb
      .from("tribute_email_sequence")
      .select("stopped")
      .eq("tribute_email_id", row.tribute_email_id)
      .eq("stopped", true)
      .limit(1);

    if (stopped && stopped.length > 0) {
      // Mark this one as stopped too
      await sb
        .from("tribute_email_sequence")
        .update({ stopped: true })
        .eq("id", row.id);
      continue;
    }

    // Check suppression list
    const { data: suppressed } = await sb
      .from("suppressed_emails")
      .select("id")
      .eq("email", row.email)
      .limit(1);

    if (suppressed && suppressed.length > 0) {
      await sb
        .from("tribute_email_sequence")
        .update({ stopped: true })
        .eq("id", row.id);
      continue;
    }

    // Send
    await enqueueNurtureEmail(
      sb,
      row.email,
      row.email_number,
      row.pet_name,
      row.tribute_id,
      row.id,
    );
    await sb
      .from("tribute_email_sequence")
      .update({ sent_at: now.toISOString() })
      .eq("id", row.id);
    processed++;
  }

  return { processed };
}

// ─── Main ──────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = getSupabaseClient();
    const body = await req.json().catch(() => ({}));

    if (body.action === "trigger") {
      // Immediate trigger from client
      await handleTrigger(
        sb,
        body.tribute_email_id,
        body.email,
        body.tribute_id,
        body.pet_name,
      );
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "cron") {
      // Cron-triggered check for delayed emails
      const result = await handleCron(sb);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "stop") {
      // Stop sequence for a tribute_email_id
      await sb
        .from("tribute_email_sequence")
        .update({ stopped: true })
        .eq("tribute_email_id", body.tribute_email_id)
        .is("sent_at", null);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-nurture-email error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
