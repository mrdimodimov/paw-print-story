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
const DEDUP_WINDOW_MS = 60_000;
const SAME_TYPE_COOLDOWN_MS = 48 * 60 * 60 * 1000;
const MAX_PER_CRON_RUN = 10;

// ─── Signal thresholds for conditional emails ──────────────────────

const PHOTO_THRESHOLD = 3; // photos_uploaded >= 3 → high intent

// ─── Scheduling ────────────────────────────────────────────────────
// Emails 1-4: standard nurture (always created)
// Emails 5-6: conditional (only created if tribute has high-intent signals)

const SCHEDULE: Record<number, { delayHours: number; label: string; conditional: boolean }> = {
  1: { delayHours: 0,    label: "confirmation",           conditional: false },
  2: { delayHours: 24,   label: "gentle follow-up",       conditional: false },
  3: { delayHours: 72,   label: "memory prompt",          conditional: false },
  4: { delayHours: 168,  label: "sharing reminder",       conditional: false },
  5: { delayHours: 1,    label: "photo tribute nudge",    conditional: true  }, // 1h after trigger
  6: { delayHours: 60,   label: "engagement reminder",    conditional: true  }, // ~2.5 days
};

// ─── Email Templates ──────────────────────────────────────────────

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

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, "\n")
    .replace(/<br\s*\/?>(?!\n)/gi, "\n")
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n").map((l) => l.trim()).join("\n")
    .trim();
}

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
      ${ctaButton("Share the Tribute", tributeUrl(tId))}
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
      ${ctaButton("Visit the Tribute", tributeUrl(tId))}
    `),
  }),
  // ─── Conditional emails (conversion-focused, sent once per tribute) ──
  5: (petName, tId) => ({
    subject: `${petName}'s photos deserve more than a phone gallery`,
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">You've captured something special</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        The photos you saved of ${petName} — they're more than pictures. They're the look in their eyes, the tilt of their head, the moments that mattered.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        Your tribute brings those photos and words together into something you can keep forever.
      </p>
      ${ctaButton("See Your Tribute", tributeUrl(tId))}
    `),
  }),
  6: (petName, tId) => ({
    subject: `${petName}'s tribute is still waiting for you`,
    html: wrapHtml(`
      <h2 style="margin:0 0 16px;font-size:22px;color:#2a2017;font-weight:600;">${petName}'s memory is worth holding onto</h2>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#4a4035;">
        You put real thought into ${petName}'s tribute — the memories, the personality, the little things only you would know.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4a4035;">
        It's still here whenever you're ready. Some things are worth keeping in more than just your memory.
      </p>
      ${ctaButton("Return to ${petName}'s Tribute", tributeUrl(tId))}
    `),
  }),
};

// ─── safeEnqueueEmail ──────────────────────────────────────────────

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
  const { count } = await sb.from("email_send_log")
    .select("id", { count: "exact", head: true })
    .eq("recipient_email", email).gte("created_at", windowStart);
  return (count ?? 0) >= MAX_SENDS_PER_5MIN;
}

async function isDuplicateRecent(sb: SB, email: string, templateName: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
  const { count } = await sb.from("email_send_log")
    .select("id", { count: "exact", head: true })
    .eq("recipient_email", email).eq("template_name", templateName)
    .gte("created_at", windowStart);
  return (count ?? 0) > 0;
}

async function sameTypeSentRecently(sb: SB, email: string, templateName: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - SAME_TYPE_COOLDOWN_MS).toISOString();
  const { count } = await sb.from("email_send_log")
    .select("id", { count: "exact", head: true })
    .eq("recipient_email", email).eq("template_name", templateName)
    .gte("created_at", windowStart);
  return (count ?? 0) > 0;
}

async function isSuppressed(sb: SB, email: string): Promise<boolean> {
  const { count } = await sb.from("suppressed_emails")
    .select("id", { count: "exact", head: true }).eq("email", email);
  return (count ?? 0) > 0;
}

async function isTributeCompleted(sb: SB, tributeId: string): Promise<boolean> {
  const { data } = await sb.from("tributes")
    .select("is_paid").eq("id", tributeId).single();
  return data?.is_paid === true;
}

// ─── Signal detection for conditional emails ───────────────────────

interface TributeSignals {
  photoCount: number;
  hasStory: boolean;
  isPaid: boolean;
  storyLength: number;
}

async function getTributeSignals(sb: SB, tributeId: string): Promise<TributeSignals | null> {
  const { data } = await sb.from("tributes")
    .select("photo_urls, tribute_story, is_paid")
    .eq("id", tributeId).single();
  if (!data) return null;
  const storyLen = data.tribute_story?.length ?? 0;
  return {
    photoCount: Array.isArray(data.photo_urls) ? data.photo_urls.length : 0,
    hasStory: storyLen > 100,
    isPaid: data.is_paid === true,
    storyLength: storyLen,
  };
}

// Email 5: photos >= 3 AND not paid
function qualifiesForPhotoEmail(signals: TributeSignals): boolean {
  return signals.photoCount >= PHOTO_THRESHOLD && !signals.isPaid;
}

// Email 6: high engagement (photos + story) AND not paid
function qualifiesForEngagementEmail(signals: TributeSignals): boolean {
  return signals.photoCount >= PHOTO_THRESHOLD && signals.hasStory && !signals.isPaid;
}

// Legacy compat
function isHighIntent(signals: TributeSignals): boolean {
  return qualifiesForPhotoEmail(signals);
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
    text: htmlToText(tpl.html),
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
      conditional: SCHEDULE[emailNumber]?.conditional ?? false,
    },
  });

  console.log(`[nurture] Enqueued: ${idempotencyKey}`);
  return true;
}

// ─── Trigger handler ──────────────────────────────────────────────

async function handleTrigger(
  sb: SB,
  tributeEmailId: string,
  email: string,
  tributeId: string,
  petName: string,
) {
  // Idempotency
  const { data: existing } = await sb.from("tribute_email_sequence")
    .select("id").eq("tribute_email_id", tributeEmailId).eq("email_number", 1);

  if (existing && existing.length > 0) {
    console.log(`[trigger] Idempotent skip: ${tributeEmailId}`);
    return;
  }

  if (await isRateLimited(sb, email)) {
    console.log(`[trigger] Rate limited: ${email}`);
    return;
  }

  // Determine which emails to create: always 1-4, conditionally 5-6
  const standardNumbers = Object.entries(SCHEDULE)
    .filter(([, s]) => !s.conditional).map(([n]) => Number(n));

  let conditionalNumbers: number[] = [];
  if (tributeId) {
    const signals = await getTributeSignals(sb, tributeId);
    if (signals) {
      if (qualifiesForPhotoEmail(signals)) conditionalNumbers.push(5);
      if (qualifiesForEngagementEmail(signals)) conditionalNumbers.push(6);
      console.log(`[trigger] Signals: photos=${signals.photoCount}, storyLen=${signals.storyLength}, isPaid=${signals.isPaid}, conditional=[${conditionalNumbers}]`);
    }
  }

  const emailNumbers = [...standardNumbers, ...conditionalNumbers];
  const rows = emailNumbers.map((n) => ({
    tribute_email_id: tributeEmailId,
    email,
    tribute_id: tributeId,
    pet_name: petName,
    email_number: n,
  }));

  const { data: inserted } = await sb.from("tribute_email_sequence")
    .insert(rows).select("id, email_number");

  if (!inserted) return;

  // Send email 1 immediately
  const seq1 = inserted.find((r: any) => r.email_number === 1);
  if (seq1) {
    const sent = await enqueueNurtureEmail(sb, email, 1, petName, tributeId, seq1.id);
    if (sent) {
      await sb.from("tribute_email_sequence")
        .update({ sent_at: new Date().toISOString() }).eq("id", seq1.id);
    }
  }

  console.log(`[trigger] Sequence: ${emailNumbers.length} emails (${conditionalNumbers.length} conditional) for ${tributeEmailId}`);
}

// ─── Cron handler ──────────────────────────────────────────────────

async function handleCron(sb: SB) {
  const now = new Date();
  const deferredNumbers = Object.keys(SCHEDULE).map(Number).filter((n) => n > 1);

  const { data: pending } = await sb.from("tribute_email_sequence")
    .select("*").is("sent_at", null).eq("stopped", false)
    .in("email_number", deferredNumbers).limit(MAX_PER_CRON_RUN);

  if (!pending || pending.length === 0) return { processed: 0, skipped: 0 };

  let processed = 0;
  let skipped = 0;

  for (const row of pending) {
    if (processed >= MAX_PER_CRON_RUN) {
      console.log(`[cron] Hit max (${MAX_PER_CRON_RUN})`);
      break;
    }

    const createdAt = new Date(row.created_at);
    const hoursSince = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const schedule = SCHEDULE[row.email_number];
    if (!schedule || hoursSince < schedule.delayHours) continue;

    // Stopped sibling check
    const { data: stoppedSiblings } = await sb.from("tribute_email_sequence")
      .select("stopped").eq("tribute_email_id", row.tribute_email_id)
      .eq("stopped", true).limit(1);

    if (stoppedSiblings && stoppedSiblings.length > 0) {
      await sb.from("tribute_email_sequence").update({ stopped: true }).eq("id", row.id);
      skipped++;
      continue;
    }

    if (await isSuppressed(sb, row.email)) {
      await sb.from("tribute_email_sequence").update({ stopped: true }).eq("id", row.id);
      skipped++;
      continue;
    }

    // For conditional emails, re-check per-email qualification at send time
    if (schedule.conditional && row.tribute_id) {
      const signals = await getTributeSignals(sb, row.tribute_id);
      const qualifies = signals && (
        (row.email_number === 5 && qualifiesForPhotoEmail(signals)) ||
        (row.email_number === 6 && qualifiesForEngagementEmail(signals))
      );
      if (!qualifies) {
        await sb.from("tribute_email_sequence").update({ stopped: true }).eq("id", row.id);
        skipped++;
        console.log(`[cron] Conditional skip (email ${row.email_number}, signals changed): ${row.id}`);
        continue;
      }
    }

    if (row.tribute_id && await isTributeCompleted(sb, row.tribute_id)) {
      await sb.from("tribute_email_sequence").update({ stopped: true }).eq("id", row.id);
      skipped++;
      continue;
    }

    const sent = await enqueueNurtureEmail(
      sb, row.email, row.email_number, row.pet_name, row.tribute_id, row.id,
    );

    if (sent) {
      await sb.from("tribute_email_sequence")
        .update({ sent_at: now.toISOString() }).eq("id", row.id);
      processed++;
    } else {
      skipped++;
    }
  }

  console.log(`[cron] Done: processed=${processed}, skipped=${skipped}`);
  return { processed, skipped };
}

// ─── Conversion tracking ──────────────────────────────────────────

async function handleConversionCheck(sb: SB) {
  // Find tributes that converted (is_paid=true) after nurture emails were sent
  // This correlates email_send_log with tributes to measure effectiveness
  const { data: conversions } = await sb.from("email_send_log")
    .select("recipient_email, template_name, metadata, created_at")
    .like("template_name", "nurture_email_%")
    .eq("status", "pending")
    .limit(100);

  if (!conversions || conversions.length === 0) return { conversions: 0 };

  const tributeIds = new Set<string>();
  for (const row of conversions) {
    const meta = row.metadata as Record<string, unknown> | null;
    if (meta?.tribute_id) tributeIds.add(meta.tribute_id as string);
  }

  if (tributeIds.size === 0) return { conversions: 0 };

  const { data: paidTributes } = await sb.from("tributes")
    .select("id").in("id", Array.from(tributeIds)).eq("is_paid", true);

  const paidIds = new Set((paidTributes ?? []).map((t: any) => t.id));

  // Stop sequences for converted tributes
  let stopped = 0;
  for (const tributeId of paidIds) {
    await sb.from("tribute_email_sequence")
      .update({ stopped: true })
      .eq("tribute_id", tributeId)
      .is("sent_at", null);
    stopped++;
  }

  console.log(`[conversion] Found ${paidIds.size} converted tributes, stopped ${stopped} sequences`);
  return { conversions: paidIds.size, stopped };
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
      const nurture = await handleCron(sb);
      const conversion = await handleConversionCheck(sb);
      return new Response(JSON.stringify({ ok: true, ...nurture, ...conversion }), {
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
