import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Copy, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Memory {
  id: string;
  visitor_name: string | null;
  message: string;
  created_at: string;
}

interface TributeMemoriesProps {
  tributeId: string;
  petName: string;
  unlocked?: boolean;
  slug?: string;
}

const MAX_MESSAGE = 300;
const MIN_MESSAGE = 5;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MemoryCard = ({ memory }: { memory: Memory }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="rounded-lg border border-border/60 bg-accent/20 p-4"
  >
    <p className="font-body text-sm leading-relaxed text-foreground">
      {memory.message}
    </p>
    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
      <span className="font-medium">
        — {memory.visitor_name?.trim() || "Anonymous"}
      </span>
      <span>{formatDate(memory.created_at)}</span>
    </div>
  </motion.div>
);

const TributeMemories = ({ tributeId, petName, unlocked = true, slug }: TributeMemoriesProps) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const newMemoryRef = useRef<HTMLDivElement>(null);

  const fetchMemories = async () => {
    const { data } = await supabase
      .from("tribute_memories")
      .select("*")
      .eq("tribute_id", tributeId)
      .order("created_at", { ascending: false });
    setMemories((data as Memory[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tributeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();

    if (trimmed.length < MIN_MESSAGE) {
      toast.error(`Message must be at least ${MIN_MESSAGE} characters.`);
      return;
    }
    if (trimmed.length > MAX_MESSAGE) {
      toast.error(`Message must be ${MAX_MESSAGE} characters or fewer.`);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("tribute_memories").insert({
      tribute_id: tributeId,
      visitor_name: name.trim().slice(0, 100) || null,
      message: trimmed,
    });

    if (error) {
      toast.error("Could not save your memory. Please try again.");
      setSubmitting(false);
      return;
    }

    setName("");
    setMessage("");
    setJustSubmitted(true);
    toast.success("Your memory has been added 🤍");
    await fetchMemories();
    setSubmitting(false);

    setTimeout(() => {
      newMemoryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

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
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft md:p-8">
      {/* Header */}
      <div className="mb-1 text-center">
        <Heart className="mx-auto mb-2 h-5 w-5 text-primary/60" />
        <h3 className="font-display text-xl font-semibold text-foreground md:text-2xl">
          Shared Memories
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Friends and family can share their memories.
        </p>
      </div>

      {!loading && memories.length > 0 && (
        <p className="mb-4 mt-4 text-center text-xs text-muted-foreground">
          {memories.length === 1
            ? "1 memory shared"
            : `${memories.length} memories shared`}
        </p>
      )}

      {/* Paywall overlay for unpaid users */}
      {!unlocked ? (
        <div className="relative mt-6">
          {/* Blurred preview of memories (or placeholder) */}
          <div className="pointer-events-none select-none blur-[4px]">
            <div className="space-y-3 opacity-50">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-border/60 bg-accent/20 p-4">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                  <div className="mt-3 h-2 w-1/3 rounded bg-muted/60" />
                </div>
              ))}
            </div>
          </div>

          {/* Lock message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-primary/20 bg-card/95 px-6 py-6 text-center shadow-soft backdrop-blur-sm">
              <Lock className="mx-auto mb-2 h-5 w-5 text-primary/60" />
              <p className="text-sm font-medium text-foreground">
                Unlock this tribute to allow others to share their memories.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Memories list */}
          {loading ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">Loading memories…</p>
          ) : memories.length > 0 ? (
            <div ref={newMemoryRef} className="mt-6 space-y-3">
              <AnimatePresence>
                {memories.map((m) => (
                  <MemoryCard key={m.id} memory={m} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No memories yet. Be the first to share one.
            </p>
          )}

          {/* Post-submission share prompt */}
          <AnimatePresence>
            {justSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-lg border border-primary/20 bg-accent/30 p-4 text-center"
              >
                <p className="mb-3 text-sm text-muted-foreground">
                  Share this page so others can contribute too
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

          {/* Leave a Memory form */}
          <div className="mt-6 rounded-lg border border-border/60 bg-accent/20 p-5">
            <h4 className="mb-1 font-display text-sm font-semibold text-foreground">
              Leave a Memory
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              Please keep messages respectful.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="bg-background"
              />
              <div className="relative">
                <Textarea
                  placeholder="Share a moment you'll always remember…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                  rows={3}
                  className="bg-background pr-16"
                  required
                />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                  {message.length}/{MAX_MESSAGE}
                </span>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || message.trim().length < MIN_MESSAGE}
              >
                <Send className="mr-1 h-4 w-4" />
                {submitting ? "Saving…" : "Add Memory"}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default TributeMemories;
