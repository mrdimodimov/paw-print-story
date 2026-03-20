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

function extractTimeline(story: string, yearsOfLife?: string): TimelineEntry[] {
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

  // Cinematic title patterns — standard entries
  const TITLE_PATTERNS: { regex: RegExp; title: string; firstTitle: string }[] = [
    { regex: /first\s+(day|time|night|walk|trip|bath)/i, title: "The Day It All Began", firstTitle: "The Day Everything Changed" },
    { regex: /(door|window|gate|porch|waiting|watched)/i, title: "The Door That Always Knew", firstTitle: "The Door That Was Never Empty" },
    { regex: /(cuddle|snuggle|nap|sleep|pillow|blanket|couch)/i, title: "Where the Warmth Lived", firstTitle: "Where Every Silence Was Full" },
    { regex: /(play|run|fetch|chase|jump|zoomie|ball)/i, title: "The Wild Hours", firstTitle: "The Hours the World Fell Away" },
    { regex: /(walk|hike|adventure|explore|park|beach|trail)/i, title: "Miles That Mattered", firstTitle: "The Walk That Never Felt Long Enough" },
    { regex: /(morning|sunrise|dawn|wake|breakfast|routine)/i, title: "Before the World Woke Up", firstTitle: "The Mornings That Belonged to Us" },
    { regex: /(evening|sunset|night|dark|quiet|still)/i, title: "When the House Went Quiet", firstTitle: "The Quiet That Held Everything" },
    { regex: /(home|family|house|welcome|arrive|adopt|rescue)/i, title: "Coming Through the Door", firstTitle: "The Moment the House Had a Heartbeat" },
    { regex: /(food|eat|treat|dinner|chicken|kibble|cheese)/i, title: "The Small Negotiations", firstTitle: "The Ritual That Never Got Old" },
    { regex: /(love|heart|soul|bond|friend|companion)/i, title: "The Space Between Us", firstTitle: "The Space Only They Could Fill" },
    { regex: /(grow|older|age|year|season|winter|summer)/i, title: "Through Every Season", firstTitle: "The Years That Moved Too Fast" },
    { regex: /(goodbye|farewell|last|miss|gone|final)/i, title: "The Light That Lingered", firstTitle: "The Light That Refused to Leave" },
    { regex: /(toy|favorite|spot|place|chair|bed|corner)/i, title: "A Place That Was Only Theirs", firstTitle: "The Corner Where Time Stood Still" },
    { regex: /(sound|bark|purr|meow|voice|noise|whine)/i, title: "The Sound the House Remembers", firstTitle: "The Sound That Filled the House" },
    { regex: /(rain|storm|thunder|snow|cold|warm)/i, title: "What the Weather Taught Us", firstTitle: "The Storm That Drew Us Closer" },
    { regex: /(cage|tank|enclosure|wheel|burrow|nest)/i, title: "A Whole World in Miniature", firstTitle: "The Tiny World That Held Everything" },
  ];

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  function sanitizeTitle(raw: string): string {
    return raw.replace(/^[—\-–\s:]+|[—\-–\s:]+$/g, "").trim();
  }

  /** Generate a cinematic fallback title from paragraph text */
  function summarizeFromText(text: string): string {
    // Extract the key noun/object from the first sentence for a more evocative title
    const firstSentence = text.split(/[.!?]/)[0]?.trim() || "";
    const words = firstSentence.split(/\s+/).filter(Boolean);
    if (words.length <= 5) return words.join(" ");
    // Take a compelling slice — skip first 1-2 filler words, grab the core
    const start = words.length > 8 ? 2 : 1;
    return words.slice(start, start + 4).join(" ");
  }

  // Elevated cinematic fallbacks for the first entry
  const FIRST_CINEMATIC_FALLBACKS = [
    "The Moment Everything Shifted",
    "Where It All Began to Matter",
    "The First Chapter of Something Real",
    "A Feeling the House Never Forgot",
    "The Beginning of a Beautiful Disruption",
  ];

  const CINEMATIC_FALLBACKS = [
    "The Hours That Held Us",
    "Something Worth Remembering",
    "A Rhythm All Their Own",
    "What the Silence Kept",
    "The Smallest Ceremony",
  ];

  function generateTitle(text: string, index: number, _total: number): string {
    const isFirst = index === 0;

    for (const pattern of TITLE_PATTERNS) {
      const match = text.match(pattern.regex);
      if (match) return sanitizeTitle(isFirst ? pattern.firstTitle : pattern.title);
    }

    // Fallback: use elevated set for first, standard for rest
    const fallbacks = isFirst ? FIRST_CINEMATIC_FALLBACKS : CINEMATIC_FALLBACKS;
    return fallbacks[index % fallbacks.length];
  }

  const targetCount = Math.min(Math.max(3, Math.ceil(paragraphs.length * 0.6)), 5);
  const step = Math.max(1, Math.floor(paragraphs.length / targetCount));
  const selected: string[] = [];

  for (let i = 0; i < paragraphs.length && selected.length < targetCount; i += step) {
    selected.push(paragraphs[i]);
  }

  const lastP = paragraphs[paragraphs.length - 1];
  if (selected.length < 5 && lastP && !selected.includes(lastP)) {
    if (/goodbye|farewell|rainbow|bridge|miss|forever|always|heart|legacy/i.test(lastP)) {
      selected.push(lastP);
    }
  }

  const usedTitles = new Set<string>();

  return selected.map((text, i) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const description = sentences.slice(0, 2).join(" ").trim();

    let title = sanitizeTitle(generateTitle(text, i, selected.length));
    if (!title || /^Memory\s*\d+$/i.test(title)) {
      title = summarizeFromText(text) || "A Cherished Moment";
    }
    if (usedTitles.has(title)) {
      title = summarizeFromText(text.slice(text.length / 3)) || "A Special Moment";
    }
    usedTitles.add(title);

    let year: string | undefined;
    if (startYear && endYear && selected.length > 1) {
      const yearSpan = endYear - startYear;
      const entryYear = startYear + Math.round((i / (selected.length - 1)) * yearSpan);
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
  const entries = useMemo(() => extractTimeline(story, yearsOfLife), [story, yearsOfLife]);

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
                Unlock My Tribute
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
