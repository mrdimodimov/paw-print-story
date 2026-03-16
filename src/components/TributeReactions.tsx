import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const REACTION_TYPES = [
  { type: "candle", emoji: "🕯️", label: "Light a Candle" },
  { type: "paw", emoji: "🐾", label: "Leave a Paw" },
  { type: "heart", emoji: "❤️", label: "Send Love" },
] as const;

type ReactionType = "candle" | "paw" | "heart";

interface Props {
  tributeId: string;
}

export default function TributeReactions({ tributeId }: Props) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    candle: 0,
    paw: 0,
    heart: 0,
  });
  const [cooldown, setCooldown] = useState<ReactionType | null>(null);

  const fetchCounts = useCallback(async () => {
    const { data } = await supabase
      .from("tribute_reactions")
      .select("reaction_type")
      .eq("tribute_id", tributeId);

    if (data) {
      const next: Record<ReactionType, number> = { candle: 0, paw: 0, heart: 0 };
      for (const row of data) {
        const rt = row.reaction_type as ReactionType;
        if (rt in next) next[rt]++;
      }
      setCounts(next);
    }
  }, [tributeId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleReact = async (type: ReactionType) => {
    if (cooldown) return;
    setCooldown(type);

    // Optimistic update
    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));

    await supabase.from("tribute_reactions").insert({
      tribute_id: tributeId,
      reaction_type: type,
    });

    setTimeout(() => setCooldown(null), 3000);
  };

  const total = counts.candle + counts.paw + counts.heart;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft text-center">
      <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
        Honor this memory
      </h3>
      <p className="mb-5 text-sm text-muted-foreground">
        Leave a small tribute to show you care
      </p>

      <div className="flex justify-center gap-3">
        {REACTION_TYPES.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={cooldown === type}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-3 text-sm transition-all hover:border-primary/40 hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
            title={label}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      {total > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {counts.candle > 0 && `${counts.candle} candle${counts.candle !== 1 ? "s" : ""}`}
          {counts.candle > 0 && (counts.paw > 0 || counts.heart > 0) ? " · " : ""}
          {counts.paw > 0 && `${counts.paw} paw${counts.paw !== 1 ? "s" : ""}`}
          {counts.paw > 0 && counts.heart > 0 ? " · " : ""}
          {counts.heart > 0 && `${counts.heart} heart${counts.heart !== 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}
