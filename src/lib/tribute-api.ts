import type { TributeFormData, TierConfig, GeneratedTribute } from "./types";
import { buildPromptVariables } from "./types";

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: (result: GeneratedTribute) => void;
  onError: (error: string) => void;
}

export async function generateTribute(
  form: TributeFormData,
  tier: TierConfig,
  callbacks: StreamCallbacks
) {
  const vars = buildPromptVariables(form, tier);

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-tribute`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(vars),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Generation failed" }));
    callbacks.onError(err.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    callbacks.onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let fullText = "";
  let streamDone = false;

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

  // Parse sections from the full text
  const result = parseGeneratedOutput(fullText);
  callbacks.onDone(result);
}

function parseGeneratedOutput(text: string): GeneratedTribute {
  const result: GeneratedTribute = { story: text };

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
      result.social_post = text.slice(socialIdx + "---SOCIAL_POST---".length, socialEnd).trim();
    }

    if (cardIdx !== -1) {
      const cardEnd = socialIdx !== -1 && socialIdx > cardIdx ? socialIdx : text.length;
      result.share_card_text = text.slice(cardIdx + "---SHARE_CARD---".length, cardEnd).trim();
    }
  }

  return result;
}
