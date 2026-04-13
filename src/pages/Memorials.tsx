import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

interface PublicTribute {
  id: string;
  pet_name: string;
  story: string;
  slug: string;
  created_at: string;
}

export default function Memorials() {
  const [tributes, setTributes] = useState<PublicTribute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("public_tributes")
        .select("id, pet_name, story, slug, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setTributes(data);
      setLoading(false);
    }
    load();
  }, []);

  const preview = (story: string) => {
    if (!story) return "A heartfelt tribute…";
    const clean = story.replace(/---[A-Z_]+---[^\n]*/g, "").trim();
    return clean.length <= 100 ? clean : clean.slice(0, 97).trimEnd() + "…";
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Recent Pet Tributes | {BRAND.name}</title>
        <meta name="description" content="Browse recent pet memorial tributes created by loving owners." />
        <link rel="canonical" href={`${BRAND.baseUrl}/memorials`} />
      </Helmet>

      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <BrandLogo size="sm" />
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-center font-display text-3xl font-bold text-foreground">
          Recent Pet Tributes
        </h1>

        {loading ? (
          <p className="py-16 text-center text-muted-foreground">Loading…</p>
        ) : tributes.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No tributes yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tributes.map((t) => (
              <Link
                key={t.id}
                to={`/memorial/${t.slug}`}
                className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-card"
              >
                <h2 className="mb-1 font-display text-lg font-semibold text-foreground">
                  {t.pet_name}
                </h2>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {preview(t.story)}
                </p>
                <span className="text-sm text-primary">Read tribute →</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
