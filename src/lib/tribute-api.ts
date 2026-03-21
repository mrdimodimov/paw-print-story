import type { TributeFormData, TierConfig, GeneratedTribute } from "./types";
import { buildPromptVariables } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { generateMemorialSlug, generateMemorialSlugWithSuffix } from "./slugify";

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
      body: JSON.stringify({ ...vars, job_id: jobId, previous_job_id: previousJobId }),
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

  // Generate URL slug using emotional priority logic
  const slug = generateMemorialSlug(form.pet_name, {
    yearsOfLife: form.years_of_life,
    title: result.title,
  });

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
      const { data, error } = await supabase.from("tributes").insert({
        pet_name: form.pet_name,
        pet_type: form.pet_type,
        breed: form.breed || null,
        years_of_life: form.years_of_life || null,
        owner_name: form.owner_name || null,
        tier_name: tier.name,
        tribute_story: result.story,
        title: result.title || null,
        slug: slugToTry,
        social_post: result.social_post || null,
        share_card_text: result.share_card_text || null,
        photo_urls: form.photo_urls,
        form_data: form as any,
        is_public: isPublic || false,
      }).select("id, slug").single();

      if (!error && data) {
        tributeId = data.id;
        tributeSlug = data.slug ?? undefined;
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
    });
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
  };

  // Extract title
  const titleIdx = text.indexOf("---TITLE---");
  if (titleIdx !== -1) {
    const afterTitle = text.slice(titleIdx + "---TITLE---".length).trimStart();
    const titleEnd = afterTitle.indexOf("\n");
    if (titleEnd !== -1) {
      result.title = afterTitle.slice(0, titleEnd).trim() || undefined;
      // Remove title section from remaining text
      text = (text.slice(0, titleIdx) + afterTitle.slice(titleEnd + 1)).trim();
    }
  }

  const socialIdx = text.indexOf("---SOCIAL_POST---");
  const cardIdx = text.indexOf("---SHARE_CARD---");

  if (socialIdx !== -1 || cardIdx !== -1) {
    const storyEnd = Math.min(
      socialIdx !== -1 ? socialIdx : Infinity,
      cardIdx !== -1 ? cardIdx : Infinity
    );
    result.story = text.slice(0, storyEnd).trim();

    if (socialIdx !== -1) {
      const socialEnd = cardIdx !== -1 && cardIdx > socialIdx ? cardIdx : text.length;
      const parsed = text.slice(socialIdx + "---SOCIAL_POST---".length, socialEnd).trim();
      result.social_post = parsed || undefined;
    }

    if (cardIdx !== -1) {
      const cardEnd = socialIdx !== -1 && socialIdx > cardIdx ? socialIdx : text.length;
      const parsed = text.slice(cardIdx + "---SHARE_CARD---".length, cardEnd).trim();
      result.share_card_text = parsed || undefined;
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
