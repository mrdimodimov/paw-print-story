import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const REACTION_TYPES = [
  { type: "candle" as const, emoji: "🕯️", label: "Light a Candle", feedback: "Your candle has been lit 🤍" },
  { type: "paw" as const, emoji: "🐾", label: "Leave a Paw", feedback: "You left a paw print 🤍" },
  { type: "heart" as const, emoji: "❤️", label: "Send Love", feedback: "Your love has been sent 🤍" },
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

function getTotalSessionReactions(tributeId: string): number {
  return getSessionReactions(tributeId).size;
}

interface TributeReactionsProps {
  tributeId: string;
  petName?: string;
  unlocked?: boolean;
  slug?: string;
}

/**
 * Hook that manages reaction state, shared between counter and CTA components.
 */
function useReactions(tributeId: string, unlocked: boolean) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    candle: 0,
    paw: 0,
    heart: 0,
  });
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set());
  const [animating, setAnimating] = useState<ReactionType | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [showPaywallMsg, setShowPaywallMsg] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

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
    if (reacted.has(type) || cooldown) return;

    // Paywall: free users get 1 reaction total
    if (!unlocked && getTotalSessionReactions(tributeId) >= 1) {
      setShowPaywallMsg(true);
      return;
    }

    // Optimistic update
    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setReacted((prev) => new Set(prev).add(type));
    markSessionReaction(tributeId, type);
    setAnimating(type);
    setCooldown(true);

    const feedback = REACTION_TYPES.find((r) => r.type === type)?.feedback;
    if (feedback) toast.success(feedback);

    // Show share prompt after reacting
    setShowSharePrompt(true);

    await supabase.from("tribute_reactions").insert({
      tribute_id: tributeId,
      reaction_type: type,
    });

    setTimeout(() => {
      setAnimating(null);
      setCooldown(false);
    }, 3000);
  };

  return { counts, reacted, animating, handleReact, showPaywallMsg, showSharePrompt, cooldown };
}

/**
 * Compact social-proof counter row for the hero header.
 */
export function ReactionCounters({
  tributeId,
  petName,
  unlocked = false,
}: TributeReactionsProps) {
  const { counts, reacted, animating, handleReact } = useReactions(tributeId, unlocked);
  const total = counts.candle + counts.paw + counts.heart;

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-center gap-5">
      {REACTION_TYPES.map(({ type, emoji }) => (
        <button
          key={type}
          onClick={() => handleReact(type)}
          disabled={reacted.has(type)}
          className="group flex items-center gap-1.5 transition-transform disabled:cursor-default"
          title={`${type === "candle" ? "Light a Candle" : type === "paw" ? "Leave a Paw" : "Send Love"}`}
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
  );
}

/**
 * Full end-of-story reactions CTA section with heading, buttons, paywall, and share.
 */
export default function TributeReactions({
  tributeId,
  petName,
  unlocked = false,
  slug,
}: TributeReactionsProps) {
  const {
    counts,
    reacted,
    animating,
    handleReact,
    showPaywallMsg,
    showSharePrompt,
    cooldown,
  } = useReactions(tributeId, unlocked);
  const [copied, setCopied] = useState(false);

  const total = counts.candle + counts.paw + counts.heart;

  const handleCopyLink = async () => {
    const url = slug
      ? `${window.location.origin}/memorial/${slug}`
      : window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center shadow-soft md:p-8">
      {/* Heading */}
      <h3 className="mb-1 font-display text-xl font-semibold text-foreground md:text-2xl">
        Honor their memory
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        {total > 0
          ? `Join ${total} other${total !== 1 ? "s" : ""} who loved ${petName || "this pet"}`
          : `Be the first to honor ${petName || "this pet"}'s memory`}
      </p>

      {/* Counter row */}
      <div className="mb-6 flex items-center justify-center gap-6">
        {REACTION_TYPES.map(({ type, emoji }) => (
          <div key={type} className="flex items-center gap-1.5">
            <motion.span
              className="text-xl"
              animate={animating === type ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {emoji}
            </motion.span>
            <span className="text-base font-medium text-muted-foreground tabular-nums">
              {counts[type]}
            </span>
          </div>
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
              disabled={hasReacted || cooldown}
              whileTap={!hasReacted ? { scale: 0.95 } : {}}
              whileHover={!hasReacted ? { scale: 1.03 } : {}}
              className={`
                inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium
                transition-all duration-200
                ${hasReacted
                  ? "border-primary/30 bg-accent/60 text-primary cursor-default"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/40 hover:shadow-soft"
                }
                ${cooldown && !hasReacted ? "opacity-60" : ""}
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

      {/* Honored message */}
      <AnimatePresence>
        {reacted.size > 0 && !showPaywallMsg && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-sm font-medium text-primary/80"
          >
            You've honored their memory 🤍
          </motion.p>
        )}
      </AnimatePresence>

      {/* Paywall message for free users */}
      <AnimatePresence>
        {showPaywallMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-6 max-w-sm rounded-lg border border-primary/20 bg-accent/30 p-4"
          >
            <p className="mb-3 text-sm text-foreground">
              Create your own tribute to continue honoring and sharing memories.
            </p>
            <Button
              size="sm"
              onClick={() => (window.location.href = "/create")}
            >
              Create a Tribute
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share trigger after reacting */}
      <AnimatePresence>
        {showSharePrompt && !showPaywallMsg && reacted.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t border-border pt-5"
          >
            <p className="mb-3 text-sm text-muted-foreground">
              Share this tribute with others who loved them
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Link
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
