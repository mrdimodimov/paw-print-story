import CtaIcon from "@/components/CtaIcon";
import BrandLogo from "@/components/BrandLogo";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  trackCreateStarted,
  trackStepMounted,
  trackStepCompleted,
  trackCreateError,
  trackExitIntent,
  detectTimeout,
} from "@/lib/funnel-tracking";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, ImagePlus, X, Shield, Heart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";
import { TIERS } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DevTestingPanel } from "@/components/DevTestingPanel";
import ImageCropModal from "@/components/ImageCropModal";
import { AutofillButton } from "@/components/AutofillButton";
import { useTestMode } from "@/hooks/use-test-mode";
import { TEST_PRESETS } from "@/lib/test-presets";
import { captureTesterSource, trackEvent } from "@/lib/analytics";
import { readPrefillQuote, clearPrefillQuote } from "@/lib/quote-prefill";
import type { TributeFormData, TributeStyle } from "@/lib/types";

const PERSONALITY_OPTIONS = [
  "Loyal", "Playful", "Gentle", "Adventurous", "Funny", "Cuddly",
  "Brave", "Mischievous", "Calm", "Energetic", "Stubborn", "Sweet",
];

const TONE_OPTIONS: { value: TributeStyle; label: string; desc: string }[] = [
  { value: "warm", label: "Warm & Heartfelt", desc: "Tender and comforting" },
  { value: "celebratory", label: "Celebratory", desc: "Joyful and uplifting" },
  { value: "gentle", label: "Gentle", desc: "Soft and peaceful" },
  { value: "lighthearted", label: "Lighthearted", desc: "Fun and loving" },
];

const RAINBOW_BRIDGE_OPTION: { value: TributeStyle; label: string; desc: string } = {
  value: "rainbow_bridge",
  label: "Rainbow Bridge Tribute",
  desc: "Includes comforting themes about reunion and peaceful crossing at the Rainbow Bridge.",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const STEPS = [
  "About Your Pet",
  "Personality",
  "Memories",
  "What They Loved",
  "Your Message",
  "Style",
];


const defaultForm: TributeFormData = {
  pet_name: "",
  pet_type: "",
  breed: "",
  years_of_life: "",
  owner_name: "",
  photo_urls: [],
  personality_traits: [],
  personality_description: "",
  memories: [""],
  special_habits: "",
  favorite_activities: "",
  favorite_people_or_animals: "",
  owner_message: "",
  tone: "warm",
};

const Questionnaire = () => {
  const { isTestMode } = useTestMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "story";
  const isTester = !!searchParams.get("tester");
  const tierConfig = TIERS.find((t) => t.id === tier) || TIERS[0];
  // Skip intro screen when arriving from homepage demo prefill — go straight to Step 1
  const initialStep = !!(searchParams.get("name") || searchParams.get("trait") || searchParams.get("memory")) ? 0 : -1;
  const [step, setStep] = useState(initialStep); // -1 = intro screen, -2 = prefill reveal
  const [form, setForm] = useState<TributeFormData>(defaultForm);
  const [prefillQuote, setPrefillQuote] = useState<string | null>(null);
  const prefilledName = searchParams.get("name") || "";
  const prefilledTrait = searchParams.get("trait") || "";
  const prefilledMemory = searchParams.get("memory") || "";
  const hasDemoPrefill = !!(prefilledName || prefilledTrait || prefilledMemory);

  // Prefill from homepage interactive demo (?name=&trait=&memory=)
  useEffect(() => {
    if (!hasDemoPrefill) return;
    setForm((prev) => ({
      ...prev,
      pet_name: prefilledName || prev.pet_name,
      personality_traits: prefilledTrait
        ? Array.from(new Set([...prev.personality_traits, prefilledTrait]))
        : prev.personality_traits,
      memories: prefilledMemory
        ? [prefilledMemory, ...prev.memories.slice(1)]
        : prev.memories,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Read prefill quote from localStorage on mount; if present and the user
  // arrived via ?prefill=1, show a dedicated reveal screen first.
  useEffect(() => {
    const q = readPrefillQuote();
    if (q && searchParams.get("prefill") === "1") {
      setPrefillQuote(q);
      setStep(-2);
    } else if (q) {
      // Quote exists but no prefill flag — still seed owner_message silently
      setPrefillQuote(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture tester source on mount and fire DB + GA4 funnel-start events.
  // Also wire exit-intent: if the user leaves /create without finishing, fire
  // `exit_intent_create`. The funnel state is cleared by `trackTributePublished`,
  // so a successful generation suppresses this exit event.
  useEffect(() => {
    captureTesterSource();
    trackEvent("tribute_started");
    trackCreateStarted();

    const handleBeforeUnload = () => trackExitIntent();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // SPA navigation away from /create
      trackExitIntent();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  // Fire `trackStepMounted` whenever the user enters a new step.
  // The `intro` pseudo-step (step === -1) is treated as the funnel landing.
  useEffect(() => {
    const stepName =
      step === -2 ? "prefill_reveal" : step === -1 ? "intro" : STEPS[step] ?? `step_${step}`;
    // step_number: -1 for prefill, 0 for intro, 1..N for actual steps
    const stepNumber = step === -2 ? -1 : step === -1 ? 0 : step + 1;
    trackStepMounted(stepName, stepNumber);
  }, [step]);

  const update = <K extends keyof TributeFormData>(key: K, value: TributeFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTrait = (trait: string) => {
    update(
      "personality_traits",
      form.personality_traits.includes(trait)
        ? form.personality_traits.filter((t) => t !== trait)
        : [...form.personality_traits, trait]
    );
  };

  const addMemory = () => update("memories", [...form.memories, ""]);
  const updateMemory = (i: number, val: string) => {
    const updated = [...form.memories];
    updated[i] = val;
    update("memories", updated);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = tierConfig.photo_limit - form.photo_urls.length;
    if (remaining <= 0) {
      toast({
        title: "Photo limit reached",
        description: `You can upload up to ${tierConfig.photo_limit} photo${tierConfig.photo_limit > 1 ? "s" : ""} with your current plan.`,
      });
      return;
    }

    const file = files[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Photos must be JPG, PNG, or WEBP and under 5MB." });
      trackCreateError("About Your Pet", "validation");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: `${file.name} exceeds the 5MB limit.` });
      trackCreateError("About Your Pet", "validation");
      return;
    }

    // Open crop modal with preview
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setCropOpen(true);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropOpen(false);
    setCropSrc(null);
    setUploading(true);

    const ext = croppedFile.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const startedAt = Date.now();
    try {
      const { error } = await supabase.storage.from("pet-photos").upload(path, croppedFile);
      if (error) {
        toast({ title: "Upload failed", description: error.message });
        const msg = (error.message || "").toLowerCase();
        const errorType = detectTimeout(startedAt)
          ? "timeout"
          : msg.includes("network") || msg.includes("fetch")
            ? "network"
            : "upload_failed";
        trackCreateError("About Your Pet", errorType);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("pet-photos").getPublicUrl(path);
      update("photo_urls", [...form.photo_urls, urlData.publicUrl]);
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      const errorType = detectTimeout(startedAt)
        ? "timeout"
        : msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")
          ? "network"
          : "unknown";
      toast({ title: "Upload failed", description: msg || "Unexpected error" });
      trackCreateError("About Your Pet", errorType);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    update("photo_urls", form.photo_urls.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (step === -1) return true;
    if (step === 0) return form.pet_name.trim() && form.pet_type.trim();
    return true;
  };

  const encouragementMessage = (() => {
    if (step === 1) return "You're doing great ❤️";
    if (step === 2) return "You're halfway there";
    if (step === 3) return "Almost done";
    return null;
  })();

  const MEMORY_STARTERS = [
    { label: "A favorite memory", text: "One of my favorite memories is " },
    { label: "Something they always did", text: "They always " },
    { label: "A funny moment", text: "The funniest thing was when " },
  ];

  const fillFirstEmptyMemory = (text: string) => {
    const updated = [...form.memories];
    const idx = updated.findIndex((m) => !m.trim());
    const target = idx === -1 ? 0 : idx;
    updated[target] = (updated[target] || "") + text;
    update("memories", updated);
  };

  const [showExtraMemories, setShowExtraMemories] = useState(false);

  // Ensure at least 2 memory slots are visible by default
  useEffect(() => {
    if (form.memories.length < 2) {
      update("memories", [...form.memories, ...Array(2 - form.memories.length).fill("")]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    // Final step (Style) — fire DB step_completed + GA4 step_completed
    trackEvent("step_completed", { metadata: { step: STEPS[step] } });
    trackStepCompleted(STEPS[step], step + 1);
    trackEvent("tribute_completed", { metadata: { photos: form.photo_urls.length, tier } });
    const testerSource = sessionStorage.getItem("tester_source");
    const testerParam = testerSource ? `&tester=${testerSource}` : "";
    navigate(`/tribute?tier=${tier}${isTestMode ? "&test=true" : ""}${testerParam}`, {
      state: { formData: form, isPublic: isTestMode ? false : isPublic, email: email.trim() || undefined, isTestMode },
    });
  };

  const handleSkipToPreview = () => {
    // Auto-fill with medium preset if form is empty
    const filledForm = form.pet_name.trim()
      ? form
      : { ...form, ...TEST_PRESETS.find((p) => p.id === "medium")!.data } as TributeFormData;
    const testerSkip = sessionStorage.getItem("tester_source");
    navigate(`/tribute?tier=${tier}&test=true${testerSkip ? `&tester=${testerSkip}` : ""}`, {
      state: { formData: filledForm, isPublic: false, isTestMode: true },
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            {hasDemoPrefill && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  ✓ We started this for you
                </p>
                <p className="text-sm text-foreground/80">
                  {[prefilledName, prefilledTrait, prefilledMemory].filter(Boolean).join(" • ")}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">This will take less than a minute.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Pet's Name *</Label>
                <Input
                  placeholder="e.g., Buddy"
                  value={form.pet_name}
                  onChange={(e) => update("pet_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Type of Pet *</Label>
                <Input
                  placeholder="e.g., Dog, Cat, Bird"
                  value={form.pet_type}
                  onChange={(e) => update("pet_type", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <Label className="mb-3 block">
                What words describe {form.pet_name || "your pet"}?
              </Label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_OPTIONS.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      form.personality_traits.includes(trait)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Describe their personality in a few words</Label>
              <Textarea
                className="min-h-[60px] transition-[min-height] duration-200 focus:min-h-[120px]"
                placeholder="e.g., Always the first to greet visitors, loved belly rubs..."
                value={form.personality_description}
                onChange={(e) => update("personality_description", e.target.value)}
                rows={2}
              />
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground/80">Short and simple is perfect.</p>
                <AutofillButton
                  field="personality_description"
                  form={form}
                  currentValue={form.personality_description || ""}
                  onApply={(text) => update("personality_description", text)}
                />
              </div>
            </div>
          </div>
        );

      case 2: {
        const placeholders = [
          "One of your favorite moments together...",
          "A moment that always makes you smile...",
          "Something they used to do that you'll never forget...",
          "A small habit or memory you loved...",
        ];
        const visibleCount = showExtraMemories ? form.memories.length : Math.min(2, form.memories.length);
        return (
          <div className="space-y-5">
            <div>
              <Label className="mb-3 block">
                Share your favorite memories with {form.pet_name || "your pet"}
              </Label>
              <div className="mb-3 flex flex-wrap gap-2">
                {MEMORY_STARTERS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => fillFirstEmptyMemory(s.text)}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-accent/50"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
              {form.memories.slice(0, visibleCount).map((m, i) => (
                <div key={i} className="mb-2">
                  <Textarea
                    className="min-h-[56px] transition-[min-height] duration-200 focus:min-h-[110px]"
                    placeholder={placeholders[i % placeholders.length]}
                    value={m}
                    onChange={(e) => updateMemory(i, e.target.value)}
                    rows={2}
                  />
                  <div className="mt-1 flex justify-end">
                    <AutofillButton
                      field="memories"
                      form={form}
                      currentValue={m}
                      onApply={(text) => updateMemory(i, text)}
                    />
                  </div>
                </div>
              ))}
              <p className="mb-3 text-xs text-muted-foreground/80">Short and simple is perfect.</p>
              {!showExtraMemories ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowExtraMemories(true);
                    if (form.memories.length < 3) addMemory();
                  }}
                >
                  + Add another memory
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={addMemory}>
                  + Add another memory
                </Button>
              )}
            </div>
            <div>
              <Label>Any special habits or quirks?</Label>
              <Textarea
                className="min-h-[56px] transition-[min-height] duration-200 focus:min-h-[110px]"
                placeholder="e.g., Always stole socks, slept in funny positions..."
                value={form.special_habits}
                onChange={(e) => update("special_habits", e.target.value)}
                rows={2}
              />
              <div className="mt-1 flex justify-end">
                <AutofillButton
                  field="special_habits"
                  form={form}
                  currentValue={form.special_habits || ""}
                  onApply={(text) => update("special_habits", text)}
                />
              </div>
            </div>
          </div>
        );
      }

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <Label>Favorite activities or hobbies</Label>
              <Textarea
                className="min-h-[60px] transition-[min-height] duration-200 focus:min-h-[120px]"
                placeholder="e.g. Chasing balls, sleeping in the sun..."
                value={form.favorite_activities}
                onChange={(e) => update("favorite_activities", e.target.value)}
                rows={2}
              />
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground/80">Short and simple is perfect.</p>
                <AutofillButton
                  field="favorite_activities"
                  form={form}
                  currentValue={form.favorite_activities || ""}
                  onApply={(text) => update("favorite_activities", text)}
                />
              </div>
            </div>
            <div>
              <Label>Favorite people or animal friends</Label>
              <Textarea
                className="min-h-[60px] transition-[min-height] duration-200 focus:min-h-[120px]"
                placeholder="e.g. Best friends with the neighbor's cat, loved the mailman..."
                value={form.favorite_people_or_animals}
                onChange={(e) => update("favorite_people_or_animals", e.target.value)}
                rows={2}
              />
              <div className="mt-1 flex justify-end">
                <AutofillButton
                  field="favorite_people_or_animals"
                  form={form}
                  currentValue={form.favorite_people_or_animals || ""}
                  onApply={(text) => update("favorite_people_or_animals", text)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div>
              <Label>
                A personal message to {form.pet_name || "your pet"} (optional)
              </Label>
              <p className="mt-1 mb-2 text-xs text-muted-foreground">
                This is optional — even one sentence is enough.
              </p>
              <Textarea
                className="min-h-[80px] transition-[min-height] duration-200 focus:min-h-[160px]"
                placeholder="Say anything you'd like them to know..."
                value={form.owner_message}
                onChange={(e) => update("owner_message", e.target.value)}
                rows={3}
              />
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground/80">Short and simple is perfect.</p>
                <AutofillButton
                  field="owner_message"
                  form={form}
                  currentValue={form.owner_message || ""}
                  onApply={(text) => update("owner_message", text)}
                />
              </div>
            </div>
          </div>
        );

      case 5: {
        const showRainbowBridge = tier === "pack" || tier === "legacy";
        const allToneOptions = showRainbowBridge
          ? [...TONE_OPTIONS, RAINBOW_BRIDGE_OPTION]
          : TONE_OPTIONS;
        return (
          <div className="space-y-5">
            <Label className="mb-3 block">Choose a tone for the tribute</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {allToneOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("tone", opt.value)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    form.tone === opt.value
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="font-display text-base font-semibold text-foreground">
                    {opt.label}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DevTestingPanel
        onFill={(data) => setForm((prev) => ({ ...prev, ...data }))}
        onToneChange={(tone) => update("tone", tone)}
        currentTone={form.tone}
        onSkipToPreview={handleSkipToPreview}
        isTestMode={isTestMode}
      />
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <BrandLogo size="sm" />
          {!isTester && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}
        </div>
      </header>

      <div className="tribute-container max-w-2xl py-8">
        {/* Prefill reveal screen */}
        {step === -2 && prefillQuote ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center py-12"
          >
            <div className="mb-6 rounded-full bg-accent p-5">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              We started this for you
            </h1>
            <p className="mb-8 max-w-md text-base text-muted-foreground">
              You picked words that meant something. We'll weave them into your tribute.
            </p>
            <div className="mb-10 w-full max-w-lg rounded-2xl border border-primary/30 bg-primary/5 p-8 shadow-soft">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your chosen words
              </p>
              <p className="font-display text-xl italic leading-relaxed text-foreground md:text-2xl">
                "{prefillQuote}"
              </p>
            </div>
            <Button
              size="lg"
              className="px-8 py-6 text-lg shadow-glow"
              onClick={() => {
                // Seed owner_message with the quote so it carries into generation
                setForm((prev) => ({
                  ...prev,
                  owner_message: prev.owner_message?.trim()
                    ? prev.owner_message
                    : prefillQuote,
                }));
                trackEvent("prefill_continue_clicked", {
                  metadata: { quote: prefillQuote, source: "prefill_reveal" },
                });
                // Keep vp_prefill_quote in storage; it is cleared after successful generation
                setStep(0);
              }}
            >
              <CtaIcon className="mr-2 shrink-0" size={22} />
              Continue
            </Button>
            <button
              type="button"
              onClick={() => {
                setPrefillQuote(null);
                clearPrefillQuote();
                setStep(-1);
              }}
              className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Start without this quote
            </button>
          </motion.div>
        ) : step === -1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center py-16"
          >
            <div className="mb-6 rounded-full bg-accent p-5">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Let's create something beautiful for your pet
            </h1>
            <p className="mb-10 max-w-md text-base text-muted-foreground">
              This will only take 2 minutes. We'll guide you every step of the way.
            </p>
            {hasDemoPrefill && (
              <div className="mb-8 w-full max-w-md rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  ✓ We started this for you
                </p>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {prefilledName && (
                    <li><span className="text-muted-foreground">Name:</span> {prefilledName}</li>
                  )}
                  {prefilledTrait && (
                    <li><span className="text-muted-foreground">Personality:</span> {prefilledTrait}</li>
                  )}
                  {prefilledMemory && (
                    <li><span className="text-muted-foreground">Memory:</span> {prefilledMemory}</li>
                  )}
                </ul>
              </div>
            )}
            <Button
              size="lg"
              className="px-8 py-6 text-lg shadow-glow"
              onClick={() => setStep(0)}
            >
              <CtaIcon className="mr-2 shrink-0" size={22} />
              Start My Tribute
            </Button>
            <p className="mt-6 text-xs text-muted-foreground/70">
              No signup required · You'll preview before paying
            </p>
          </motion.div>
        ) : (
        <>
        <div className="mb-8 rounded-lg bg-accent/60 p-4 text-center text-sm text-accent-foreground">
          Take your time. There are no right or wrong answers. Even small memories create meaningful tributes.
        </div>

        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
          {step === 0 ? "Tell us about them." : STEPS[step]}
        </h2>
        {step === 0 && (
          <p className="mb-6 text-sm text-muted-foreground">
            We'll help you turn your memories into something beautiful.
          </p>
        )}
        {step !== 0 && <div className="mb-6" />}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Email + Gallery opt-in — only on final step */}
        {step === STEPS.length - 1 && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-border bg-accent/30 p-4">
              <Label className="text-sm text-foreground">Email (optional)</Label>
              <p className="mb-2 text-xs text-muted-foreground">We'll save your tribute so you can come back anytime.</p>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-accent/30 p-4">
              <Checkbox
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-foreground">
                Allow this tribute to appear in the public VellumPet memorial gallery
              </span>
            </label>
          </div>
        )}

        {/* Micro-encouragement */}
        {encouragementMessage && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm font-medium text-primary/80"
          >
            {encouragementMessage}
          </motion.p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Your answers are never stored or used for AI training. They are only used to generate your tribute.
        </p>

        <ImageCropModal
          open={cropOpen}
          imageSrc={cropSrc}
          onClose={() => { setCropOpen(false); setCropSrc(null); }}
          onCropComplete={handleCropComplete}
        />

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step <= 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <div className="flex flex-col items-end gap-1.5">
              <Button
                onClick={() => {
                  if (!canProceed()) {
                    trackCreateError(STEPS[step], "validation");
                    return;
                  }
                  trackEvent("step_completed", { metadata: { step: STEPS[step] } });
                  trackStepCompleted(STEPS[step], step + 1);
                  setStep((s) => s + 1);
                }}
                disabled={!canProceed()}
              >
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              {step > 0 && step < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("step_completed", { metadata: { step: STEPS[step], skipped: true } });
                    trackStepCompleted(STEPS[step], step + 1);
                    setStep((s) => s + 1);
                  }}
                  className="text-xs text-muted-foreground/70 underline-offset-2 hover:text-muted-foreground hover:underline"
                >
                  Skip this step
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-foreground/90 text-center">
                You've shared enough to create something meaningful.
              </p>
              <p className="text-xs text-muted-foreground text-center">
                We're creating your tribute now…
              </p>
              <p className="text-xs text-muted-foreground/70 text-center">
                You'll be able to preview it before anything is paid.
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Your purchase is protected by our 7-Day Tribute Satisfaction Guarantee.
              </p>
              <Button onClick={handleGenerate}>
                <Sparkles className="mr-1 h-4 w-4" /> Generate Tribute
              </Button>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
