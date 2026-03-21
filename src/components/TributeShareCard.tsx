import { useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import html2canvas from "html2canvas";
import { Download, Share2, PawPrint, ChevronLeft, ChevronRight, Lock, Facebook, Twitter, Mail, MessageCircle, Send } from "lucide-react";
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

// Facebook App ID for Messenger sharing — replace with your own app ID when available
const FACEBOOK_APP_ID = "";

type TemplateId = "classic" | "modern" | "botanical";

interface TemplateConfig {
  id: TemplateId;
  label: string;
  background: string;
  borderColor: string;
  nameColor: string;
  yearsColor: string;
  textColor: string;
  footerColor: string;
  accentColor: string;
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: "classic",
    label: "Classic Warmth",
    background: "linear-gradient(160deg, hsl(40,33%,97%), hsl(32,60%,88%), hsl(35,30%,92%))",
    borderColor: "hsla(32,80%,50%,0.25)",
    nameColor: "hsl(30,10%,15%)",
    yearsColor: "hsl(30,8%,50%)",
    textColor: "hsl(30,10%,15%)",
    footerColor: "hsl(30,8%,50%)",
    accentColor: "hsla(32,80%,50%,0.4)",
  },
  {
    id: "modern",
    label: "Midnight Calm",
    background: "linear-gradient(160deg, hsl(220,25%,18%), hsl(225,20%,25%), hsl(215,22%,20%))",
    borderColor: "hsla(210,40%,70%,0.2)",
    nameColor: "hsl(40,40%,92%)",
    yearsColor: "hsla(40,30%,80%,0.7)",
    textColor: "hsl(210,20%,85%)",
    footerColor: "hsla(210,20%,70%,0.6)",
    accentColor: "hsla(40,50%,65%,0.5)",
  },
  {
    id: "botanical",
    label: "Soft Garden",
    background: "linear-gradient(160deg, hsl(140,20%,95%), hsl(120,18%,88%), hsl(90,15%,92%))",
    borderColor: "hsla(140,30%,50%,0.2)",
    nameColor: "hsl(150,15%,18%)",
    yearsColor: "hsl(140,10%,45%)",
    textColor: "hsl(150,10%,20%)",
    footerColor: "hsl(140,10%,50%)",
    accentColor: "hsla(140,35%,45%,0.35)",
  },
];

interface TributeShareCardProps {
  petName: string;
  years: string;
  excerpt: string;
  photoUrls: string[];
  shareCardLimit: number;
}

function extractQuote(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  // Score by emotional weight: prefer 8-20 word sentences
  const scored = sentences.map((s) => {
    const trimmed = s.trim();
    const words = trimmed.split(/\s+/).length;
    const score = words >= 8 && words <= 20 ? words + 5 : words > 20 ? 8 : words;
    return { s: trimmed, score };
  });
  scored.sort((a, b) => b.score - a.score);
  // Return single strongest sentence — keeps quote to max 2 lines on the card
  return scored[0]?.s || text;
}

// Photo layout configurations for different counts
function renderPhotos(photos: string[], tmpl: TemplateConfig, petName: string) {
  if (photos.length === 0) {
    // Paw icon fallback
    return (
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: tmpl.accentColor.replace(/[\d.]+\)$/, "0.15)"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
          position: "relative",
          zIndex: 1,
        }}
      >
        <PawPrint style={{ width: 40, height: 40, color: tmpl.accentColor }} />
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <img
        src={photos[0]}
        alt={petName}
        crossOrigin="anonymous"
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          border: `3px solid ${tmpl.accentColor}`,
          marginBottom: 18,
          position: "relative",
          zIndex: 1,
        }}
      />
    );
  }

  if (photos.length <= 3) {
    // Elegant collage: overlapping circles
    const size = photos.length === 2 ? 90 : 75;
    const overlap = photos.length === 2 ? -15 : -12;
    const totalWidth = photos.length * size + (photos.length - 1) * overlap;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
          position: "relative",
          zIndex: 1,
          width: totalWidth,
        }}
      >
        {photos.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${petName} ${i + 1}`}
            crossOrigin="anonymous"
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              objectFit: "cover",
              border: `3px solid ${tmpl.accentColor}`,
              marginLeft: i === 0 ? 0 : overlap,
              position: "relative",
              zIndex: photos.length - i,
            }}
          />
        ))}
      </div>
    );
  }

  // 4-5 photos: featured large + small row
  const featured = photos[0];
  const rest = photos.slice(1);
  const smallSize = 55;
  const smallOverlap = -8;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 14,
        position: "relative",
        zIndex: 1,
        gap: 8,
      }}
    >
      <img
        src={featured}
        alt={petName}
        crossOrigin="anonymous"
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          objectFit: "cover",
          border: `3px solid ${tmpl.accentColor}`,
        }}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        {rest.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${petName} ${i + 2}`}
            crossOrigin="anonymous"
            style={{
              width: smallSize,
              height: smallSize,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${tmpl.accentColor}`,
              marginLeft: i === 0 ? 0 : smallOverlap,
              position: "relative",
              zIndex: rest.length - i,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const TributeShareCard = ({ petName, years, excerpt, photoUrls, shareCardLimit }: TributeShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(0);

  const availableCount = shareCardLimit === -1 ? TEMPLATES.length : Math.min(shareCardLimit, TEMPLATES.length);
  const quote = extractQuote(excerpt);
  // Limit to ~20 words max for 2-line visual fit
  const shortQuote = quote.split(/\s+/).slice(0, 20).join(" ") + (quote.split(/\s+/).length > 20 ? "…" : "");
  const tmpl = TEMPLATES[activeTemplate];

  // Use background overlay from first photo if available
  const bgPhotoUrl = photoUrls[0] || null;

  const getCanvas = async () => {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
  };

  const handleDownload = async () => {
    setExporting(true);
    try {
      const canvas = await getCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${petName}-memorial-card-${tmpl.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Share card downloaded!");
    } catch {
      toast.error("Failed to generate card image.");
    } finally {
      setExporting(false);
    }
  };

  const getShareText = () => `In Loving Memory of ${petName} — "${shortQuote}" 🐾 Created with ${BRAND.name}`;




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
          // Use the first photo URL if available (data URIs won't work on Pinterest)
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
          return; // early return, skip success toast

        case "native": {
          const canvas = await getCanvas();
          if (!canvas) break;
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `${petName}-memorial.png`, { type: "image/png" });
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ title: `In Loving Memory of ${petName}`, text: shortQuote, files: [file] });
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

  const prevTemplate = () => setActiveTemplate((i) => (i - 1 + availableCount) % availableCount);
  const nextTemplate = () => setActiveTemplate((i) => (i + 1) % availableCount);

  return (
    <div className="space-y-5">
      {/* Template selector */}
      {TEMPLATES.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="icon" onClick={prevTemplate} disabled={availableCount <= 1} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-2">
            {TEMPLATES.map((t, i) => {
              const locked = i >= availableCount;
              return (
                <button
                  key={t.id}
                  onClick={() => !locked && setActiveTemplate(i)}
                  disabled={locked}
                  className={`relative rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    i === activeTemplate
                      ? "border-primary bg-primary/10 text-primary"
                      : locked
                        ? "cursor-not-allowed border-border bg-muted/50 text-muted-foreground opacity-60"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {locked && <Lock className="mr-1 inline h-3 w-3" />}
                  {t.label}
                </button>
              );
            })}
          </div>

          <Button variant="ghost" size="icon" onClick={nextTemplate} disabled={availableCount <= 1} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Card preview */}
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border shadow-card">
        <div
          ref={cardRef}
          style={{
            width: 540,
            height: 540,
            background: tmpl.background,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            fontFamily: "'Playfair Display', serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Photo background overlay */}
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
                  opacity: 0.15,
                  filter: "blur(2px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: tmpl.background,
                  opacity: 0.8,
                }}
              />
            </>
          )}

          {/* Decorative border */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              bottom: 16,
              border: `1px solid ${tmpl.borderColor}`,
              borderRadius: 12,
              pointerEvents: "none",
            }}
          />

          {/* Photo(s) */}
          {renderPhotos(photoUrls, tmpl, petName)}

          {/* Pet name */}
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: tmpl.nameColor,
              textAlign: "center",
              lineHeight: 1.2,
              position: "relative",
              zIndex: 1,
            }}
          >
            {petName}
          </div>

          {/* Years */}
          {years && (
            <div
              style={{
                fontSize: 13,
                color: tmpl.yearsColor,
                marginTop: 4,
                fontStyle: "italic",
                fontFamily: "'Source Sans 3', sans-serif",
                position: "relative",
                zIndex: 1,
              }}
            >
              {years}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              width: 50,
              height: 2,
              background: tmpl.accentColor,
              borderRadius: 1,
              margin: "14px 0",
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* Quote */}
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.65,
              color: tmpl.textColor,
              textAlign: "center",
              maxWidth: 380,
              fontFamily: "'Source Sans 3', sans-serif",
              fontStyle: "italic",
              position: "relative",
              zIndex: 1,
            }}
          >
            "{shortQuote}"
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 22,
              fontSize: 9,
              color: tmpl.footerColor,
              fontFamily: "'Source Sans 3', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 4,
              zIndex: 1,
            }}
          >
            🐾 Created with {BRAND.name}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={handleDownload} disabled={exporting}>
          <Download className="mr-1 h-4 w-4" /> Download Share Card
        </Button>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={exporting}>
                      <Share2 className="mr-1 h-4 w-4" /> Share Tribute
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
                        Instagram sharing is only available via download. We'll save the card for you to post.
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenuItem onClick={() => handlePlatformShare("whatsapp")}>
                      <MessageCircle className="mr-2 h-4 w-4 text-[hsl(142,70%,40%)]" /> WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlatformShare("messenger")}>
                      <Send className="mr-2 h-4 w-4 text-[hsl(214,89%,52%)]" /> Messenger
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlatformShare("pinterest")}>
                      <svg className="mr-2 h-4 w-4 text-[hsl(0,78%,51%)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.15 9.42 7.6 11.18-.1-.95-.19-2.41.04-3.45.21-.94 1.36-5.76 1.36-5.76s-.35-.7-.35-1.72c0-1.61.94-2.82 2.1-2.82.99 0 1.47.74 1.47 1.64 0 1-.64 2.49-.97 3.88-.27 1.16.58 2.1 1.72 2.1 2.07 0 3.66-2.18 3.66-5.33 0-2.79-2-4.74-4.87-4.74-3.32 0-5.27 2.49-5.27 5.06 0 1 .39 2.08.87 2.66.1.12.11.22.08.34-.09.37-.29 1.16-.33 1.32-.05.22-.18.26-.41.16-1.52-.71-2.47-2.93-2.47-4.72 0-3.84 2.79-7.37 8.04-7.37 4.22 0 7.5 3.01 7.5 7.02 0 4.19-2.64 7.57-6.32 7.57-1.23 0-2.39-.64-2.79-1.4l-.76 2.89c-.27 1.06-1.01 2.39-1.5 3.2A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      Pinterest
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
              Share this tribute directly to your favorite social platform. Friends will see it and {BRAND.name} attribution.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TributeShareCard;
