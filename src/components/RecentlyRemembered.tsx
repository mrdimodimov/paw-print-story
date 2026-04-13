import CtaIcon from "@/components/CtaIcon";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    if (!story || story.trim().length === 0) return "A life remembered with love.";
    const cleaned = story.replace(/---[A-Z_]+---[^\n]*/g, "").replace(/\n{3,}/g, "\n\n").trim();
    const paras = cleaned.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    const hookPara = paras[0]?.trim() || cleaned.trim();
    if (hookPara.length < 20) return "A life remembered with love.";
    if (hookPara.length <= 120) return hookPara;
    const sentenceEnd = hookPara.slice(60, 120).search(/[.!?;—]\s/);
    if (sentenceEnd !== -1) {
      return hookPara.slice(0, 60 + sentenceEnd + 1).trim() + "…";
    }
    const wordCut = hookPara.slice(0, 117).lastIndexOf(" ");
    return hookPara.slice(0, wordCut > 60 ? wordCut : 110).trim() + "…";
  }

  return (
    <section className="tribute-section">
      <div className="tribute-container">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link
            to="/memorials"
            className="group inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
          >
            <h2 className="font-display text-3xl font-bold text-foreground group-hover:underline underline-offset-4 decoration-primary/40">
              Recently Remembered Pets
            </h2>
            <ArrowRight className="h-5 w-5 text-primary opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
          </Link>
          <p className="mt-2 text-base text-muted-foreground">
            Real tributes from pet owners — each one started with a small memory.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tributes.map((t) => {
            const rx = reactions[t.id] || { candle: 0, heart: 0 };
            const hasImage = t.photo_urls?.[0];
            return (
              <Link
                key={t.id}
                to={`/memorial/${t.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border/30 bg-white shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {hasImage ? (
                    <img
                      src={t.photo_urls[0]}
                      alt={`${t.pet_name} memorial`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                      <span className="text-4xl opacity-40">🐾</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Name + years */}
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {t.pet_name}
                  </h3>
                  {t.years_of_life && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.years_of_life}</p>
                  )}

                  {/* Quoted excerpt */}
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground italic">
                    "{getExcerpt(t.story)}"
                  </p>

                  {/* Reactions + subtle read link */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {rx.candle > 0 && <span>🕯️ {rx.candle}</span>}
                      {rx.heart > 0 && <span>❤️ {rx.heart}</span>}
                    </div>
                    <span className="text-xs text-primary/60 group-hover:text-primary transition-colors">
                      Read full tribute →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-1.5 text-center">
          <Link to="/memorials" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary transition-colors">
            View all tributes →
          </Link>
        </div>
        <div className="mt-10 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Every pet deserves to be remembered.
          </p>
          <Button
            size="lg"
            className="px-8 py-5 text-base"
            onClick={() => navigate("/create")}
          >
            <CtaIcon className="mr-2 shrink-0" size={22} />
            Create your pet's story →
          </Button>
        </div>
      </div>
    </section>
  );
}
