import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface TributeCard {
  id: string;
  pet_name: string;
  pet_type: string;
  years_of_life: string | null;
  story: string;
  slug: string;
  photo_urls: string[];
  created_at: string;
}

type ReactionCounts = Record<string, { candle: number; heart: number }>;

export default function RecentlyRemembered() {
  const navigate = useNavigate();
  const [tributes, setTributes] = useState<TributeCard[]>([]);
  const [reactions, setReactions] = useState<ReactionCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("public_tributes")
        .select("id, pet_name, pet_type, years_of_life, story, slug, photo_urls, created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      setTributes(data);

      // Fetch reaction counts
      const ids = data.map((t) => t.id);
      const { data: rxData } = await supabase
        .from("tribute_reactions")
        .select("tribute_id, reaction_type")
        .in("tribute_id", ids);

      if (rxData) {
        const counts: ReactionCounts = {};
        for (const row of rxData) {
          if (!counts[row.tribute_id]) counts[row.tribute_id] = { candle: 0, heart: 0 };
          if (row.reaction_type === "candle") counts[row.tribute_id].candle++;
          if (row.reaction_type === "heart") counts[row.tribute_id].heart++;
        }
        setReactions(counts);
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading || tributes.length === 0) return null;

  function getExcerpt(story: string): string {
    if (!story || story.trim().length === 0) return "A heartfelt tribute to a beloved pet.";
    // Strip markers and normalize
    const cleaned = story.replace(/---[A-Z_]+---[^\n]*/g, "").replace(/\n{3,}/g, "\n\n").trim();
    const paras = cleaned.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    
    // Use first meaningful paragraph — it's designed as an emotional hook
    const hookPara = paras[0]?.trim() || cleaned.trim();
    if (hookPara.length < 20) return "A heartfelt tribute to a beloved pet.";
    
    // Find a natural sentence break near 140 chars for a clean cutoff
    if (hookPara.length <= 160) return hookPara;
    
    const sentenceEnd = hookPara.slice(80, 160).search(/[.!?;—]\s/);
    if (sentenceEnd !== -1) {
      const cutAt = 80 + sentenceEnd + 1;
      return hookPara.slice(0, cutAt).trim() + "…";
    }
    // Fallback: word-boundary cutoff
    const wordCut = hookPara.slice(0, 145).lastIndexOf(" ");
    return hookPara.slice(0, wordCut > 80 ? wordCut : 140).trim() + "…";
  }

  return (
    <section className="tribute-section">
      <div className="tribute-container">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">
            Recently Remembered Pets
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Each of these tributes was created by someone who loved their pet deeply.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tributes.map((t, i) => {
            const rx = reactions[t.id] || { candle: 0, heart: 0 };
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/memorial/${t.slug}`)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-card"
              >
                {/* Photo */}
                {t.photo_urls?.[0] && (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={t.photo_urls[0]}
                      alt={`${t.pet_name} memorial`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-5">
                  {/* Name + years */}
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {t.pet_name}
                  </h3>
                  {t.years_of_life && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.years_of_life}</p>
                  )}

                  {/* Excerpt */}
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {getExcerpt(t.story)}
                  </p>

                  {/* Reactions + CTA */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {rx.candle > 0 && <span>🕯️ {rx.candle}</span>}
                      {rx.heart > 0 && <span>❤️ {rx.heart}</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/memorial/${t.slug}`);
                      }}
                    >
                      View Tribute →
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button
            size="lg"
            className="px-8 py-5 text-base shadow-glow"
            onClick={() => navigate("/create")}
          >
            <PawPrint className="mr-2 h-5 w-5" />
            Create a Tribute for Your Pet
          </Button>
        </div>
      </div>
    </section>
  );
}
