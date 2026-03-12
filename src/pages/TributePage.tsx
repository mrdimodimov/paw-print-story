import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint, ArrowLeft, Download, Share2, Edit, RefreshCw, FileText, Globe, Plus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { TIERS } from "@/lib/types";
import { generateTribute } from "@/lib/tribute-api";
import { downloadTributePDF, downloadMemorialPDF } from "@/lib/pdf-export";
import type { TributeFormData, GeneratedTribute, TierConfig } from "@/lib/types";

const TributePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tierId = searchParams.get("tier") || "story";
  const tier = TIERS.find((t) => t.id === tierId) || TIERS[0];

  const formDataRef = useRef<TributeFormData | null>(
    (location.state as { formData?: TributeFormData })?.formData || null
  );
  const formData = formDataRef.current;

  const [tribute, setTribute] = useState<GeneratedTribute | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState("");
  const [generating, setGenerating] = useState(true);
  const [additionalMemory, setAdditionalMemory] = useState("");
  const [showMemoryInput, setShowMemoryInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenCount, setRegenCount] = useState(0);

  const maxRegens = tier.id === "story" ? 2 : tier.id === "pack" ? 3 : Infinity;

  const runGeneration = (data: TributeFormData, tierConfig: TierConfig) => {
    setGenerating(true);
    setStreamingText("");
    setTribute(null);

    generateTribute(data, tierConfig, {
      onDelta: (text) => {
        setStreamingText((prev) => prev + text);
      },
      onDone: (result) => {
        setTribute(result);
        setEditedStory(result.story);
        setGenerating(false);
      },
      onError: (error) => {
        toast.error(error);
        setGenerating(false);
      },
    });
  };

  useEffect(() => {
    if (!formData) {
      navigate("/");
      return;
    }
    runGeneration(formData, tier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = () => {
    if (!formData) return;
    if (regenCount >= maxRegens && maxRegens !== Infinity) {
      toast.error("You've used all your regenerations for this tier.");
      return;
    }
    setRegenCount((c) => c + 1);
    runGeneration(formData, tier);
  };

  const handleAddMemoryAndRegenerate = () => {
    if (!formData || !additionalMemory.trim()) return;
    if (regenCount >= maxRegens && maxRegens !== Infinity) {
      toast.error("You've used all your regenerations for this tier.");
      return;
    }
    formDataRef.current = {
      ...formData,
      memories: [...formData.memories, additionalMemory.trim()],
    };
    setAdditionalMemory("");
    setShowMemoryInput(false);
    setRegenCount((c) => c + 1);
    runGeneration(formDataRef.current, tier);
  };

  const handleSaveEdit = () => {
    if (tribute) {
      setTribute({ ...tribute, story: editedStory });
    }
    setIsEditing(false);
    toast.success("Changes saved!");
  };

  const handleCopyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!tribute || !formData) return;
    const photoUrl = formData.photo_urls?.[0];
    await downloadTributePDF(formData.pet_name, formData.years_of_life, tribute.story, photoUrl);
    toast.success("PDF downloaded!");
  };

  const handleDownloadMemorial = () => {
    if (!tribute || !formData) return;
    downloadMemorialPDF(formData.pet_name, formData.years_of_life, tribute.story);
    toast.success("Memorial PDF downloaded!");
  };

  // Loading / streaming state
  if (generating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6 rounded-full bg-accent p-6"
        >
          <PawPrint className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-foreground">
          Crafting {formData?.pet_name ? `${formData.pet_name}'s` : "your pet's"} tribute...
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Turning your memories into something beautiful
        </p>
        {streamingText && (
          <div className="mt-8 max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card">
            <p className="whitespace-pre-line font-body text-sm leading-relaxed text-foreground">
              {streamingText}
              <span className="animate-pulse">▌</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!tribute) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {BRAND.name}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Home
          </Button>
        </div>
      </header>

      <div className="tribute-container max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Tribute Story */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
            <h2 className="mb-1 font-display text-2xl font-bold text-foreground">
              {formData?.pet_name ? `${formData.pet_name}'s Tribute` : "Your Pet's Tribute"}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">{tier.name}</p>

            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editedStory}
                  onChange={(e) => setEditedStory(e.target.value)}
                  rows={15}
                  className="font-body text-foreground"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>Save Changes</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditedStory(tribute.story); setIsEditing(false); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-line font-body leading-relaxed text-foreground">
                {tribute.story}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mb-6 flex flex-wrap gap-3">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1 h-4 w-4" /> Edit Story
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenCount >= maxRegens && maxRegens !== Infinity}
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
              {maxRegens !== Infinity && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({maxRegens - regenCount} left)
                </span>
              )}
            </Button>
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="mr-1 h-4 w-4" /> Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMemoryInput(!showMemoryInput)}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Memory
            </Button>
          </div>

          {/* Add Memory Input */}
          {showMemoryInput && (
            <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-soft">
              <p className="mb-2 text-sm font-medium text-foreground">
                Add another memory to enrich the tribute
              </p>
              <Textarea
                value={additionalMemory}
                onChange={(e) => setAdditionalMemory(e.target.value)}
                placeholder="Share another special memory..."
                rows={3}
              />
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={handleAddMemoryAndRegenerate} disabled={!additionalMemory.trim()}>
                  <RefreshCw className="mr-1 h-4 w-4" /> Regenerate with Memory
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowMemoryInput(false); setAdditionalMemory(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Social Post (Tier 2+) */}
          {tribute.social_post && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Social Media Post
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{tribute.social_post}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleCopyToClipboard(tribute.social_post!)}
              >
                {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          )}

          {/* Share Card (Tier 2+) */}
          {tribute.share_card_text && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Memorial Card
                </h3>
              </div>
              <div className="rounded-lg bg-accent p-6 text-center">
                <PawPrint className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="whitespace-pre-line font-display text-lg text-foreground">
                  {tribute.share_card_text}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadMemorial}>
                  <Download className="mr-1 h-4 w-4" /> Download Memorial PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(tribute.share_card_text!)}
                >
                  <Copy className="mr-1 h-4 w-4" /> Copy Text
                </Button>
              </div>
            </div>
          )}

          {/* Digital Memorial Page (Tier 3) */}
          {tier.include_memorial_page && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-accent/50 p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Digital Memorial Page
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your digital memorial page is being prepared. You'll receive a unique link to share with family and friends.
              </p>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                Coming Soon
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TributePage;
