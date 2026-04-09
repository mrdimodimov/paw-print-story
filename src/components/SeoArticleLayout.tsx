import BrandLogo from "@/components/BrandLogo";
import CtaIcon from "@/components/CtaIcon";
import PawIcon from "@/components/PawIcon";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

interface SeoArticleMeta {
  title: string;
  description: string;
}

interface ContextualLink {
  text: string;
  href: string;
}

interface StructuredTip {
  heading: string;
  body: string;
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface InternalLink {
  label: string;
  href: string;
}

interface SeoArticleProps {
  meta: SeoArticleMeta;
  heading: string;
  intro: string;
  exampleTitle: string;
  exampleBody: string[];
  exampleHeading?: string;
  howToWriteIntro?: string;
  howToWriteBody?: string[];
  tips: StructuredTip[];
  tipsIntro?: string;
  outroHeading?: string;
  outro?: string;
  datePublished?: string;
  slug?: string;
  contextualLinks?: ContextualLink[];
  breadcrumbs?: BreadcrumbItem[];
  definition?: string;
  definitionHeading?: string;
  faqs?: FaqItem[];
  internalLinks?: InternalLink[];
}

type ArticleEntry = { title: string; href: string; short: string; tags: string[] };

const ALL_ARTICLES: ArticleEntry[] = [
  // Hub / pillar pages
  { title: "Pet Memorial Page", href: "/pet-memorial", short: "Create a beautiful online pet memorial", tags: ["hub", "memorial"] },
  { title: "Pet Memorial Quotes", href: "/pet-memorial-quotes", short: "Meaningful quotes to remember your pet", tags: ["hub", "quotes"] },
  { title: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes", short: "Comforting Rainbow Bridge quotes for pet loss", tags: ["hub", "quotes", "grief"] },
  { title: "How to Cope With Losing a Pet", href: "/cope-with-losing-a-pet", short: "A gentle guide to pet loss grief and healing", tags: ["hub", "grief"] },
  { title: "Pet Sympathy Messages", href: "/pet-sympathy-messages", short: "What to say when someone loses a pet", tags: ["hub", "messages", "sympathy"] },
  // Dog
  { title: "Dog Memorial Quotes", href: "/dog-memorial-quotes", short: "Heartfelt words to remember your dog", tags: ["dog", "quotes"] },
  { title: "Short Dog Memorial Quotes", href: "/short-dog-memorial-quotes", short: "Simple words to remember your dog", tags: ["dog", "quotes", "short"] },
  { title: "Rest in Peace Dog Quotes", href: "/rest-in-peace-dog-quotes", short: "RIP quotes for dogs", tags: ["dog", "quotes"] },
  { title: "Dog Loss Quotes", href: "/dog-loss-quotes", short: "Quotes for coping with losing a dog", tags: ["dog", "quotes", "grief"] },
  { title: "Dog Obituary Example", href: "/dog-obituary-example", short: "How to write a beautiful dog obituary", tags: ["dog", "writing"] },
  { title: "What to Write When a Dog Dies", href: "/what-to-write-when-a-dog-dies", short: "A gentle guide for writing a dog memorial", tags: ["dog", "writing"] },
  // Cat
  { title: "Cat Memorial Quotes", href: "/cat-memorial-quotes", short: "Gentle words to remember your cat", tags: ["cat", "quotes"] },
  { title: "Cat Loss Quotes", href: "/cat-loss-quotes", short: "Quotes for coping with losing a cat", tags: ["cat", "quotes", "grief"] },
  { title: "Cat Memorial Tribute Example", href: "/cat-memorial-tribute-example", short: "A heartfelt cat memorial tribute guide", tags: ["cat", "writing"] },
  { title: "What to Write When a Cat Dies", href: "/what-to-write-when-a-cat-dies", short: "A gentle guide for writing a cat memorial", tags: ["cat", "writing"] },
  // Breed pages
  { title: "Labrador Memorial Quotes", href: "/labrador-memorial-quotes", short: "Memorial quotes for Labradors", tags: ["dog", "breed", "quotes"] },
  { title: "Golden Retriever Memorial Quotes", href: "/golden-retriever-memorial-quotes", short: "Memorial quotes for Golden Retrievers", tags: ["dog", "breed", "quotes"] },
  { title: "German Shepherd Memorial Quotes", href: "/german-shepherd-memorial-quotes", short: "Memorial quotes for German Shepherds", tags: ["dog", "breed", "quotes"] },
  { title: "French Bulldog Memorial Quotes", href: "/french-bulldog-memorial-quotes", short: "Memorial quotes for French Bulldogs", tags: ["dog", "breed", "quotes"] },
  { title: "Poodle Memorial Quotes", href: "/poodle-memorial-quotes", short: "Memorial quotes for Poodles", tags: ["dog", "breed", "quotes"] },
  { title: "Beagle Memorial Quotes", href: "/beagle-memorial-quotes", short: "Memorial quotes for Beagles", tags: ["dog", "breed", "quotes"] },
  { title: "Rottweiler Memorial Quotes", href: "/rottweiler-memorial-quotes", short: "Memorial quotes for Rottweilers", tags: ["dog", "breed", "quotes"] },
  { title: "Yorkie Memorial Quotes", href: "/yorkie-memorial-quotes", short: "Memorial quotes for Yorkshire Terriers", tags: ["dog", "breed", "quotes"] },
  { title: "Dachshund Memorial Quotes", href: "/dachshund-memorial-quotes", short: "Memorial quotes for Dachshunds", tags: ["dog", "breed", "quotes"] },
  { title: "Boxer Dog Memorial Quotes", href: "/boxer-dog-memorial-quotes", short: "Memorial quotes for Boxer dogs", tags: ["dog", "breed", "quotes"] },
  // Name pages
  { title: "Pet Memorial Quotes for Bella", href: "/pet-memorial-quotes-bella", short: "Personalized quotes for Bella", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Max", href: "/pet-memorial-quotes-max", short: "Personalized quotes for Max", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Luna", href: "/pet-memorial-quotes-luna", short: "Personalized quotes for Luna", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Charlie", href: "/pet-memorial-quotes-charlie", short: "Personalized quotes for Charlie", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Lucy", href: "/pet-memorial-quotes-lucy", short: "Personalized quotes for Lucy", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Daisy", href: "/pet-memorial-quotes-daisy", short: "Personalized quotes for Daisy", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Milo", href: "/pet-memorial-quotes-milo", short: "Personalized quotes for Milo", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Cooper", href: "/pet-memorial-quotes-cooper", short: "Personalized quotes for Cooper", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Bailey", href: "/pet-memorial-quotes-bailey", short: "Personalized quotes for Bailey", tags: ["name", "quotes"] },
  { title: "Pet Memorial Quotes for Sadie", href: "/pet-memorial-quotes-sadie", short: "Personalized quotes for Sadie", tags: ["name", "quotes"] },
  // Long-tail emotional
  { title: "Losing a Pet Quotes", href: "/losing-a-pet-quotes", short: "Quotes for coping with pet loss", tags: ["grief", "quotes"] },
  { title: "Grieving Pet Quotes", href: "/grieving-pet-quotes", short: "Quotes for pet grief", tags: ["grief", "quotes"] },
  { title: "Pet Loss Poems", href: "/pet-loss-poems", short: "Poems for pet loss", tags: ["grief", "poems"] },
  { title: "Pet Memorial Prayers", href: "/pet-memorial-prayers", short: "Prayers for pet memorials", tags: ["memorial", "prayers"] },
  { title: "Short Pet Loss Messages", href: "/short-pet-loss-messages", short: "Brief comfort messages for pet loss", tags: ["messages", "sympathy", "short"] },
  { title: "Long Pet Memorial Messages", href: "/long-pet-memorial-messages", short: "Extended pet memorial messages", tags: ["messages", "memorial"] },
  { title: "Pet Loss Instagram Captions", href: "/pet-loss-instagram-captions", short: "Instagram captions for pet loss", tags: ["captions", "social"] },
  { title: "Pet Remembrance Messages", href: "/pet-remembrance-messages", short: "Messages to remember a pet", tags: ["messages", "memorial"] },
  { title: "Pet Grief Quotes", href: "/pet-grief-quotes", short: "Quotes for pet grief", tags: ["grief", "quotes"] },
  { title: "Missing My Pet Quotes", href: "/missing-my-pet-quotes", short: "Quotes about missing a pet", tags: ["grief", "quotes"] },
  { title: "Pet Remembrance Quotes", href: "/pet-remembrance-quotes", short: "Meaningful words to honor your pet", tags: ["memorial", "quotes"] },
  { title: "Short Pet Memorial Quotes", href: "/short-pet-memorial-quotes", short: "Brief pet memorial quotes", tags: ["quotes", "short"] },
  { title: "Sudden Pet Death Quotes", href: "/sudden-pet-death-quotes", short: "Quotes for unexpected pet loss", tags: ["grief", "quotes"] },
  { title: "Short Cat Memorial Quotes", href: "/short-cat-memorial-quotes", short: "Brief quotes to remember your cat", tags: ["cat", "quotes", "short"] },
  { title: "Loss of Dog Messages to a Friend", href: "/loss-of-dog-messages-to-a-friend", short: "What to say when a friend loses a dog", tags: ["dog", "messages", "sympathy"] },
  { title: "Sudden Dog Death Quotes", href: "/sudden-dog-death-quotes", short: "Quotes for sudden dog loss", tags: ["dog", "grief", "quotes"] },
  { title: "Pet Grief Quotes for Instagram", href: "/pet-grief-quotes-for-instagram", short: "Honest grief captions for Instagram", tags: ["grief", "captions", "social"] },
  { title: "Pet Anniversary Quotes", href: "/pet-anniversary-quotes", short: "Quotes for pet loss anniversaries", tags: ["memorial", "quotes"] },
  // Captions & utility
  { title: "Pet Memorial Captions", href: "/pet-memorial-captions", short: "Captions for pet memorials", tags: ["captions", "social"] },
  { title: "Instagram Pet Memorial Captions", href: "/instagram-pet-memorial-captions", short: "Instagram captions for pet memorials", tags: ["captions", "social"] },
  // Messages
  { title: "Pet Memorial Message Examples", href: "/pet-memorial-message", short: "Thoughtful pet memorial message ideas", tags: ["messages", "memorial"] },
  { title: "Pet Condolence Messages", href: "/pet-condolence-messages", short: "What to say when someone loses a pet", tags: ["messages", "sympathy"] },
];

// Category browse links shown on every page
const CATEGORY_LINKS = [
  { label: "Dog Memorial Quotes", href: "/dog-memorial-quotes" },
  { label: "Cat Memorial Quotes", href: "/cat-memorial-quotes" },
  { label: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
  { label: "Pet Loss Quotes", href: "/losing-a-pet-quotes" },
  { label: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
  { label: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes" },
];

/** Return up to `count` related articles based on shared tags, excluding current page */
function getRelatedArticles(currentSlug: string, count: number = 6): ArticleEntry[] {
  const current = ALL_ARTICLES.find((a) => a.href === currentSlug);
  const currentTags = current?.tags || [];
  const others = ALL_ARTICLES.filter((a) => a.href !== currentSlug);

  // Score by number of shared tags
  const scored = others.map((a) => ({
    ...a,
    score: a.tags.filter((t) => currentTags.includes(t)).length,
  }));

  // Sort by score desc, then alphabetically for ties
  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return scored.slice(0, count);
}

const SeoArticleLayout = ({
  meta,
  heading,
  intro,
  exampleTitle,
  exampleBody,
  howToWriteIntro = "Writing a tribute doesn't require any special skill — just honesty and a willingness to remember. Here's a simple approach to get started.",
  howToWriteBody = [
    "Start by recalling the moment your pet entered your life. What do you remember most clearly?",
    "Think about their daily habits — the things they did that made you smile without even trying.",
    "Write about the way they made you feel. What did their presence bring to your home?",
    "Don't edit too much. The best tributes feel natural, like you're speaking to someone who loved them too.",
  ],
  tips,
  tipsIntro = "Here are a few tips to help you write a tribute that feels personal and true to your pet's life.",
  outroHeading = "You Don't Have to Write It Alone",
  outro = "If putting your feelings into words feels overwhelming, VellumPet can help. Answer a few simple questions about your pet, and we'll craft a beautiful, heartfelt tribute for you.",
  datePublished = "2025-01-15",
  slug = "",
  contextualLinks = [],
  breadcrumbs,
  definition,
  definitionHeading,
  faqs,
  internalLinks,
  exampleHeading = "Example Tribute",
}: SeoArticleProps) => {
  const navigate = useNavigate();

  const siteBase = import.meta.env.VITE_SITE_URL || "https://vellumpet.com";
  const canonicalUrl = `${siteBase}${slug}`;

  if (!slug) {
    console.warn("SeoArticleLayout: missing slug");
  }

  const effectiveDefinitionHeading = definitionHeading || `What Is ${heading}?`;

  const relatedArticles = getRelatedArticles(slug, 6);
  const browseLinks = CATEGORY_LINKS.filter((c) => c.href !== slug);

  // Intent-based CTA text
  const lowerHeading = heading.toLowerCase();
  const isExamplePage = lowerHeading.includes("example") || lowerHeading.includes("tribute example");
  const isGriefPage = lowerHeading.includes("grief") || lowerHeading.includes("losing") || lowerHeading.includes("loss") || lowerHeading.includes("cope") || lowerHeading.includes("sudden");
  // Default to quotes if not example or grief
  const emotionalCtaLine1 = isExamplePage
    ? "You can create something like this for your own pet."
    : isGriefPage
    ? "When you're ready, create a quiet space to remember them."
    : "Turn these words into a personal tribute.";
  const midCtaText = isExamplePage
    ? "Create something like this for your pet"
    : isGriefPage
    ? "When you're ready, honor their memory"
    : "Turn your favorite quote into a lasting tribute";

  // Build breadcrumb trail: Home → [parent] → current page
  const crumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    ...(breadcrumbs || []),
    { name: heading, href: slug || "" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    author: { "@type": "Organization", name: "VellumPet", url: siteBase },
    publisher: { "@type": "Organization", name: "VellumPet", url: siteBase },
    datePublished,
    dateModified: datePublished,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.href.startsWith("http") ? c.href : `${siteBase}${c.href}`,
    })),
  };

  const faqLd = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="VellumPet" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta property="og:image" content={`${siteBase}/og-default.jpg`} />
        <meta name="twitter:image" content={`${siteBase}/og-default.jpg`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <BrandLogo size="sm" onClick={() => navigate("/")} />
          <div className="flex flex-col items-end gap-0.5">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-4 py-2 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
            >
              Start Your Pet's Tribute
            </Link>
            <span className="text-xs text-muted-foreground">It only takes a minute to begin.</span>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="tribute-container max-w-2xl pt-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <span className="mx-1">›</span>}
              {i < crumbs.length - 1 ? (
                <Link to={c.href} className="hover:text-primary transition-colors">{c.name}</Link>
              ) : (
                <span className="text-foreground font-medium">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Article */}
      <article className="tribute-section">
        <div className="tribute-container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              {heading}
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>

            {/* Definition block */}
            {definition && (
              <section className="mb-10">
                <h2 className="mb-3 text-2xl font-bold text-foreground">{effectiveDefinitionHeading}</h2>
                <p className="text-muted-foreground leading-relaxed">{definition}</p>
              </section>
            )}


          </motion.div>

          {/* Contextual links */}
          {contextualLinks.length > 0 && (
            <div className="mb-12 flex flex-wrap gap-3">
              {contextualLinks.map((link, i) => (
                <Link
                  key={i}
                  to={link.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent/40"
                >
                  <PawIcon className="h-3.5 w-3.5 shrink-0" />
                  {link.text}
                </Link>
              ))}
            </div>
          )}

          {/* Browse more categories */}
          <div className="mb-12">
            <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Browse more</p>
            <div className="flex flex-wrap gap-2">
              {browseLinks.map((link, i) => (
                <Link
                  key={i}
                  to={link.href}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/40 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="mb-5 text-2xl font-bold text-foreground">
              {exampleHeading}
            </h2>
            <div className="rounded-xl border border-border bg-card p-8 shadow-card md:p-10">
              <h3 className="mb-5 text-center font-display text-xl font-semibold text-foreground">
                {exampleTitle}
              </h3>
              <div className="space-y-4 font-body text-sm leading-relaxed text-foreground/90">
                {exampleBody.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Emotional CTA after example */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="my-24 flex justify-center"
          >
            <div className="w-full max-w-lg rounded-2xl bg-accent/40 px-8 py-12 text-center">
              <p className="mb-4 text-sm italic text-muted-foreground tracking-wide">Can you picture them right now?</p>
              <p className="mb-1 text-xl md:text-2xl font-semibold text-foreground leading-snug">
                If you're still thinking about them…
              </p>
              <p className="mb-5 text-xl md:text-2xl font-semibold text-foreground leading-snug">
                this is your moment to remember them properly.
              </p>
              <p className="mb-8 text-base text-muted-foreground">
                Create something real, not just words on a page.
              </p>
              <Link
                to="/tribute"
                className="inline-flex items-center gap-2.5 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-12 py-5 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
              >
                <CtaIcon className="mr-1 shrink-0" size={22} />
                Create Their Tribute Now
              </Link>
            </div>
          </motion.div>

          {/* H2: How to Write Your Own */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              How to Write Your Own
            </h2>
            <p className="mb-6 text-muted-foreground">{howToWriteIntro}</p>
            <div className="space-y-4 text-foreground/90">
              {howToWriteBody.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.section>

          {/* Mid-article CTA block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center md:p-8"
          >
            <p className="mb-4 text-lg font-medium text-foreground">
              {midCtaText}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-6 py-3 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
            >
              <CtaIcon className="mr-1 shrink-0" size={18} />
              Start Your Tribute
            </Link>
            <p className="mt-4 text-xs italic text-muted-foreground/60">
              "It made it so much easier to put everything I felt into words."
            </p>
          </motion.div>

          {/* H2: Tips */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Tips for Writing a Meaningful Tribute
            </h2>
            <p className="mb-8 text-muted-foreground">{tipsIntro}</p>
            <div className="space-y-6">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <PawIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{tip.heading}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14 rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10"
          >
            <h2 className="mb-3 text-2xl font-bold text-foreground">
              {outroHeading}
            </h2>
            <p className="mb-6 text-muted-foreground">{outro}</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-8 py-4 text-base font-medium text-white shadow-glow transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
            >
              <CtaIcon className="mr-1 shrink-0" size={22} />
              Create a Tribute for Your Pet
            </Link>
            <div className="mt-5 space-y-1">
              <p className="text-xs italic text-muted-foreground/60">
                "I didn't expect something this simple to feel so meaningful."
              </p>
              <p className="text-xs italic text-muted-foreground/60">
                "Now I have something I can come back to and remember them."
              </p>
            </div>
          </motion.section>

          {/* Related Articles */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Related Reads
            </h2>
            <div className="space-y-4">
              {relatedArticles.map((article) => (
                <Link
                  key={article.href}
                  to={article.href}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {article.short}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Recently Remembered */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <h2 className="mb-3 text-2xl font-bold text-foreground">
              Recently Remembered Pets
            </h2>
            <p className="mb-4 text-muted-foreground">
              Browse heartfelt tributes created by pet owners honoring the pets they loved.
            </p>
            <Link
              to="/memories"
              className="group inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              View all pet memorials <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.section>

          {/* FAQ Section */}
          {faqs && faqs.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-14"
            >
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-foreground">{faq.question}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Internal Links */}
          {internalLinks && internalLinks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-14"
            >
              <h3 className="mb-4 text-xl font-bold text-foreground">
                Explore More Guides
              </h3>
              <ul className="space-y-2">
                {internalLinks.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.href}
                      className="inline-flex items-center gap-2 text-primary font-medium hover:underline transition-colors"
                    >
                      <PawIcon className="h-3.5 w-3.5 shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="tribute-container">
          <p>
            Made with <Heart className="inline h-3 w-3 text-primary" /> by{" "}
            {BRAND.name}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SeoArticleLayout;
