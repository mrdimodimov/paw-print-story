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

function buildPrompt(data: TributeRequest): string {
  const toneDescriptions: Record<string, string> = {
    warm: "warm, heartfelt, and comforting",
    celebratory: "joyful, celebratory, and uplifting",
    gentle: "soft, peaceful, and tender",
    lighthearted: "fun, loving, and lighthearted",
  };

  const toneDesc = toneDescriptions[data.tone] || toneDescriptions.warm;

  const contextSections: string[] = [];

  if (data.memories) {
    contextSections.push(`MEMORIES:\n${data.memories}`);
  }
  if (data.special_habits) {
    contextSections.push(`HABITS & QUIRKS:\n${data.special_habits}`);
  }
  if (data.favorite_activities) {
    contextSections.push(`WHAT THEY LOVED:\n${data.favorite_activities}`);
  }
  if (data.favorite_people_or_animals) {
    contextSections.push(`SPECIAL BONDS:\n${data.favorite_people_or_animals}`);
  }
  if (data.owner_message) {
    contextSections.push(`OWNER'S WORDS:\n"${data.owner_message}"`);
  }

  let prompt = `You will write a tribute for ${data.pet_name}, a ${data.pet_type}${data.breed && data.breed !== "unknown" ? ` (${data.breed})` : ""}, loved by ${data.owner_name}.

Years of life: ${data.years || "many wonderful years"}
Personality traits: ${data.personality_traits || "loving and special"}
${data.personality_description ? `Owner's description: ${data.personality_description}` : ""}

${contextSections.join("\n\n")}

TONE: ${toneDesc}

═══════════════════════════════════════
STEP 1 — NARRATIVE EXTRACTION (internal only, do NOT include in output)
═══════════════════════════════════════

Before writing, silently review all the information above and identify:

1. THREE DEFINING PERSONALITY TRAITS — not just adjectives, but traits shown through behavior. For example, not "playful" but "the kind of playful where a red dot on the floor could transform an entire afternoon."

2. TWO VIVID MOMENTS — the most cinematic, specific memories or habits from the data. These should be scenes a reader can picture: a place, an action, a sensory detail.

3. ONE EMOTIONAL THEME — the through-line of ${data.pet_name}'s life with their family. Examples: loyal companionship, playful spirit, comforting presence, joyful mischief, quiet devotion, fierce tenderness.

Keep this extraction entirely internal. Do not output it.

═══════════════════════════════════════
STEP 2 — WRITE THE TRIBUTE
═══════════════════════════════════════

Using the narrative highlights you just identified, write the tribute.

VOICE:
- Write as if a close family member is remembering ${data.pet_name} and sharing their memories with others — someone who was there for the morning routines, the evening rituals, the unremarkable Tuesday afternoons that turned out to be the most meaningful.
- The writing should feel warm, sincere, and personal — never formal, distant, or clinical.
- Do NOT sound like an obituary, an encyclopedia entry, or a greeting card. Sound like a real person who loved this animal and is telling you what it was like to live with them.
- Lean into everyday moments: the sound of paws on the kitchen floor, the specific spot on the couch, the look they gave when they wanted something. These small truths carry more emotional weight than grand statements.
- Use natural, conversational storytelling language. Vary sentence length. Let some sentences be short and quiet. Let others unspool into a memory.

WRITING RULES:
- Turn each memory and habit into a vivid, lived scene — show the moment, don't summarize it.
- Ground personality traits in specific actions and behaviors, not adjectives. Don't say "${data.pet_name} was playful" — describe what their version of play looked like.
- Focus on small everyday details that made ${data.pet_name} unique.
- NEVER use generic memorial phrases or clichés. Forbidden phrases include: "brought joy to everyone," "crossed the rainbow bridge," "will never be forgotten," "forever in our hearts," "unconditional love," "loyal companion to the end," "left paw prints on our hearts," "earned their wings."
- If the owner included a personal message, let that sentiment flow naturally through the piece without quoting it directly.

STRUCTURE:
1. Open with a warm, specific moment or memory that immediately captures who ${data.pet_name} was — drop the reader into a scene.
2. Show ${data.pet_name}'s defining personality through actions and habits — let behavior reveal character.
3. Bring in one or two vivid memories as fully rendered scenes with sensory details.
4. Describe what ${data.pet_name} loved most and the bonds they formed.
5. Close with a gentle, grounded reflection on the bond shared — honest and tender, anchored in the emotional theme. End on something real, not a platitude.

TARGET LENGTH: ${data.word_count_min}–${data.word_count_max} words.

OUTPUT: Return ONLY the final tribute text. No titles, headers, labels, or extraction notes.`;

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
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are a gifted storyteller who writes pet memorial tributes. You work in two internal phases: first you extract narrative highlights (personality traits, vivid moments, emotional theme) from the provided details, then you use those highlights as the foundation for a deeply personal tribute. You never reveal the extraction step — only the final tribute appears. Your voice is natural and intimate, like a close friend sharing what made this pet irreplaceable. You turn specific memories into cinematic scenes. You never use stock memorial phrases or sentimental clichés.",
            },
            { role: "user", content: prompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to generate tribute. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-tribute error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
