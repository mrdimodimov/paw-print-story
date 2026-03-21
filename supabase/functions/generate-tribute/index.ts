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
  previous_job_id?: string;
}

// Tier security rules — enforced server-side
const tierRules: Record<string, { include_social_post: boolean; include_share_card: boolean }> = {
  "Quick Story": { include_social_post: false, include_share_card: false },
  "Full Memorial Pack": { include_social_post: true, include_share_card: true },
  "Everlasting Legacy Page": { include_social_post: true, include_share_card: true },
};

// In-memory rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
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

// ---------------------------------------------------------------------------
// Simplified prompts — concise directives, no redundancy
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are writing a deeply personal pet tribute based ONLY on the user's input. Ignore any previous or conflicting instructions. Follow ONLY the rules below.

CORE RULE (CRITICAL):
- Use ONLY details provided by the user. Do NOT invent new events, relationships, or scenarios. You may expand emotions and describe moments more vividly, but never add new facts.

WRITING STYLE:
- Write in natural, flowing paragraphs. It should feel like someone remembering their pet, not structured output.
- Avoid rigid sections or fragmented blocks. Use clear, human language.
- Vary sentence length naturally. Avoid overly complex or overly flat sentences.
- Keep sentences slightly shorter and more direct.
- Prefer simple, natural phrasing over polished or abstract language.
- Avoid over-explaining: if a moment is clear, do not expand it unnecessarily. Let small details carry meaning without extra interpretation.
- Reduce density: do not overload paragraphs with too many ideas. Give important moments space to breathe.

NARRATIVE FLOW (IMPORTANT):
- The tribute must feel like a single continuous story, not disconnected memory blocks.
- Let one memory naturally lead into another. Subtly reference earlier moments when appropriate.
- Memories should connect and build on each other emotionally.

STRUCTURE:
- Opening: Start with a specific moment, habit, or scene — never a summary.
- Middle: Expand memories naturally, showing personality through actions.
- Ending (CRITICAL): The final paragraph must feel like a quiet emotional landing. Reflect on what those moments meant in simple, grounded language. End with a short, clear sentence that feels natural and memorable. Avoid abstract or overly poetic phrasing.

MEMORY TITLES:
- DO NOT include titles inside the tribute text.
- The tribute must be written as clean, uninterrupted paragraphs.
- No headings, labels, or section titles should appear in the story.

TONE:
- Follow the selected tone provided in the user prompt. Apply tone naturally through wording. Do NOT exaggerate or invent details to match tone.

AVOID:
- Clichés ("forever in our hearts", "rainbow bridge", "crossed the rainbow bridge", "unconditional love", "loyal companion", "left paw prints on our hearts")
- Repetitive phrasing
- Overly poetic or artificial language

OUTPUT FORMAT: First line: "---TITLE---" followed by a short title (4–10 words). Then a blank line, then 3–5 paragraphs of the tribute, each separated by a blank line. No titles inside the paragraphs. No other headers or labels.`;

const REGEN_SYSTEM_PROMPT = `You are a gifted pet memorial writer. Write a NEW variation of a pet tribute using the provided narrative context. Create a fresh tribute that feels different while staying true to the same pet and memories.

CORE RULES:
1. ONLY use details from the provided context. Never invent new content. You may expand emotion and sensory texture on existing details.
2. Write in natural, flowing paragraphs (3–5, blank line between). Let the story breathe organically.
3. Focus on 1–2 PRIMARY memories. Use different angles and openings than the previous version.

VOICE: Warm, conversational, personal — like a family member remembering. Mix sentence lengths, show personality through actions, prefer clarity.

OPENING: Drop into a specific moment or habit — never a summary. Pull the reader in immediately.
ENDING: Echo a primary memory, reflect briefly, close with one grounded sentence.

MEMORY TITLES: Cinematic 3–6 word titles per paragraph. First title = strongest hook. No generic titles or decorative symbols.

FORBIDDEN: Generic memorial clichés — replace with specific pet details.

OUTPUT FORMAT: First line: "---TITLE---" followed by a short title (4–10 words). Then blank line, then tribute with paragraphs separated by blank lines. No other headers or labels.`;

// ---------------------------------------------------------------------------
// Tone descriptions & input-depth detection
// ---------------------------------------------------------------------------

const toneDescriptions: Record<string, string> = {
  warm: "warm and natural — heartfelt, conversational pacing, grounded emotion.",
  celebratory: "celebratory — highlight joy, energy, and personality. Keep it bright without being shallow.",
  gentle: "calm and gentle — softer pacing, simple language, quiet presence. Let silence carry weight.",
  lighthearted: "playful — light humor from real behaviors only. Slight exaggeration of existing traits allowed. Warmth underneath, never sarcasm.",
  rainbow_bridge: "comforting and spiritual — peaceful farewell imagery, reunion, continued love. Still grounded in real memories.",
};

function getDepthHint(data: TributeRequest): string {
  const signals: string[] = [];
  if (data.memories) signals.push(...data.memories.split(/\n+/).filter(s => s.trim().length > 10));
  if (data.special_habits?.trim().length > 10) signals.push(data.special_habits);
  if (data.favorite_activities?.trim().length > 10) signals.push(data.favorite_activities);
  if (data.favorite_people_or_animals?.trim().length > 10) signals.push(data.favorite_people_or_animals);
  if (data.personality_description?.trim().length > 10) signals.push(data.personality_description);

  const count = signals.length;
  if (count <= 2) return "INPUT DEPTH: LOW — Few details provided. Revisit the same memories from multiple angles (what happened, how it felt, what it meant). Never invent new events to fill space.";
  if (count <= 5) return "INPUT DEPTH: MEDIUM — Distribute focus across memories with moderate detail.";
  return "INPUT DEPTH: HIGH — Use the full range of memories. Vary structure and pacing naturally.";
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildPrompt(data: TributeRequest): string {
  const toneDesc = toneDescriptions[data.tone] || toneDescriptions.warm;

  const sections: string[] = [];
  if (data.memories) sections.push(`MEMORIES:\n${data.memories}`);
  if (data.special_habits) sections.push(`HABITS & QUIRKS:\n${data.special_habits}`);
  if (data.favorite_activities) sections.push(`WHAT THEY LOVED:\n${data.favorite_activities}`);
  if (data.favorite_people_or_animals) sections.push(`SPECIAL BONDS:\n${data.favorite_people_or_animals}`);
  if (data.owner_message) sections.push(`OWNER'S WORDS:\n"${data.owner_message}"`);

  let prompt = `Write a tribute for ${data.pet_name}, a ${data.pet_type}${data.breed && data.breed !== "unknown" ? ` (${data.breed})` : ""}, loved by ${data.owner_name}.

Years of life: ${data.years || "many wonderful years"}
Personality: ${data.personality_traits || "loving and special"}
${data.personality_description ? `Owner's description: ${data.personality_description}` : ""}

${sections.join("\n\n")}

${getDepthHint(data)}

TONE: ${toneDesc}
TARGET LENGTH: ${data.word_count_min}–${data.word_count_max} words.`;

  if (data.include_social_post) {
    prompt += `\n\nAfter the tribute, on a new line write "---SOCIAL_POST---" followed by a short social media post (under 280 characters) honoring ${data.pet_name}. Make it personal and specific. Include relevant emojis and 2-3 hashtags.`;
  }
  if (data.include_share_card) {
    prompt += `\n\nAfter that, on a new line write "---SHARE_CARD---" followed by a 2-3 line memorial card text with ${data.pet_name}'s name, years, and a brief touching phrase specific to them.`;
  }

  return prompt;
}

function buildRegenPrompt(narrativeContext: string, data: TributeRequest): string {
  const toneDesc = toneDescriptions[data.tone] || toneDescriptions.warm;
  const extraMemories = data.memories ? `\n\nADDITIONAL MEMORIES TO WEAVE IN:\n${data.memories}` : "";

  let prompt = `Using the following narrative context about ${data.pet_name}, write a completely new tribute variation. Use different opening scenes, different sentence structures, and fresh angles on the same memories.

NARRATIVE CONTEXT:
${narrativeContext}${extraMemories}

TONE: ${toneDesc}
TARGET LENGTH: ${data.word_count_min}–${data.word_count_max} words.`;

  if (data.include_social_post) {
    prompt += `\n\nAfter the tribute, on a new line write "---SOCIAL_POST---" followed by a short social media post (under 280 characters) honoring ${data.pet_name}. Make it personal and specific. Include relevant emojis and 2-3 hashtags.`;
  }
  if (data.include_share_card) {
    prompt += `\n\nAfter that, on a new line write "---SHARE_CARD---" followed by a 2-3 line memorial card text with ${data.pet_name}'s name, years, and a brief touching phrase specific to them.`;
  }

  return prompt;
}

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

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------

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

    // Check for regeneration with cached context
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
          cachedNarrative = prevJob.narrative_context;
          useRegenPrompt = true;
        }
      } catch { /* Fall through to full prompt */ }
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
