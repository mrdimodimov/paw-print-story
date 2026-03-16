import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint, Heart, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PublicTribute {
  id: string;
  slug: string;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  years_of_life: string | null;
  story: string;
  social_post: string | null;
  share_card_text: string | null;
  photo_urls: string[];
  tier_id: string;
  created_at: string;
}

const ShareButtons = ({ url, title, photoUrl }: { url: string; title: string; photoUrl?: string }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platforms = [
    { name: "X", url: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "WhatsApp", url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: "Pinterest", url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${photoUrl ? `&media=${encodeURIComponent(photoUrl)}` : ""}` },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => (
        <Button
          key={p.name}
          variant="outline"
          size="sm"
          onClick={() => window.open(p.url, "_blank", "noopener,noreferrer,width=600,height=400")}
        >
          <Share2 className="mr-1 h-3 w-3" />
          {p.name}
        </Button>
      ))}
    </div>
  );
};

const PhotoGallery = ({ photos, petName, tier }: { photos: string[]; petName: string; tier: string }) => {
  if (photos.length === 0) return null;

  // Tier 1: 1 photo, Tier 2: up to 3, Tier 3: up to 5
  const maxPhotos = tier === "legacy" ? 5 : tier === "pack" ? 3 : 1;
  const displayPhotos = photos.slice(0, maxPhotos);

  if (tier === "legacy" && displayPhotos.length > 1) {
    // Premium gallery for legacy tier: hero photo + grid
    return (
      <div className="mb-8">
        <div className="mb-4 overflow-hidden rounded-xl shadow-md">
          <img
            src={displayPhotos[0]}
            alt={`${petName}`}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {displayPhotos.slice(1).map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${petName} photo ${i + 2}`}
              className="h-32 w-full rounded-lg object-cover shadow-sm md:h-40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (displayPhotos.length > 1) {
    // Gallery grid for pack tier
    return (
      <div className="mb-8 grid grid-cols-3 gap-3">
        {displayPhotos.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${petName} photo ${i + 1}`}
            className="h-32 w-full rounded-lg object-cover shadow-sm"
          />
        ))}
      </div>
    );
  }

  // Single photo
  return (
    <div className="mb-8 flex justify-center">
      <img
        src={displayPhotos[0]}
        alt={petName}
        className="h-48 w-48 rounded-xl object-cover shadow-md md:h-56 md:w-56"
      />
    </div>
  );
};

const PublicMemorialPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tribute, setTribute] = useState<PublicTribute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTribute = async () => {
      if (!slug) return;

      // Try lookup by slug first
      let { data, error } = await supabase
        .from("public_tributes")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      // If not found and slug looks like a UUID, try by id for backward compat
      if (!data && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
        const result = await supabase
          .from("public_tributes")
          .select("*")
          .eq("id", slug)
          .maybeSingle();
        data = result.data;
        error = result.error;

        // Redirect old ID URLs to slug-based URL
        if (data) {
          navigate(`/memorial/${data.slug}`, { replace: true });
          return;
        }
      }

      // Also redirect /memory/:slug to /memorial/:slug
      if (data && location.pathname.startsWith("/memory/")) {
        navigate(`/memorial/${data.slug}`, { replace: true });
        return;
      }

      if (error || !data) {
        toast.error("Memorial page not found");
        navigate("/");
        return;
      }
      setTribute(data as PublicTribute);
      document.title = `In Memory of ${data.pet_name} | ${BRAND.name}`;

      // Set canonical tag
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = `${window.location.origin}/memorial/${data.slug}`;

      setLoading(false);
    };
    fetchTribute();
  }, [slug, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="rounded-full bg-accent p-6"
        >
          <PawPrint className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!tribute) return null;

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const isLegacy = tribute.tier_id === "legacy";
  const isPack = tribute.tier_id === "pack";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => navigate("/")}
          >
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {BRAND.name}
            </span>
          </div>
        </div>
      </header>

      <div className={`tribute-container py-8 ${isLegacy ? "max-w-4xl" : "max-w-3xl"}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Memorial Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-accent p-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className={`mb-2 font-display font-bold text-foreground ${isLegacy ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}>
              In Loving Memory of {tribute.pet_name}
            </h1>
            {tribute.years_of_life && (
              <p className="text-sm text-muted-foreground">{tribute.years_of_life}</p>
            )}
            {tribute.breed && (
              <p className="mt-1 text-xs text-muted-foreground capitalize">
                {tribute.breed} · {tribute.pet_type}
              </p>
            )}
          </div>

          {/* Photos */}
          <PhotoGallery
            photos={tribute.photo_urls}
            petName={tribute.pet_name}
            tier={tribute.tier_id}
          />

          {/* Tribute Story */}
          <div className={`mb-8 rounded-xl border border-border bg-card shadow-card ${isLegacy ? "p-8 md:p-10" : "p-6 md:p-8"}`}>
            {isLegacy && (
              <div className="mb-6 border-b border-border/50 pb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  A Tribute to {tribute.pet_name}
                </h2>
              </div>
            )}
            <div className={`whitespace-pre-line font-body leading-relaxed text-foreground ${isLegacy || isPack ? "text-base" : "text-sm"}`}>
              {tribute.story}
            </div>
          </div>

          {/* Share Card Preview (Tier 2+) */}
          {(isPack || isLegacy) && tribute.share_card_text && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">
                Memorial Quote
              </h3>
              <blockquote className="border-l-4 border-primary/40 pl-4 italic text-foreground/80">
                "{tribute.share_card_text}"
              </blockquote>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">
                Share This Memorial
              </h3>
            </div>
            <ShareButtons
              url={pageUrl}
              title={`In Loving Memory of ${tribute.pet_name}`}
              photoUrl={tribute.photo_urls[0]}
            />
          </div>
        </motion.div>
      </div>

      {/* Marketing Footer */}
      <footer className="border-t border-border/50 bg-accent/30 py-10">
        <div className="tribute-container text-center">
          <p className="mb-2 text-xs text-muted-foreground">
            Created with {BRAND.name}
          </p>
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            Create a Tribute for Your Pet
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Honor your pet's memory with a beautiful, personalized tribute.
          </p>
          <Button
            size="lg"
            className="px-8 shadow-glow"
            onClick={() => navigate("/create")}
          >
            <PawPrint className="mr-2 h-5 w-5" />
            Create a Tribute for Your Pet
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default PublicMemorialPage;
