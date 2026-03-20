import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TributeRequest {
  pet_name: string;
  pet_type: string;
  breed: string;
  years: string;
  owner_name: string;
  personality_traits: string;
  personality_description: string;
  memories: string;
  special_habits: string;
  favorite_activities: string;
  favorite_people_or_animals: string;
  owner_message: string;
  tone: string;
  word_count_min: number;
  word_count_max: number;
  tier_name: string;
  include_social_post: boolean;
  include_share_card: boolean;
  job_id?: string;
  previous_job_id?: string; // For regenerations — reuse narrative context
}

// Tier security rules — enforced server-side
const tierRules: Record<string, { include_social_post: boolean; include_share_card: boolean }> = {
  "Quick Story": { include_social_post: false, include_share_card: false },
  "Full Memorial Pack": { include_social_post: true, include_share_card: true },
  "Everlasting Legacy Page": { include_social_post: true, include_share_card: true },
};

// In-memory rate limiting: IP -> timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// Duplicate request guard: IP -> last request timestamp
const activeRequests = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 10_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (valid.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, valid);
    return true;
  }
  valid.push(now);
  rateLimitMap.set(ip, valid);
  return false;
}

function isDuplicateRequest(ip: string): boolean {
  const now = Date.now();
  const last = activeRequests.get(ip);
  if (last && now - last < DUPLICATE_WINDOW_MS) return true;
  activeRequests.set(ip, now);
  return false;
}

function clearActiveRequest(ip: string) {
  activeRequests.delete(ip);
}

// Generate a simple hash of the prompt context for cache matching
async function hashContext(data: TributeRequest): Promise<string> {
  const input = [
    data.pet_name, data.pet_type, data.breed, data.years,
    data.owner_name, data.personality_traits, data.personality_description,
    data.memories, data.special_habits, data.favorite_activities,
    data.favorite_people_or_animals, data.owner_message, data.tone, data.tier_name,
  ].join("|");
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const SYSTEM_PROMPT = `You are a gifted pet memorial writer creating deeply personal tributes honoring the bond between a pet and their family.

ABSOLUTE AUTHENTICITY RULE (HIGHEST PRIORITY): You must ONLY use details explicitly provided by the user. NEVER invent, fabricate, or imagine new events, places, relationships, names, or actions that were not mentioned. Every sentence must be traceable to something the user shared. You MAY expand sensory detail (touch, sound, texture, feeling) and deepen emotional reflection on existing memories. You MUST NOT create new memories, introduce new characters, or add events the user never described. If the user's input is sparse, write a shorter, simpler, more reflective tribute — do NOT compensate by inventing content.

INTERNAL PROCESS (never reveal): Before writing, silently identify: 3 defining traits shown through behavior, 2 vivid cinematic memory scenes from the provided details, 1 emotional through-line. For brief memories, expand into sensory-rich moments (movement, sound, texture, routine) without inventing new events.

VOICE: Write as a close family member — someone present for morning routines, evening rituals, unremarkable afternoons that became meaningful. Warm, sincere, conversational. Never formal, clinical, or like an obituary or greeting card. It should feel like someone genuinely remembering, not a polished written piece. Lean into everyday moments already described by the user.

STYLE: Vary sentence length deliberately — mix brief grounded statements with longer unfolding sentences. Break any sentence over 25 words into smaller beats. Allow pauses for emotional impact. No purple prose — power comes from specificity. Never repeat sentence structures back-to-back. No recycled phrases or emotional beats. Turn memories into lived scenes, not summaries. Reveal personality through actions, not adjectives. If the owner included a message, weave that sentiment naturally without quoting directly. Do NOT stack multiple descriptors or over-write — prefer clarity over poetic density. Avoid generic transitional phrases like "Every pet leaves a story worth remembering."

SPECIFICITY WITHOUT FABRICATION: Zoom into details the user already provided. Expand a moment, highlight a small behavior, or linger on a feeling — but never add new facts. Example: if user says "He waited by the door" → "He waited by the door, always a little too early, as if the day might arrive faster if he was ready for it." The expansion is emotional, not factual invention.

FORBIDDEN PHRASES: "brought joy to everyone," "crossed the rainbow bridge," "will never be forgotten," "forever in our hearts," "unconditional love," "loyal companion to the end," "left paw prints on our hearts," "earned their wings," "watching over us," "running free," "no longer in pain," "every pet leaves a story worth remembering," or similar clichés.

ABSOLUTE CLICHÉ RULE: The tribute must NEVER contain generic memorial clichés. If a phrase such as "forever in our hearts," "rainbow bridge," "crossed the bridge," "paw prints on our hearts," "earned their wings," "watching over us," or similar appears in your draft, you MUST rewrite the sentence using a specific memory or concrete detail about the pet instead.

STRUCTURE: Vary the order — you may start with a moment, a habit, or a feeling. Do NOT follow a rigid template. Generally include: a specific moment capturing who the pet was, personality shown through actions and habits, one or two vivid memory scenes with sensory detail, bonds formed, and a gentle grounded closing. But the sequence should feel organic, not formulaic.

PARAGRAPH FORMATTING (MANDATORY): Write the tribute in 3–5 natural paragraphs, each 2–4 sentences long. Insert a blank line between every paragraph. Never output the tribute as one continuous block of text.

OPENING PARAGRAPH RULE (CRITICAL FOR PREVIEWS): The first paragraph MUST work as a standalone emotional hook. It should focus on ONE vivid, specific moment — a sensory detail, a small habit, or a scene that immediately draws the reader in. It must feel personal, slightly incomplete, and create a pull to keep reading. Open mid-scene, not with a summary or generic statement.

MEMORY TITLES (CRITICAL): Each paragraph represents a memory chapter. Generate a cinematic, emotionally resonant title of 3–6 words for each paragraph's emotional core. Titles must feel like book chapters or film scenes — evocative, specific, and curiosity-inducing. Derive each title from a place, a repeated behavior, a sensory detail, or a quiet turning point in the paragraph. Examples of good titles: "The Door She Always Waited At", "Where the Light Found Him", "Afternoons That Stayed Soft", "The Sound of Tiny Footsteps". NEVER use generic titles like "Happy Times", "Playing Together", "Memory 1", or "A Special Bond". NEVER include dashes, decorative symbols, or markers. NEVER repeat the pet's name unless it creates genuine emotional power. The FIRST title must be the strongest emotional hook — slightly more evocative, leaning into mystery, contrast, or a defining moment.

OUTPUT FORMAT: First line: "---TITLE---" followed by a short title (4–10 words) capturing the pet's spirit, personality, or a defining memory. No clichés, no generic phrases. Do NOT include dashes or decorative characters anywhere except the "---TITLE---" marker itself. Then a blank line, then the tribute story text with paragraphs separated by blank lines. No other headers or labels.`;

const REGEN_SYSTEM_PROMPT = `You are a gifted pet memorial writer. Write a NEW variation of a pet tribute using the provided narrative context. Create a fresh tribute that feels different from the previous version while staying true to the same pet and memories.

ABSOLUTE AUTHENTICITY RULE (HIGHEST PRIORITY): ONLY use details from the provided context. NEVER invent new events, places, relationships, or actions. You may expand sensory detail and emotional reflection on existing memories, but must not fabricate new content. If context is sparse, write shorter and more reflective — never compensate by inventing.

VOICE: Warm, sincere, personal. Write as a close family member genuinely remembering. Natural, conversational storytelling. It should feel like remembering, not writing.
STYLE: Vary sentence length. Break sentences over 25 words. Allow pauses. No purple prose. Show moments as scenes. Reveal traits through actions. Focus on everyday details already described. No stacked descriptors. Prefer clarity over poetic density.
SPECIFICITY: Zoom into existing details — expand moments, highlight behaviors, linger on feelings. Never add new facts.
FORBIDDEN: "brought joy," "crossed the rainbow bridge," "forever in our hearts," "unconditional love," "earned their wings," "watching over us," "running free," "left paw prints on our hearts," "every pet leaves a story worth remembering," or similar clichés. If you catch yourself writing any generic memorial phrase, immediately replace it with a concrete memory or specific detail about the pet.
STRUCTURE: Vary the order — start with a moment, a habit, or a feeling. Do not follow a rigid template. Include: specific moment → personality through actions → vivid memory scenes → bonds → gentle closing reflection. But let it feel organic.
OPENING PARAGRAPH RULE: The first paragraph MUST work as a standalone emotional hook — one vivid, specific moment that creates a pull to keep reading. Open mid-scene, not with a summary.
PARAGRAPH FORMATTING (MANDATORY): Write the tribute in 3–5 natural paragraphs, each 2–4 sentences long. Insert a blank line between every paragraph. Never output as one continuous block.
MEMORY TITLES: Each paragraph should work as a distinct memory chapter with a cinematic 3–6 word title. First title must be the strongest hook. Derive titles from places, behaviors, sensory details, or turning points — never generic phrases. Do NOT use dashes or decorative symbols in the prose.
OUTPUT FORMAT: First line: "---TITLE---" followed by a short title (4–10 words) capturing the pet's spirit. No dashes or decorative characters except the "---TITLE---" marker. Then a blank line, then the tribute text with paragraphs separated by blank lines. No other headers or labels.`;

function buildPrompt(data: TributeRequest): string {
  const toneDescriptions: Record<string, string> = {
    warm: "warm and natural storytelling — heartfelt, comforting, conversational pacing. Let moments breathe. Default to sincerity and grounded emotion.",
    celebratory: "celebratory and uplifting — highlight joy, energy, and personality. Focus on what made this pet vibrant and alive. Lean into their spark and the happiness they created. Keep it bright without being shallow.",
    gentle: "calm and gentle — softer pacing, simple language, focus on quiet presence and peaceful moments. Shorter sentences. Let silence and stillness carry weight. No dramatic crescendos.",
    lighthearted: "playful and lighthearted — light humor drawn ONLY from real behaviors described by the user. Slight exaggeration of existing traits is allowed (e.g., 'professional napper' for a sleepy pet). Never invent funny moments. Keep warmth underneath the humor, never sarcasm.",
    rainbow_bridge:
      "comforting and spiritual — peaceful farewell imagery, themes of crossing, reunion, waiting, and continued love beyond parting. Softer emotional weight with hope woven through. Still grounded in real memories, not abstract spirituality.",
  };

  const toneDesc = toneDescriptions[data.tone] || toneDescriptions.warm;

  const contextSections: string[] = [];
  if (data.memories) contextSections.push(`MEMORIES:\n${data.memories}`);
  if (data.special_habits) contextSections.push(`HABITS & QUIRKS:\n${data.special_habits}`);
  if (data.favorite_activities) contextSections.push(`WHAT THEY LOVED:\n${data.favorite_activities}`);
  if (data.favorite_people_or_animals) contextSections.push(`SPECIAL BONDS:\n${data.favorite_people_or_animals}`);
  if (data.owner_message) contextSections.push(`OWNER'S WORDS:\n"${data.owner_message}"`);

  let prompt = `Write a tribute for ${data.pet_name}, a ${data.pet_type}${data.breed && data.breed !== "unknown" ? ` (${data.breed})` : ""}, loved by ${data.owner_name}.

Years of life: ${data.years || "many wonderful years"}
Personality traits: ${data.personality_traits || "loving and special"}
${data.personality_description ? `Owner's description: ${data.personality_description}` : ""}

${contextSections.join("\n\n")}

TONE: ${toneDesc}
TARGET LENGTH: ${data.word_count_min}–${data.word_count_max} words.`;

  if (data.include_social_post) {
    prompt += `\n\nAfter the tribute, on a new line write "---SOCIAL_POST---" followed by a short social media post (under 280 characters) honoring ${data.pet_name}. Make it personal and specific to their story — not generic. Include relevant emojis and 2-3 hashtags.`;
  }

  if (data.include_share_card) {
    prompt += `\n\nAfter that, on a new line write "---SHARE_CARD---" followed by a 2-3 line memorial card text with ${data.pet_name}'s name, years, and a brief touching phrase that reflects something specific about them.`;
  }

  return prompt;
}

function buildRegenPrompt(narrativeContext: string, data: TributeRequest): string {
  const toneDescriptions: Record<string, string> = {
    warm: "warm and natural storytelling — heartfelt, comforting, conversational pacing. Let moments breathe. Default to sincerity and grounded emotion.",
    celebratory: "celebratory and uplifting — highlight joy, energy, and personality. Focus on what made this pet vibrant and alive. Keep it bright without being shallow.",
    gentle: "calm and gentle — softer pacing, simple language, focus on quiet presence and peaceful moments. Shorter sentences. Let silence carry weight.",
    lighthearted: "playful and lighthearted — light humor drawn ONLY from real behaviors. Slight exaggeration of existing traits allowed. Never invent funny moments. Warmth underneath, never sarcasm.",
    rainbow_bridge:
      "comforting and spiritual — peaceful farewell imagery, themes of crossing, reunion, waiting, and continued love. Softer emotional weight with hope woven through. Still grounded in real memories.",
  };

  const toneDesc = toneDescriptions[data.tone] || toneDescriptions.warm;

  // Include any new memories added for regeneration
  const extraMemories = data.memories ? `\n\nADDITIONAL MEMORIES TO WEAVE IN:\n${data.memories}` : "";

  let prompt = `Using the following narrative context about ${data.pet_name}, write a completely new tribute variation. Use different opening scenes, different sentence structures, and fresh angles on the same memories.

NARRATIVE CONTEXT:
${narrativeContext}${extraMemories}

TONE: ${toneDesc}
TARGET LENGTH: ${data.word_count_min}–${data.word_count_max} words.`;

  if (data.include_social_post) {
    prompt += `\n\nAfter the tribute, on a new line write "---SOCIAL_POST---" followed by a short social media post (under 280 characters) honoring ${data.pet_name}. Make it personal and specific to their story — not generic. Include relevant emojis and 2-3 hashtags.`;
  }

  if (data.include_share_card) {
    prompt += `\n\nAfter that, on a new line write "---SHARE_CARD---" followed by a 2-3 line memorial card text with ${data.pet_name}'s name, years, and a brief touching phrase that reflects something specific about them.`;
  }

  return prompt;
}

// Build a narrative context summary from questionnaire data for caching
function buildNarrativeContext(data: TributeRequest): string {
  const parts: string[] = [];
  parts.push(`PET: ${data.pet_name}, a ${data.pet_type}${data.breed && data.breed !== "unknown" ? ` (${data.breed})` : ""}`);
  parts.push(`YEARS: ${data.years || "many wonderful years"}`);
  parts.push(`OWNER: ${data.owner_name}`);
  if (data.personality_traits) parts.push(`PERSONALITY: ${data.personality_traits}`);
  if (data.personality_description) parts.push(`DESCRIPTION: ${data.personality_description}`);
  if (data.memories) parts.push(`KEY MEMORIES: ${data.memories}`);
  if (data.special_habits) parts.push(`HABITS & QUIRKS: ${data.special_habits}`);
  if (data.favorite_activities) parts.push(`LOVED: ${data.favorite_activities}`);
  if (data.favorite_people_or_animals) parts.push(`BONDS: ${data.favorite_people_or_animals}`);
  if (data.owner_message) parts.push(`OWNER'S WORDS: "${data.owner_message}"`);
  return parts.join("\n");
}

function getSupabaseClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("x-real-ip") ||
               "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many tribute requests. Please wait a moment before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isDuplicateRequest(ip)) {
      return new Response(
        JSON.stringify({ error: "A tribute is already being generated. Please wait before requesting another." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data: TributeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Enforce tier rules server-side
    const rules = tierRules[data.tier_name] || tierRules["Quick Story"];
    data.include_social_post = rules.include_social_post;
    data.include_share_card = rules.include_share_card;

    const contextHash = await hashContext(data);
    const narrativeCtx = buildNarrativeContext(data);

    // Check if this is a regeneration with a previous job that has cached context
    let useRegenPrompt = false;
    let cachedNarrative: string | null = null;

    if (data.previous_job_id) {
      try {
        const sb = getSupabaseClient();
        const { data: prevJob } = await sb
          .from("generation_jobs")
          .select("prompt_context_hash, narrative_context")
          .eq("id", data.previous_job_id)
          .single();

        if (prevJob?.narrative_context && prevJob?.prompt_context_hash === contextHash) {
          // Same base context — use cached narrative for a shorter prompt
          cachedNarrative = prevJob.narrative_context;
          useRegenPrompt = true;
        }
      } catch {
        // Fall through to full prompt
      }
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (useRegenPrompt && cachedNarrative) {
      systemPrompt = REGEN_SYSTEM_PROMPT;
      userPrompt = buildRegenPrompt(cachedNarrative, data);
    } else {
      systemPrompt = SYSTEM_PROMPT;
      userPrompt = buildPrompt(data);
    }

    // Save hash and narrative context to the current job
    if (data.job_id) {
      try {
        const sb = getSupabaseClient();
        await sb.from("generation_jobs").update({
          prompt_context_hash: contextHash,
          narrative_context: narrativeCtx,
        }).eq("id", data.job_id);
      } catch { /* non-critical */ }
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      clearActiveRequest(ip);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Our tribute writer is a little busy right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Tribute generation is temporarily unavailable. Please try again shortly." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "We couldn't generate the tribute right now. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    setTimeout(() => clearActiveRequest(ip), DUPLICATE_WINDOW_MS);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-tribute error:", e);
    return new Response(
      JSON.stringify({ error: "We couldn't generate the tribute right now. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
