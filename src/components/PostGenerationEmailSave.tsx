import { useState, useRef, useCallback } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEBOUNCE_MS = 60_000; // 60s cooldown between sends
const STORAGE_PREFIX = "email_sent_";

function recentlySent(tributeId?: string): boolean {
  if (!tributeId) return false;
  try {
    const ts = localStorage.getItem(`${STORAGE_PREFIX}${tributeId}`);
    if (!ts) return false;
    return Date.now() - Number(ts) < DEBOUNCE_MS;
  } catch {
    return false;
  }
}

function markSent(tributeId?: string) {
  if (!tributeId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tributeId}`, String(Date.now()));
  } catch { /* storage unavailable */ }
}

interface PostGenerationEmailSaveProps {
  tributeId?: string;
  petName: string;
}

const PostGenerationEmailSave = ({ tributeId, petName }: PostGenerationEmailSaveProps) => {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(() => recentlySent(tributeId));
  const [saving, setSaving] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const lastSendRef = useRef<number>(0);

  const handleSave = useCallback(async () => {
    // Client-side debounce: block rapid re-clicks
    if (Date.now() - lastSendRef.current < DEBOUNCE_MS) {
      toast.info("Email already sent — please wait before retrying.");
      setCooldown(true);
      return;
    }

    // Reload-protection via localStorage
    if (recentlySent(tributeId)) {
      setSaved(true);
      toast.info("Your tribute was already saved.");
      return;
    }

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.from("tribute_emails").insert({
        email: trimmed,
        tribute_id: tributeId || null,
      }).select("id").single();

      if (error) {
        // Duplicate insert (unique constraint) — treat as already saved
        if (error.code === "23505") {
          setSaved(true);
          markSent(tributeId);
          toast.info("Your tribute was already saved.");
          return;
        }
        throw error;
      }

      lastSendRef.current = Date.now();
      markSent(tributeId);
      setSaved(true);
      toast.success("Your tribute has been saved!");

      // Trigger nurture email sequence (non-critical)
      if (data?.id && tributeId) {
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
        } catch { /* non-critical */ }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [email, tributeId, petName]);

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
