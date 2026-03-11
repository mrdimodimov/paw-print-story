import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint, ArrowLeft, Download, Share2, Edit, RefreshCw, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BRAND } from "@/lib/brand";
import { TIERS, buildPromptVariables } from "@/lib/types";
import type { TributeFormData, GeneratedTribute, TierConfig } from "@/lib/types";

// Mock tribute generation — replace with AI backend call
function generateMockTribute(form: TributeFormData, tier: TierConfig): GeneratedTribute {
  const vars = buildPromptVariables(form, tier);
  const story = `A Tribute to ${vars.pet_name}

${vars.pet_name} was more than just a ${vars.pet_type.toLowerCase()}${vars.breed !== "unknown" ? ` — a beautiful ${vars.breed}` : ""}. For ${vars.years || "many wonderful years"}, ${vars.pet_name} filled ${vars.owner_name}'s life with unconditional love and joy.

${vars.personality_traits ? `Known for being ${vars.personality_traits}, ` : ""}${vars.pet_name} had a way of making every day brighter. ${vars.personality_description || ""}

${vars.memories ? `Among the most cherished memories: ${vars.memories}.` : ""} ${vars.special_habits ? `And who could forget — ${vars.special_habits}.` : ""}

${vars.favorite_activities ? `${vars.pet_name} loved nothing more than ${vars.favorite_activities.toLowerCase()}.` : ""} ${vars.favorite_people_or_animals ? `A true social spirit, ${vars.pet_name} shared a special bond with ${vars.favorite_people_or_animals}.` : ""}

${vars.owner_message ? `\n"${vars.owner_message}"\n— ${vars.owner_name}` : ""}

${vars.pet_name} may have crossed the rainbow bridge, but the pawprints left on our hearts will last forever. Until we meet again, dear friend.`;

  const result: GeneratedTribute = { story };

  if (tier.include_social_post) {
    result.social_post = `Forever in our hearts 🐾 Today we honor ${vars.pet_name}, who filled our lives with love for ${vars.years || "so many years"}. ${vars.personality_traits ? `A truly ${vars.personality_traits.split(",")[0].trim().toLowerCase()} soul.` : ""} #PetTribute #ForeverLoved #${vars.pet_name.replace(/\s/g, "")}`;
  }

  if (tier.include_share_card) {
    result.share_card_text = `In Loving Memory of ${vars.pet_name} 🕊️\n${vars.years || ""}\nForever in our hearts.`;
  }

  return result;
}

const TributePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tierId = searchParams.get("tier") || "story";
  const tier = TIERS.find((t) => t.id === tierId) || TIERS[0];

  const formData = (location.state as { formData?: TributeFormData })?.formData;

  const [tribute, setTribute] = useState<GeneratedTribute | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState("");
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    if (!formData) {
      navigate("/");
      return;
    }
    // Simulate generation delay
    const timer = setTimeout(() => {
      const result = generateMockTribute(formData, tier);
      setTribute(result);
      setEditedStory(result.story);
      setGenerating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, tier, navigate]);

  const handleRegenerate = () => {
    if (!formData) return;
    setGenerating(true);
    setTimeout(() => {
      const result = generateMockTribute(formData, tier);
      setTribute(result);
      setEditedStory(result.story);
      setGenerating(false);
    }, 1500);
  };

  const handleSaveEdit = () => {
    if (tribute) {
      setTribute({ ...tribute, story: editedStory });
    }
    setIsEditing(false);
  };

  if (generating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
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
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditedStory(tribute.story);
                      setIsEditing(false);
                    }}
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
          <div className="mb-8 flex flex-wrap gap-3">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1 h-4 w-4" /> Edit Story
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
            </Button>
            <Button size="sm">
              <Download className="mr-1 h-4 w-4" /> Download PDF
            </Button>
          </div>

          {/* Social Post (Tier 2+) */}
          {tribute.social_post && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Social Media Post
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {tribute.social_post}
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Copy to Clipboard
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
              <Button variant="outline" size="sm" className="mt-3">
                <Download className="mr-1 h-4 w-4" /> Download Card
              </Button>
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
