import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TributeShareCardProps {
  petName: string;
  years: string;
  excerpt: string;
  photoUrl?: string;
}

const TributeShareCard = ({ petName, years, excerpt, photoUrl }: TributeShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

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
      link.download = `${petName}-tribute-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Card downloaded!");
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
        const file = new File([blob], `${petName}-tribute.png`, { type: "image/png" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `In Loving Memory of ${petName}`,
            text: excerpt,
            files: [file],
          });
        } else {
          // Fallback: copy image to clipboard or open in new tab
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

  // Truncate excerpt to ~30 words for card
  const shortExcerpt = excerpt.split(/\s+/).slice(0, 30).join(" ") + (excerpt.split(/\s+/).length > 30 ? "…" : "");

  return (
    <div className="space-y-4">
      {/* The actual card — 1080x1080 logical, scaled down for preview */}
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border shadow-card">
        <div
          ref={cardRef}
          style={{
            width: 540,
            height: 540,
            background: "linear-gradient(160deg, hsl(40,33%,97%), hsl(32,60%,88%), hsl(35,30%,92%))",
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
          {/* Decorative corner accents */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              bottom: 16,
              border: "1px solid hsla(32,80%,50%,0.25)",
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
                width: 140,
                height: 140,
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid hsla(32,80%,50%,0.4)",
                marginBottom: 20,
              }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "hsla(32,80%,50%,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <PawPrint style={{ width: 44, height: 44, color: "hsl(32,80%,50%)" }} />
            </div>
          )}

          {/* Pet name */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "hsl(30,10%,15%)",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {petName}
          </div>

          {/* Years */}
          {years && (
            <div
              style={{
                fontSize: 14,
                color: "hsl(30,8%,50%)",
                marginTop: 4,
                fontStyle: "italic",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {years}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              width: 60,
              height: 2,
              background: "hsla(32,80%,50%,0.4)",
              borderRadius: 1,
              margin: "16px 0",
            }}
          />

          {/* Excerpt */}
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "hsl(30,10%,15%)",
              textAlign: "center",
              maxWidth: 400,
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            {shortExcerpt}
          </div>

          {/* Branding */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              fontSize: 10,
              color: "hsl(30,8%,50%)",
              fontFamily: "'Source Sans 3', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            🐾 TributePaw
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={handleDownload} disabled={exporting}>
          <Download className="mr-1 h-4 w-4" /> Download Card
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} disabled={exporting}>
          <Share2 className="mr-1 h-4 w-4" /> Share on Social Media
        </Button>
      </div>
    </div>
  );
};

export default TributeShareCard;
