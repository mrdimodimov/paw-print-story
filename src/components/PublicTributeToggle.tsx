import { useState } from "react";
import { Globe, Link as LinkIcon, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedTribute, TributeTier } from "@/lib/types";
import { generateMemorialSlug, generateMemorialSlugWithSuffix, slugify } from "@/lib/slugify";

interface PublicTributeToggleProps {
  petName: string;
  petType: string;
  breed?: string;
  yearsOfLife: string;
  tribute: GeneratedTribute;
  photoUrls: string[];
  tierId: TributeTier;
}

const PublicTributeToggle = ({
  petName,
  petType,
  breed,
  yearsOfLife,
  tribute,
  photoUrls,
  tierId,
}: PublicTributeToggleProps) => {
  const [isPublic, setIsPublic] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customSlug, setCustomSlug] = useState("");

  const isLegacy = tierId === "legacy";

  const handleToggle = async (checked: boolean) => {
    setIsPublic(checked);
    if (!checked) {
      setPublicUrl(null);
      return;
    }

    setCreating(true);
    try {
      const slug = isLegacy && customSlug.trim()
        ? slugify(customSlug.trim())
        : generateMemorialSlug(petName, petType);

      const { error } = await supabase.from("public_tributes").insert({
        slug,
        pet_name: petName,
        pet_type: petType,
        breed: breed || null,
        years_of_life: yearsOfLife,
        story: tribute.story,
        social_post: tribute.social_post || null,
        share_card_text: tribute.share_card_text || null,
        photo_urls: photoUrls,
        tier_id: tierId,
        custom_slug: isLegacy && customSlug.trim() ? customSlug.trim() : null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("That URL is already taken. Try a different custom URL.");
        } else {
          toast.error("Failed to create public page. Please try again.");
        }
        setIsPublic(false);
        return;
      }

      const baseUrl = window.location.origin;
      setPublicUrl(`${baseUrl}/memory/${slug}`);
      toast.success("Public memorial page created!");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsPublic(false);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">
          Create a Public Tribute Page
        </h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Share a beautiful memorial page that friends and family can visit.
      </p>

      {/* Legacy tier: custom URL option */}
      {isLegacy && !publicUrl && (
        <div className="mb-4">
          <Label htmlFor="custom-slug" className="mb-1 text-xs text-muted-foreground">
            Custom URL (optional) — e.g. /memory/{customSlug || petName.toLowerCase()}
          </Label>
          <Input
            id="custom-slug"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder={petName.toLowerCase()}
            className="mt-1"
            disabled={isPublic}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <Switch
          checked={isPublic}
          onCheckedChange={handleToggle}
          disabled={creating || !!publicUrl}
        />
        <Label className="text-sm text-foreground">
          {publicUrl ? "Public page created" : isPublic ? "Creating..." : "Keep tribute private"}
        </Label>
      </div>

      {publicUrl && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-primary" />
            <code className="flex-1 rounded bg-muted px-3 py-1.5 text-xs text-foreground">
              {publicUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(publicUrl, "_blank")}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              View Page
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTributeToggle;
