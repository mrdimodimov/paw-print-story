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

  // Build rich context blocks only when data exists
  const contextSections: string[] = [];

  if (data.memories) {
    contextSections.push(`MEMORIES (weave these as vivid scenes, not summaries):\n${data.memories}`);
  }
  if (data.special_habits) {
    contextSections.push(`HABITS & QUIRKS (use as concrete details that show personality):\n${data.special_habits}`);
  }
  if (data.favorite_activities) {
    contextSections.push(`WHAT THEY LOVED (bring these to life as small everyday moments):\n${data.favorite_activities}`);
  }
  if (data.favorite_people_or_animals) {
    contextSections.push(`SPECIAL BONDS:\n${data.favorite_people_or_animals}`);
  }
  if (data.owner_message) {
    contextSections.push(`OWNER'S WORDS (weave this sentiment naturally into the tribute):\n"${data.owner_message}"`);
  }

  let prompt = `Write a heartfelt tribute celebrating the life of ${data.pet_name}, a ${data.pet_type}${data.breed && data.breed !== "unknown" ? ` (${data.breed})` : ""} who was loved by ${data.owner_name}.

Years of life: ${data.years || "many wonderful years"}
Personality: ${data.personality_traits || "loving and special"}
${data.personality_description ? `In their own words: ${data.personality_description}` : ""}

${contextSections.join("\n\n")}

TONE: ${toneDesc}

INSTRUCTIONS:
- Use the specific memories, habits, and personality traits above to create vivid moments in the story. Show, don't tell — turn each memory into a small scene the reader can picture.
- Focus on small everyday details that made ${data.pet_name} unique: the way they greeted their owner, where they liked to sleep, their little rituals.
- AVOID generic memorial phrases and clichés. Never write: "brought joy to everyone," "will never be forgotten," "crossed the rainbow bridge," "forever in our hearts," or similar stock phrases.
- Write in a natural storytelling voice, as if a close friend is sharing what made ${data.pet_name} special. Not a formal obituary.
- If the owner included a personal message, let that feeling flow through the piece without quoting it directly.

STRUCTURE:
1. Open with a warm memory or a small, specific moment that captures who ${data.pet_name} was.
2. Describe ${data.pet_name}'s personality and spirit through actions and habits, not adjectives.
3. Bring in favorite memories and daily rituals as lived scenes.
4. Mention what ${data.pet_name} loved most and the bonds they formed.
5. Close with a gentle, grounded reflection on the bond shared — honest and tender, not sentimental.

TARGET LENGTH: ${data.word_count_min}–${data.word_count_max} words.

Return ONLY the tribute text. No titles, headers, or labels.`;

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
          model: "openai/gpt-5-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a gifted storyteller who writes pet memorial tributes. Your voice is natural and intimate — like a close friend recalling what made someone's pet irreplaceable. You turn specific memories into vivid scenes. You never use stock memorial phrases or sentimental clichés. Every tribute you write feels like it could only be about this one particular animal.",
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
