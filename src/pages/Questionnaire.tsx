import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, ArrowLeft, ArrowRight, Sparkles, ImagePlus, X, Shield, Heart } from "lucide-react";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "story";
  const tierConfig = TIERS.find((t) => t.id === tier) || TIERS[0];
  const [step, setStep] = useState(-1); // -1 = intro screen
  const [form, setForm] = useState<TributeFormData>(defaultForm);
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of filesToUpload) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Photos must be JPG, PNG, or WEBP and under 5MB." });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: `${file.name} exceeds the 5MB limit.` });
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("pet-photos").upload(path, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message });
        continue;
      }
      const { data: urlData } = supabase.storage.from("pet-photos").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    if (newUrls.length > 0) {
      update("photo_urls", [...form.photo_urls, ...newUrls]);
    }
    setUploading(false);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (step === 1) return "This is already becoming something special ❤️";
    if (step === 3) return "You're doing great — your tribute is taking shape.";
    return null;
  })();

  const handleGenerate = () => {
    navigate(`/tribute?tier=${tier}`, { state: { formData: form, isPublic, email: email.trim() || undefined } });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Breed (optional)</Label>
                <Input
                  placeholder="e.g., Golden Retriever"
                  value={form.breed}
                  onChange={(e) => update("breed", e.target.value)}
                />
              </div>
              <div>
                <Label>Years of Life</Label>
                <Input
                  placeholder="e.g., 2010–2024 or 12 years"
                  value={form.years_of_life}
                  onChange={(e) => update("years_of_life", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Your Name (optional)</Label>
              <Input
                placeholder="Your first name"
                value={form.owner_name}
                onChange={(e) => update("owner_name", e.target.value)}
              />
            </div>

            {/* Photo Upload */}
            <div className="rounded-lg border border-border bg-accent/30 p-5">
              <Label className="mb-1 block">Pet Photo (optional)</Label>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload a photo of your pet to make the tribute more personal.
                {tierConfig.photo_limit > 1 && (
                  <> You can add up to {tierConfig.photo_limit} photos with your current plan.</>
                )}
              </p>

              {/* Photo Previews */}
              {form.photo_urls.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-3">
                  {form.photo_urls.map((url, i) => (
                    <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                      <img src={url} alt={`Pet photo ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute right-1 top-1 rounded-full bg-foreground/70 p-0.5 text-background opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {form.photo_urls.length < tierConfig.photo_limit && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple={tierConfig.photo_limit > 1}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="mr-1.5 h-4 w-4" />
                    {uploading ? "Uploading…" : "Choose Photo"}
                  </Button>
                </>
              )}

              {form.photo_urls.length >= tierConfig.photo_limit && tierConfig.photo_limit > 0 && (
                <p className="text-xs text-muted-foreground">
                  You've reached the {tierConfig.photo_limit}-photo limit for your plan.
                </p>
              )}
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
                placeholder="e.g., Always the first to greet visitors, loved belly rubs..."
                value={form.personality_description}
                onChange={(e) => update("personality_description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <Label className="mb-3 block">
                Share your favorite memories with {form.pet_name || "your pet"}
              </Label>
              {form.memories.map((m, i) => (
                <Textarea
                  key={i}
                  className="mb-3"
                  placeholder={`Memory ${i + 1}...`}
                  value={m}
                  onChange={(e) => updateMemory(i, e.target.value)}
                  rows={2}
                />
              ))}
              <Button variant="outline" size="sm" onClick={addMemory}>
                + Add another memory
              </Button>
            </div>
            <div>
              <Label>Any special habits or quirks?</Label>
              <Textarea
                placeholder="e.g., Always stole socks, slept in funny positions..."
                value={form.special_habits}
                onChange={(e) => update("special_habits", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <Label>Favorite activities or hobbies</Label>
              <Textarea
                placeholder="e.g., Chasing squirrels, swimming, car rides..."
                value={form.favorite_activities}
                onChange={(e) => update("favorite_activities", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Favorite people or animal friends</Label>
              <Textarea
                placeholder="e.g., Best friends with the neighbor's cat..."
                value={form.favorite_people_or_animals}
                onChange={(e) => update("favorite_people_or_animals", e.target.value)}
                rows={3}
              />
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
              <Textarea
                placeholder="Say anything you'd like them to know..."
                value={form.owner_message}
                onChange={(e) => update("owner_message", e.target.value)}
                rows={5}
              />
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
      />
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {BRAND.name}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>
      </header>

      <div className="tribute-container max-w-2xl py-8">
        {/* Intro screen */}
        {step === -1 ? (
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
            <Button
              size="lg"
              className="px-8 py-6 text-lg shadow-glow"
              onClick={() => setStep(0)}
            >
              <PawPrint className="mr-2 h-5 w-5" />
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

        <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
          {STEPS[step]}
        </h2>

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

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Your answers are never stored or used for AI training. They are only used to generate your tribute.
        </p>

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-2">
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
      </div>
    </div>
  );
};

export default Questionnaire;
