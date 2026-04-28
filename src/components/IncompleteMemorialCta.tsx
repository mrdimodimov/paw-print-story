import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, FileText, Clock, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PawIcon from "@/components/PawIcon";
import CtaIcon from "@/components/CtaIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IncompleteMemorialCtaProps {
  petName: string;
  slug: string;
  tributeId: string;
  hasPhotos: boolean;
  hasStory: boolean;
}

const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop&auto=format",
];

const PLACEHOLDER_TIMELINE = [
  { title: "The Day We Met", text: "Every great love story has a beginning…" },
  { title: "Favorite Moments", text: "The little things that made every day special…" },
  { title: "Forever Remembered", text: "A bond that time can never break…" },
];

export default function IncompleteMemorialCta({
  petName,
  slug,
  hasPhotos,
  hasStory,
}: IncompleteMemorialCtaProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleComplete = () => {
    if (token) {
      navigate(`/memorial/manage/${slug}?token=${token}`);
    } else {
      setShowEmailInput(true);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSending(true);
    try {
      const { data: pt } = await supabase
        .from("public_tributes")
        .select("manage_token, tribute_id")
        .eq("slug", slug)
        .maybeSingle();

      if (!pt?.manage_token) {
        toast.error("Could not find access link. Please contact support.");
        return;
      }

      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "payment-confirmation",
          recipientEmail: email,
          idempotencyKey: `incomplete-${slug}-${Date.now()}`,
          templateData: {
            petName,
            slug,
            tributeId: pt.tribute_id,
            manageToken: pt.manage_token,
            state: "ready",
          },
        },
      });

      if (error) throw error;
      toast.success("Access link sent to your email!");
      setShowEmailInput(false);
    } catch {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Urgency badge */}
      <div className="flex justify-center">
        <Badge variant="outline" className="border-primary/30 bg-accent/50 text-foreground/70 gap-1.5 px-3 py-1">
          <Clock className="h-3 w-3" />
          Memorial not yet completed
        </Badge>
      </div>

      {/* Hero CTA card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-8 md:p-10 text-center shadow-card"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <Heart className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mb-2 font-display text-xl md:text-2xl font-bold text-foreground">
          Start honoring {petName}'s memory
        </h2>
        <p className="mb-6 text-sm text-muted-foreground max-w-md mx-auto">
          Add photos, write their story, and create a place to remember them forever.
        </p>

        {!showEmailInput ? (
          <Button size="lg" className="px-8 shadow-glow" onClick={handleComplete}>
            <CtaIcon className="mr-2 shrink-0" size={20} />
            Complete memorial
          </Button>
        ) : (
          <div className="mx-auto max-w-sm space-y-3">
            <p className="text-xs text-muted-foreground">Enter your email to receive your editing link</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              />
              <Button onClick={handleEmailSubmit} disabled={sending}>
                {sending ? "Sending…" : "Send"}
                {!sending && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Blurred preview: what their memorial could look like */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative"
      >
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          What {petName}'s memorial could look like
        </p>

        <div className="pointer-events-none select-none" aria-hidden="true">
          {/* Placeholder photo grid */}
          {!hasPhotos && (
            <div className="mb-6 grid grid-cols-3 gap-3">
              {PLACEHOLDER_PHOTOS.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                  <img
                    src={src}
                    alt=""
                    className="h-28 w-full object-cover blur-[6px] opacity-40 md:h-36"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Placeholder story */}
          {!hasStory && (
            <div className="mb-6 rounded-xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground/50">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Their Story</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted/40" />
                <div className="h-3 w-11/12 rounded bg-muted/40" />
                <div className="h-3 w-4/5 rounded bg-muted/40" />
                <div className="h-3 w-9/12 rounded bg-muted/40" />
              </div>
            </div>
          )}

          {/* Placeholder timeline */}
          <div className="rounded-xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground/50">
              <PawIcon className="h-4 w-4" />
              <span className="text-xs font-medium">A Life Remembered</span>
            </div>
            <div className="space-y-4">
              {PLACEHOLDER_TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-3 opacity-40">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary/40" />
                  <div>
                    <p className="text-sm font-medium text-foreground/60">{item.title}</p>
                    <p className="text-xs text-muted-foreground/60">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fade overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </motion.div>
    </div>
  );
}
