import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SB = ReturnType<typeof createClient>;

function getSupabaseClient(): SB {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ─── Brand constants ───────────────────────────────────────────────

const BASE_URL = "https://paw-print-story.lovable.app";
const SENDER_DOMAIN = "notify.vellumpet.com";
const BRAND_NAME = "VellumPet";
const PRIMARY_COLOR = "#6B5744";

// ─── Safety limits ─────────────────────────────────────────────────

const MAX_SENDS_PER_5MIN = 3;
const DEDUP_WINDOW_MS = 60_000; // 60s per-template dedup
const SAME_TYPE_COOLDOWN_MS = 48 * 60 * 60 * 1000; // 48h per email_type
const MAX_PER_CRON_RUN = 10; // hard cap per cron invocation

// ─── Scheduling: emotion-based delays (hours after sequence created) ──

const SCHEDULE: Record<number, { delayHours: number; label: string }> = {
  1: { delayHours: 0, label: "confirmation" },       // immediate
  2: { delayHours: 24, label: "gentle follow-up" },   // Day 1
  3: { delayHours: 72, label: "memory prompt" },       // Day 3
  4: { delayHours: 168, label: "sharing reminder" },   // Day 7
};

// ─── Email Templates (emotional, non-promotional) ──────────────────

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

interface EmailTemplate { subject: string; html: string }

const templates: Record<number, (petName: string, tributeId: string) => EmailTemplate> = {
  1: (petName, tId) => ({
    subject: `${petName}'s tribute has been saved`,
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">${petName}'s tribute is safe with us</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        We know how much ${petName} meant to you. Your tribute is saved and ready whenever you need it.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        Come back anytime to read, share, or add to it.
      </p>
      ${ctaButton("View Your Tribute", tributeUrl(tId))}
    `),
  }),
  2: (petName, tId) => ({
    subject: "Add a memory you never want to forget",
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">Add a memory you never want to forget</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        Sometimes the smallest moments are the ones we miss most — the way ${petName} greeted you, a favorite spot, a silly habit.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        Your tribute is a place to hold onto those details before they fade.
      </p>
      ${ctaButton("Add a Memory", tributeUrl(tId))}
    `),
  }),
  3: (petName, tId) => ({
    subject: `${petName}'s story deserves to be told`,
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">${petName}'s story deserves to be told</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        The people who loved ${petName} would love to see this tribute too.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        Share it with family or friends — sometimes remembering together makes it a little easier.
      </p>
      ${ctaButton("Share ${petName}'s Tribute", tributeUrl(tId))}
    `),
  }),
  4: (petName, tId) => ({
    subject: "Take a moment to remember them today",
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">Take a moment to remember ${petName}</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        It's been a little while, and we just wanted you to know — ${petName}'s tribute is still here, exactly where you left it.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        Whenever you're ready, it's waiting for you.
      </p>
      ${ctaButton("Visit ${petName}'s Tribute", tributeUrl(tId))}
    `),
  }),
};

// ─── safeEnqueueEmail (mandatory validation gate) ──────────────────

async function safeEnqueueEmail(
  sb: SB,
  queueName: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (payload.purpose !== "transactional") {
    const reason = !payload.purpose ? "missing 'purpose'" : `invalid purpose '${payload.purpose}'`;
    console.error(`[safeEnqueue] REJECTED: ${reason}`, { to: payload.to, queue: queueName });
    throw new Error(`Enqueue blocked: ${reason}`);
  }
  if (!payload.to || !payload.subject || !payload.html) {
    console.error("[safeEnqueue] REJECTED: missing required fields", {
      to: !!payload.to, subject: !!payload.subject, html: !!payload.html,
    });
    throw new Error("Enqueue blocked: missing to/subject/html");
  }
  console.log("[safeEnqueue] OK", { to: payload.to, queue: queueName });
  await sb.rpc("enqueue_email", { queue_name: queueName, payload });
}

// ─── Guards ────────────────────────────────────────────────────────

async function isRateLimited(sb: SB, email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count } = await sb
    .from("email_send_log")
    .select("id", { count: "exact", head: true })
    .eq("recipient_email", email)
    .gte("created_at", windowStart);
  return (count ?? 0) >= MAX_SENDS_PER_5MIN;
}

async function isDuplicateRecent(sb: SB, email: string, templateName: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
  const { count } = await sb
    .from("email_send_log")
    .select("id", { count: "exact", head: true })
    .eq("recipient_email", email)
    .eq("template_name", templateName)
    .gte("created_at", windowStart);
  return (count ?? 0) > 0;
}

async function sameTypeSentRecently(sb: SB, email: string, templateName: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - SAME_TYPE_COOLDOWN_MS).toISOString();
  const { count } = await sb
    .from("email_send_log")
    .select("id", { count: "exact", head: true })
    .eq("recipient_email", email)
    .eq("template_name", templateName)
    .gte("created_at", windowStart);
  return (count ?? 0) > 0;
}

async function isSuppressed(sb: SB, email: string): Promise<boolean> {
  const { count } = await sb
    .from("suppressed_emails")
    .select("id", { count: "exact", head: true })
    .eq("email", email);
  return (count ?? 0) > 0;
}

async function isTributeCompleted(sb: SB, tributeId: string): Promise<boolean> {
  const { data } = await sb
    .from("tributes")
    .select("is_paid")
    .eq("id", tributeId)
    .single();
  return data?.is_paid === true;
}

// ─── Enqueue with full guard chain ─────────────────────────────────

async function enqueueNurtureEmail(
  sb: SB,
  recipientEmail: string,
  emailNumber: number,
  petName: string,
  tributeId: string,
  sequenceId: string,
): Promise<boolean> {
  const templateName = `nurture_email_${emailNumber}`;
  const idempotencyKey = `${recipientEmail}:${templateName}:${tributeId}`;

  // Guard chain — each logs its own rejection reason
  if (await isSuppressed(sb, recipientEmail)) {
    console.log(`[nurture] Suppressed: ${recipientEmail}`);
    return false;
  }
  if (await isRateLimited(sb, recipientEmail)) {
    console.log(`[nurture] Rate limited: ${recipientEmail}`);
    return false;
  }
  if (await isDuplicateRecent(sb, recipientEmail, templateName)) {
    console.log(`[nurture] Dedup (60s): ${idempotencyKey}`);
    return false;
  }
  if (await sameTypeSentRecently(sb, recipientEmail, templateName)) {
    console.log(`[nurture] Same type cooldown (48h): ${idempotencyKey}`);
    return false;
  }
  if (tributeId && await isTributeCompleted(sb, tributeId)) {
    console.log(`[nurture] Tribute completed, skipping: ${tributeId}`);
    return false;
  }

  const tpl = templates[emailNumber](petName, tributeId);
  const payload = {
    to: recipientEmail,
    subject: tpl.subject,
    html: tpl.html,
    from: `${BRAND_NAME} <hello@${SENDER_DOMAIN}>`,
    purpose: "transactional" as const,
    idempotency_key: idempotencyKey,
    sequence_id: sequenceId,
    email_number: emailNumber,
  };

  await safeEnqueueEmail(sb, "transactional_emails", payload);

  await sb.from("email_send_log").insert({
    recipient_email: recipientEmail,
    template_name: templateName,
    status: "pending",
    metadata: {
      tribute_id: tributeId,
      sequence_id: sequenceId,
      idempotency_key: idempotencyKey,
      schedule_label: SCHEDULE[emailNumber]?.label ?? "unknown",
    },
  });

  console.log(`[nurture] Enqueued: ${idempotencyKey}`);
  return true;
}

// ─── Trigger handler (user clicks "save email") ───────────────────

async function handleTrigger(
  sb: SB,
  tributeEmailId: string,
  email: string,
  tributeId: string,
  petName: string,
) {
  // Idempotency: check if sequence already exists
  const { data: existing } = await sb
    .from("tribute_email_sequence")
    .select("id")
    .eq("tribute_email_id", tributeEmailId)
    .eq("email_number", 1);

  if (existing && existing.length > 0) {
    console.log(`[trigger] Idempotent skip: sequence exists for ${tributeEmailId}`);
    return;
  }

  if (await isRateLimited(sb, email)) {
    console.log(`[trigger] Rate limited: ${email}`);
    return;
  }

  // Create sequence rows for all scheduled emails
  const emailNumbers = Object.keys(SCHEDULE).map(Number);
  const rows = emailNumbers.map((n) => ({
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

  // Send email 1 immediately (delay = 0)
  const seq1 = inserted.find((r: any) => r.email_number === 1);
  if (seq1) {
    const sent = await enqueueNurtureEmail(sb, email, 1, petName, tributeId, seq1.id);
    if (sent) {
      await sb.from("tribute_email_sequence")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", seq1.id);
    }
  }

  console.log(`[trigger] Sequence created: ${emailNumbers.length} emails for ${tributeEmailId}`);
}

// ─── Cron handler (scheduled emails 2, 3, 4) ──────────────────────

async function handleCron(sb: SB) {
  const now = new Date();
  const emailNumbers = Object.keys(SCHEDULE).map(Number).filter((n) => n > 1);

  const { data: pending } = await sb
    .from("tribute_email_sequence")
    .select("*")
    .is("sent_at", null)
    .eq("stopped", false)
    .in("email_number", emailNumbers)
    .limit(MAX_PER_CRON_RUN);

  if (!pending || pending.length === 0) return { processed: 0, skipped: 0 };

  let processed = 0;
  let skipped = 0;

  for (const row of pending) {
    // Hard cap per run
    if (processed >= MAX_PER_CRON_RUN) {
      console.log(`[cron] Hit max per run (${MAX_PER_CRON_RUN}), stopping`);
      break;
    }

    const createdAt = new Date(row.created_at);
    const hoursSince = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const schedule = SCHEDULE[row.email_number];
    if (!schedule || hoursSince < schedule.delayHours) continue;

    // Check if any sibling in the sequence was stopped
    const { data: stoppedSiblings } = await sb
      .from("tribute_email_sequence")
      .select("stopped")
      .eq("tribute_email_id", row.tribute_email_id)
      .eq("stopped", true)
      .limit(1);

    if (stoppedSiblings && stoppedSiblings.length > 0) {
      await sb.from("tribute_email_sequence").update({ stopped: true }).eq("id", row.id);
      skipped++;
      console.log(`[cron] Stopped (sibling): ${row.id}`);
      continue;
    }

    // Suppression check
    if (await isSuppressed(sb, row.email)) {
      await sb.from("tribute_email_sequence").update({ stopped: true }).eq("id", row.id);
      skipped++;
      console.log(`[cron] Suppressed: ${row.email}`);
      continue;
    }

    // Tribute completed check
    if (row.tribute_id && await isTributeCompleted(sb, row.tribute_id)) {
      await sb.from("tribute_email_sequence").update({ stopped: true }).eq("id", row.id);
      skipped++;
      console.log(`[cron] Tribute completed: ${row.tribute_id}`);
      continue;
    }

    const sent = await enqueueNurtureEmail(
      sb, row.email, row.email_number, row.pet_name, row.tribute_id, row.id,
    );

    if (sent) {
      await sb.from("tribute_email_sequence")
        .update({ sent_at: now.toISOString() })
        .eq("id", row.id);
      processed++;
    } else {
      skipped++;
    }
  }

  console.log(`[cron] Done: processed=${processed}, skipped=${skipped}`);
  return { processed, skipped };
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
      await handleTrigger(sb, body.tribute_email_id, body.email, body.tribute_id, body.pet_name);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "cron") {
      const result = await handleCron(sb);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "stop") {
      await sb.from("tribute_email_sequence")
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
