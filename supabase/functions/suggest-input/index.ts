// Optional AI input helper for the questionnaire form.
// IMPORTANT: This function is intentionally separate from `generate-tribute`.
// It does NOT touch the tribute generation pipeline, schema, or payloads.
// It only returns a short 1-2 sentence suggestion to help users fill in
// a single textarea field.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SuggestRequest {
  field: string; // which field the user is asking help for
  context: {
    pet_name?: string;
    pet_type?: string;
    breed?: string;
    personality_traits?: string[];
    personality_description?: string;
    memories?: string[];
    special_habits?: string;
    favorite_activities?: string;
    favorite_people_or_animals?: string;
    owner_message?: string;
  };
}

// Light per-IP rate limit so the helper can't be abused
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

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

const FIELD_GUIDANCE: Record<string, string> = {
  personality_description:
    "Describe their personality in 1-2 short, warm sentences. Concrete and specific, never generic.",
  memories:
    "Suggest ONE short, vivid memory in 1-2 sentences. Use a small concrete detail. Do not invent owner names.",
  special_habits:
    "Suggest ONE small quirky habit in 1-2 sentences. Specific and endearing.",
  favorite_activities:
    "List a few favorite activities or hobbies in 1-2 short sentences. Warm and concrete.",
  favorite_people_or_animals:
    "Mention favorite people or animal friends in 1-2 short sentences. Warm and specific.",
  owner_message:
    "Write a 1-2 sentence heartfelt message addressed directly to the pet. Tender, sincere, never templated.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as SuggestRequest;
    const field = body.field;
    const ctx = body.context || {};
    const guidance = FIELD_GUIDANCE[field];
    if (!guidance) {
      return new Response(JSON.stringify({ error: "Unsupported field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const petName = ctx.pet_name || "the pet";
    const petType = ctx.pet_type || "pet";
    const traits = (ctx.personality_traits || []).filter(Boolean).join(", ");
    const memories = (ctx.memories || []).filter(Boolean).join(" | ");

    const systemPrompt =
      "You help a grieving pet owner fill in a single short field of a memorial questionnaire. " +
      "Output ONLY the suggested text — no preamble, no quotes, no labels. " +
      "Keep it to 1-2 short sentences. Warm, sincere, never templated, never generic. " +
      "Avoid repetitive phrasing like 'always', 'so much', 'very', 'incredibly'. " +
      "Prefer specific, concrete details over general emotional statements. " +
      "Never invent the owner's name. Never mention AI. Never use clichés like 'rainbow bridge' unless asked.";

    const userPrompt = [
      `Field: ${field}`,
      `Guidance: ${guidance}`,
      `Pet name: ${petName}`,
      `Pet type: ${petType}`,
      ctx.breed ? `Breed: ${ctx.breed}` : "",
      traits ? `Personality traits: ${traits}` : "",
      ctx.personality_description ? `Personality so far: ${ctx.personality_description}` : "",
      memories ? `Memories so far: ${memories}` : "",
      ctx.special_habits ? `Habits so far: ${ctx.special_habits}` : "",
      ctx.favorite_activities ? `Activities so far: ${ctx.favorite_activities}` : "",
      ctx.favorite_people_or_animals ? `Friends so far: ${ctx.favorite_people_or_animals}` : "",
      ctx.owner_message ? `Owner message so far: ${ctx.owner_message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("suggest-input AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    let suggestion: string = data?.choices?.[0]?.message?.content?.trim() || "";

    // Strip wrapping quotes if present
    suggestion = suggestion.replace(/^["“”']+|["“”']+$/g, "").trim();

    if (!suggestion) {
      return new Response(JSON.stringify({ error: "Empty suggestion" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-input error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
