import PawIcon from "@/components/PawIcon";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Check, Copy, RefreshCw, ImagePlus, Pencil,
  Share2, MessageCircle, Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

interface TributePreview {
  pet_name: string;
  story: string;
  photo_urls: string[];
  tier_id: string;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const slug = searchParams.get("slug");
  const tributeId = searchParams.get("id");

  const [verifying, setVerifying] = useState(true);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resolvedTributeId, setResolvedTributeId] = useState(tributeId || "");
  const [resolvedSlug, setResolvedSlug] = useState(slug || "");
  const [preview, setPreview] = useState<TributePreview | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });

        if (error) throw error;

        if (data?.paid) {
          setPaid(true);
          const tid = data.tributeId || tributeId;
          if (tid) setResolvedTributeId(tid);

          // Resolve slug + preview data
          if (tid) {
            const { data: pt } = await supabase
              .from("public_tributes")
              .select("pet_name, story, photo_urls, tier_id, slug")
              .eq("tribute_id", tid)
              .maybeSingle();

            if (pt) {
              if (pt.slug) setResolvedSlug(pt.slug);
              setPreview({
                pet_name: pt.pet_name,
                story: pt.story,
                photo_urls: pt.photo_urls || [],
                tier_id: pt.tier_id,
              });
            } else if (!slug) {
              const { data: tribute } = await supabase
                .from("tributes")
                .select("slug")
                .eq("id", tid)
                .single();
              if (tribute?.slug) setResolvedSlug(tribute.slug);
            }
          }
        } else {
          toast.error(data?.error || "Payment could not be verified.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("Could not verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [sessionId, slug, tributeId, navigate]);

  const memorialUrl = resolvedSlug
    ? `${window.location.origin}/memorial/${resolvedSlug}`
    : `${window.location.origin}/tribute/${resolvedTributeId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(memorialUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewPage = () => {
    if (resolvedSlug) {
      navigate(`/memorial/${resolvedSlug}`);
    } else {
      navigate(`/tribute/${resolvedTributeId}`);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `💛 A memorial for ${preview?.pet_name || "a beloved pet"}: ${memorialUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(
      `💛 Remembering ${preview?.pet_name || "a beloved pet"}`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(memorialUrl)}`,
      "_blank"
    );
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6 rounded-full bg-accent p-6"
        >
          <PawIcon className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-foreground">Verifying your payment…</p>
        <p className="mt-2 text-sm text-muted-foreground">This will only take a moment.</p>
      </div>
    );
  }

  if (!paid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10">
          <PawIcon className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h1 className="font-display text-xl font-semibold text-foreground">
            Payment not confirmed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If you completed the payment, it may take a moment to process. If the issue persists, please contact support.
          </p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const storyExcerpt = preview?.story
    ? preview.story.length > 200
      ? preview.story.slice(0, 200) + "…"
      : preview.story
    : null;

  const heroPhoto = preview?.photo_urls?.[0];

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-12 md:py-20">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-8"
      >
        {/* Success header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent"
          >
            <PawIcon className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {preview?.pet_name
              ? `${preview.pet_name}'s memorial is ready`
              : "Your memorial is ready"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your tribute is now live. Here's everything you can do with it.
          </p>
        </div>

        {/* Preview card */}
        {(heroPhoto || storyExcerpt) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            {heroPhoto && (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={heroPhoto}
                  alt={preview?.pet_name || "Pet photo"}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {storyExcerpt && (
              <div className="p-5">
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  "{storyExcerpt}"
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Section: Your memorial */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            Your memorial
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleViewPage}
            >
              <Globe className="h-4 w-4" /> View Tribute
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() =>
                navigate(
                  resolvedSlug
                    ? `/tribute/s/${resolvedSlug}`
                    : `/tribute/${resolvedTributeId}`
                )
              }
            >
              <Pencil className="h-4 w-4" /> Edit Story
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => {
                const base = resolvedSlug
                  ? `/tribute/s/${resolvedSlug}`
                  : `/tribute/${resolvedTributeId}`;
                navigate(`${base}?action=regenerate`);
              }}
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => {
                const base = resolvedSlug
                  ? `/tribute/s/${resolvedSlug}`
                  : `/tribute/${resolvedTributeId}`;
                navigate(`${base}?action=photos`);
              }}
            >
              <ImagePlus className="h-4 w-4" /> Add Photos
            </Button>
          </div>
        </motion.div>

        {/* Section: Share with others */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="mb-1 font-display text-lg font-semibold text-foreground">
            Share with others
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Let friends and family visit, react, and leave their own memories.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleCopyLink}
            >
              {copied ? (
                <><Check className="h-4 w-4" /> Copied!</>
              ) : (
                <><Copy className="h-4 w-4" /> Copy Link</>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
              onClick={handleTwitter}
            >
              <Twitter className="h-4 w-4" /> Twitter
            </Button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground/60">
          Powered by {BRAND.name}
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
