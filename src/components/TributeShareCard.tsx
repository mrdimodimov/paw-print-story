import PawIcon from "@/components/PawIcon";
import { BRAND } from "@/lib/brand";
import html2canvas from "html2canvas";
import { Download, Share2, Facebook, Twitter, Mail, MessageCircle, Send, Copy, Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const FACEBOOK_APP_ID = "";

// ── Card dimensions ───────────────────────────────────────────────────
const CARD_W = 1080;
const CARD_H = 1350; // 4:5 Instagram-optimised

// ── Card style types ──────────────────────────────────────────────────
type CardStyleId = "minimal" | "story" | "classic";

interface CardStyle {
  id: CardStyleId;
  label: string;
  maxWords: number;
  background: string;
  borderColor: string;
  nameColor: string;
  yearsColor: string;
  textColor: string;
  footerColor: string;
  accentColor: string;
  glowColor: string;
  photoSize: number;
  nameFontSize: number;
  quoteFontSize: number;
  showYears: boolean;
  quoteStyle: "italic" | "normal";
}

const CARD_STYLES: CardStyle[] = [
  {
    id: "minimal",
    label: "Minimal",
    maxWords: 16,
    background: "linear-gradient(160deg, hsl(36,30%,97%), hsl(30,25%,92%))",
    borderColor: "hsla(30,20%,70%,0.18)",
    nameColor: "hsl(30,8%,14%)",
    yearsColor: "hsl(30,6%,50%)",
    textColor: "hsl(30,8%,20%)",
    footerColor: "hsl(30,6%,55%)",
    accentColor: "hsla(36,55%,55%,0.45)",
    glowColor: "hsla(36,60%,70%,0.35)",
    photoSize: 220,
    nameFontSize: 42,
    quoteFontSize: 24,
    showYears: true,
    quoteStyle: "italic",
  },
  {
    id: "story",
    label: "Story",
    maxWords: 16,
    background: "linear-gradient(160deg, hsl(220,25%,14%), hsl(225,22%,22%), hsl(215,20%,18%))",
    borderColor: "hsla(210,40%,70%,0.12)",
    nameColor: "hsl(40,45%,93%)",
    yearsColor: "hsla(40,30%,80%,0.55)",
    textColor: "hsl(210,18%,88%)",
    footerColor: "hsla(210,18%,70%,0.45)",
    accentColor: "hsla(40,55%,65%,0.4)",
    glowColor: "hsla(40,50%,60%,0.25)",
    photoSize: 200,
    nameFontSize: 38,
    quoteFontSize: 22,
    showYears: false,
    quoteStyle: "normal",
  },
  {
    id: "classic",
    label: "Classic",
    maxWords: 16,
    background: "linear-gradient(160deg, hsl(38,35%,96%), hsl(32,55%,88%), hsl(35,28%,93%))",
    borderColor: "hsla(32,80%,50%,0.2)",
    nameColor: "hsl(30,12%,14%)",
    yearsColor: "hsl(30,8%,48%)",
    textColor: "hsl(30,12%,14%)",
    footerColor: "hsl(30,8%,48%)",
    accentColor: "hsla(32,75%,50%,0.4)",
    glowColor: "hsla(32,70%,60%,0.3)",
    photoSize: 210,
    nameFontSize: 42,
    quoteFontSize: 22,
    showYears: true,
    quoteStyle: "italic",
  },
];

interface TributeShareCardProps {
  petName: string;
  years: string;
  excerpt: string;
  photoUrls: string[];
  shareCardLimit: number;
  shortCaption?: string;
  tributeUrl?: string;
}

// ── Intelligent quote extraction ──────────────────────────────────────
const ACTION_WORDS = /\b(waited|ran|slept|followed|curled|sat|watched|jumped|barked|purred|nudged|licked|leaned|stayed|walked|played|chased|snored|wagged|stretched|buried|pressed|climbed|carried|greeted|danced)\b/i;
const ROUTINE_WORDS = /\b(every\s+(day|night|morning|evening|time)|always|each\s+(night|morning|day)|without\s+fail|never\s+missed)\b/i;
const EMOTIONAL_WORDS = /\b(miss|quiet|remember|stayed|gone|absence|heart|love|meant|felt|empty|still|silence|peace|goodbye|forever|close|warm|gentle|soft)\b/i;

function extractQuote(text: string, maxWords: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const scored = sentences.map((s) => {
    const trimmed = s.trim();
    const words = trimmed.split(/\s+/).length;
    let score = 0;
    if (ACTION_WORDS.test(trimmed)) score += 2;
    if (ROUTINE_WORDS.test(trimmed)) score += 2;
    if (words <= 16) score += 2;
    if (EMOTIONAL_WORDS.test(trimmed)) score += 1;
    if (words > 20) score -= 2;
    if (words >= 6 && words <= 16) score += 2;
    return { s: trimmed, score, words };
  });
  scored.sort((a, b) => b.score - a.score);
  let quote = scored[0]?.s || text;
  const quoteWords = quote.split(/\s+/);
  if (quoteWords.length > maxWords) {
    quote = quoteWords.slice(0, maxWords).join(" ") + "…";
  }
  return quote;
}

// ── Photo renderer ────────────────────────────────────────────────────
function renderPhoto(
  photos: string[],
  petName: string,
  size: number,
  accentColor: string,
  glowColor: string
) {
  const glowSize = size + 40;
  const shadowSize = size + 20;

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    width: glowSize,
    height: glowSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Glow ring
  const glowRingStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
    filter: "blur(12px)",
  };

  // Shadow
  const shadowStyle: React.CSSProperties = {
    position: "absolute",
    top: (glowSize - shadowSize) / 2 + 8,
    left: (glowSize - shadowSize) / 2,
    width: shadowSize,
    height: shadowSize / 2,
    borderRadius: "50%",
    background: "hsla(0,0%,0%,0.12)",
    filter: "blur(18px)",
  };

  if (photos.length === 0) {
    return (
      <div style={wrapperStyle}>
        <div style={glowRingStyle} />
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: accentColor.replace(/[\d.]+\)$/, "0.12)"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PawIcon size={Math.round(size * 0.35)} color={accentColor} />
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <div style={glowRingStyle} />
      <div style={shadowStyle} />
      <img
        src={photos[0]}
        alt={petName}
        crossOrigin="anonymous"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: `4px solid ${accentColor.replace(/[\d.]+\)$/, "0.5)")}`,
          boxShadow: `0 0 30px ${glowColor}`,
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
const TributeShareCard = ({
  petName,
  years,
  excerpt,
  photoUrls,
  shareCardLimit,
  shortCaption,
  tributeUrl,
}: TributeShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [activeStyle, setActiveStyle] = useState(0);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Dynamically scale the native canvas to fit the container
  const updateScale = useCallback(() => {
    if (wrapperRef.current) {
      const containerWidth = wrapperRef.current.offsetWidth;
      const scale = containerWidth / CARD_W;
      wrapperRef.current.style.setProperty("--card-scale", String(scale));
    }
  }, []);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  const availableCount =
    shareCardLimit === -1
      ? CARD_STYLES.length
      : Math.min(shareCardLimit, CARD_STYLES.length);
  const style = CARD_STYLES[activeStyle];
  const quote = extractQuote(excerpt, style.maxWords);
  const bgPhotoUrl = photoUrls[0] || null;
  const shareUrl = tributeUrl || `${BRAND.baseUrl}${window.location.pathname}`;

  const getCanvas = async () => {
    if (!cardRef.current) return null;
    const el = cardRef.current;
    const prevTransform = el.style.transform;
    el.style.transform = "none";
    const canvas = await html2canvas(el, {
      scale: 1,
      useCORS: true,
      backgroundColor: null,
      width: CARD_W,
      height: CARD_H,
    });
    el.style.transform = prevTransform;
    return canvas;
  };

  const handleDownload = async () => {
    setExporting(true);
    try {
      const canvas = await getCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${petName}-memorial-${style.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Share card downloaded!");
    } catch {
      toast.error("Failed to generate card image.");
    } finally {
      setExporting(false);
    }
  };

  const handleCopyCaption = async () => {
    const text = shortCaption || `In Loving Memory of ${petName} — "${quote}" 🐾\n\nRead their full story: ${shareUrl}\n\n#PetMemorial #${petName.replace(/\s+/g, "")} #VellumPet`;
    try {
      await navigator.clipboard.writeText(text);
      setCaptionCopied(true);
      toast.success("Caption copied!");
      setTimeout(() => setCaptionCopied(false), 2500);
    } catch {
      toast.error("Could not copy caption.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleNativeShare = async () => {
    setExporting(true);
    try {
      const canvas = await getCanvas();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${petName}-memorial.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `In Loving Memory of ${petName}`,
            text: shortCaption || quote,
            files: [file],
          });
        } else {
          // Fallback to platform share dropdown
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          toast.info("Image opened — save and share.");
        }
      }, "image/png");
    } catch {
      toast.error("Share cancelled or unavailable.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Style selector */}
      <div className="flex items-center justify-center gap-2">
        {CARD_STYLES.map((s, i) => {
          const locked = i >= availableCount;
          return (
            <button
              key={s.id}
              onClick={() => !locked && setActiveStyle(i)}
              disabled={locked}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                i === activeStyle
                  ? "border-primary bg-primary/10 text-primary"
                  : locked
                    ? "cursor-not-allowed border-border bg-muted/50 text-muted-foreground opacity-60"
                    : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Card preview — scaled canvas (4:5) */}
      <div
        ref={wrapperRef}
        className="mx-auto w-full max-w-[500px] overflow-hidden rounded-xl border border-border shadow-card"
        style={{ aspectRatio: `${CARD_W} / ${CARD_H}`, position: "relative" }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div
            ref={cardRef}
            style={{
              width: CARD_W,
              height: CARD_H,
              transform: "scale(var(--card-scale, 0.4630))",
              transformOrigin: "top left",
              background: style.background,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "120px 100px",
              fontFamily: "'Playfair Display', serif",
              position: "relative",
              overflow: "hidden",
              gap: 40,
            }}
          >
            {/* Grain texture overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.035,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "128px 128px",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            {/* Vignette edges */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, transparent 55%, hsla(0,0%,0%,0.08) 100%)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            {/* Radial glow behind photo area */}
            <div
              style={{
                position: "absolute",
                top: "18%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 600,
                height: 600,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${style.glowColor}, transparent 70%)`,
                filter: "blur(40px)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Background photo overlay */}
            {bgPhotoUrl && (
              <>
                <img
                  src={bgPhotoUrl}
                  alt=""
                  crossOrigin="anonymous"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: style.id === "story" ? 0.08 : 0.1,
                    filter: "blur(10px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: style.background,
                    opacity: 0.85,
                  }}
                />
              </>
            )}

            {/* Decorative border */}
            <div
              style={{
                position: "absolute",
                top: 44,
                left: 44,
                right: 44,
                bottom: 44,
                border: `1.5px solid ${style.borderColor}`,
                borderRadius: 24,
                pointerEvents: "none",
                zIndex: 3,
              }}
            />

            {/* Photo with glow ring */}
            {renderPhoto(photoUrls, petName, style.photoSize * 2, style.accentColor, style.glowColor)}

            {/* Pet name */}
            <div
              style={{
                fontSize: style.nameFontSize * 2,
                fontWeight: 700,
                color: style.nameColor,
                textAlign: "center",
                lineHeight: 1.1,
                position: "relative",
                zIndex: 3,
                letterSpacing: "0.02em",
              }}
            >
              {petName}
            </div>

            {/* Years */}
            {style.showYears && years && (
              <div
                style={{
                  fontSize: 28,
                  color: style.yearsColor,
                  fontFamily: "'Source Sans 3', sans-serif",
                  letterSpacing: "0.15em",
                  position: "relative",
                  zIndex: 3,
                  marginTop: -24,
                  fontWeight: 300,
                }}
              >
                {years}
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                width: 80,
                height: 3,
                background: style.accentColor,
                borderRadius: 2,
                position: "relative",
                zIndex: 3,
              }}
            />

            {/* Quote */}
            <div
              style={{
                fontSize: style.quoteFontSize * 2,
                lineHeight: 1.85,
                color: style.textColor,
                textAlign: "center",
                maxWidth: 760,
                fontFamily: "'Source Sans 3', sans-serif",
                fontStyle: style.quoteStyle,
                position: "relative",
                zIndex: 3,
              }}
            >
              "{quote}"
            </div>

            {/* Footer — growth loop CTA */}
            <div
              style={{
                position: "absolute",
                bottom: 56,
                fontSize: 22,
                color: style.footerColor,
                fontFamily: "'Source Sans 3', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                zIndex: 3,
                opacity: 0.65,
              }}
            >
              <span style={{ letterSpacing: "0.04em" }}>Read their full story</span>
              <span style={{ fontSize: 18, opacity: 0.7 }}>vellumpet.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button size="sm" onClick={handleDownload} disabled={exporting}>
          <Download className="mr-1.5 h-4 w-4" /> Download
        </Button>

        {typeof navigator !== "undefined" && navigator.share && (
          <Button variant="outline" size="sm" onClick={handleNativeShare} disabled={exporting}>
            <Share2 className="mr-1.5 h-4 w-4" /> Share
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={handleCopyCaption}>
          {captionCopied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {captionCopied ? "Copied!" : "Copy Caption"}
        </Button>

        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {linkCopied ? <Check className="mr-1.5 h-4 w-4" /> : <Link className="mr-1.5 h-4 w-4" />}
          {linkCopied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
};

export default TributeShareCard;
