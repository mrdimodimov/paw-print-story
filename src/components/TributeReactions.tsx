import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REACTION_TYPES = [
  { type: "candle" as const, emoji: "🕯️", label: "Light a Candle", feedback: "Your candle has been lit" },
  { type: "paw" as const, emoji: "🐾", label: "Leave a Paw", feedback: "You left a paw print" },
  { type: "heart" as const, emoji: "❤️", label: "Send Love", feedback: "Your love has been sent" },
];

type ReactionType = "candle" | "paw" | "heart";

const SESSION_KEY = "vellumpet_reactions";

function getSessionReactions(tributeId: string): Set<ReactionType> {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return new Set();
    const map = JSON.parse(stored) as Record<string, ReactionType[]>;
    return new Set(map[tributeId] || []);
  } catch {
    return new Set();
  }
}

function markSessionReaction(tributeId: string, type: ReactionType) {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    const map: Record<string, ReactionType[]> = stored ? JSON.parse(stored) : {};
    const existing = new Set(map[tributeId] || []);
    existing.add(type);
    map[tributeId] = [...existing];
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(map));
  } catch { /* non-critical */ }
}

interface TributeReactionsProps {
  tributeId: string;
  petName?: string;
}

export default function TributeReactions({ tributeId, petName }: TributeReactionsProps) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    candle: 0,
    paw: 0,
    heart: 0,
  });
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set());
  const [animating, setAnimating] = useState<ReactionType | null>(null);

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
    setReacted(getSessionReactions(tributeId));
  }, [fetchCounts, tributeId]);

  const handleReact = async (type: ReactionType) => {
    if (reacted.has(type)) return;

    // Optimistic update
    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setReacted((prev) => new Set(prev).add(type));
    markSessionReaction(tributeId, type);
    setAnimating(type);

    const feedback = REACTION_TYPES.find((r) => r.type === type)?.feedback;
    if (feedback) toast.success(feedback);

    await supabase.from("tribute_reactions").insert({
      tribute_id: tributeId,
      reaction_type: type,
    });

    setTimeout(() => setAnimating(null), 600);
  };

  const total = counts.candle + counts.paw + counts.heart;

  return (
    <div className="text-center">
      {/* Reaction summary row */}
      <div className="mb-5 flex items-center justify-center gap-5">
        {REACTION_TYPES.map(({ type, emoji }) => (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={reacted.has(type)}
            className="group flex items-center gap-1.5 transition-transform disabled:cursor-default"
          >
            <motion.span
              className="text-lg"
              animate={animating === type ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {emoji}
            </motion.span>
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {counts[type]}
            </span>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {REACTION_TYPES.map(({ type, emoji, label }) => {
          const hasReacted = reacted.has(type);
          return (
            <motion.button
              key={type}
              onClick={() => handleReact(type)}
              disabled={hasReacted}
              whileTap={!hasReacted ? { scale: 0.95 } : {}}
              className={`
                inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium
                transition-all duration-200
                ${hasReacted
                  ? "border-primary/30 bg-accent/60 text-primary cursor-default"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/40 hover:shadow-soft"
                }
              `}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={hasReacted ? "done" : "idle"}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {emoji}
                </motion.span>
              </AnimatePresence>
              {hasReacted ? "✓" : label}
            </motion.button>
          );
        })}
      </div>

      {/* Supporting text */}
      <p className="mt-5 text-sm text-muted-foreground">
        {total > 0
          ? `Join ${total} other${total !== 1 ? "s" : ""} in honoring ${petName || "this pet"}'s memory`
          : `Be the first to honor ${petName || "this pet"}'s memory`
        }
      </p>
    </div>
  );
}
