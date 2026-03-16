import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send } from "lucide-react";
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
    className="rounded-lg border border-border bg-card p-4 shadow-sm"
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

const TributeMemories = ({ tributeId, petName }: TributeMemoriesProps) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    toast.success("Your memory has been added.");
    await fetchMemories();
    setSubmitting(false);

    // Scroll to newly added memory
    setTimeout(() => {
      newMemoryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">
          Memories of {petName}
        </h3>
      </div>
      {!loading && (
        <p className="mb-4 text-sm text-muted-foreground">
          {memories.length === 0
            ? "0 memories shared"
            : memories.length === 1
              ? "1 memory shared"
              : `${memories.length} memories shared`}
        </p>
      )}

      {/* Memories list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading memories…</p>
      ) : memories.length > 0 ? (
        <div ref={newMemoryRef} className="mb-8 space-y-3">
          <AnimatePresence>
            {memories.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          No memories yet. Be the first to share one.
        </p>
      )}

      {/* Leave a Memory form */}
      <div className="rounded-lg border border-border/60 bg-accent/30 p-5">
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
              placeholder="Share a memory or message…"
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
            {submitting ? "Saving…" : "Leave a Memory"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TributeMemories;
