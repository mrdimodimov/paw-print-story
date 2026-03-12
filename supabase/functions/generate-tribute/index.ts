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

  let prompt = `You are a compassionate writer creating a heartfelt tribute for a beloved pet.

Pet name: ${data.pet_name}
Pet type: ${data.pet_type}
${data.breed && data.breed !== "unknown" ? `Breed: ${data.breed}` : ""}
Years: ${data.years || "many wonderful years"}
Owner: ${data.owner_name}

Personality traits: ${data.personality_traits || "loving and special"}
${data.personality_description ? `Personality details: ${data.personality_description}` : ""}

${data.memories ? `Favorite memories: ${data.memories}` : ""}
${data.special_habits ? `Special habits and quirks: ${data.special_habits}` : ""}
${data.favorite_activities ? `Things they loved: ${data.favorite_activities}` : ""}
${data.favorite_people_or_animals ? `Special bonds: ${data.favorite_people_or_animals}` : ""}
${data.owner_message ? `Owner's personal message: "${data.owner_message}"` : ""}

Tone: ${toneDesc}

Instructions:
Write a ${toneDesc} tribute celebrating this pet's life. Focus on small details that made them special. Avoid generic phrases. Make the tribute feel deeply personal and comforting. Include the owner's message naturally if provided.

Target length: ${data.word_count_min}–${data.word_count_max} words.

Return ONLY the tribute text, no titles or headers.`;

  if (data.include_social_post) {
    prompt += `\n\nAfter the tribute, on a new line write "---SOCIAL_POST---" followed by a short social media post (under 280 characters) honoring the pet. Include relevant emojis and 2-3 hashtags.`;
  }

  if (data.include_share_card) {
    prompt += `\n\nAfter that, on a new line write "---SHARE_CARD---" followed by a 2-3 line memorial card text with the pet's name, years, and a brief touching phrase.`;
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
                "You are a compassionate, eloquent writer who specializes in pet memorial tributes. Your writing is sincere, personal, and deeply moving without being overly sentimental or cliché.",
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
