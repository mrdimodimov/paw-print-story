import { useRef, useState, useEffect, useCallback } from "react";
import { BRAND } from "@/lib/brand";
import html2canvas from "html2canvas";
import { Download, Share2, PawPrint, Facebook, Twitter, Mail, MessageCircle, Send } from "lucide-react";
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
    maxWords: 18,
    background: "linear-gradient(160deg, hsl(0,0%,98%), hsl(0,0%,94%))",
    borderColor: "hsla(0,0%,70%,0.2)",
    nameColor: "hsl(0,0%,12%)",
    yearsColor: "hsl(0,0%,50%)",
    textColor: "hsl(0,0%,20%)",
    footerColor: "hsl(0,0%,55%)",
    accentColor: "hsla(30,40%,55%,0.35)",
    photoSize: 180,
    nameFontSize: 36,
    quoteFontSize: 20,
    showYears: true,
    quoteStyle: "italic",
  },
  {
    id: "story",
    label: "Story",
    maxWords: 30,
    background: "linear-gradient(160deg, hsl(220,25%,18%), hsl(225,20%,25%), hsl(215,22%,20%))",
    borderColor: "hsla(210,40%,70%,0.15)",
    nameColor: "hsl(40,40%,92%)",
    yearsColor: "hsla(40,30%,80%,0.6)",
    textColor: "hsl(210,20%,85%)",
    footerColor: "hsla(210,20%,70%,0.5)",
    accentColor: "hsla(40,50%,65%,0.4)",
    photoSize: 140,
    nameFontSize: 32,
    quoteFontSize: 18,
    showYears: false,
    quoteStyle: "normal",
  },
  {
    id: "classic",
    label: "Classic",
    maxWords: 30,
    background: "linear-gradient(160deg, hsl(40,33%,97%), hsl(32,60%,88%), hsl(35,30%,92%))",
    borderColor: "hsla(32,80%,50%,0.25)",
    nameColor: "hsl(30,10%,15%)",
    yearsColor: "hsl(30,8%,50%)",
    textColor: "hsl(30,10%,15%)",
    footerColor: "hsl(30,8%,50%)",
    accentColor: "hsla(32,80%,50%,0.4)",
    photoSize: 160,
    nameFontSize: 36,
    quoteFontSize: 18,
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

    // Action bonus
    if (ACTION_WORDS.test(trimmed)) score += 2;
    // Routine bonus
    if (ROUTINE_WORDS.test(trimmed)) score += 2;
    // Short sentence bonus
    if (words <= 20) score += 1;
    // Emotional word bonus
    if (EMOTIONAL_WORDS.test(trimmed)) score += 1;
    // Length penalty
    if (words > 30) score -= 2;
    // Sweet spot bonus
    if (words >= 8 && words <= 20) score += 2;

    return { s: trimmed, score, words };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick top sentence; optionally combine with second if both fit
  let quote = scored[0]?.s || text;
  const topWords = quote.split(/\s+/).length;
  if (scored[1] && topWords + scored[1].words <= maxWords) {
    quote += " " + scored[1].s;
  }

  // Trim to max words
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
  accentColor: string
) {
  if (photos.length === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: accentColor.replace(/[\d.]+\)$/, "0.15)"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <PawPrint style={{ width: size * 0.4, height: size * 0.4, color: accentColor }} />
      </div>
    );
  }

  return (
    <img
      src={photos[0]}
      alt={petName}
      crossOrigin="anonymous"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: `3px solid ${accentColor}`,
        position: "relative",
        zIndex: 1,
      }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────
const TributeShareCard = ({
  petName,
  years,
  excerpt,
  photoUrls,
  shareCardLimit,
}: TributeShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [activeStyle, setActiveStyle] = useState(0);

  // Dynamically scale the 1080px canvas to fit the container
  const updateScale = useCallback(() => {
    if (wrapperRef.current) {
      const containerWidth = wrapperRef.current.offsetWidth;
      const scale = containerWidth / 1080;
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

  const getCanvas = async () => {
    if (!cardRef.current) return null;
    // Temporarily remove CSS scale for accurate capture at native 1080x1080
    const el = cardRef.current;
    const prevTransform = el.style.transform;
    el.style.transform = "none";
    const canvas = await html2canvas(el, {
      scale: 1,
      useCORS: true,
      backgroundColor: null,
      width: 1080,
      height: 1080,
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

  const getShareText = () =>
    `In Loving Memory of ${petName} — "${quote}" 🐾 Created with ${BRAND.name} • ${BRAND.baseUrl}`;

  const handlePlatformShare = async (platform: string) => {
    setExporting(true);
    const rawUrl = `${BRAND.baseUrl}${window.location.pathname}`;
    const encodedUrl = encodeURIComponent(rawUrl);
    const shareText = getShareText();
    const encodedText = encodeURIComponent(shareText);
    const encodedSubject = encodeURIComponent(`In Loving Memory of ${petName}`);

    try {
      let opened = false;

      switch (platform) {
        case "facebook":
          opened = !!window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            "_blank",
            "noopener,noreferrer,width=600,height=500"
          );
          break;
        case "twitter":
          opened = !!window.open(
            `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            "_blank",
            "noopener,noreferrer,width=600,height=500"
          );
          break;
        case "whatsapp": {
          const waText = encodeURIComponent(`${shareText}\n${rawUrl}`);
          opened = !!window.open(
            `https://wa.me/?text=${waText}`,
            "_blank",
            "noopener,noreferrer,width=600,height=500"
          );
          break;
        }
        case "messenger":
          opened = !!window.open(
            `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=${encodeURIComponent(FACEBOOK_APP_ID)}&redirect_uri=${encodedUrl}`,
            "_blank",
            "noopener,noreferrer,width=600,height=500"
          );
          break;
        case "pinterest": {
          const mediaUrl = photoUrls[0] ? encodeURIComponent(photoUrls[0]) : "";
          opened = !!window.open(
            `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${mediaUrl}&description=${encodedText}`,
            "_blank",
            "noopener,noreferrer,width=600,height=500"
          );
          break;
        }
        case "email":
          window.location.href = `mailto:?subject=${encodedSubject}&body=${encodedText}%0A%0A${encodedUrl}`;
          opened = true;
          break;
        case "instagram":
          await handleDownload();
          toast.info("Image downloaded — open Instagram and share from your gallery.");
          return;
        case "native": {
          const canvas = await getCanvas();
          if (!canvas) break;
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `${petName}-memorial.png`, { type: "image/png" });
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ title: `In Loving Memory of ${petName}`, text: quote, files: [file] });
            } else {
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
              toast.info("Image opened in new tab — save and share.");
            }
          }, "image/png");
          return;
        }
      }

      if (opened) {
        toast.success(`Opening ${platform}…`);
      } else {
        toast.error("Unable to share directly. Please download your card and share manually.");
      }
    } catch {
      toast.error("Unable to share directly. Please download your card and share manually.");
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

      {/* Card preview — scaled canvas */}
      <div ref={wrapperRef} className="mx-auto w-full max-w-[500px] overflow-hidden rounded-xl border border-border shadow-card" style={{ aspectRatio: "1 / 1", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div
            ref={cardRef}
            style={{
              width: 1080,
              height: 1080,
              transform: "scale(var(--card-scale, 0.4630))",
              transformOrigin: "top left",
              background: style.background,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "112px 96px",
              fontFamily: "'Playfair Display', serif",
              position: "relative",
              overflow: "hidden",
              gap: 36,
            }}
          >
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
                    opacity: style.id === "story" ? 0.1 : 0.12,
                    filter: "blur(8px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: style.background,
                    opacity: 0.82,
                  }}
                />
              </>
            )}

            {/* Decorative border */}
            <div
              style={{
                position: "absolute",
                top: 40,
                left: 40,
                right: 40,
                bottom: 40,
                border: `2px solid ${style.borderColor}`,
                borderRadius: 28,
                pointerEvents: "none",
              }}
            />

            {/* Photo */}
            {renderPhoto(photoUrls, petName, style.photoSize * 2, style.accentColor)}

            {/* Pet name */}
            <div
              style={{
                fontSize: style.nameFontSize * 2,
                fontWeight: 700,
                color: style.nameColor,
                textAlign: "center",
                lineHeight: 1.15,
                position: "relative",
                zIndex: 1,
                letterSpacing: "0.01em",
              }}
            >
              {petName}
            </div>

            {/* Years */}
            {style.showYears && years && (
              <div
                style={{
                  fontSize: 30,
                  color: style.yearsColor,
                  fontStyle: "italic",
                  fontFamily: "'Source Sans 3', sans-serif",
                  position: "relative",
                  zIndex: 1,
                  marginTop: -20,
                }}
              >
                {years}
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                width: 88,
                height: 4,
                background: style.accentColor,
                borderRadius: 2,
                position: "relative",
                zIndex: 1,
              }}
            />

            {/* Quote */}
            <div
              style={{
                fontSize: style.quoteFontSize * 2,
                lineHeight: 1.75,
                color: style.textColor,
                textAlign: "center",
                maxWidth: 800,
                fontFamily: "'Source Sans 3', sans-serif",
                fontStyle: style.quoteStyle,
                position: "relative",
                zIndex: 1,
              }}
            >
              "{quote}"
            </div>

            {/* Footer */}
            <div
              style={{
                position: "absolute",
                bottom: 52,
                fontSize: 20,
                color: style.footerColor,
                fontFamily: "'Source Sans 3', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                zIndex: 1,
                opacity: 0.7,
              }}
            >
              <span>🐾 Created with {BRAND.name}</span>
              <span style={{ fontSize: 18 }}>vellumpet.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={handleDownload} disabled={exporting}>
          <Download className="mr-1 h-4 w-4" /> Download
        </Button>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={exporting}>
                      <Share2 className="mr-1 h-4 w-4" /> Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handlePlatformShare("facebook")}>
                      <Facebook className="mr-2 h-4 w-4 text-[hsl(220,46%,48%)]" /> Facebook
                    </DropdownMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem onClick={() => handlePlatformShare("instagram")}>
                          <svg className="mr-2 h-4 w-4 text-[hsl(330,70%,50%)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
                          Instagram
                          <span className="ml-auto text-[10px] text-muted-foreground">Download</span>
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px] text-center text-xs">
                        Instagram sharing downloads the card for you to post.
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuItem onClick={() => handlePlatformShare("whatsapp")}>
                      <MessageCircle className="mr-2 h-4 w-4 text-[hsl(142,70%,40%)]" /> WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlatformShare("messenger")}>
                      <Send className="mr-2 h-4 w-4 text-[hsl(214,89%,52%)]" /> Messenger
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlatformShare("twitter")}>
                      <Twitter className="mr-2 h-4 w-4" /> X (Twitter)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlatformShare("email")}>
                      <Mail className="mr-2 h-4 w-4" /> Email
                    </DropdownMenuItem>
                    {typeof navigator !== "undefined" && navigator.share && (
                      <DropdownMenuItem onClick={() => handlePlatformShare("native")}>
                        <Share2 className="mr-2 h-4 w-4" /> More options…
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-center">
              Share this card on your favorite platform.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TributeShareCard;
