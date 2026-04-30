import type { TributeFormData, TierConfig, GeneratedTribute } from "./types";
import { buildPromptVariables } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { generateMemorialSlug, generateMemorialSlugWithSuffix } from "./slugify";
import { getTesterSource } from "./analytics";

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: (result: GeneratedTribute & { tributeId?: string; jobId?: string; slug?: string }) => void;
  onError: (error: string) => void;
}

// Slug generation now uses the shared slugify utility

const LOCK_KEY = "vellumpet_generation_lock";
const JOB_KEY = "vellumpet_active_job";
const LOCK_TTL = 60_000; // 60 seconds

let _generating = false;

function acquireLock(): boolean {
  if (_generating) return false;
  const existing = localStorage.getItem(LOCK_KEY);
  if (existing && Date.now() - Number(existing) < LOCK_TTL) return false;
  _generating = true;
  localStorage.setItem(LOCK_KEY, String(Date.now()));
  return true;
}

function releaseLock() {
  _generating = false;
  localStorage.removeItem(LOCK_KEY);
  localStorage.removeItem(JOB_KEY);
}

export function isGenerationLocked(): boolean {
  if (_generating) return true;
  const existing = localStorage.getItem(LOCK_KEY);
  return !!existing && Date.now() - Number(existing) < LOCK_TTL;
}

export function getActiveJobId(): string | null {
  return localStorage.getItem(JOB_KEY);
}

async function createJob(form: TributeFormData, tier: TierConfig): Promise<string | null> {
  try {
    const { data, error } = await supabase.from("generation_jobs").insert({
      status: "pending",
      pet_name: form.pet_name,
      owner_name: form.owner_name || null,
      tier_name: tier.name,
      photo_urls: form.photo_urls,
      form_data: form as any,
    }).select("id").single();
    if (!error && data) return data.id;
  } catch { /* non-critical */ }
  return null;
}

async function updateJobStatus(jobId: string, status: string, extra?: Record<string, any>) {
  try {
    await supabase.from("generation_jobs").update({ status, ...extra }).eq("id", jobId);
  } catch { /* non-critical */ }
}

export async function loadJobById(id: string) {
  const { data, error } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateTribute(
  form: TributeFormData,
  tier: TierConfig,
  callbacks: StreamCallbacks,
  previousJobId?: string,
  isPublic?: boolean
) {
  if (!acquireLock()) {
    callbacks.onError("A tribute is already being generated. Please wait for it to finish.");
    return;
  }

  // Create job record
  const jobId = await createJob(form, tier);
  if (jobId) {
    localStorage.setItem(JOB_KEY, jobId);
    await updateJobStatus(jobId, "generating");
  }

  const vars = buildPromptVariables(form, tier);
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-tribute`;

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        ...vars,
        job_id: jobId,
        previous_job_id: previousJobId,
        // Optional emotional seed quote captured from SEO pages
        tone_seed: (() => {
          try {
            return localStorage.getItem("vp_prefill_quote") || undefined;
          } catch {
            return undefined;
          }
        })(),
      }),
    });
  } catch (e) {
    if (jobId) await updateJobStatus(jobId, "failed", { error_message: "Network error" });
    releaseLock();
    callbacks.onError("Network error. Please check your connection and try again.");
    return;
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Generation failed" }));
    if (jobId) await updateJobStatus(jobId, "failed", { error_message: err.error || "Generation failed" });
    releaseLock();
    callbacks.onError(err.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    if (jobId) await updateJobStatus(jobId, "failed", { error_message: "No response body" });
    releaseLock();
    callbacks.onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let fullText = "";
  let streamDone = false;

  try {
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullText += content;
            callbacks.onDelta(content);
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Flush remaining buffer
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullText += content;
            callbacks.onDelta(content);
          }
        } catch { /* ignore */ }
      }
    }
  } catch (e) {
    if (jobId) await updateJobStatus(jobId, "failed", { error_message: "Stream disconnected" });
    releaseLock();
    callbacks.onError("The tribute stream was interrupted. Please try again.");
    return;
  }

  // Parse sections from the full text
  const result = parseGeneratedOutput(fullText);


  // Persist tribute to database with slug collision retry
  let tributeId: string | undefined;
  let tributeSlug: string | undefined;
  const baseSlug = generateMemorialSlug(form.pet_name, {
    yearsOfLife: form.years_of_life,
    title: result.title,
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    const slugToTry = attempt === 0 ? baseSlug : generateMemorialSlugWithSuffix(baseSlug);
    try {
      const normalizedPetType = (form.pet_type || "").toLowerCase();
      const safePetType =
        normalizedPetType === "dog" ||
        normalizedPetType === "cat" ||
        normalizedPetType === "bird"
          ? normalizedPetType
          : "other";

      const { data, error } = await supabase.from("tributes").insert({
        pet_name: form.pet_name,
        pet_type: safePetType,
        breed: form.breed || null,
        years_of_life: form.years_of_life || null,
        owner_name: form.owner_name || null,
        tier_name: tier.name,
        tribute_story: result.story,
        title: result.title || null,
        slug: slugToTry,
        social_post: result.social_post || null,
        share_card_text: result.share_card_text || null,
        short_caption: result.short_caption || null,
        photo_urls: form.photo_urls,
        form_data: form as any,
        is_public: isPublic || false,
        tester_source: getTesterSource(),
      } as any).select("id, slug").single();

      if (!error && data) {
        tributeId = data.id;
        tributeSlug = data.slug ?? undefined;

        // Always pre-insert into public_tributes with full data (unpaid, private)
        const safeStory =
          result.story && result.story.length > 30
            ? result.story
            : "A life remembered with love.";

        const { error: ptError } = await supabase.from("public_tributes").insert({
          tribute_id: data.id,
          slug: slugToTry,
          pet_name: form.pet_name,
          pet_type: safePetType,
          breed: form.breed || null,
          years_of_life: form.years_of_life || null,
          story: safeStory,
          social_post: result.social_post || null,
          share_card_text: result.share_card_text || null,
          photo_urls: form.photo_urls ?? [],
          tier_id: tier.id,
          is_public: false,
          is_paid: false,
        } as any).select("id").maybeSingle();

        if (ptError) {
          console.error("Failed to insert public_tributes:", ptError);
          throw new Error("Failed to create tribute record for payment");
        }

        break;
      }
      // If error is a unique constraint violation, retry with suffix
      if (error && !error.message?.includes("duplicate")) {
        console.warn("Failed to persist tribute:", error.message);
        break;
      }
    } catch {
      console.warn("Failed to persist tribute");
      break;
    }
  }

  // Update job as completed
  if (jobId) {
    await updateJobStatus(jobId, "completed", {
      tribute_story: result.story,
      social_post: result.social_post || null,
      share_card_text: result.share_card_text || null,
      short_caption: result.short_caption || null,
    });
  }

  // Fire-and-forget "ready" email. Must never block job completion.
  if (tributeId) {
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "payment-confirmation",
          tributeId,
          idempotencyKey: `ready-${tributeId}`,
          templateData: { state: "ready" },
        },
      });
    } catch (emailErr) {
      console.warn("Failed to send 'ready' email (non-blocking):", emailErr);
    }
  }

  releaseLock();
  callbacks.onDone({ ...result, tributeId, jobId, slug: tributeSlug });
}

function parseGeneratedOutput(text: string): GeneratedTribute {
  const result: GeneratedTribute = {
    story: text.trim(),
    title: undefined,
    social_post: undefined,
    share_card_text: undefined,
    short_caption: undefined,
  };

  // Extract title
  const titleIdx = text.indexOf("---TITLE---");
  if (titleIdx !== -1) {
    const afterTitle = text.slice(titleIdx + "---TITLE---".length).trimStart();
    const titleEnd = afterTitle.indexOf("\n");
    if (titleEnd !== -1) {
      result.title = afterTitle.slice(0, titleEnd).trim() || undefined;
      text = (text.slice(0, titleIdx) + afterTitle.slice(titleEnd + 1)).trim();
    }
  }

  const markers = ["---SOCIAL_POST---", "---SHARE_CARD---", "---SHORT_CAPTION---"] as const;
  const positions = markers.map(m => ({ marker: m, idx: text.indexOf(m) })).filter(p => p.idx !== -1).sort((a, b) => a.idx - b.idx);

  if (positions.length > 0) {
    result.story = text.slice(0, positions[0].idx).trim();

    for (let i = 0; i < positions.length; i++) {
      const start = positions[i].idx + positions[i].marker.length;
      const end = i + 1 < positions.length ? positions[i + 1].idx : text.length;
      const parsed = text.slice(start, end).trim();

      if (positions[i].marker === "---SOCIAL_POST---") result.social_post = parsed || undefined;
      else if (positions[i].marker === "---SHARE_CARD---") result.share_card_text = parsed || undefined;
      else if (positions[i].marker === "---SHORT_CAPTION---") result.short_caption = parsed || undefined;
    }
  } else {
    result.story = text.trim();
  }

  return result;
}

export async function loadTributeById(id: string) {
  const { data, error } = await supabase
    .from("tributes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function loadTributeBySlug(slug: string) {
  const { data, error } = await supabase
    .from("tributes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}
