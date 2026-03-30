import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type Rating = "yes" | "somewhat" | "not_really";

interface TesterFeedbackModalProps {
  tributeId?: string;
  testerToken: string | null;
  photosUploaded?: number;
  tributeStartTime?: number;
  onClose: () => void;
}

export default function TesterFeedbackModal({
  tributeId,
  testerToken,
  photosUploaded,
  tributeStartTime,
  onClose,
}: TesterFeedbackModalProps) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [confusion, setConfusion] = useState("");
  const [positive, setPositive] = useState("");
  const [missing, setMissing] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = confusion.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const elapsed = tributeStartTime
      ? Math.round((Date.now() - tributeStartTime) / 1000)
      : null;

    await supabase.from("feedback" as any).insert({
      tribute_id: tributeId || null,
      tester_token: testerToken,
      rating: rating || null,
      confusion_text: confusion.trim(),
      positive_text: positive.trim() || null,
      missing_text: missing.trim() || null,
      time_to_complete_seconds: elapsed,
      photos_uploaded: photosUploaded ?? null,
    } as any);

    setSubmitted(true);
    setTimeout(onClose, 1800);
  };

  const ratingOptions: { value: Rating; label: string }[] = [
    { value: "yes", label: "Yes" },
    { value: "somewhat", label: "Somewhat" },
    { value: "not_really", label: "Not really" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="Skip"
          >
            <X className="h-4 w-4" />
          </button>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 text-center"
            >
              <p className="font-display text-lg text-foreground">
                Thank you — this really helps 🙏
              </p>
            </motion.div>
          ) : (
            <>
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                Can I ask you something? 💛
              </h3>
              <p className="mb-5 text-sm text-muted-foreground">
                This is early and your feedback really helps improve it.
              </p>

              {/* Quick rating */}
              <div className="mb-5">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Did this feel meaningful?
                </p>
                <div className="flex gap-2">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRating(opt.value)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        rating === opt.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q1 - required */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  What felt confusing or frustrating? <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={confusion}
                  onChange={(e) => setConfusion(e.target.value)}
                  placeholder="Be honest — anything helps"
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Q2 - optional */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  What did you like or find meaningful?
                </label>
                <Textarea
                  value={positive}
                  onChange={(e) => setPositive(e.target.value)}
                  placeholder="Optional"
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Q3 - optional */}
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Anything you expected but didn't see?
                </label>
                <Textarea
                  value={missing}
                  onChange={(e) => setMissing(e.target.value)}
                  placeholder="Optional"
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Skip
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  size="sm"
                >
                  {submitting ? "Sending…" : "Send feedback"}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
