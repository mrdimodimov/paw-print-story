// Structured schema for tribute generation
export interface TributeFormData {
  // Section 1: Basic Pet Info
  pet_name: string;
  pet_type: string;
  breed?: string;
  years_of_life: string;
  owner_name?: string;
  photo_urls: string[];

  // Section 2: Personality
  personality_traits: string[];
  personality_description?: string;

  // Section 3: Favorite Memories
  memories: string[];
  special_habits?: string;

  // Section 4: What They Loved
  favorite_activities?: string;
  favorite_people_or_animals?: string;

  // Section 5: Owner Message
  owner_message?: string;

  // Section 6: Tone & Style
  tone: TributeStyle;
}

export type TributeStyle = "warm" | "celebratory" | "gentle" | "lighthearted" | "rainbow_bridge";

export type TributeTier = "story" | "pack" | "legacy";

export interface TierConfig {
  id: TributeTier;
  name: string;
  price: number;
  popular?: boolean;
  label?: string;
  description?: string;
  micro_text?: string;
  word_count_target: [number, number];
  features: string[];
  include_share_card: boolean;
  include_social_post: boolean;
  include_printable_pdf: boolean;
  include_memorial_page: boolean;
  share_card_limit: number;
  photo_limit: number;
}

export const TIERS: TierConfig[] = [
  {
    id: "story",
    name: "Quick Tribute",
    price: 19,
    description: "A simple, heartfelt tribute",
    micro_text: "For a simple way to remember your pet",
    word_count_target: [350, 450],
    features: [
      "Beautiful tribute story",
      "One cherished photo",
      "Private memorial page",
      "Edit before download",
    ],
    include_share_card: true,
    include_social_post: false,
    include_printable_pdf: true,
    include_memorial_page: false,
    share_card_limit: 1,
    photo_limit: 1,
  },
  {
    id: "pack",
    name: "Memorial Tribute Pack",
    price: 39,
    popular: true,
    description: "A complete tribute to share and keep forever",
    micro_text: "Most pet parents choose this to preserve their pet's memory",
    word_count_target: [450, 600],
    features: [
      "Full tribute story",
      "Photo gallery (3 photos)",
      "Shareable memorial page",
      "Social media tribute card",
      "Printable memorial keepsake",
    ],
    include_share_card: true,
    include_social_post: true,
    include_printable_pdf: true,
    include_memorial_page: false,
    share_card_limit: 3,
    photo_limit: 3,
  },
  {
    id: "legacy",
    name: "Everlasting Legacy Page",
    price: 79,
    label: "Premium Memorial Experience",
    description: "A lasting online memorial for your pet",
    micro_text: "A place friends and family can visit and remember",
    word_count_target: [500, 650],
    features: [
      "Everything in Memorial Pack",
      "Custom personal memorial link",
      "Public gallery option",
      "Visitor reactions (candles, paws, hearts)",
    ],
    include_share_card: true,
    include_social_post: true,
    include_printable_pdf: true,
    include_memorial_page: true,
    share_card_limit: -1,
    photo_limit: 5,
  },
];

export interface GeneratedTribute {
  story: string;
  title?: string;
  social_post?: string;
  share_card_text?: string;
}

// AI Prompt template builder
export function buildPromptVariables(form: TributeFormData, tier: TierConfig) {
  return {
    pet_name: form.pet_name,
    pet_type: form.pet_type,
    breed: form.breed || "unknown",
    years: form.years_of_life,
    owner_name: form.owner_name || "their loving owner",
    personality_traits: form.personality_traits.join(", "),
    personality_description: form.personality_description || "",
    memories: form.memories.filter(Boolean).join("; "),
    special_habits: form.special_habits || "",
    favorite_activities: form.favorite_activities || "",
    favorite_people_or_animals: form.favorite_people_or_animals || "",
    owner_message: form.owner_message || "",
    tone: form.tone,
    word_count_min: import.meta.env.DEV ? 120 : tier.word_count_target[0],
    word_count_max: import.meta.env.DEV ? 180 : tier.word_count_target[1],
    tier_name: tier.name,
    include_social_post: tier.include_social_post,
    include_share_card: tier.include_share_card,
  };
}
