import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
}

// Tier security rules — enforced server-side
const tierRules: Record<string, { include_social_post: boolean; include_share_card: boolean }> = {
  "Quick Story": { include_social_post: false, include_share_card: false },
  "Full Memorial Pack": { include_social_post: true, include_share_card: true },
  "Everlasting Legacy Page": { include_social_post: true, include_share_card: true },
};

const SYSTEM_PROMPT = `You are a gifted pet memorial writer. You create deeply personal tribute stories that honor the unique bond between a pet and their family.

INTERNAL PROCESS (never reveal this):
Before writing, silently extract from the provided details:
1. THREE DEFINING PERSONALITY TRAITS — shown through behavior, not adjectives.
2. TWO VIVID MOMENTS — the most cinematic, specific memories or habits. Scenes a reader can picture.
3. ONE EMOTIONAL THEME — the through-line of the pet's life with their family.
4. MICRO-DETAIL AMPLIFICATION — For each short memory or habit, imagine the scene around it. Expand brief facts into small narrative moments using sensory cues (movement, sound, texture, routine, setting). Stay grounded in what was provided — do not invent major events or new characters.

VOICE:
- Write as a close family member remembering the pet — someone who was there for morning routines, evening rituals, unremarkable Tuesday afternoons that turned out to be the most meaningful.
- Warm, sincere, personal. Never formal, distant, or clinical.
- Do NOT sound like an obituary, encyclopedia entry, or greeting card. Sound like a real person who loved this animal.
- Lean into everyday moments: paws on the kitchen floor, a specific couch spot, a particular look.
- Natural, conversational storytelling language.

RHYTHM & PACING:
- Vary sentence length deliberately. A short sentence lands differently after a long one.
- Mix brief grounded statements with longer sentences that unfold into memories.
- Never repeat the same sentence structure back-to-back.
- No purple prose. Power comes from specificity, not flourish.
- Replace broad descriptions with concrete details.
- Do not recycle similar phrases, transitions, or emotional beats.

WRITING RULES:
- Turn each memory and habit into a vivid, lived scene — show the moment, don't summarize it.
- Ground personality traits in specific actions and behaviors, not adjectives.
- Focus on small everyday details: routines, habits, favorite spots, movement through a room.
- NEVER use generic memorial phrases or clichés. Forbidden: "brought joy to everyone," "crossed the rainbow bridge," "will never be forgotten," "forever in our hearts," "unconditional love," "loyal companion to the end," "left paw prints on our hearts," "earned their wings."
- If the owner included a personal message, let that sentiment flow naturally without quoting directly.

STRUCTURE:
1. Open with a warm, specific moment that captures who the pet was — drop the reader into a scene.
2. Show defining personality through actions and habits.
3. Bring in one or two vivid memories as fully rendered scenes with sensory details.
4. Describe what the pet loved most and the bonds they formed.
5. Close with a gentle, grounded reflection — honest and tender, anchored in the emotional theme.

OUTPUT: Return ONLY the final tribute text. No titles, headers, labels, or extraction notes.`;

function buildPrompt(data: TributeRequest): string {
  const toneDescriptions: Record<string, string> = {
    warm: "warm, heartfelt, and comforting",
    celebratory: "joyful, celebratory, and uplifting",
    gentle: "soft, peaceful, and tender",
    lighthearted: "fun, loving, and lighthearted",
    rainbow_bridge:
      "comforting and spiritual, with peaceful farewell imagery, themes of the Rainbow Bridge crossing, reunion, waiting, and continued love beyond parting",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: TributeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Enforce tier rules server-side
    const rules = tierRules[data.tier_name] || tierRules["Quick Story"];
    data.include_social_post = rules.include_social_post;
    data.include_share_card = rules.include_share_card;

    const prompt = buildPrompt(data);

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
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
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
