import { useState, useEffect, useCallback, useRef } from "react";
import { BRAND } from "@/lib/brand";
import { Globe, Link as LinkIcon, Copy, Check, ExternalLink, Pencil, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedTribute, TributeTier } from "@/lib/types";
import { generateMemorialSlug, generateMemorialSlugWithSuffix, slugify } from "@/lib/slugify";

const RESERVED_SLUGS = ["memorial", "admin", "api", "vellumpet", "login", "signup", "settings"];
const SLUG_MAX_LENGTH = 60;
const SLUG_REGEX = /^[a-z0-9-]+$/;

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "reserved" | "empty";

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, SLUG_MAX_LENGTH);
}

function validateSlug(slug: string): SlugStatus {
  if (!slug || slug === "-") return "empty";
  if (RESERVED_SLUGS.includes(slug)) return "reserved";
  if (!SLUG_REGEX.test(slug)) return "invalid";
  if (/^\d+$/.test(slug)) return "invalid"; // only numbers
  if (/--/.test(slug)) return "invalid"; // repeated dashes
  return "idle";
}

interface PublicTributeToggleProps {
  petName: string;
  petType: string;
  breed?: string;
  yearsOfLife: string;
  tribute: GeneratedTribute;
  photoUrls: string[];
  tierId: TributeTier;
  paid?: boolean;
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
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [tributeId, setTributeId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customSlug, setCustomSlug] = useState("");

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editSlug, setEditSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [saving, setSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const isLegacy = tierId === "legacy";
  const publicUrl = currentSlug ? `${BRAND.baseUrl}/memorial/${currentSlug}` : null;

  // Debounced availability check
  const checkAvailability = useCallback(
    (slug: string, currentId: string | null) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const localStatus = validateSlug(slug);
      if (localStatus !== "idle") {
        setSlugStatus(localStatus);
        return;
      }

      setSlugStatus("checking");
      debounceRef.current = setTimeout(async () => {
        try {
          const query = supabase
            .from("public_tributes")
            .select("id")
            .eq("slug", slug);

          const { data } = await query;
          const isTaken = data?.some((row) => row.id !== currentId);
          setSlugStatus(isTaken ? "taken" : "available");
        } catch {
          setSlugStatus("idle");
        }
      }, 400);
    },
    []
  );

  const handleSlugInput = (raw: string) => {
    const sanitized = sanitizeSlug(raw);
    setEditSlug(sanitized);
    checkAvailability(sanitized, tributeId);
  };

  const startEditing = () => {
    setEditSlug(currentSlug || "");
    setSlugStatus("idle");
    setEditing(true);
    setShowCompletion(false);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditSlug("");
    setSlugStatus("idle");
  };

  const handleSave = async () => {
    if (slugStatus !== "available" || !tributeId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("public_tributes")
        .update({ slug: editSlug })
        .eq("id", tributeId);

      if (error) {
        if (error.code === "23505") {
          toast.error("That URL was just taken. Try another.");
          setSlugStatus("taken");
        } else {
          toast.error("Failed to update URL. Please try again.");
        }
        return;
      }

      setCurrentSlug(editSlug);
      setEditing(false);
      setShowCompletion(true);
      toast.success("Memorial URL updated!");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setIsPublic(checked);
    if (!checked) {
      setCurrentSlug(null);
      setTributeId(null);
      setShowCompletion(false);
      return;
    }

    setCreating(true);
    try {
      let slug = isLegacy && customSlug.trim()
        ? slugify(customSlug.trim())
        : generateMemorialSlug(petName, { yearsOfLife, title: tribute.title });

      let { error, data } = await supabase.from("public_tributes").insert({
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
      }).select("id, slug").single();

      // If duplicate slug, retry with suffix
      if (error?.code === "23505" && !(isLegacy && customSlug.trim())) {
        slug = generateMemorialSlugWithSuffix(slug);
        const retry = await supabase.from("public_tributes").insert({
          slug, pet_name: petName, pet_type: petType, breed: breed || null,
          years_of_life: yearsOfLife, story: tribute.story,
          social_post: tribute.social_post || null, share_card_text: tribute.share_card_text || null,
          photo_urls: photoUrls, tier_id: tierId, custom_slug: null,
        }).select("id, slug").single();
        error = retry.error;
        data = retry.data;
      }

      if (error) {
        if (error.code === "23505") {
          toast.error("That URL is already taken. Try a different custom URL.");
        } else {
          toast.error("Failed to create public page. Please try again.");
        }
        setIsPublic(false);
        return;
      }

      setCurrentSlug(data?.slug || slug);
      setTributeId(data?.id || null);
      setShowCompletion(true);
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

  const statusMessage = () => {
    switch (slugStatus) {
      case "checking":
        return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Checking…</span>;
      case "available":
        return <span className="flex items-center gap-1 text-xs text-primary"><Check className="h-3 w-3" /> Available</span>;
      case "taken":
        return <span className="text-xs text-destructive">Slug already taken</span>;
      case "invalid":
        return <span className="text-xs text-destructive">Use only letters, numbers, and dashes</span>;
      case "reserved":
        return <span className="text-xs text-destructive">This URL is reserved</span>;
      case "empty":
        return <span className="text-xs text-destructive">Slug cannot be empty</span>;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">
          {showCompletion ? "Your memorial page is ready to share" : "Create a Public Tribute Page"}
        </h3>
      </div>

      {!currentSlug && (
        <p className="mb-4 text-sm text-muted-foreground">
          Share a beautiful memorial page that friends and family can visit.
        </p>
      )}

      {/* Legacy tier: custom URL option before creation */}
      {isLegacy && !currentSlug && (
        <div className="mb-4">
          <Label htmlFor="custom-slug" className="mb-1 text-xs text-muted-foreground">
            Custom URL (optional) — e.g. /memorial/{customSlug || petName.toLowerCase()}
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

      {/* Toggle to create */}
      {!currentSlug && (
        <div className="flex items-center gap-3">
          <Switch
            checked={isPublic}
            onCheckedChange={handleToggle}
            disabled={creating || !!currentSlug}
          />
          <Label className="text-sm text-foreground">
            {isPublic ? "Creating..." : "Keep tribute private"}
          </Label>
        </div>
      )}

      {/* After creation: URL display with edit capability */}
      {currentSlug && (
        <div className="mt-1 space-y-4">
          {/* URL display / edit */}
          <div className="space-y-2">
            {editing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1 rounded-md border border-border bg-muted px-3 py-2">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    vellumpet.com/memorial/
                  </span>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => handleSlugInput(e.target.value)}
                    className="flex-1 border-none bg-transparent text-xs text-foreground outline-none"
                    autoFocus
                    maxLength={SLUG_MAX_LENGTH}
                  />
                </div>
                <div className="flex items-center justify-between">
                  {statusMessage()}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                      <X className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={slugStatus !== "available" || saving}
                    >
                      {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 shrink-0 text-primary" />
                <code className="flex-1 truncate rounded bg-muted px-3 py-1.5 text-xs text-foreground">
                  {publicUrl}
                </code>
                <Button variant="ghost" size="sm" onClick={startEditing} className="shrink-0">
                  <Pencil className="mr-1 h-3 w-3" /> Edit link
                </Button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!editing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/memorial/${currentSlug}`, "_blank")}
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                View Page
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicTributeToggle;
