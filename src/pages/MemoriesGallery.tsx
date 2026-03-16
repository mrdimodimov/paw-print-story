import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    document.title = "Pet Memorial Stories | VellumPet";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Read heartfelt memorial tributes celebrating beloved pets and their lives.");
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
        // Fetch reaction counts for all tribute IDs
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
    const first = story.split(/\n\s*\n/)[0] || story;
    return first.length > 140 ? first.slice(0, 140).trimEnd() + "…" : first;
  };

  const getTributeUrl = (t: TributeCard) =>
    t.slug ? `/tribute/s/${t.slug}` : `/tribute/${t.id}`;

  const CtaBlock = () => (
    <div className="text-center">
      <Button size="lg" onClick={() => navigate("/")}>
        <Sparkles className="mr-2 h-4 w-4" /> Create a Tribute for Your Pet
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {BRAND.name}
            </span>
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
        <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
          Heartfelt memorial tributes celebrating the pets who changed our lives.
        </p>

        <div className="mb-10">
          <CtaBlock />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="rounded-full bg-accent p-6"
            >
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
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {t.pet_name}
                    </h3>
                    <span className="text-base">🐾</span>
                  </div>
                  {t.breed && (
                    <p className="mb-2 text-xs text-muted-foreground">{t.breed}</p>
                  )}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => navigate(getTributeUrl(t))}
                  >
                    Read {t.pet_name}'s Story
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          <CtaBlock />
        </div>
      </div>
    </div>
  );
}
