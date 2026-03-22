import { useMemo } from "react";
import { motion } from "framer-motion";
import { PawPrint, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineEntry {
  title: string;
  year?: string;
  description: string;
}

interface MemoryTimelineProps {
  story: string;
  petName: string;
  yearsOfLife?: string;
  photoUrls?: string[];
  tierId: string;
  unlocked: boolean;
  onUnlock: () => void;
}

// --- Emotional arc slots ---
enum ArcSlot {
  ARRIVAL = 0,
  PERSONALITY = 1,
  RITUALS = 2,
  BOND = 3,
  FAREWELL = 4,
}

const ARC_KEYWORDS: { slot: ArcSlot; regex: RegExp }[] = [
  { slot: ArcSlot.FAREWELL, regex: /\b(goodbye|farewell|rainbow|bridge|miss|gone|final|last|without|empty|quiet now|no longer|passed|heaven)\b/i },
  { slot: ArcSlot.ARRIVAL, regex: /\b(first\s+(day|time|night)|adopt|rescue|brought\s+home|came\s+home|arrived|welcomed|puppy|kitten|baby)\b/i },
  { slot: ArcSlot.PERSONALITY, regex: /\b(quirk|personalit|stubborn|gentle|crazy|wild|goofy|mischiev|curious|fearless|shy|bold|energetic|calm|sassy|dramatic)\b/i },
  { slot: ArcSlot.RITUALS, regex: /\b(every\s+(morning|evening|night|day)|routine|ritual|always\s+would|habit|breakfast|dinner|walk|waited|same\s+spot)\b/i },
  { slot: ArcSlot.BOND, regex: /\b(love|heart|soul|bond|best\s+friend|companion|comfort|safe|trust|together|family|meant\s+everything|unconditional)\b/i },
];

// Arc-specific title banks (each slot has its own cinematic titles)
const ARC_TITLES: Record<ArcSlot, string[]> = {
  [ArcSlot.ARRIVAL]: [
    "The Day Everything Changed",
    "The Moment the House Had a Heartbeat",
    "Where It All Began",
    "Coming Through the Door",
    "The First Chapter",
  ],
  [ArcSlot.PERSONALITY]: [
    "A Spirit Like No Other",
    "The One Who Wrote the Rules",
    "Wild in All the Right Ways",
    "The Character We'll Never Forget",
    "A Presence That Filled the Room",
  ],
  [ArcSlot.RITUALS]: [
    "The Rituals That Made Us Whole",
    "Every Morning, Without Fail",
    "The Small Ceremonies",
    "A Rhythm All Their Own",
    "The Hours That Belonged to Us",
  ],
  [ArcSlot.BOND]: [
    "The Space Only They Could Fill",
    "Where Love Lived Loudest",
    "The Bond That Words Can't Hold",
    "Something Deeper Than Language",
    "What the Heart Remembers Most",
  ],
  [ArcSlot.FAREWELL]: [
    "The Light That Refused to Leave",
    "Now the House Moves Differently",
    "What Stays When They're Gone",
    "The Quiet That Holds Everything",
    "A Presence Still Felt",
  ],
};

const LOWERCASE_WORDS = new Set(["of", "the", "and", "in", "to", "a", "an", "for", "but", "or", "nor", "on", "at", "by", "with"]);

function toTitleCase(s: string): string {
  return s.split(/\s+/).map((word, i) => {
    if (i === 0 || !LOWERCASE_WORDS.has(word.toLowerCase())) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  }).join(" ");
}

function sanitizeTitle(raw: string): string {
  return toTitleCase(raw.replace(/^[—\-–\s:]+|[—\-–\s:]+$/g, "").trim());
}

function extractTimeline(story: string, petName: string, yearsOfLife?: string): TimelineEntry[] {
  const paragraphs = story
    .split(/\n\n+|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  if (paragraphs.length === 0) return [];

  let startYear: number | null = null;
  let endYear: number | null = null;
  if (yearsOfLife) {
    const match = yearsOfLife.match(/(\d{4})\s*[-–—]\s*(\d{4})/);
    if (match) {
      startYear = parseInt(match[1]);
      endYear = parseInt(match[2]);
    }
  }

  // Score each paragraph for each arc slot
  const slotBest: Record<ArcSlot, { idx: number; score: number }> = {
    [ArcSlot.ARRIVAL]: { idx: -1, score: 0 },
    [ArcSlot.PERSONALITY]: { idx: -1, score: 0 },
    [ArcSlot.RITUALS]: { idx: -1, score: 0 },
    [ArcSlot.BOND]: { idx: -1, score: 0 },
    [ArcSlot.FAREWELL]: { idx: -1, score: 0 },
  };

  paragraphs.forEach((p, pi) => {
    // Bias: first paragraphs toward ARRIVAL, last toward FAREWELL
    const positionBias = (slot: ArcSlot) => {
      if (slot === ArcSlot.ARRIVAL) return Math.max(0, 1 - pi * 0.3);
      if (slot === ArcSlot.FAREWELL) return Math.max(0, (pi - (paragraphs.length - 2)) * 0.5);
      return 0;
    };

    for (const { slot, regex } of ARC_KEYWORDS) {
      const matches = (p.match(regex) || []).length;
      const score = matches + positionBias(slot);
      if (score > slotBest[slot].score) {
        slotBest[slot] = { idx: pi, score };
      }
    }
  });

  // Assign paragraphs to slots, avoiding duplicates
  const usedIdxs = new Set<number>();
  const arcOrder: ArcSlot[] = [ArcSlot.ARRIVAL, ArcSlot.PERSONALITY, ArcSlot.RITUALS, ArcSlot.BOND, ArcSlot.FAREWELL];
  const selected: { slot: ArcSlot; text: string }[] = [];

  // First pass: assign best matches
  for (const slot of arcOrder) {
    const best = slotBest[slot];
    if (best.idx >= 0 && best.score > 0 && !usedIdxs.has(best.idx)) {
      selected.push({ slot, text: paragraphs[best.idx] });
      usedIdxs.add(best.idx);
    }
  }

  // Second pass: fill missing slots from remaining paragraphs by position
  for (const slot of arcOrder) {
    if (selected.find((s) => s.slot === slot)) continue;
    // Pick paragraph at expected position
    const idealIdx = Math.round((slot / 4) * (paragraphs.length - 1));
    // Search outward from ideal
    for (let d = 0; d < paragraphs.length; d++) {
      for (const dir of [idealIdx + d, idealIdx - d]) {
        if (dir >= 0 && dir < paragraphs.length && !usedIdxs.has(dir)) {
          selected.push({ slot, text: paragraphs[dir] });
          usedIdxs.add(dir);
          break;
        }
      }
      if (selected.find((s) => s.slot === slot)) break;
    }
  }

  // Sort by arc order
  selected.sort((a, b) => a.slot - b.slot);

  // Limit to 3-5 entries
  const entries = selected.slice(0, 5);
  if (entries.length < 3 && paragraphs.length >= 3) {
    // Pad with unused paragraphs
    for (let i = 0; i < paragraphs.length && entries.length < 3; i++) {
      if (!usedIdxs.has(i)) {
        entries.push({ slot: ArcSlot.BOND, text: paragraphs[i] });
        usedIdxs.add(i);
      }
    }
  }

  const usedTitles = new Set<string>();

  return entries.map((entry, i) => {
    // Extract 1-3 tight sentences
    const sentences = entry.text.match(/[^.!?]+[.!?]+/g) || [entry.text];
    const description = sentences.slice(0, 3).join(" ").trim();

    // Pick title from arc-specific bank
    const bank = ARC_TITLES[entry.slot];
    let title = sanitizeTitle(bank[0]);
    for (const candidate of bank) {
      const sanitized = sanitizeTitle(candidate);
      if (!usedTitles.has(sanitized)) {
        title = sanitized;
        break;
      }
    }
    usedTitles.add(title);

    let year: string | undefined;
    if (startYear && endYear && entries.length > 1) {
      const yearSpan = endYear - startYear;
      const entryYear = startYear + Math.round((i / (entries.length - 1)) * yearSpan);
      year = String(entryYear);
    }

    return { title, year, description };
  });
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function MemoryTimeline({
  story,
  petName,
  yearsOfLife,
  photoUrls,
  tierId,
  unlocked,
  onUnlock,
}: MemoryTimelineProps) {
  const entries = useMemo(() => extractTimeline(story, petName, yearsOfLife), [story, petName, yearsOfLife]);

  if (entries.length === 0) return null;

  const isTier1 = tierId === "story";
  const visibleCount = isTier1 && !unlocked ? Math.min(2, entries.length) : entries.length;
  const hasLockedEntries = isTier1 && !unlocked && entries.length > visibleCount;

  return (
    <div className="mb-6 rounded-xl border border-border bg-card px-4 py-8 shadow-soft sm:px-6 md:px-8 md:py-12">
      {/* Centered container */}
      <div className="mx-auto max-w-[700px]">
        {/* Title + Emotional Intro */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <PawPrint className="mx-auto mb-3 h-6 w-6 text-primary/60" />
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            A Life Remembered
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            A life remembered through moments that mattered most.
          </p>
        </motion.div>

        {/* Entries as centered story cards */}
        <div className="space-y-8">
          {entries.map((entry, i) => {
            const isVisible = i < visibleCount;
            const isLocked = !isVisible;
            const hasPhoto = !isTier1 && photoUrls && photoUrls[i];

            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeInUp}
                className={isLocked ? "pointer-events-none select-none blur-[2px]" : ""}
                style={isLocked ? { opacity: 0.3 } : undefined}
              >
                {/* Title row */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-accent/50">
                    <PawPrint className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {entry.title}
                    </h3>
                    {entry.year && (
                      <span className="text-xs text-muted-foreground">{entry.year}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mb-4 pl-11 text-[15px] leading-relaxed text-muted-foreground">
                  {entry.description}
                </p>

                {/* Photo between entries for tier 2/3 */}
                {hasPhoto && (
                  <div className="ml-11 w-[calc(100%-2.75rem)] overflow-hidden rounded-lg border border-border bg-muted/30 shadow-soft">
                    <motion.img
                      initial={{ opacity: 0, scale: 0.97 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      src={photoUrls![i]}
                      alt={`${petName} — ${entry.title}`}
                      className="mx-auto block max-h-[320px] w-auto max-w-full object-contain"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Lock overlay for Tier 1 */}
        {hasLockedEntries && (
          <div className="relative mt-2">
            {/* Gradient fade over last entry */}
            <div
              className="pointer-events-none absolute -top-24 left-0 right-0 h-24"
              style={{
                background: "linear-gradient(to bottom, hsl(var(--card) / 0), hsl(var(--card) / 1))",
              }}
            />
            <div className="rounded-xl border border-primary/20 bg-accent/30 px-6 py-8 text-center">
              <Lock className="mx-auto mb-3 h-6 w-6 text-primary/60" />
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                Unlock {petName}'s full life story
              </h3>
              <p className="mx-auto mb-5 max-w-sm text-sm text-muted-foreground">
                See every memory beautifully preserved
              </p>
              <Button size="lg" onClick={onUnlock}>
                Keep {petName}'s Story Forever
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
