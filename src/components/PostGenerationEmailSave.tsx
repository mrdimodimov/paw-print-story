import { useState, useRef, useCallback } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isInCooldown, markSent, isEmailEnabled, logEmailAttempt } from "@/lib/email-guard";

interface PostGenerationEmailSaveProps {
  tributeId?: string;
  petName: string;
  isTestMode?: boolean;
}

const PostGenerationEmailSave = ({ tributeId, petName, isTestMode = false }: PostGenerationEmailSaveProps) => {
  const guardKey = `email_save_${tributeId || "unknown"}`;
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(() => isInCooldown(guardKey));
  const [saving, setSaving] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const submittedRef = useRef(false); // prevent double-click

  const handleSave = useCallback(async () => {
    // Prevent double-click within same render
    if (submittedRef.current) return;

    // Dev-mode kill switch
    if (!isEmailEnabled(isTestMode)) {
      logEmailAttempt("email-save", guardKey, "blocked_dev");
      toast.info("Email sending is disabled in dev mode.");
      return;
    }

    // Client-side cooldown (survives page reload)
    if (isInCooldown(guardKey)) {
      logEmailAttempt("email-save", guardKey, "blocked_cooldown");
      setSaved(true);
      toast.info("Your tribute was already saved.");
      return;
    }

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    submittedRef.current = true;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("tribute_emails").insert({
        email: trimmed,
        tribute_id: tributeId || null,
      }).select("id").single();

      if (error) {
        if (error.code === "23505") {
          setSaved(true);
          markSent(guardKey);
          logEmailAttempt("email-save", guardKey, "blocked_duplicate");
          toast.info("Your tribute was already saved.");
          return;
        }
        throw error;
      }

      markSent(guardKey);
      setSaved(true);
      logEmailAttempt("email-save", guardKey, "sent");
      toast.success("Your tribute has been saved!");

      // Trigger nurture email sequence (non-critical, no retry)
      if (data?.id && tributeId) {
        const nurtureKey = `nurture_${tributeId}`;
        if (!isInCooldown(nurtureKey)) {
          try {
            await supabase.functions.invoke("send-nurture-email", {
              body: {
                action: "trigger",
                tribute_email_id: data.id,
                email: trimmed,
                tribute_id: tributeId,
                pet_name: petName,
              },
            });
            markSent(nurtureKey);
            logEmailAttempt("nurture-trigger", nurtureKey, "sent");
          } catch {
            logEmailAttempt("nurture-trigger", nurtureKey, "error");
          }
        } else {
          logEmailAttempt("nurture-trigger", nurtureKey, "blocked_cooldown");
        }
      }
    } catch {
      logEmailAttempt("email-save", guardKey, "error");
      toast.error("Something went wrong. Please try again.");
      submittedRef.current = false; // allow retry on real error
    } finally {
      setSaving(false);
    }
  }, [email, tributeId, petName, guardKey, isTestMode]);

  if (saved) {
    return (
      <div className="mb-6 rounded-xl border border-primary/30 bg-accent/50 p-6 text-center shadow-soft">
        <Mail className="mx-auto mb-2 h-6 w-6 text-primary" />
        <p className="font-display text-base font-semibold text-foreground">
          Tribute saved!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          We've linked your email so you can access {petName}'s tribute anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-semibold text-foreground">
          Want to save your tribute?
        </h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Enter your email to access it anytime.
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={saving || cooldown}
        />
        <Button onClick={handleSave} disabled={saving || cooldown}>
          {saving ? "Saving…" : cooldown ? "Please wait…" : "Save My Tribute"}
        </Button>
      </div>
      {cooldown && (
        <p className="mt-2 text-xs text-muted-foreground">
          Email sent — please wait before retrying.
        </p>
      )}
    </div>
  );
};

export default PostGenerationEmailSave;
