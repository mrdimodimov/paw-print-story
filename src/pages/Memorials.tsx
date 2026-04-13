import { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Search, Trash2 } from "lucide-react";
import CtaIcon from "@/components/CtaIcon";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PublicTribute {
  id: string;
  pet_name: string;
  pet_type: string;
  years_of_life: string | null;
  story: string;
  slug: string;
  photo_urls: string[];
  created_at: string;
}

const PAGE_SIZE = 12;

export default function Memorials() {
  const [tributes, setTributes] = useState<PublicTribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "dog" | "cat" | "other">("all");
  const [deleteTarget, setDeleteTarget] = useState<PublicTribute | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = useMemo(() => {
    return !!localStorage.getItem("admin_key");
  }, []);

  const fetchTributes = useCallback(async (offset: number, append = false) => {
    const setter = append ? setLoadingMore : setLoading;
    setter(true);

    const { data } = await supabase
      .from("public_tributes")
      .select("id, pet_name, pet_type, years_of_life, story, slug, photo_urls, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (data) {
      setTributes((prev) => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setter(false);
  }, []);

  useEffect(() => {
    fetchTributes(0);
  }, [fetchTributes]);

  const loadMore = () => {
    fetchTributes(tributes.length, true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const adminKey = localStorage.getItem("admin_key") || "";
      const res = await supabase.functions.invoke("delete-tribute", {
        body: { tribute_id: deleteTarget.id, slug: deleteTarget.slug },
        headers: { "x-admin-key": adminKey },
      });

      if (res.error) throw res.error;

      setTributes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.pet_name}" memorial deleted`);
    } catch (err: any) {
      toast.error("Failed to delete: " + (err?.message || "Unknown error"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = useMemo(() => {
    let list = tributes;
    if (filter !== "all") {
      list = list.filter((t) => {
        const type = t.pet_type?.toLowerCase() || "dog";
        if (filter === "dog") return type === "dog";
        if (filter === "cat") return type === "cat";
        return type !== "dog" && type !== "cat";
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.pet_name.toLowerCase().includes(q));
    }
    return list;
  }, [tributes, filter, search]);

  const excerpt = (story: string): string => {
    if (!story || story.trim().length === 0) return "A life remembered with love.";
    const cleaned = story.replace(/---[A-Z_]+---[^\n]*/g, "").replace(/\n{3,}/g, "\n\n").trim();
    const paras = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 30);
    const hook = paras[0]?.trim() || cleaned.trim();
    if (hook.length < 20) return "A life remembered with love.";
    if (hook.length <= 120) return hook;
    const wordCut = hook.slice(0, 117).lastIndexOf(" ");
    return hook.slice(0, wordCut > 60 ? wordCut : 110).trim() + "…";
  };

  const petTypes = useMemo(() => {
    const types = new Set(tributes.map((t) => (t.pet_type?.toLowerCase() || "dog")));
    return { hasDogs: types.has("dog"), hasCats: types.has("cat"), hasOther: [...types].some((t) => t !== "dog" && t !== "cat") };
  }, [tributes]);

  const filterChips: { key: "all" | "dog" | "cat" | "other"; label: string; show: boolean }[] = [
    { key: "all", label: "All", show: true },
    { key: "dog", label: "Dogs", show: petTypes.hasDogs },
    { key: "cat", label: "Cats", show: petTypes.hasCats },
    { key: "other", label: "Other", show: petTypes.hasOther },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pet Memorials",
    description: "Browse heartfelt pet memorials. Read real stories and create a lasting tribute for your pet.",
    url: `${BRAND.baseUrl}/memorials`,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pet Memorials — Remember Loved Pets | {BRAND.name}</title>
        <meta name="description" content="Browse heartfelt pet memorials. Read real stories and create a lasting tribute for your pet." />
        <link rel="canonical" href={`${BRAND.baseUrl}/memorials`} />
        <meta property="og:title" content={`Pet Memorials | ${BRAND.name}`} />
        <meta property="og:description" content="Browse heartfelt pet memorials. Read real stories and create a lasting tribute for your pet." />
        <meta property="og:url" content={`${BRAND.baseUrl}/memorials`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete memorial?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the memorial for <strong>{deleteTarget?.pet_name}</strong>? This will remove it from both public tributes and the tributes table. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <BrandLogo size="sm" />
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-14 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="font-display text-4xl font-bold text-foreground">
            All Pet Memorials
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            A place where every pet is remembered — stories, photos, and the small moments that mattered most.
          </p>
          <Link
            to="/create"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Create a tribute <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Filters + Search */}
      <div className="mx-auto max-w-5xl px-4 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by pet name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {filterChips.filter((c) => c.show).map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === chip.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-5xl px-4 pb-16">
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border/30 bg-white">
                <div className="aspect-video bg-muted rounded-t-2xl" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground mb-1">
              {search || filter !== "all"
                ? "No tributes match your search."
                : "No tributes yet — be the first to create one."}
            </p>
            <Link
              to="/create"
              className="mt-4 inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Create a tribute <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => {
                const hasImage = t.photo_urls?.[0];
                return (
                  <div key={t.id} className="relative">
                    <Link
                      to={`/memorial/${t.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-border/30 bg-white shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1"
                    >
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
                        <h2 className="font-display text-lg font-semibold text-foreground">
                          {t.pet_name}
                        </h2>
                        {t.years_of_life && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{t.years_of_life}</p>
                        )}
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground italic">
                          "{excerpt(t.story)}"
                        </p>
                        <span className="mt-3 block text-xs text-primary/60 group-hover:text-primary transition-colors">
                          Read full tribute →
                        </span>
                      </div>
                    </Link>

                    {/* Admin delete button */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(t);
                        }}
                        className="absolute top-2 right-2 z-10 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground opacity-0 hover:bg-destructive transition-all group-hover:opacity-100 hover:opacity-100 focus:opacity-100 shadow-md"
                        title="Delete memorial"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && !search && filter === "all" && (
              <div className="mt-10 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more tributes"}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Internal SEO links */}
        <div className="mt-16 border-t border-border/40 pt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Looking for something specific? Try our guides →
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/what-to-write-when-a-dog-dies" className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
              What to Write When a Dog Dies
            </Link>
            <Link to="/cat-memorial-quotes" className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
              Cat Memorial Quotes
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="mb-3 text-sm text-muted-foreground">Your pet's story deserves to be told</p>
          <Button size="lg" className="px-8 py-5 text-base" asChild>
            <Link to="/create">
              <CtaIcon className="mr-2 shrink-0" size={22} />
              Create your pet's tribute →
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
