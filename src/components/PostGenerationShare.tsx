import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

interface PostGenerationShareProps {
  petName: string;
  slug?: string;
  onViewTribute: () => void;
}

export default function PostGenerationShare({ petName, slug, onViewTribute }: PostGenerationShareProps) {
  const [copied, setCopied] = useState(false);

  const memorialUrl = slug ? `${BRAND.baseUrl}/memorial/${slug}` : null;

  const handleCopy = async () => {
    if (!memorialUrl) return;
    await navigator.clipboard.writeText(memorialUrl);
    setCopied(true);
    toast.success("Link copied — ready to share ❤️");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsApp = () => {
    if (!memorialUrl) return;
    const text = `I created this tribute for ${petName}. I thought you'd like to see it ❤️ ${memorialUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const handleFacebook = () => {
    if (!memorialUrl) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memorialUrl)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8 rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10"
    >
      <Heart className="mx-auto mb-4 h-8 w-8 text-primary/70" />

      <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
        Your tribute for {petName} is ready
      </h2>

      <p className="mx-auto mt-3 max-w-md font-display text-sm italic leading-relaxed text-muted-foreground">
        {petName} filled your life with love — now let others remember {petName.toLowerCase()} too.
      </p>

      <div className="mt-6">
        <Button size="lg" onClick={onViewTribute}>
          View Tribute
        </Button>
      </div>

      {memorialUrl && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-4 text-sm font-medium text-foreground">
            Share with family and friends
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp}>
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={handleFacebook}>
              Facebook
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Many pet owners share this with close family
          </p>
        </div>
      )}
    </motion.div>
  );
}
