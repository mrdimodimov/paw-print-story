import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

interface TributeCard {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  tribute_story: string;
  slug: string | null;
  created_at: string;
}

export default function MemoriesGallery() {
  const navigate = useNavigate();
  const [tributes, setTributes] = useState<TributeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactionCounts, setReactionCounts] = useState<Record<string, { candle: number; paw: number; heart: number }>>({});

  useEffect(() => {
    document.title = `Pet Memorial Stories — Heartfelt Tributes | ${BRAND.name}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse heartfelt pet memorials created by loving owners. Each tribute tells a unique story worth remembering.");
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("tributes")
        .select("id, pet_name, pet_type, breed, tribute_story, slug, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(24);

      if (data) {
        setTributes(data);
        const ids = data.map((t) => t.id);
        if (ids.length > 0) {
          const { data: reactions } = await supabase
            .from("tribute_reactions")
            .select("tribute_id, reaction_type")
            .in("tribute_id", ids);

          if (reactions) {
            const counts: Record<string, { candle: number; paw: number; heart: number }> = {};
            for (const r of reactions) {
              if (!counts[r.tribute_id]) counts[r.tribute_id] = { candle: 0, paw: 0, heart: 0 };
              const rt = r.reaction_type as "candle" | "paw" | "heart";
              if (rt in counts[r.tribute_id]) counts[r.tribute_id][rt]++;
            }
            setReactionCounts(counts);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const getExcerpt = (story: string) => {
    if (!story || story.trim().length === 0) return "A heartfelt tribute to a beloved pet.";
    const cleaned = story.replace(/---[A-Z_]+---[^\n]*/g, "").replace(/\n{3,}/g, "\n\n").trim();
    const paras = cleaned.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    const hookPara = paras[0]?.trim() || cleaned.trim();
    if (hookPara.length < 20) return "A heartfelt tribute to a beloved pet.";
    if (hookPara.length <= 160) return hookPara;
    const sentenceEnd = hookPara.slice(80, 160).search(/[.!?;—]\s/);
    if (sentenceEnd !== -1) {
      const cutAt = 80 + sentenceEnd + 1;
      return hookPara.slice(0, cutAt).trim() + "…";
    }
    const wordCut = hookPara.slice(0, 145).lastIndexOf(" ");
    return hookPara.slice(0, wordCut > 80 ? wordCut : 140).trim() + "…";
  };

  const getTributeUrl = (t: TributeCard) =>
    t.slug ? `/memorial/${t.slug}` : `/tribute/${t.id}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">{BRAND.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Home
          </Button>
        </div>
      </header>

      <div className="tribute-container max-w-5xl py-12">
        <h1 className="mb-2 text-center font-display text-3xl font-bold text-foreground md:text-4xl">
          Remembering Beloved Pets
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-center text-muted-foreground">
          Heartfelt memorial tributes celebrating the pets who changed our lives.
        </p>

        {/* Emotional gallery CTA */}
        <div className="mx-auto mb-10 max-w-2xl rounded-xl border border-border bg-accent/20 p-6 text-center">
          <p className="mb-1 font-display text-base font-semibold text-foreground">
            Each of these tributes was created by someone who loved their pet deeply.
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            You can create one too.
          </p>
          <Button size="lg" onClick={() => navigate("/create")}>
            <PawPrint className="mr-2 h-4 w-4" />
            Create a Tribute
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Takes less than 2 minutes · No writing required · Edit before downloading
          </p>
        </div>

        <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          Browse heartfelt pet memorials created by loving owners. Each tribute tells a unique story worth remembering.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="rounded-full bg-accent p-6">
              <PawPrint className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
        ) : tributes.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No public tributes yet. Be the first to share a memorial.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tributes.map((t) => {
              const c = reactionCounts[t.id];
              const total = c ? c.candle + c.paw + c.heart : 0;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-foreground">{t.pet_name}</h3>
                    <span className="text-base">🐾</span>
                  </div>
                  {t.breed && <p className="mb-2 text-xs text-muted-foreground">{t.breed}</p>}
                  <p className="mb-4 flex-1 font-body text-sm italic leading-relaxed text-foreground/80">
                    "{getExcerpt(t.tribute_story)}"
                  </p>
                  {total > 0 && c && (
                    <p className="mb-3 text-xs text-muted-foreground">
                      {c.candle > 0 && `${c.candle} candle${c.candle !== 1 ? "s" : ""}`}
                      {c.candle > 0 && (c.paw > 0 || c.heart > 0) ? " · " : ""}
                      {c.paw > 0 && `${c.paw} paw${c.paw !== 1 ? "s" : ""}`}
                      {c.paw > 0 && c.heart > 0 ? " · " : ""}
                      {c.heart > 0 && `${c.heart} heart${c.heart !== 1 ? "s" : ""}`}
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="self-start" onClick={() => navigate(getTributeUrl(t))}>
                    Read {t.pet_name}'s Story
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Social proof */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Many pet owners choose to preserve their pet's memory this way.
        </p>

        {/* Internal links */}
        <nav className="mt-8 flex items-center justify-center gap-4 text-sm" aria-label="Related pages">
          <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">Home</Link>
        </nav>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl border border-border bg-accent/20 p-8 text-center">
          <p className="mb-1 font-display text-lg font-semibold text-foreground">
            Every pet deserves to be remembered.
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create a lasting tribute for your pet today.
          </p>
          <Button size="lg" onClick={() => navigate("/create")}>
            <PawPrint className="mr-2 h-4 w-4" />
            Create a Tribute
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Takes less than 2 minutes · No writing required
          </p>
        </div>
      </div>
    </div>
  );
}
