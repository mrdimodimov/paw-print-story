import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostGenerationEmailSaveProps {
  tributeId?: string;
  petName: string;
}

const PostGenerationEmailSave = ({ tributeId, petName }: PostGenerationEmailSaveProps) => {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await supabase.from("tribute_emails").insert({
        email: trimmed,
        tribute_id: tributeId || null,
      }).select("id").single();

      setSaved(true);
      toast.success("Your tribute has been saved!");

      // Trigger nurture email sequence
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
  };

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
        />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save My Tribute"}
        </Button>
      </div>
    </div>
  );
};

export default PostGenerationEmailSave;
