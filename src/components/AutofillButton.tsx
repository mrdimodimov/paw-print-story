import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import type { TributeFormData } from "@/lib/types";

// Fields the autofill helper supports. Must match server-side FIELD_GUIDANCE.
export type AutofillField =
  | "personality_description"
  | "memories"
  | "special_habits"
  | "favorite_activities"
  | "favorite_people_or_animals"
  | "owner_message";

interface AutofillButtonProps {
  field: AutofillField;
  form: TributeFormData;
  currentValue: string;
  onApply: (text: string) => void;
}

/**
 * Optional AI-assisted input helper.
 *
 * - Pure UI helper: never touches generation pipeline / payload / schema.
 * - User must click the button — no auto-trigger.
 * - If the textarea already has content, asks for confirm before replacing.
 * - On any failure, silently does nothing (does not block the flow).
 */
export function AutofillButton({ field, form, currentValue, onApply }: AutofillButtonProps) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const callSuggest = async () => {
    if (loading || cooldown) return;

    const hasExisting = !!currentValue.trim();

    // Trigger 1.5s cooldown immediately to prevent spam clicks
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1500);

    setLoading(true);
    const isRegenerate = hasExisting;
    try {
      trackEvent(isRegenerate ? "autofill_regenerated" : "autofill_used", {
        metadata: { field },
      });

      const { data, error } = await supabase.functions.invoke("suggest-input", {
        body: {
          field,
          context: {
            pet_name: form.pet_name,
            pet_type: form.pet_type,
            breed: form.breed,
            personality_traits: form.personality_traits,
            personality_description: form.personality_description,
            memories: form.memories,
            special_habits: form.special_habits,
            favorite_activities: form.favorite_activities,
            favorite_people_or_animals: form.favorite_people_or_animals,
            owner_message: form.owner_message,
          },
        },
      });

      if (error) throw error;
      const suggestion: string | undefined = data?.suggestion;
      if (!suggestion) throw new Error("No suggestion returned");

      // Append rather than replace: preserves user's own writing
      const merged = currentValue.trim()
        ? `${currentValue}\n\n${suggestion}`
        : suggestion;
      onApply(merged);

      trackEvent("autofill_applied", {
        metadata: { field, had_existing_content: hasExisting },
      });
    } catch (err) {
      // Never block the user's flow — only show a soft toast.
      console.warn("[autofill] suggestion failed", err);
      toast({
        title: "Couldn't generate a suggestion",
        description: "No worries — just keep writing in your own words.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={callSuggest}
      disabled={loading || cooldown}
      className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary/80 transition-colors hover:text-primary disabled:opacity-60"
      aria-label="Suggest something"
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3" />
          Suggest something
        </>
      )}
    </button>
  );
}
