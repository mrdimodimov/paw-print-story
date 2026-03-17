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

/**
 * Extract 3–5 memory entries from the tribute story paragraphs.
 * Uses heuristics: splits on paragraphs, picks key sentences,
 * and generates short titles from the first few words.
 */
function extractTimeline(story: string, yearsOfLife?: string): TimelineEntry[] {
  const paragraphs = story
    .split(/\n\n+|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  if (paragraphs.length === 0) return [];

  // Parse years range for distributing across entries
  let startYear: number | null = null;
  let endYear: number | null = null;
  if (yearsOfLife) {
    const match = yearsOfLife.match(/(\d{4})\s*[-–—]\s*(\d{4})/);
    if (match) {
      startYear = parseInt(match[1]);
      endYear = parseInt(match[2]);
    }
  }

  // Title extraction heuristics
  const TITLE_PATTERNS = [
    { regex: /first\s+(day|time|night|walk|trip|visit|bath|christmas|birthday)/i, title: (m: RegExpMatchArray) => `First ${capitalize(m[1])}` },
    { regex: /favorite\s+(spot|place|toy|treat|game|person|blanket|chair)/i, title: (m: RegExpMatchArray) => `Favorite ${capitalize(m[1])}` },
    { regex: /(cuddle|snuggle|nap|sleep|rest)/i, title: () => "Quiet Moments" },
    { regex: /(play|run|fetch|chase|jump|zoomie)/i, title: () => "Playful Days" },
    { regex: /(love|heart|soul|bond|friend|companion)/i, title: () => "A Bond Like No Other" },
    { regex: /(goodbye|farewell|rainbow|bridge|miss|gone|last)/i, title: () => "Until We Meet Again" },
    { regex: /(walk|hike|adventure|explore|outdoor|park|beach)/i, title: () => "Adventures Together" },
    { regex: /(home|family|house|welcome|arrive|adopt)/i, title: () => "Coming Home" },
    { regex: /(grow|older|age|year|season|winter|summer)/i, title: () => "Through the Seasons" },
    { regex: /(food|eat|treat|dinner|breakfast|kibble|chicken)/i, title: () => "The Little Things" },
  ];

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  function generateTitle(text: string, index: number, total: number): string {
    // First entry often about arrival/beginning
    if (index === 0) {
      const homeMatch = text.match(/(home|family|adopt|rescue|arrive|first|welcome|puppy|kitten)/i);
      if (homeMatch) return "The Day It All Began";
    }
    // Last entry often about farewell
    if (index === total - 1) {
      const endMatch = text.match(/(goodbye|farewell|rainbow|bridge|miss|forever|always|heart|legacy)/i);
      if (endMatch) return "Forever in Our Hearts";
    }

    for (const pattern of TITLE_PATTERNS) {
      const match = text.match(pattern.regex);
      if (match) return pattern.title(match);
    }

    // Fallback: extract a meaningful phrase from the first sentence
    const firstSentence = text.split(/[.!?]/)[0]?.trim() || "";
    const words = firstSentence.split(/\s+/).slice(0, 4);
    if (words.length >= 2) {
      return words.join(" ");
    }
    return `Memory ${index + 1}`;
  }

  // Select evenly spaced paragraphs (3–5)
  const targetCount = Math.min(Math.max(3, Math.ceil(paragraphs.length * 0.6)), 5);
  const step = Math.max(1, Math.floor(paragraphs.length / targetCount));
  const selected: string[] = [];

  for (let i = 0; i < paragraphs.length && selected.length < targetCount; i += step) {
    selected.push(paragraphs[i]);
  }

  // Ensure we have the last paragraph if it's meaningful (farewell)
  const lastP = paragraphs[paragraphs.length - 1];
  if (selected.length < 5 && lastP && !selected.includes(lastP)) {
    if (/goodbye|farewell|rainbow|bridge|miss|forever|always|heart|legacy/i.test(lastP)) {
      selected.push(lastP);
    }
  }

  const usedTitles = new Set<string>();

  return selected.map((text, i) => {
    // Trim to 1–2 sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const description = sentences.slice(0, 2).join(" ").trim();

    let title = generateTitle(text, i, selected.length);
    // Avoid duplicate titles
    if (usedTitles.has(title)) {
      title = `Memory ${i + 1}`;
    }
    usedTitles.add(title);

    // Distribute years if available
    let year: string | undefined;
    if (startYear && endYear && selected.length > 1) {
      const yearSpan = endYear - startYear;
      const entryYear = startYear + Math.round((i / (selected.length - 1)) * yearSpan);
      year = String(entryYear);
    }

    return { title, year, description };
  });
}

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
    <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft md:p-8">
      {/* Section heading */}
      <div className="mb-2 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          A Life Remembered
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Scroll to remember {petName}'s life
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mx-auto mt-8 max-w-lg">
        {/* Vertical connector line */}
        <div
          className="absolute left-4 top-2 w-px bg-border md:left-1/2 md:-translate-x-px"
          style={{ height: hasLockedEntries ? "100%" : `calc(100% - 1rem)` }}
        />

        {entries.map((entry, i) => {
          const isVisible = i < visibleCount;
          const isLocked = !isVisible;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isLocked ? 0.3 : 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative mb-8 last:mb-0 ${isLocked ? "pointer-events-none select-none blur-[2px]" : ""}`}
            >
              {/* Dot / paw icon */}
              <div className="absolute left-2.5 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-card md:left-1/2 md:-translate-x-1/2">
                <PawPrint className="h-2.5 w-2.5 text-primary" />
              </div>

              {/* Content card */}
              <div className="ml-10 md:ml-0 md:w-[calc(50%-2rem)] md:odd:mr-auto md:even:ml-auto">
                <div className="rounded-lg border border-border/60 bg-background p-4 shadow-sm">
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {entry.title}
                    </h3>
                    {entry.year && (
                      <span className="text-xs text-muted-foreground">{entry.year}</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {entry.description}
                  </p>

                  {/* Optional photo for tier 2/3 */}
                  {!isTier1 && photoUrls && photoUrls[i] && (
                    <img
                      src={photoUrls[i]}
                      alt={`${petName} - ${entry.title}`}
                      className="mt-3 h-24 w-full rounded-md border border-border object-cover"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lock overlay for Tier 1 */}
      {hasLockedEntries && (
        <div className="relative -mt-4">
          {/* Gradient fade */}
          <div
            className="pointer-events-none absolute -top-20 left-0 right-0 h-20"
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
              See every memory beautifully preserved in a timeline
            </p>
            <Button size="lg" onClick={onUnlock}>
              Unlock Full Tribute
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
