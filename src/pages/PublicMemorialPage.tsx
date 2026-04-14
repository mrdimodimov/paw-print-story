import CtaIcon from "@/components/CtaIcon";
import IncompleteMemorialCta from "@/components/IncompleteMemorialCta";
import PawIcon from "@/components/PawIcon";
import BrandLogo from "@/components/BrandLogo";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
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

/* ── helpers ────────────────────────────────────────── */

/* ── story split helper ─────────────────────────────── */

function splitStoryWithCta(story: string): { before: string; after: string } | null {
  const normalized = story.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  let paras = normalized.split(/\n\s*\n/).filter(Boolean);

  // Fallback: if few paragraphs, split by sentences
  if (paras.length < 3) {
    paras = normalized.split(/(?<=[.?!])\s+/).filter(Boolean);
  }

  if (paras.length < 4) return null;

  const splitAt = Math.min(3, Math.floor(paras.length / 2));
  return {
    before: paras.slice(0, splitAt).join("\n\n"),
    after: paras.slice(splitAt).join("\n\n"),
  };
}

/* ── sub-components ─────────────────────────────────── */


const ShareButtons = ({ url, title, photoUrl }: { url: string; title: string; photoUrl?: string }) => {
  const eu = encodeURIComponent(url);
  const et = encodeURIComponent(title);
  const platforms = [
    { name: "X", url: `https://x.com/intent/tweet?url=${eu}&text=${et}` },
    { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${eu}` },
    { name: "WhatsApp", url: `https://wa.me/?text=${et}%20${eu}` },
    { name: "Pinterest", url: `https://pinterest.com/pin/create/button/?url=${eu}&description=${et}${photoUrl ? `&media=${encodeURIComponent(photoUrl)}` : ""}` },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => (
        <Button key={p.name} variant="outline" size="sm" onClick={() => window.open(p.url, "_blank", "noopener,noreferrer,width=600,height=400")}>
          <Share2 className="mr-1 h-3 w-3" />
          {p.name}
        </Button>
      ))}
    </div>
  );
};

const PhotoGallery = ({ photos, petName, tier }: { photos: string[]; petName: string; tier: string }) => {
  if (photos.length === 0) return null;
  const maxPhotos = tier === "legacy" ? 5 : tier === "pack" ? 3 : 1;
  const displayPhotos = photos.slice(0, maxPhotos);

  if (tier === "legacy" && displayPhotos.length > 1) {
    return (
      <div className="mb-8">
        <div className="mb-4 overflow-hidden rounded-xl shadow-md">
          <img src={displayPhotos[0]} alt={`${petName}`} className="h-64 w-full object-cover md:h-80" loading="lazy" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {displayPhotos.slice(1).map((url, i) => (
            <img key={i} src={url} alt={`${petName} photo ${i + 2}`} className="h-32 w-full rounded-lg object-cover shadow-sm md:h-40" loading="lazy" />
          ))}
        </div>
      </div>
    );
  }

  if (displayPhotos.length > 1) {
    return (
      <div className="mb-8 grid grid-cols-3 gap-3">
        {displayPhotos.map((url, i) => (
          <img key={i} src={url} alt={`${petName} photo ${i + 1}`} className="h-32 w-full rounded-lg object-cover shadow-sm" loading="lazy" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 flex justify-center">
      <img src={displayPhotos[0]} alt={petName} className="h-48 w-48 rounded-xl object-cover shadow-md md:h-56 md:w-56" loading="lazy" />
    </div>
  );
};

/* ── main page ──────────────────────────────────────── */

const PublicMemorialPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tribute, setTribute] = useState<PublicTribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInlineCta, setShowInlineCta] = useState(false);
  const storyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!storyRef.current) return;
      const rect = storyRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (rect.height + windowHeight)));
      if (progress > 0.35) setShowInlineCta(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchTribute = async () => {
      if (!slug) return;

      console.log("Memorial slug:", slug);

      let { data, error } = await supabase
        .from("public_tributes")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!data && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
        const result = await supabase.from("public_tributes").select("*").eq("id", slug).maybeSingle();
        data = result.data;
        error = result.error;
        if (data) { navigate(`/memorial/${data.slug}`, { replace: true }); return; }
      }

      if (data && location.pathname.startsWith("/memory/")) {
        navigate(`/memorial/${data.slug}`, { replace: true });
        return;
      }

      if (error || !data) {
        console.log("Memorial not found for slug:", slug);
        setLoading(false);
        return;
      }

      setTribute(data as PublicTribute);

      setLoading(false);
    };
    fetchTribute();
  }, [slug, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="rounded-full bg-accent p-6">
          <PawIcon className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!tribute) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">
      <PawIcon className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold text-foreground mb-2">Memorial not found</h1>
      <p className="text-muted-foreground mb-6">We couldn't find a memorial page for this link.</p>
      <Link to="/" className="text-primary underline">Go home</Link>
    </div>
  );

  const pageUrl = `${BRAND.baseUrl}/memorial/${tribute.slug}`;
  const storyExcerpt = tribute.story.replace(/\n+/g, " ").slice(0, 150).trim().replace(/\s+\S*$/, "…");
  const pageTitle = `${tribute.pet_name} Memorial | ${BRAND.name}`;
  const metaDesc = storyExcerpt || `Read ${tribute.pet_name}'s heartfelt tribute and celebrate the life of a beloved pet.`;
  const isLegacy = tribute.tier_id === "legacy";
  const isPack = tribute.tier_id === "pack";
  const breedOrType = tribute.breed ? `${tribute.breed} ${tribute.pet_type}` : tribute.pet_type;

  const hasPhotos = tribute.photo_urls.length > 0;
  const storyTrimmed = tribute.story.replace(/\s+/g, "").length;
  const isIncomplete = !hasPhotos && storyTrimmed < 100;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `In Loving Memory of ${tribute.pet_name}`,
    description: metaDesc,
    url: pageUrl,
    image: tribute.photo_urls[0] || undefined,
    datePublished: tribute.created_at,
    author: { "@type": "Organization", name: BRAND.name, url: BRAND.baseUrl },
    publisher: { "@type": "Organization", name: BRAND.name, url: BRAND.baseUrl },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        {tribute.photo_urls[0] && <meta property="og:image" content={tribute.photo_urls[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDesc} />
        {tribute.photo_urls[0] && <meta name="twitter:image" content={tribute.photo_urls[0]} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className="flex cursor-pointer items-center gap-2" onClick={() => navigate("/")}>
            <BrandLogo size="sm" />
          </div>
        </div>
      </header>

      <div className={`tribute-container py-8 pb-24 ${isLegacy ? "max-w-4xl" : "max-w-3xl"}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

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
            {tribute.years_of_life && <p className="text-sm text-muted-foreground">{tribute.years_of_life}</p>}
            {tribute.breed && <p className="mt-1 text-xs text-muted-foreground capitalize">{tribute.breed} · {tribute.pet_type}</p>}
          </div>

          {/* Incomplete memorial CTA */}
          {isIncomplete && (
            <IncompleteMemorialCta
              petName={tribute.pet_name}
              slug={tribute.slug}
              tributeId={tribute.id}
              hasPhotos={hasPhotos}
              hasStory={storyTrimmed >= 100}
            />
          )}

          {/* Photos */}
          {!isIncomplete && <PhotoGallery photos={tribute.photo_urls} petName={tribute.pet_name} tier={tribute.tier_id} />}

          {!isIncomplete && <>
          {/* Tribute Story */}
          {(() => {
            const storySplit = splitStoryWithCta(tribute.story);
            const storyClasses = `whitespace-pre-wrap font-body leading-relaxed text-foreground ${isLegacy || isPack ? "text-base" : "text-sm"}`;
            const cardClasses = `mb-8 rounded-xl border border-border bg-card shadow-card ${isLegacy ? "p-8 md:p-10" : "p-6 md:p-8"}`;

            const inlineCta = showInlineCta && (
              <div className="my-6 text-center">
                <p className="mb-2 text-xs text-muted-foreground">
                  Every pet leaves a story worth remembering.
                </p>
                <button
                  onClick={() => navigate("/create")}
                  className="group inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 text-sm text-foreground/80 transition-all hover:border-primary/40 hover:bg-accent/20 hover:text-foreground"
                >
                  Honor your pet's memory in the same way
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            );

            if (storySplit) {
              return (
                <div ref={storyRef}>
                  <div className={cardClasses}>
                    {isLegacy && (
                      <div className="mb-6 border-b border-border/50 pb-4">
                        <h2 className="font-display text-xl font-semibold text-foreground">A Tribute to {tribute.pet_name}</h2>
                      </div>
                    )}
                    <div className={storyClasses}>{storySplit.before}</div>
                    {inlineCta}
                    <div className={storyClasses}>{storySplit.after}</div>
                  </div>
                </div>
              );
            }

            return (
              <div ref={storyRef}>
                <div className={cardClasses}>
                  {isLegacy && (
                    <div className="mb-6 border-b border-border/50 pb-4">
                      <h2 className="font-display text-xl font-semibold text-foreground">A Tribute to {tribute.pet_name}</h2>
                    </div>
                  )}
                  <div className={storyClasses}>{tribute.story}</div>
                </div>

                {inlineCta}
              </div>
            );
          })()}

          {/* Share Card (Tier 2+) */}
          {(isPack || isLegacy) && tribute.share_card_text && (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Memorial Quote</h3>
              <blockquote className="border-l-4 border-primary/40 pl-4 italic text-foreground/80">"{tribute.share_card_text}"</blockquote>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Share This Memorial</h3>
            </div>
            <ShareButtons url={pageUrl} title={`In Loving Memory of ${tribute.pet_name}`} photoUrl={tribute.photo_urls[0]} />
          </div>

          {/* About Section */}
          <section className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">About {tribute.pet_name}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tribute.pet_name} was a beloved {breedOrType}
              {tribute.years_of_life ? ` who lived a beautiful life (${tribute.years_of_life})` : ""}.
              {" "}This tribute was created to honor {tribute.pet_name}'s memory and celebrate the joy they brought to their family.
            </p>
          </section>

          </>}

          {/* Internal Links */}
          <nav className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm" aria-label="Related pages">
            <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">Home</Link>
            <span className="text-border">·</span>
            <Link to="/memories" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">See Other Pet Tributes</Link>
          </nav>
        </motion.div>
      </div>

      {/* CTA 2: Final bottom */}
      <section className="border-t border-border/50 bg-accent/30 py-12">
        <div className="tribute-container max-w-2xl text-center">
          <p className="mb-2 font-display text-xl font-semibold text-foreground">
            Every pet deserves to be remembered.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Takes less than 2 minutes · No writing required
          </p>
          <Button size="lg" className="px-8 shadow-glow" onClick={() => navigate("/create")}>
            <CtaIcon className="mr-2 shrink-0" size={22} />
            Create a Tribute
          </Button>
          <p className="mt-6 text-xs text-muted-foreground">Created with {BRAND.name}</p>
        </div>
      </section>
    </div>
  );
};

export default PublicMemorialPage;
