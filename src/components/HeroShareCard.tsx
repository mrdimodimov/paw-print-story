import { PawPrint, Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HeroShareCardProps {
  petName: string;
  years?: string;
  quote: string;
  photoUrl?: string;
  onShare?: () => void;
}

const HeroShareCard = ({ petName, years, quote, photoUrl, onShare }: HeroShareCardProps) => {
  const [copied, setCopied] = useState(false);

  const displayQuote = quote.length > 140 ? quote.slice(0, 140).trim() + "…" : quote;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`"${displayQuote}" — In loving memory of ${petName}`);
      setCopied(true);
      toast.success("Quote copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="mb-8 flex flex-col items-center">
      {/* The keepsake card */}
      <div
        className="w-full max-w-[420px] rounded-2xl border border-border/60 p-8 text-center shadow-card"
        style={{
          background: "linear-gradient(160deg, hsl(var(--card)), hsl(var(--accent) / 0.3), hsl(var(--card)))",
        }}
      >
        {/* Pet photo */}
        {photoUrl ? (
          <div className="mx-auto mb-5 h-24 w-24 overflow-hidden rounded-full border-[3px] border-accent shadow-soft">
            <img
              src={photoUrl}
              alt={`${petName} memorial`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-accent/30">
            <PawPrint className="h-10 w-10 text-primary/60" />
          </div>
        )}

        {/* Pet name */}
        <h3 className="font-display text-2xl font-bold text-foreground">{petName}</h3>

        {/* Years */}
        {years && (
          <p className="mt-1 text-sm italic text-muted-foreground">{years}</p>
        )}

        {/* Divider */}
        <div className="mx-auto my-5 h-px w-12 bg-primary/25" />

        {/* Quote */}
        <p className="mx-auto max-w-[320px] font-body text-sm italic leading-relaxed text-foreground/80">
          "{displayQuote}"
        </p>

        {/* Subtle branding */}
        <p className="mt-6 text-[9px] tracking-widest text-muted-foreground/40">
          🐾 vellumpet.com
        </p>
      </div>

      {/* Micro CTA */}
      <p className="mt-5 font-display text-sm text-muted-foreground">
        Share their memory
      </p>
      <div className="mt-2.5 flex items-center gap-2.5">
        <Button variant="outline" size="sm" onClick={handleCopyText}>
          {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy text"}
        </Button>
        {onShare && (
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="mr-1 h-3.5 w-3.5" /> Share
          </Button>
        )}
      </div>
    </div>
  );
};

export default HeroShareCard;
