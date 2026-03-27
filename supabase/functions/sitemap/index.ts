import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SITE = "https://paw-print-story.lovable.app";

const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/create", changefreq: "monthly", priority: "0.9" },
  { path: "/memories", changefreq: "daily", priority: "0.8" },
  // Hub / money pages
  { path: "/pet-memorial", changefreq: "weekly", priority: "0.8", lastmod: "2025-03-27" },
  // SEO blog articles
  { path: "/pet-memorial-quotes", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/rainbow-bridge-quotes", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/cope-with-losing-a-pet", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/pet-sympathy-messages", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/short-dog-memorial-quotes", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/dog-memorial-quotes", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/cat-memorial-quotes", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/pet-remembrance-quotes", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/what-to-write-when-a-cat-dies", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/pet-condolence-messages", changefreq: "monthly", priority: "0.7", lastmod: "2025-03-27" },
  { path: "/dog-obituary-example", changefreq: "monthly", priority: "0.7", lastmod: "2025-01-15" },
  { path: "/cat-memorial-tribute-example", changefreq: "monthly", priority: "0.7", lastmod: "2025-01-20" },
  { path: "/pet-memorial-message", changefreq: "monthly", priority: "0.7", lastmod: "2025-02-01" },
  { path: "/what-to-write-when-a-dog-dies", changefreq: "monthly", priority: "0.7", lastmod: "2025-02-10" },
  // Legal
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

function urlEntry(loc: string, opts: { changefreq?: string; priority?: string; lastmod?: string }) {
  let xml = `  <url>\n    <loc>${loc}</loc>\n`;
  if (opts.lastmod) xml += `    <lastmod>${opts.lastmod}</lastmod>\n`;
  if (opts.changefreq) xml += `    <changefreq>${opts.changefreq}</changefreq>\n`;
  if (opts.priority) xml += `    <priority>${opts.priority}</priority>\n`;
  xml += `  </url>`;
  return xml;
}

Deno.serve(async () => {
  // Build static entries
  const entries: string[] = STATIC_PAGES.map((p) =>
    urlEntry(`${SITE}${p.path}`, p)
  );

  // Fetch public tributes dynamically
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tributes } = await supabase
      .from("public_tributes")
      .select("slug, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (tributes) {
      for (const t of tributes) {
        const lastmod = t.created_at ? t.created_at.slice(0, 10) : undefined;
        entries.push(
          urlEntry(`${SITE}/memorial/${t.slug}`, {
            changefreq: "yearly",
            priority: "0.5",
            lastmod,
          })
        );
      }
    }

    // Also fetch public tributes from the tributes table (with slugs)
    const { data: sluggedTributes } = await supabase
      .from("tributes")
      .select("slug, created_at")
      .eq("is_public", true)
      .not("slug", "is", null)
      .order("created_at", { ascending: false })
      .limit(1000);

    // Deduplicate — public_tributes slugs take precedence
    const existingSlugs = new Set(tributes?.map((t) => t.slug) || []);
    if (sluggedTributes) {
      for (const t of sluggedTributes) {
        if (t.slug && !existingSlugs.has(t.slug)) {
          const lastmod = t.created_at ? t.created_at.slice(0, 10) : undefined;
          entries.push(
            urlEntry(`${SITE}/memorial/${t.slug}`, {
              changefreq: "yearly",
              priority: "0.5",
              lastmod,
            })
          );
        }
      }
    }
  } catch (e) {
    console.error("Sitemap DB error:", e);
    // Continue with static entries only
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
