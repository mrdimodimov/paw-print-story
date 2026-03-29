import PawIcon from "@/components/PawIcon";
import { useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import html2canvas from "html2canvas";
import { Download, Copy, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── Quote extraction (reuse scoring logic) ────────────────────────────
const ACTION_WORDS = /\b(waited|ran|slept|followed|curled|sat|watched|jumped|barked|purred|nudged|licked|leaned|stayed|walked|played|chased|snored|wagged|stretched|buried|pressed|climbed|carried|greeted|danced)\b/i;
const ROUTINE_WORDS = /\b(every\s+(day|night|morning|evening|time)|always|each\s+(night|morning|day)|without\s+fail|never\s+missed)\b/i;
const EMOTIONAL_WORDS = /\b(miss|quiet|remember|stayed|gone|absence|heart|love|meant|felt|empty|still|silence|peace|goodbye|forever|close|warm|gentle|soft)\b/i;

function extractStoryQuote(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const scored = sentences.map((s) => {
    const trimmed = s.trim();
    const words = trimmed.split(/\s+/).length;
    let score = 0;
    if (ACTION_WORDS.test(trimmed)) score += 2;
    if (ROUTINE_WORDS.test(trimmed)) score += 2;
    if (words <= 20) score += 1;
    if (EMOTIONAL_WORDS.test(trimmed)) score += 1;
    if (words > 30) score -= 2;
    if (words >= 8 && words <= 20) score += 2;
    return { s: trimmed, score, words };
  });
  scored.sort((a, b) => b.score - a.score);
  let quote = scored[0]?.s || text;
  const quoteWords = quote.split(/\s+/);
  if (quoteWords.length > 25) {
    quote = quoteWords.slice(0, 25).join(" ") + "…";
  }
  return quote;
}

function extractClosingLine(text: string, petName: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const lastFew = sentences.slice(-3);
  for (const s of lastFew.reverse()) {
    const trimmed = s.trim();
    const words = trimmed.split(/\s+/).length;
    if (words <= 10 && EMOTIONAL_WORDS.test(trimmed)) return trimmed;
  }
  return `I miss you, ${petName}.`;
}

// ── CTA lines (rotated per render) ────────────────────────────────────
const CTA_LINES = [
  "Create a tribute for your pet",
  "Turn their memory into a story",
  "Honor their memory → vellumpet.com",
];

function pickCta(): string {
  return CTA_LINES[Math.floor(Math.random() * CTA_LINES.length)];
}

// ── Auto caption generator ────────────────────────────────────────────
const CAPTION_TEMPLATES = [
  (name: string) => `I didn't expect this to feel this real.\nI made this for ${name} 🐾`,
  (name: string) => `Some goodbyes take a long time to say.\nThis one's for ${name} 🐾`,
  (name: string) => `I wanted to remember ${name} the right way 🐾`,
];

function generateCaption(petName: string): string {
  const template = CAPTION_TEMPLATES[Math.floor(Math.random() * CAPTION_TEMPLATES.length)];
  return `${template(petName)}\n\nvellumpet.com\n\n#petmemorial #inlovingmemory #petloss #${petName.toLowerCase().replace(/\s+/g, "")}`;
}

interface InstagramStoryCardProps {
  petName: string;
  years: string;
  excerpt: string;
  photoUrls: string[];
}

const InstagramStoryCard = ({ petName, years, excerpt, photoUrls }: InstagramStoryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [caption] = useState(() => generateCaption(petName));

  const quote = extractStoryQuote(excerpt);
  const closingLine = extractClosingLine(excerpt, petName);
  const bgPhoto = photoUrls[0] || null;
  const [ctaLine] = useState(pickCta);

  // Share-ready filename
  const fileName = `${petName.toLowerCase().replace(/\s+/g, "-")}-memory-story.png`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const el = cardRef.current;
      const prevTransform = el.style.transform;
      el.style.transform = "none";
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#111827",
        width: 540,
        height: 960,
      });
      el.style.transform = prevTransform;
      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Story image downloaded!");
    } catch {
      toast.error("Failed to generate story image.");
    } finally {
      setExporting(false);
    }
  };

  const handleShareToStory = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Caption copied to clipboard!");
    } catch { /* ignore */ }
    await handleDownload();
    toast.info("Open Instagram → Story → select the downloaded image, then paste the caption.");
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Caption copied!");
    } catch {
      toast.error("Could not copy caption.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Story preview — scaled down for display */}
      <div className="mx-auto overflow-hidden rounded-xl border border-border shadow-card" style={{ width: 270, height: 480 }}>
        <div
          ref={cardRef}
          style={{
            width: 540,
            height: 960,
            transform: "scale(0.5)",
            transformOrigin: "top left",
            background: "linear-gradient(180deg, hsl(220,20%,14%) 0%, hsl(225,18%,22%) 40%, hsl(30,15%,18%) 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "100px 50px 70px",
            fontFamily: "'Playfair Display', serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background photo */}
          {bgPhoto && (
            <>
              <img
                src={bgPhoto}
                alt=""
                crossOrigin="anonymous"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.12,
                  filter: "blur(6px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, hsla(220,20%,14%,0.8) 0%, hsla(225,18%,22%,0.75) 40%, hsla(30,15%,18%,0.85) 100%)",
                }}
              />
            </>
          )}

          {/* Top: Name + Years */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1, marginBottom: 20 }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "hsl(40,40%,92%)",
                lineHeight: 1.2,
                letterSpacing: "0.02em",
              }}
            >
              {petName}
            </div>
            {years && (
              <div
                style={{
                  fontSize: 14,
                  color: "hsla(40,30%,80%,0.7)",
                  marginTop: 8,
                  fontStyle: "italic",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                {years}
              </div>
            )}
          </div>

          {/* Photo — dominant focal point */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", marginBottom: 32 }}>
            {bgPhoto ? (
              <div
                aria-label={petName}
                style={{
                  width: 220,
                  height: 220,
                  aspectRatio: "1 / 1",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundImage: `url(${bgPhoto})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  border: "3px solid hsla(40,50%,65%,0.4)",
                  boxShadow: "0 0 60px rgba(255, 200, 120, 0.25)",
                  opacity: 1,
                  filter: "contrast(1.05)",
                  mixBlendMode: "normal" as const,
                }}
              />
            ) : (
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  background: "hsla(40,50%,65%,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 60px rgba(255, 200, 120, 0.25)",
                }}
              >
                <PawIcon size={80} color="hsla(40,50%,65%,0.5)" />
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 40,
              height: 1,
              background: "hsla(40,50%,65%,0.3)",
              marginBottom: 24,
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* Quote */}
          <div
            style={{
              textAlign: "center",
              position: "relative",
              zIndex: 1,
              maxWidth: 420,
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.6,
                color: "hsl(210,20%,90%)",
                fontStyle: "italic",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              "{quote}"
            </div>
          </div>

          {/* Bottom: Closing line + CTA + branding */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1, marginTop: 32 }}>
            <div
              style={{
                fontSize: 14,
                color: "hsla(40,30%,80%,0.6)",
                fontFamily: "'Source Sans 3', sans-serif",
                marginBottom: 16,
              }}
            >
              {closingLine}
            </div>

            {/* Emotional CTA */}
            <div
              style={{
                fontSize: 11,
                color: "hsla(40,30%,80%,0.45)",
                fontFamily: "'Source Sans 3', sans-serif",
                marginBottom: 14,
                letterSpacing: "0.03em",
              }}
            >
              {ctaLine}
            </div>

            {/* Branding footer */}
            <div
              style={{
                fontSize: 10,
                color: "hsla(210,20%,70%,0.35)",
                fontFamily: "'Source Sans 3', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span>🐾 vellumpet.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        <Button size="sm" onClick={handleShareToStory} disabled={exporting}>
          <Instagram className="mr-1.5 h-4 w-4" /> Share to Instagram Story
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={exporting}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyCaption}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Caption
          </Button>
        </div>
      </div>

      {/* Caption preview */}
      <div className="mx-auto max-w-xs rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Suggested caption
        </p>
        <p className="whitespace-pre-wrap text-center text-xs leading-relaxed text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
};

export default InstagramStoryCard;
