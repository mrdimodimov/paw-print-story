import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Heart, Share2, ArrowRight } from "lucide-react";
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

function setMetaTag(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setJsonLd(data: Record<string, unknown>) {
  let el = document.querySelector('script[data-ld="memorial"]') as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-ld", "memorial");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
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

/* ── Sticky CTA Bar ─────────────────────────────────── */

const StickyCta = ({ navigate }: { navigate: (path: string) => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-sm"
        >
          <div className="tribute-container flex items-center justify-between py-3">
            <p className="text-sm font-medium text-foreground">
              Create a tribute for your pet
            </p>
            <Button size="sm" className="shadow-glow" onClick={() => navigate("/create")}>
              Create a Tribute <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── main page ──────────────────────────────────────── */

const PublicMemorialPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tribute, setTribute] = useState<PublicTribute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTribute = async () => {
      if (!slug) return;

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

      if (error || !data) { toast.error("Memorial page not found"); navigate("/"); return; }

      setTribute(data as PublicTribute);

      /* ── Dynamic SEO ── */
      const t = data as PublicTribute;
      const breedOrType = t.breed ? `${t.breed} ${t.pet_type}` : t.pet_type;
      const pageTitle = `${t.pet_name}${t.years_of_life ? ` (${t.years_of_life})` : ""} — A Loving ${breedOrType} Tribute | ${BRAND.name}`;
      const metaDesc = `Read ${t.pet_name}'s heartfelt tribute and celebrate the life of a beloved ${breedOrType}. Create your own pet memorial with ${BRAND.name}.`;
      const pageUrl = `${BRAND.baseUrl}/memorial/${t.slug}`;

      document.title = pageTitle;
      setMetaTag("description", metaDesc);
      setMetaTag("og:title", pageTitle, true);
      setMetaTag("og:description", metaDesc, true);
      setMetaTag("og:type", "article", true);
      setMetaTag("og:url", pageUrl, true);
      if (t.photo_urls[0]) setMetaTag("og:image", t.photo_urls[0], true);
      setMetaTag("twitter:card", "summary_large_image");
      setMetaTag("twitter:title", pageTitle);
      setMetaTag("twitter:description", metaDesc);
      if (t.photo_urls[0]) setMetaTag("twitter:image", t.photo_urls[0]);

      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
      canonical.href = pageUrl;

      setJsonLd({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `In Loving Memory of ${t.pet_name}`,
        description: metaDesc,
        url: pageUrl,
        image: t.photo_urls[0] || undefined,
        datePublished: t.created_at,
        author: { "@type": "Organization", name: BRAND.name, url: BRAND.baseUrl },
        publisher: { "@type": "Organization", name: BRAND.name, url: BRAND.baseUrl },
      });

      setLoading(false);
    };
    fetchTribute();
  }, [slug, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="rounded-full bg-accent p-6">
          <PawPrint className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!tribute) return null;

  const pageUrl = `${BRAND.baseUrl}/memorial/${tribute.slug}`;
  const isLegacy = tribute.tier_id === "legacy";
  const isPack = tribute.tier_id === "pack";
  const breedOrType = tribute.breed ? `${tribute.breed} ${tribute.pet_type}` : tribute.pet_type;
  const storySplit = splitStoryWithCta(tribute.story);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky CTA */}
      <StickyCta navigate={navigate} />

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className="flex cursor-pointer items-center gap-2" onClick={() => navigate("/")}>
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">{BRAND.name}</span>
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

          {/* Photos */}
          <PhotoGallery photos={tribute.photo_urls} petName={tribute.pet_name} tier={tribute.tier_id} />

          {/* Tribute Story — with mid-story CTA */}
          <div className={`mb-8 rounded-xl border border-border bg-card shadow-card ${isLegacy ? "p-8 md:p-10" : "p-6 md:p-8"}`}>
            {isLegacy && (
              <div className="mb-6 border-b border-border/50 pb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">A Tribute to {tribute.pet_name}</h2>
              </div>
            )}

            {storySplit ? (
              <>
                <div className={`whitespace-pre-line font-body leading-relaxed text-foreground ${isLegacy || isPack ? "text-base" : "text-sm"}`}>
                  {storySplit.before}
                </div>

                {/* Mid-story CTA */}
                <div className="my-6 rounded-lg border border-border/50 bg-accent/10 px-5 py-4 text-center">
                  <p className="mb-1 font-display text-sm font-semibold text-foreground">
                    Every pet leaves a story worth remembering.
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Create a tribute for your own pet in minutes.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => navigate("/create")}>
                    <PawPrint className="mr-1 h-3 w-3" />
                    Create a Tribute
                  </Button>
                </div>

                <div className={`whitespace-pre-line font-body leading-relaxed text-foreground ${isLegacy || isPack ? "text-base" : "text-sm"}`}>
                  {storySplit.after}
                </div>
              </>
            ) : (
              <div className={`whitespace-pre-line font-body leading-relaxed text-foreground ${isLegacy || isPack ? "text-base" : "text-sm"}`}>
                {tribute.story}
              </div>
            )}
          </div>

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

          {/* ── SEO Content Sections ── */}

          {/* About Section */}
          <section className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">About {tribute.pet_name}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tribute.pet_name} was a beloved {breedOrType}
              {tribute.years_of_life ? ` who lived a beautiful life (${tribute.years_of_life})` : ""}.
              {" "}This tribute was created to honor {tribute.pet_name}s memory and celebrate the joy they brought to their family.
            </p>
          </section>

          {/* Timeline CTA */}
          <SoftCta
            navigate={navigate}
            heading="Honor your pet's life in the same way."
            subtext="Create a beautiful tribute in minutes."
            buttonText="Start Your Tribute"
          />

          {/* Memorial Ideas */}
          <section className="mb-8 rounded-xl border border-border bg-accent/20 p-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Looking for a Way to Remember Your Pet?</h2>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              Creating a tribute story is one of the most meaningful ways to preserve their memory. Answer a few questions about your pet, and {BRAND.name} turns your memories into a heartfelt tribute you can keep forever.
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              Many pet owners choose to preserve their pet's memory this way.
            </p>
            <Button size="lg" className="shadow-glow" onClick={() => navigate("/create")}>
              <PawPrint className="mr-2 h-5 w-5" />
              Create a Tribute for Your Pet
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">Takes less than 2 minutes · No writing required · Edit before downloading</p>
          </section>

          {/* Internal Links */}
          <nav className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm" aria-label="Related pages">
            <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">Home</Link>
            <span className="text-border">·</span>
            <Link to="/memories" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">See Other Pet Tributes</Link>
          </nav>
        </motion.div>
      </div>

      {/* End-of-page CTA */}
      <section className="border-t border-border/50 bg-accent/30 py-12">
        <div className="tribute-container max-w-2xl text-center">
          <p className="mb-2 font-display text-xl font-semibold text-foreground">
            Every pet deserves to be remembered.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Create a lasting tribute for your pet today.
          </p>
          <Button size="lg" className="px-8 shadow-glow" onClick={() => navigate("/create")}>
            <PawPrint className="mr-2 h-5 w-5" />
            Create a Tribute
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">Takes less than 2 minutes · No writing required</p>
          <p className="mt-6 text-xs text-muted-foreground">Created with {BRAND.name}</p>
        </div>
      </section>
    </div>
  );
};

export default PublicMemorialPage;
