import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint, ArrowLeft, Download, Share2, Edit, RefreshCw, FileText, Globe, Plus, Copy, Check, Image, Link, Lock } from "lucide-react";
import TributeShareCard from "@/components/TributeShareCard";
import TributeWritingExperience from "@/components/TributeWritingExperience";
import PublicTributeToggle from "@/components/PublicTributeToggle";
import TributeMemories from "@/components/TributeMemories";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { TIERS } from "@/lib/types";
import { generateTribute, loadTributeById, loadTributeBySlug, loadJobById, getActiveJobId } from "@/lib/tribute-api";
import { downloadTributePDF, downloadMemorialPDF, ensureParagraphs } from "@/lib/pdf-export";
import type { TributeFormData, GeneratedTribute, TierConfig } from "@/lib/types";

const TributePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: tributeIdParam, slug: slugParam } = useParams<{ id: string; slug: string }>();
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
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [additionalMemory, setAdditionalMemory] = useState("");
  const [showMemoryInput, setShowMemoryInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const [lastJobId, setLastJobId] = useState<string | undefined>();
  const [tributeSlug, setTributeSlug] = useState<string | undefined>();
  const [unlocked, setUnlocked] = useState(false);
  const [tributeDbId, setTributeDbId] = useState<string | undefined>();
  const [currentTier, setCurrentTier] = useState<TierConfig>(tier);
  const [petName, setPetName] = useState(formData?.pet_name || "");
  const [photoUrls, setPhotoUrls] = useState<string[]>(formData?.photo_urls || []);
  const [yearsOfLife, setYearsOfLife] = useState(formData?.years_of_life || "");
  const [petType, setPetType] = useState(formData?.pet_type || "dog");
  const [breed, setBreed] = useState(formData?.breed);

  const maxRegens = currentTier.id === "story" ? 2 : currentTier.id === "pack" ? 3 : Infinity;

  const applyJobData = (job: any) => {
    setPetName(job.pet_name || "");
    setPhotoUrls(job.photo_urls || []);
    if (job.form_data) {
      const fd = job.form_data as unknown as TributeFormData;
      formDataRef.current = fd;
      setYearsOfLife(fd.years_of_life || "");
      setPetType(fd.pet_type || "dog");
      setBreed(fd.breed);
    }
    const savedTier = TIERS.find((t) => t.name === job.tier_name);
    if (savedTier) setCurrentTier(savedTier);
  };

  const runGeneration = (data: TributeFormData, tierConfig: TierConfig, prevJobId?: string) => {
    setGenerating(true);
    setStreamingText("");
    setTribute(null);
    setRecoveryMessage(null);

    generateTribute(data, tierConfig, {
      onDelta: (text) => {
        setStreamingText((prev) => prev + text);
      },
      onDone: (result) => {
        setTribute(result);
        setEditedStory(result.story);
        setGenerating(false);
        if (result.jobId) setLastJobId(result.jobId);
        if (result.tributeId) setTributeDbId(result.tributeId);
        if (result.slug) {
          setTributeSlug(result.slug);
          navigate(`/tribute/s/${result.slug}?tier=${tierConfig.id}`, { replace: true });
        } else if (result.tributeId) {
          navigate(`/tribute/${result.tributeId}?tier=${tierConfig.id}`, { replace: true });
        }
      },
      onError: (error) => {
        toast.error(error);
        setGenerating(false);
      },
    }, prevJobId);
  };

  useEffect(() => {
    const lookupParam = slugParam || tributeIdParam;
    const isSlugLookup = !!slugParam;

    // 1. If we have a tribute param in the URL, load from database
    if (lookupParam) {
      setLoading(true);
      const loader = isSlugLookup
        ? loadTributeBySlug(lookupParam)
        : loadTributeById(lookupParam);

      loader.then((data) => {
        if (!data) {
          toast.error("Tribute not found");
          navigate("/");
          return;
        }
        setTribute({
          story: data.tribute_story,
          title: (data as any).title || undefined,
          social_post: data.social_post || undefined,
          share_card_text: data.share_card_text || undefined,
        });
        setEditedStory(data.tribute_story);
        setPetName(data.pet_name);
        setPhotoUrls(data.photo_urls || []);
        setYearsOfLife(data.years_of_life || "");
        setPetType(data.pet_type || "dog");
        setBreed(data.breed);
        setTributeSlug((data as any).slug || undefined);
        setTributeDbId(data.id);
        setUnlocked(true);
        if (data.form_data) {
          formDataRef.current = data.form_data as unknown as TributeFormData;
        }
        const savedTier = TIERS.find((t) => t.name === data.tier_name);
        if (savedTier) setCurrentTier(savedTier);
        setLoading(false);
      });
      return;
    }

    // 2. Check for an active job from localStorage (recovery after refresh)
    const activeJobId = getActiveJobId();
    if (activeJobId && !formData) {
      setLoading(true);
      setRecoveryMessage("Checking for your tribute...");
      loadJobById(activeJobId).then((job) => {
        if (!job) {
          localStorage.removeItem("vellumpet_active_job");
          setRecoveryMessage(null);
          setLoading(false);
          navigate("/");
          return;
        }

        if (job.status === "completed" && job.tribute_story) {
          setRecoveryMessage("Your tribute is still being written. Restoring it now...");
          setTribute({
            story: job.tribute_story,
            social_post: job.social_post || undefined,
            share_card_text: job.share_card_text || undefined,
          });
          setEditedStory(job.tribute_story);
          applyJobData(job);
          localStorage.removeItem("vellumpet_active_job");
          localStorage.removeItem("vellumpet_generation_lock");
          setLoading(false);
          toast.success("Your tribute has been restored!");
        } else if (job.status === "generating" || job.status === "pending") {
          // Job is still in progress — poll for completion
          setRecoveryMessage("Your tribute is still being written. Restoring it now...");
          applyJobData(job);
          const poll = setInterval(async () => {
            const updated = await loadJobById(activeJobId);
            if (!updated) {
              clearInterval(poll);
              setLoading(false);
              setRecoveryMessage(null);
              navigate("/");
              return;
            }
            if (updated.status === "completed" && updated.tribute_story) {
              clearInterval(poll);
              setTribute({
                story: updated.tribute_story,
                social_post: updated.social_post || undefined,
                share_card_text: updated.share_card_text || undefined,
              });
              setEditedStory(updated.tribute_story);
              localStorage.removeItem("vellumpet_active_job");
              localStorage.removeItem("vellumpet_generation_lock");
              setLoading(false);
              setRecoveryMessage(null);
              toast.success("Your tribute has been restored!");
            } else if (updated.status === "failed") {
              clearInterval(poll);
              localStorage.removeItem("vellumpet_active_job");
              localStorage.removeItem("vellumpet_generation_lock");
              setLoading(false);
              setRecoveryMessage(null);
              toast.error(updated.error_message || "Generation failed. Please try again.");
              // If we have form data from the job, allow retry
              if (updated.form_data) {
                formDataRef.current = updated.form_data as unknown as TributeFormData;
              }
            }
          }, 3000);
          // Timeout after 2 minutes
          setTimeout(() => {
            clearInterval(poll);
            if (loading) {
              localStorage.removeItem("vellumpet_active_job");
              localStorage.removeItem("vellumpet_generation_lock");
              setLoading(false);
              setRecoveryMessage(null);
              toast.error("Generation timed out. Please try again.");
            }
          }, 120_000);
        } else if (job.status === "failed") {
          localStorage.removeItem("vellumpet_active_job");
          localStorage.removeItem("vellumpet_generation_lock");
          setLoading(false);
          setRecoveryMessage(null);
          toast.error(job.error_message || "The previous generation failed. Please try again.");
          if (job.form_data) {
            formDataRef.current = job.form_data as unknown as TributeFormData;
          }
          navigate("/");
        }
      });
      return;
    }

    // 3. Otherwise, generate from form data
    if (!formData) {
      navigate("/");
      return;
    }
    setPetName(formData.pet_name);
    setPhotoUrls(formData.photo_urls || []);
    setYearsOfLife(formData.years_of_life || "");
    setPetType(formData.pet_type || "dog");
    setBreed(formData.breed);
    runGeneration(formData, tier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = () => {
    if (!formDataRef.current) return;
    if (regenCount >= maxRegens && maxRegens !== Infinity) {
      toast.error("You've used all your regenerations for this tier.");
      return;
    }
    setRegenCount((c) => c + 1);
    runGeneration(formDataRef.current, currentTier, lastJobId);
  };

  const handleAddMemoryAndRegenerate = () => {
    if (!formDataRef.current || !additionalMemory.trim()) return;
    if (regenCount >= maxRegens && maxRegens !== Infinity) {
      toast.error("You've used all your regenerations for this tier.");
      return;
    }
    formDataRef.current = {
      ...formDataRef.current,
      memories: [...formDataRef.current.memories, additionalMemory.trim()],
    };
    setAdditionalMemory("");
    setShowMemoryInput(false);
    setRegenCount((c) => c + 1);
    runGeneration(formDataRef.current, currentTier, lastJobId);
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
    if (!tribute) return;
    await downloadTributePDF(petName, yearsOfLife, tribute.story, photoUrls, tier.id);
    toast.success("PDF downloaded!");
  };

  const handleDownloadMemorial = async () => {
    if (!tribute) return;
    await downloadMemorialPDF(petName, yearsOfLife, tribute.story, photoUrls, tier.id);
    toast.success("Memorial PDF downloaded!");
  };

  // Loading from database or recovering
  if (loading) {
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
          {recoveryMessage || "Loading tribute..."}
        </p>
      </div>
    );
  }

  // Generating / streaming state
  if (generating) {
    return (
      <div className="flex min-h-screen flex-col items-center bg-background px-4 pt-24">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6 rounded-full bg-accent p-6"
        >
          <PawPrint className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-foreground">
          Crafting {petName ? `${petName}'s` : "your pet's"} tribute…
        </p>

        <TributeWritingExperience petName={petName} visible={generating} />

        {streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <p className="whitespace-pre-line font-body text-sm leading-relaxed text-foreground">
              {streamingText}
              <span className="animate-pulse">▌</span>
            </p>
          </motion.div>
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
          {/* Photo Gallery Preview */}
          {photoUrls.length > 0 && (
            <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {petName ? `${petName}'s Photos` : "Pet Photos"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  — Photos help make your tribute personal and memorable.
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {photoUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${petName || "Pet"} photo ${i + 1}`}
                    className="h-20 w-20 rounded-lg border border-border object-cover shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tribute Story */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
            {tribute.title ? (
              <h2 className="mb-4 text-center font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
                {tribute.title}
              </h2>
            ) : (
              <h2 className="mb-1 font-display text-2xl font-bold text-foreground">
                {petName ? `${petName}'s Tribute` : "Your Pet's Tribute"}
              </h2>
            )}
            <p className="mb-6 text-center text-sm text-muted-foreground">{currentTier.name}</p>

            {isEditing && unlocked ? (
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
            ) : unlocked ? (
              <div className="mx-auto max-w-prose font-body text-foreground">
                {ensureParagraphs(tribute.story).map((p, i) => (
                  <p key={i} className="mb-4 leading-[1.7]">{p}</p>
                ))}
              </div>
            ) : (
              /* Paywall preview */
              <div className="relative">
                <div className="mx-auto max-w-prose font-body text-foreground">
                  {ensureParagraphs(tribute.story.slice(0, Math.floor(tribute.story.length * 0.45))).map((p, i) => (
                    <p key={i} className="mb-4 leading-[1.7]">{p}</p>
                  ))}
                </div>
                {/* Gradient fade */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
                  style={{
                    background: "linear-gradient(to bottom, hsl(var(--card) / 0), hsl(var(--card) / 1))",
                  }}
                />
              </div>
            )}
          </div>

          {/* Paywall CTA */}
          {!unlocked && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-accent/30 p-8 text-center shadow-soft">
              <Lock className="mx-auto mb-4 h-8 w-8 text-primary/70" />
              <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                Continue reading {petName ? `${petName}'s` : "your pet's"} full tribute
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                Unlock the full memorial story, shareable card, and printable tribute.
              </p>
              <Button size="lg" onClick={() => setUnlocked(true)}>
                Unlock Full Tribute
              </Button>
            </div>
          )}

          {/* Actions */}
          {unlocked && (
            <>
              <div className="mb-6 flex flex-wrap gap-3">
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-1 h-4 w-4" /> Edit Story
                  </Button>
                )}
                {formDataRef.current && (
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
                )}
                <Button size="sm" onClick={handleDownloadPDF}>
                  <Download className="mr-1 h-4 w-4" /> Download PDF
                </Button>
                {currentTier.include_printable_pdf && (currentTier.id === "pack" || currentTier.id === "legacy") && (
                  <Button variant="outline" size="sm" onClick={handleDownloadMemorial}>
                    <FileText className="mr-1 h-4 w-4" /> Printable Memorial
                  </Button>
                )}
                {formDataRef.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMemoryInput(!showMemoryInput)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Memory
                  </Button>
                )}
              </div>

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
            </>
          )}

          {/* Social Post (Tier 2+) */}
          {unlocked && tribute.social_post && (
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

          {/* Memorial Share Card */}
          {unlocked && currentTier.include_share_card && tribute.share_card_text && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Create a Memorial Share Card
                </h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Generate a shareable image with your pet's photo and a quote from the tribute.
              </p>
              <TributeShareCard
                petName={petName || "Your Pet"}
                years={yearsOfLife}
                excerpt={tribute.share_card_text}
                photoUrls={photoUrls}
                shareCardLimit={currentTier.share_card_limit}
              />
            </div>
          )}

          {/* Share Buttons */}
          {tributeSlug && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Share This Tribute
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/tribute/s/${tributeSlug}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied!");
                  }}
                >
                  <Link className="mr-1 h-3 w-3" /> Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/tribute/s/${tributeSlug}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=400");
                  }}
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/tribute/s/${tributeSlug}`;
                    const text = `In Loving Memory of ${petName}`;
                    window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer,width=600,height=400");
                  }}
                >
                  X / Twitter
                </Button>
              </div>
            </div>
          )}

          {/* Leave a Memory */}
          {tributeDbId && (
            <div className="mb-6">
              <TributeMemories tributeId={tributeDbId} petName={petName || "Your Pet"} />
            </div>
          )}

          <div className="mb-6">
            <PublicTributeToggle
              petName={petName || ""}
              petType={petType}
              breed={breed}
              yearsOfLife={yearsOfLife}
              tribute={tribute}
              photoUrls={photoUrls}
              tierId={currentTier.id}
            />
          </div>

          {/* Digital Memorial Page (Tier 3) */}
          {currentTier.include_memorial_page && (
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
              {photoUrls.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Your {photoUrls.length} photo{photoUrls.length > 1 ? "s" : ""} will be included in the memorial gallery.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TributePage;
