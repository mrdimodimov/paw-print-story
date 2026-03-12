import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2, PawPrint, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  overlayGradient?: string;
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
  photoUrl?: string;
  shareCardLimit: number; // -1 = unlimited
}

function extractQuote(text: string): string {
  // Pick the best 1-2 sentence quote from the text
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  // Skip very short sentences, prefer ones 8-25 words
  const scored = sentences.map((s) => {
    const words = s.trim().split(/\s+/).length;
    const score = words >= 8 && words <= 25 ? words : words > 25 ? 10 : words;
    return { s: s.trim(), score };
  });
  scored.sort((a, b) => b.score - a.score);
  // Take top 1-2 sentences that fit ~30 words
  let quote = scored[0]?.s || text;
  if (scored[1] && (quote.split(/\s+/).length + scored[1].s.split(/\s+/).length) <= 35) {
    quote += " " + scored[1].s;
  }
  return quote;
}

const TributeShareCard = ({ petName, years, excerpt, photoUrl, shareCardLimit }: TributeShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(0);

  const availableCount = shareCardLimit === -1 ? TEMPLATES.length : Math.min(shareCardLimit, TEMPLATES.length);
  const quote = extractQuote(excerpt);
  const shortQuote = quote.split(/\s+/).slice(0, 30).join(" ") + (quote.split(/\s+/).length > 30 ? "…" : "");
  const tmpl = TEMPLATES[activeTemplate];

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

  const handleShare = async () => {
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
            text: shortQuote,
            files: [file],
          });
        } else {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          toast.info("Image opened in new tab — save and share on social media.");
        }
        setExporting(false);
      }, "image/png");
    } catch {
      toast.error("Sharing failed.");
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
          <Button
            variant="ghost"
            size="icon"
            onClick={prevTemplate}
            disabled={availableCount <= 1}
            className="h-8 w-8"
          >
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

          <Button
            variant="ghost"
            size="icon"
            onClick={nextTemplate}
            disabled={availableCount <= 1}
            className="h-8 w-8"
          >
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
          {photoUrl && (
            <>
              <img
                src={photoUrl}
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

          {/* Pet photo or paw icon */}
          {photoUrl ? (
            <img
              src={photoUrl}
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
          ) : (
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
          )}

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
            🐾 Created with TributePaw
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={handleDownload} disabled={exporting}>
          <Download className="mr-1 h-4 w-4" /> Download Share Card
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} disabled={exporting}>
          <Share2 className="mr-1 h-4 w-4" /> Share on Social
        </Button>
      </div>
    </div>
  );
};

export default TributeShareCard;
