import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Check, Copy, RefreshCw, ImagePlus, Pencil,
  MessageCircle, Twitter, Facebook, ExternalLink, Shield, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import PawIcon from "@/components/PawIcon";

interface MemorialData {
  id: string;
  tribute_id: string | null;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  years_of_life: string | null;
  story: string;
  photo_urls: string[];
  tier_id: string;
  slug: string;
  is_paid: boolean;
  social_post: string | null;
  share_card_text: string | null;
}

const TIER_LABELS: Record<string, string> = {
  story: "Simple Tribute",
  pack: "Beautiful Tribute",
  legacy: "Legacy Memorial",
};

const MemorialManage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [data, setData] = useState<MemorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!slug) return;

    if (!token) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data: pt, error } = await supabase
        .from("public_tributes")
        .select("id, tribute_id, pet_name, pet_type, breed, years_of_life, story, photo_urls, tier_id, slug, is_paid, social_post, share_card_text")
        .eq("slug", slug)
        .eq("manage_token", token)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error || !pt) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      setData(pt as MemorialData);
      setLoading(false);
    };
    load();
  }, [slug, token, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6 rounded-full bg-accent p-6"
        >
          <PawIcon className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-foreground">Loading your memorial…</p>
      </div>
    );
  }

  if (unauthorized || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <PawIcon className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h1 className="font-display text-xl font-semibold text-foreground">
            Access restricted
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This manage page is only accessible via the link sent to your email after payment.
          </p>
          {slug && (
            <Button className="mt-6" onClick={() => navigate(`/memorial/${slug}`)}>
              View Public Memorial
            </Button>
          )}
        </div>
      </div>
    );
  }

  const publicUrl = `${BRAND.baseUrl}/memorial/${data.slug}`;
  const tributeEditPath = data.tribute_id
    ? `/tribute/${data.tribute_id}`
    : `/tribute/s/${data.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`💛 A memorial for ${data.pet_name}: ${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`💛 Remembering ${data.pet_name}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(publicUrl)}`, "_blank");
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`, "_blank");
  };

  const handleResendEmail = async () => {
    if (!data.tribute_id) {
      toast.error("Unable to resend — no linked tribute found.");
      return;
    }
    setResending(true);
    try {
      // Fetch email from tribute_emails
      const { data: emailRecord } = await supabase
        .from("tribute_emails")
        .select("email")
        .eq("tribute_id", data.tribute_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!emailRecord?.email) {
        toast.error("No email on file. Please contact support.");
        setResending(false);
        return;
      }

      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "payment-confirmation",
          recipientEmail: emailRecord.email,
          idempotencyKey: `resend-access-${data.id}-${Date.now()}`,
          templateData: {
            petName: data.pet_name,
            slug: data.slug,
            tributeId: data.tribute_id,
            manageToken: token,
          },
        },
      });

      toast.success("Access email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const heroPhoto = data.photo_urls?.[0];
  const storyExcerpt = data.story.length > 220 ? data.story.slice(0, 220) + "…" : data.story;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <PawIcon className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-semibold text-foreground">{BRAND.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {TIER_LABELS[data.tier_id] || data.tier_id}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent"
          >
            <PawIcon className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {data.pet_name}'s Memorial
          </h1>
          <p className="text-sm text-muted-foreground">
            Your tribute is live and ready to share. Here's everything you can do.
          </p>
          {data.is_paid && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Paid • Yours forever</span>
            </div>
          )}
        </motion.div>

        {/* Preview card */}
        {(heroPhoto || storyExcerpt) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card cursor-pointer group"
            onClick={() => navigate(`/memorial/${data.slug}`)}
          >
            {heroPhoto && (
              <div className="aspect-[16/9] overflow-hidden relative">
                <img
                  src={heroPhoto}
                  alt={data.pet_name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 right-3 rounded-full bg-white/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <ExternalLink className="h-4 w-4 text-foreground" />
                </div>
              </div>
            )}
            <div className="p-5">
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "{storyExcerpt}"
              </p>
              <p className="mt-3 text-xs text-primary font-medium">Click to view full memorial →</p>
            </div>
          </motion.div>
        )}

        {/* Manage section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            Manage your memorial
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate(`/memorial/${data.slug}`)}
            >
              <Globe className="h-4 w-4" /> View Tribute
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate(tributeEditPath)}
            >
              <Pencil className="h-4 w-4" /> Edit Story
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate(`${tributeEditPath}?action=regenerate`)}
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate(`${tributeEditPath}?action=photos`)}
            >
              <ImagePlus className="h-4 w-4" /> Add Photos
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 col-span-2"
              disabled={resending}
              onClick={handleResendEmail}
            >
              <Mail className="h-4 w-4" /> {resending ? "Sending…" : "Resend Access Email"}
            </Button>
          </div>
        </motion.div>

        {/* Share section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="mb-1 font-display text-lg font-semibold text-foreground">
            Share with others
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Let friends and family visit, react, and leave their own memories.
          </p>

          {/* Link display */}
          <div className="mb-4 rounded-lg border border-border bg-muted/50 px-3 py-2.5 flex items-center gap-2">
            <span className="flex-1 truncate text-sm text-muted-foreground">{publicUrl}</span>
            <Button size="sm" variant="ghost" className="shrink-0 gap-1.5" onClick={handleCopy}>
              {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={handleWhatsApp}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={handleTwitter}>
              <Twitter className="h-4 w-4" /> Twitter
            </Button>
            <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={handleFacebook}>
              <Facebook className="h-4 w-4" /> Facebook
            </Button>
          </div>
        </motion.div>

        {/* Photo gallery (if multiple photos) */}
        {data.photo_urls.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Photos ({data.photo_urls.length})
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {data.photo_urls.map((url, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg">
                  <img src={url} alt={`${data.pet_name} photo ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-center text-xs text-muted-foreground/60">
          Powered by {BRAND.name}
        </p>
      </div>
    </div>
  );
};

export default MemorialManage;
