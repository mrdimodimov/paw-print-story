import PawIcon from "@/components/PawIcon";
import BrandLogo from "@/components/BrandLogo";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Edit, RefreshCw, FileText, Globe, Plus, Copy, Check, Image, Link, Lock, Bug, SkipForward, Eye, MessageCircle, Mail, Heart, ChevronDown, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MemoryTimeline from "@/components/MemoryTimeline";
import PostGenerationShare from "@/components/PostGenerationShare";
import TributeShareCard from "@/components/TributeShareCard";
import InstagramStoryCard from "@/components/InstagramStoryCard";

import TributeWritingExperience from "@/components/TributeWritingExperience";
import PublicTributeToggle from "@/components/PublicTributeToggle";
import PostGenerationEmailSave from "@/components/PostGenerationEmailSave";
import TributeMemories from "@/components/TributeMemories";
import TributeReactions, { ReactionCounters } from "@/components/TributeReactions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { TIERS } from "@/lib/types";
import { generateTribute, loadTributeById, loadTributeBySlug, loadJobById, getActiveJobId } from "@/lib/tribute-api";
import { trackEvent, captureTesterSource } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { isInCooldown, markSent, isEmailEnabled, logEmailAttempt } from "@/lib/email-guard";
import { downloadTributePDF, downloadMemorialPDF, ensureParagraphs } from "@/lib/pdf-export";
import { TEST_PRESETS } from "@/lib/test-presets";
import type { TributeFormData, GeneratedTribute, TierConfig } from "@/lib/types";
import { useTesterAccess } from "@/hooks/use-tester-access";
import TesterFeedbackModal from "@/components/TesterFeedbackModal";

const TributePage = () => {
  captureTesterSource();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: tributeIdParam, slug: slugParam } = useParams<{ id: string; slug: string }>();
  const [searchParams] = useSearchParams();
  const tierId = searchParams.get("tier") || "story";
  const tier = TIERS.find((t) => t.id === tierId) || TIERS[0];

  const formDataRef = useRef<TributeFormData | null>(
    (location.state as { formData?: TributeFormData })?.formData || null
  );
  const preEmail = useRef<string | undefined>(
    (location.state as { email?: string })?.email || undefined
  );
  const isPublicRef = useRef<boolean>(
    (location.state as { isPublic?: boolean })?.isPublic || false
  );
  const isTestMode = searchParams.get("test") === "true" ||
    searchParams.get("preview") === "founder" ||
    !!(location.state as { isTestMode?: boolean })?.isTestMode;
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
  const [justGenerated, setJustGenerated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [testUnlocked, setTestUnlocked] = useState(true);

  // In test/founder mode, default to unlocked (toggleable via panel)
  const isFounderMode = localStorage.getItem("founderMode") === "true";
  const { isTester: isTesterFromHook, testerToken } = useTesterAccess();

  // Direct URL param detection — always reliable on first render
  const testerFromUrl = searchParams.get("tester");
  if (testerFromUrl) {
    sessionStorage.setItem("tester_source", testerFromUrl);
  }
  const testerFromStorage = sessionStorage.getItem("tester_source");
  const isTester = !!testerFromUrl || !!testerFromStorage || isTesterFromHook;

  const forceLocked = searchParams.get("locked") === "true";
  const effectiveUnlocked = forceLocked
    ? false
    : isTester ? true : (isTestMode || isFounderMode) ? testUnlocked : unlocked;

  console.log("TEST CHECK:", { testerFromUrl, testerFromStorage, isTester, effectiveUnlocked, forceLocked, unlocked });
  const [tributeDbId, setTributeDbId] = useState<string | undefined>();
  const [currentTier, setCurrentTier] = useState<TierConfig>(tier);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [petName, setPetName] = useState(formData?.pet_name || "");
  const [photoUrls, setPhotoUrls] = useState<string[]>(formData?.photo_urls || []);
  const [yearsOfLife, setYearsOfLife] = useState(formData?.years_of_life || "");
  const [petType, setPetType] = useState(formData?.pet_type || "dog");
  const [breed, setBreed] = useState(formData?.breed);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackDismissed, setFeedbackDismissed] = useState(
    () => sessionStorage.getItem("feedback_shown") === "true"
  );
  const [canShowFeedback, setCanShowFeedback] = useState(false);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
  const tributeStartTime = useRef(Date.now());

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
      onDone: async (result) => {
        setTribute(result);
        setEditedStory(result.story);
        setGenerating(false);
        setJustGenerated(true);
        if (result.jobId) setLastJobId(result.jobId);
        if (result.tributeId) setTributeDbId(result.tributeId);
        // Save pre-generation email if provided (guarded)
        if (preEmail.current && result.tributeId && !isTestMode) {
          const guardKey = `nurture_${result.tributeId}`;
          if (!isEmailEnabled(isTestMode)) {
            logEmailAttempt("nurture-trigger", guardKey, "blocked_dev");
          } else if (isInCooldown(guardKey)) {
            logEmailAttempt("nurture-trigger", guardKey, "blocked_cooldown");
          } else {
            try {
              const { data: emailRow } = await supabase.from("tribute_emails").insert({
                email: preEmail.current,
                tribute_id: result.tributeId,
              }).select("id").single();

              if (emailRow?.id) {
                await supabase.functions.invoke("send-nurture-email", {
                  body: {
                    action: "trigger",
                    tribute_email_id: emailRow.id,
                    email: preEmail.current,
                    tribute_id: result.tributeId,
                    pet_name: data.pet_name,
                  },
                });
                markSent(guardKey);
                logEmailAttempt("nurture-trigger", guardKey, "sent");
              }
            } catch {
              logEmailAttempt("nurture-trigger", guardKey, "error");
            }
          }
        }
        if (result.slug) {
          setTributeSlug(result.slug);
          const testerFwd = sessionStorage.getItem("tester_source");
          const testerSuffix = testerFwd ? `&tester=${testerFwd}` : "";
          navigate(`/tribute/s/${result.slug}?tier=${tierConfig.id}${testerSuffix}`, { replace: true });
        } else if (result.tributeId) {
          const testerFwd = sessionStorage.getItem("tester_source");
          const testerSuffix = testerFwd ? `&tester=${testerFwd}` : "";
          navigate(`/tribute/${result.tributeId}?tier=${tierConfig.id}${testerSuffix}`, { replace: true });
        }
      },
      onError: (error) => {
        toast.error(error);
        setGenerating(false);
      },
    }, prevJobId, isPublicRef.current);
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
          short_caption: (data as any).short_caption || undefined,
        });
        setEditedStory(data.tribute_story);
        setPetName(data.pet_name);
        setPhotoUrls(data.photo_urls || []);
        setYearsOfLife(data.years_of_life || "");
        setPetType(data.pet_type || "dog");
        setBreed(data.breed);
        setTributeSlug((data as any).slug || undefined);
        setTributeDbId(data.id);
        setUnlocked((data as any).is_paid === true);
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
            short_caption: (job as any).short_caption || undefined,
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
                short_caption: (updated as any).short_caption || undefined,
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
      navigate(`/create${location.search}`);
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

  // Auto-show feedback modal for testers after tribute completes
  useEffect(() => {
    if (isTester && tribute && !generating && !feedbackDismissed) {
      const timer = setTimeout(() => setShowFeedback(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isTester, tribute, generating, feedbackDismissed]);

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

  const handleCheckout = async () => {
    trackEvent("payment_clicked", { tributeId: tributeDbId, metadata: { tier: currentTier.id } });
    if (isTester) {
      // Tester bypass — mark as unlocked without Stripe
      setUnlocked(true);
      toast.success("Tester access: tribute unlocked! 💛");
      return;
    }
    if (isTestMode) {
      toast.info("Checkout disabled in test mode");
      return;
    }
    if (!tributeDbId) {
      toast.error("Please wait for your tribute to finish generating.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          tierId: currentTier.id,
          tributeId: tributeDbId,
          tributeSlug: tributeSlug,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error("Could not start checkout. Please try again.");
      setCheckoutLoading(false);
    }
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

  const handleTestRegenerate = (presetId: string) => {
    const preset = TEST_PRESETS.find((p) => p.id === presetId);
    if (!preset || !formData) return;
    const testForm = { ...formData, ...preset.data } as TributeFormData;
    formDataRef.current = testForm;
    setPetName(testForm.pet_name);
    setPhotoUrls(testForm.photo_urls || []);
    setYearsOfLife(testForm.years_of_life || "");
    setPetType(testForm.pet_type || "dog");
    setBreed(testForm.breed);
    runGeneration(testForm, currentTier, lastJobId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6 rounded-full bg-accent p-6"
        >
          <PawIcon className="h-10 w-10 text-primary" />
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
          <PawIcon className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-foreground">
          We're creating your tribute now…
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You'll be able to preview it before anything is paid.
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
      {/* Tester debug indicator */}
      {isTester && (
        <div className="fixed right-3 top-3 z-[9999] rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
          TEST MODE
        </div>
      )}
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="border-b border-yellow-500/30 bg-yellow-50 px-4 py-2 text-center dark:bg-yellow-950/20">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-yellow-700 dark:text-yellow-400">
            <Eye className="h-3.5 w-3.5" />
            Test Mode: {testUnlocked ? "Full Preview Enabled" : "Paywall Simulated"}
          </div>
        </div>
      )}

      {/* Tester Access Banner */}
      {isTester && !isTestMode && (
        <div className="border-b border-primary/20 bg-accent/50 px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">
            Early access: This tribute has been unlocked for testing 💛
          </p>
        </div>
      )}

      {/* Test Mode Panel */}
      {isTestMode && (
        <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-dashed border-yellow-500/50 bg-card p-3 shadow-lg">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-yellow-600">
            <Bug className="h-3.5 w-3.5" />
            Test Mode — Preview
          </div>
          <div className="space-y-2">
            {/* Paywall toggle */}
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-accent/20 px-3 py-2">
              <label className="text-[11px] font-medium text-foreground">
                Toggle Paywall
              </label>
              <Switch
                checked={!testUnlocked}
                onCheckedChange={(checked) => setTestUnlocked(!checked)}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {testUnlocked ? "🔓 Viewing as paid user" : "🔒 Viewing as free user"}
            </p>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
                Regenerate with Preset
              </label>
              <Select onValueChange={handleTestRegenerate}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose preset…" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      <span className="font-medium">{p.label}</span>
                      <span className="ml-1 text-muted-foreground">— {p.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[10px] text-muted-foreground">
              ⚠ Payments, public pages & emails disabled
            </p>
          </div>
        </div>
      )}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className={isTester ? "pointer-events-none" : ""}>
            <BrandLogo size="sm" />
          </div>
          {!isTester && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Home
            </Button>
          )}
        </div>
      </header>

      <div className="tribute-container max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Header */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10">
            {/* Hero Photo */}
            {photoUrls.length > 0 && (
              <div className="mb-6 flex justify-center">
                <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-accent shadow-soft md:h-44 md:w-44">
                  <img
                    src={photoUrls[0]}
                    alt={`${petName || "Pet"} memorial photo`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Pet Name */}
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {tribute.title || (petName ? `${petName}'s Tribute` : "A Tribute")}
            </h1>

            {/* Years */}
            {yearsOfLife && (
              <p className="mt-2 text-base text-muted-foreground">
                {yearsOfLife}
              </p>
            )}

            {/* Short quote */}
            {tribute.share_card_text && (
              <p className="mx-auto mt-4 max-w-md font-display text-sm italic leading-relaxed text-muted-foreground">
                "{tribute.share_card_text.length > 140
                  ? tribute.share_card_text.slice(0, 140).trim() + "…"
                  : tribute.share_card_text}"
              </p>
            )}

            {/* Reaction counters (social proof) */}
            {tributeDbId && (
              <div className="mt-5">
                <ReactionCounters tributeId={tributeDbId} petName={petName} unlocked={effectiveUnlocked} />
              </div>
            )}
          </div>

          {/* Emotional Reveal Moment */}
          {effectiveUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8 text-center"
            >
              <p className="font-display text-lg text-muted-foreground">
                This is more than a story.
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-foreground">
                It's how you remember {petName || "them"}.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg" className="gap-2">
                      <Download className="h-4 w-4" /> Download <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="min-w-[200px]">
                    <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer gap-2">
                      <FileText className="h-4 w-4" /> Full Tribute (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadMemorial} className="cursor-pointer gap-2">
                      <Printer className="h-4 w-4" /> Printable Memorial
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-xs text-muted-foreground">
                  Save it, share it, or keep it forever.
                </p>
              </div>

              {tributeSlug && (
                <div className="mt-5">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Share with someone who loved them too
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const url = `${BRAND.baseUrl}/memorial/${tributeSlug}`;
                        const caption = tribute?.short_caption
                          ? `${tribute.short_caption}\n\n${url}`
                          : `I created this tribute for ${petName}. I thought you'd like to see it ❤️\n\n${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const url = `${BRAND.baseUrl}/memorial/${tributeSlug}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied!");
                      }}
                    >
                      <Link className="h-4 w-4" /> Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Post-generation share prompt */}
          {justGenerated && (
            <PostGenerationShare
              petName={petName || "Your Pet"}
              slug={tributeSlug}
              onViewTribute={() => setJustGenerated(false)}
            />
          )}

          {justGenerated && effectiveUnlocked && !preEmail.current && (
            <PostGenerationEmailSave tributeId={tributeDbId} petName={petName || "Your Pet"} isTestMode={isTestMode} />
          )}

          {/* Additional Photos (if more than 1) */}
          {photoUrls.length > 1 && (
            <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold text-foreground">
                  More Photos
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {photoUrls.slice(1).map((url, i) => (
                  <div key={i} className="h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted/30 shadow-sm">
                    <img
                      src={url}
                      alt={`${petName || "Pet"} photo ${i + 2}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tribute Story */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
            {!effectiveUnlocked && (
              <div className="mb-6 text-center">
                <h2 className="font-display text-xl font-semibold text-foreground">You didn't expect this to feel like this.</h2>
                <p className="mt-1 font-display text-base text-muted-foreground">This is more than a story — it's how you remember {petName || "them"}.</p>
              </div>
            )}

            {!effectiveUnlocked && (
              <div className="mb-4 text-center">
                <h3 className="font-display text-2xl font-semibold text-foreground">{petName}</h3>
                {yearsOfLife && <p className="mt-1 text-sm text-muted-foreground">{yearsOfLife}</p>}
              </div>
            )}

            {effectiveUnlocked && (
              <>
                <div className="mb-4 rounded-lg bg-accent/50 px-4 py-3 text-center">
                  <p className="text-sm font-medium text-primary">Your full tribute is now yours.</p>
                </div>
                {tribute.title && (
                  <h2 className="mb-2 text-center font-display text-2xl font-semibold text-foreground">{tribute.title}</h2>
                )}
                <p className="mb-6 text-center text-sm text-muted-foreground">{currentTier.name}</p>
              </>
            )}

            {isEditing && effectiveUnlocked ? (
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
              <div className="mx-auto max-w-prose font-body text-foreground">
                {(() => {
                  const allParagraphs = ensureParagraphs(tribute.story);
                  if (effectiveUnlocked) {
                    return allParagraphs.map((p, i) => (
                      <p key={i} className="mb-4 leading-[1.7]">{p}</p>
                    ));
                  }

                  // Partial paragraph paywall: show 2 full + partial 3rd
                  if (allParagraphs.length <= 2) {
                    return allParagraphs.map((p, i) => (
                      <p key={i} className="mb-4 leading-[1.7]">{p}</p>
                    ));
                  }

                  const targetPara = allParagraphs[2] || allParagraphs[1];
                  const charLimit = Math.min(Math.max(180, targetPara.length * 0.4), 220);
                  const sliced = targetPara.slice(0, charLimit);
                  const trimmed = sliced.includes(" ")
                    ? sliced.substring(0, sliced.lastIndexOf(" "))
                    : sliced;

                  return (
                    <>
                      <p className="mb-4 leading-[1.7]">{allParagraphs[0]}</p>
                      <p className="mb-4 leading-[1.7]">{allParagraphs[1]}</p>

                      {/* Partial paragraph with blur fade */}
                      <div className="relative mb-0 select-none">
                        <p className="leading-[1.7] text-foreground">{trimmed}...</p>
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background: "linear-gradient(to bottom, transparent 20%, hsl(var(--card) / 0.4) 50%, hsl(var(--card) / 0.85) 70%, hsl(var(--card)) 100%)",
                          }}
                        />
                      </div>

                      {/* Paywall CTA — seamless within story */}
                      <div className="relative -mt-1">
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="font-display text-base font-medium text-foreground/80">
                            This is where their story continues…
                          </p>

                          <div className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                            <p>✦ {petName || "Your pet"}'s full tribute story</p>
                            <p>✦ A printable memory you can keep</p>
                            <p>✦ Something you can revisit forever</p>
                          </div>

                          <Button
                            size="lg"
                            className="mt-6 gap-2 px-8 shadow-glow"
                            onClick={handleCheckout}
                          >
                            <Heart className="h-4 w-4" />
                            {checkoutLoading ? "Redirecting…" : `Finish ${petName || "Their"}'s Story →`}
                          </Button>

                          <div className="mt-4 space-y-1">
                            <p className="font-display text-sm font-medium text-foreground/70">
                              Keep {petName || "their"}'s story with you, forever
                            </p>
                            <p className="text-xs text-muted-foreground">
                              One-time payment · Yours to revisit anytime
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {!effectiveUnlocked && (
              <div className="mt-10 border-t border-border pt-6 text-center">
                <p className="text-sm text-muted-foreground/70">
                  Your memories are private and never used for AI training.
                </p>
              </div>
            )}

            {/* Watermark footer */}
            <p className="mt-6 text-center text-[10px] tracking-wide text-muted-foreground/40">
              Generated with {BRAND.name}
            </p>
          </div>

          {/* Email save — below story card for locked users */}
          {!effectiveUnlocked && justGenerated && !preEmail.current && (
            <div className="mb-2">
              <PostGenerationEmailSave tributeId={tributeDbId} petName={petName || "Your Pet"} isTestMode={isTestMode} />
            </div>
          )}


          {/* Memory Timeline */}
          {tribute && (
            <MemoryTimeline
              story={tribute.story}
              petName={petName || "Your Pet"}
              yearsOfLife={yearsOfLife}
              photoUrls={photoUrls}
              tierId={currentTier.id}
              unlocked={effectiveUnlocked}
              onUnlock={() => setUnlocked(true)}
            />
          )}

          {/* End-of-story Reactions CTA */}
          {tributeDbId && (
            <div className="mb-6">
              <TributeReactions
                tributeId={tributeDbId}
                petName={petName}
                unlocked={effectiveUnlocked}
                slug={tributeSlug}
              />
            </div>
          )}

          {!effectiveUnlocked && (
            <div className="mb-8 rounded-xl border border-primary/20 bg-card p-8 shadow-card md:p-10">
              {/* Emotional anchor */}
              <div className="mb-6 text-center">
                <PawIcon className="mx-auto mb-3 h-7 w-7 text-primary/70" />
                <p className="font-display text-xl font-semibold text-foreground">
                  Keep their story with you
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This story isn't saved yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Unlock it to keep it forever.
                </p>
              </div>

              {/* Value section */}
              <div className="mx-auto mb-6 max-w-sm">
                <p className="mb-3 text-center text-sm font-medium text-foreground">
                  What you get:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "A story you can return to anytime",
                    "A keepsake you'll never lose",
                    "A page you can share with others",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div className="mb-4 text-center">
                <p className="text-2xl font-semibold text-foreground">
                  ${currentTier.price}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  One-time — yours forever
                </p>
              </div>

              {/* CTA */}
              <div className="mb-2 text-center">
                <Button
                  size="lg"
                  className="px-10 text-base shadow-glow"
                  disabled={checkoutLoading}
                  onClick={handleCheckout}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {checkoutLoading ? "Redirecting…" : `Save ${petName || "Their"}'s Story`}
                </Button>
              </div>

              {/* Ownership trigger */}
              <p className="mb-4 text-center text-sm italic text-muted-foreground/80">
                This tribute is uniquely yours — no one else has this story.
              </p>

              {/* Edit option */}
              {formDataRef.current && (
                <div className="mb-4 text-center">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/questionnaire?tier=" + currentTier.id)}>
                    <Edit className="mr-1 h-3.5 w-3.5" /> Edit Tribute
                  </Button>
                </div>
              )}

              {/* Trust text */}
              <p className="text-center text-xs text-muted-foreground">
                You can edit your tribute anytime after unlocking
              </p>
            </div>
          )}

          {/* Post-unlock quick actions */}
          {effectiveUnlocked && (
            <div className="mb-6 flex flex-wrap justify-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="gap-2 px-8 text-base">
                    <Download className="mr-1 h-5 w-5" /> Download <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[200px]">
                  <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer gap-2">
                    <FileText className="h-4 w-4" /> Full Tribute (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadMemorial} className="cursor-pointer gap-2">
                    <Printer className="h-4 w-4" /> Printable Memorial
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {tributeSlug && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/memorial/${tributeSlug}`)}
                >
                  <Globe className="mr-1 h-4 w-4" /> View Memorial Page
                </Button>
              )}
            </div>
          )}

          {/* Actions */}
          {effectiveUnlocked && (
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

          {/* Quick Share Caption */}
          {effectiveUnlocked && typeof tribute.short_caption === "string" && tribute.short_caption && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <Copy className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Quick Share Caption
                </h3>
              </div>
              <p className="mb-1 text-xs text-muted-foreground">Short, personal — perfect for a quick post or story.</p>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{tribute.short_caption}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => { handleCopyToClipboard(tribute.short_caption!); toast.success("Caption copied!"); }}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Caption
                </Button>
              </div>
            </div>
          )}

          {/* Shareable Memorial Card */}
          {effectiveUnlocked && currentTier.include_share_card && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Shareable Memorial Card
                </h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Download a beautiful image to share on social media or keep as a keepsake.
              </p>
              <TributeShareCard
                petName={petName || "Your Pet"}
                years={yearsOfLife}
                excerpt={tribute.share_card_text || tribute.story.split('\n')[0]?.slice(0, 120) || ""}
                photoUrls={photoUrls}
                shareCardLimit={currentTier.share_card_limit}
                shortCaption={tribute.short_caption}
                tributeUrl={tributeSlug ? `${BRAND.baseUrl}/memorial/${tributeSlug}` : undefined}
              />
            </div>
          )}

          {/* Instagram Story Card */}
          {effectiveUnlocked && currentTier.include_share_card && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Instagram Story
                </h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Share a beautiful vertical card on your Instagram Story.
              </p>
              <InstagramStoryCard
                petName={petName || "Your Pet"}
                years={yearsOfLife}
                excerpt={tribute.share_card_text || tribute.story.split('\n')[0]?.slice(0, 120) || ""}
                photoUrls={photoUrls}
              />
            </div>
          )}

          {/* Share Their Story */}
          {effectiveUnlocked && tributeSlug && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Share Their Story
                </h3>
              </div>
              <p className="mb-1 text-sm text-muted-foreground">
                Let friends and family remember them too.
              </p>
              <p className="mb-5 text-xs text-muted-foreground/70">
                Includes their story, photos, and memories.
              </p>

              {/* Primary channels */}
              <div className="flex flex-wrap justify-center gap-3 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const url = `${BRAND.baseUrl}/memorial/${tributeSlug}`;
                    const caption = tribute.short_caption
                      ? `${tribute.short_caption}\n\n${url}`
                      : `I created this tribute for ${petName}. I thought you'd like to see it ❤️\n\n${url}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank", "noopener,noreferrer");
                  }}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const url = `${BRAND.baseUrl}/memorial/${tributeSlug}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied!");
                  }}
                >
                  <Link className="h-4 w-4" /> Copy Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const url = `${BRAND.baseUrl}/memorial/${tributeSlug}`;
                    const subject = `In Loving Memory of ${petName}`;
                    const body = tribute.short_caption
                      ? `${tribute.short_caption}\n\nRead their full story: ${url}`
                      : `I wanted to share this tribute I created for ${petName}.\n\nRead their full story: ${url}`;
                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                >
                  <Mail className="h-4 w-4" /> Email
                </Button>
              </div>

              {/* Secondary channels */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const url = `${BRAND.baseUrl}/memorial/${tributeSlug}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=400");
                  }}
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const url = `${BRAND.baseUrl}/memorial/${tributeSlug}`;
                    const text = `In Loving Memory of ${petName}`;
                    window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer,width=600,height=400");
                  }}
                >
                  X / Twitter
                </Button>
              </div>
            </div>
          )}

          {/* Reactions are now in the hero header */}

          {/* Leave a Memory */}
          {tributeDbId && (
            <div className="mb-6">
              <TributeMemories tributeId={tributeDbId} petName={petName || "Your Pet"} unlocked={effectiveUnlocked} slug={tributeSlug} />
            </div>
          )}

          {effectiveUnlocked && (
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
          )}

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

        {/* Tester feedback fallback button */}
        {isTester && feedbackDismissed && !showFeedback && (
          <div className="fixed bottom-4 left-4 z-40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowFeedback(true); setFeedbackDismissed(false); }}
              className="gap-1.5 text-xs"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Leave feedback
            </Button>
          </div>
        )}
      </div>

      {/* Tester feedback modal */}
      {showFeedback && (
        <TesterFeedbackModal
          tributeId={tributeDbId}
          testerToken={testerToken}
          photosUploaded={photoUrls.length}
          tributeStartTime={tributeStartTime.current}
          onClose={() => { setShowFeedback(false); setFeedbackDismissed(true); }}
        />
      )}
    </div>
  );
};

export default TributePage;
