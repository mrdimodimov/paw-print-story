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

const ALL_ARTICLES = [
  { title: "Pet Memorial Page Online", href: "/pet-memorial", short: "Create a beautiful online pet memorial" },
  { title: "Pet Memorial Quotes", href: "/pet-memorial-quotes", short: "Meaningful quotes to remember your pet" },
  { title: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes", short: "Comforting Rainbow Bridge quotes for pet loss" },
  { title: "How to Cope With Losing a Pet", href: "/cope-with-losing-a-pet", short: "A gentle guide to pet loss grief and healing" },
  { title: "Pet Sympathy Messages", href: "/pet-sympathy-messages", short: "What to say when someone loses a pet" },
  { title: "Short Dog Memorial Quotes", href: "/short-dog-memorial-quotes", short: "Simple words to remember your dog" },
  { title: "Dog Memorial Quotes", href: "/dog-memorial-quotes", short: "Heartfelt words to remember your dog" },
  { title: "Cat Memorial Quotes", href: "/cat-memorial-quotes", short: "Gentle words to remember your cat" },
  { title: "Pet Remembrance Quotes", href: "/pet-remembrance-quotes", short: "Meaningful words to honor your pet" },
  { title: "Dog Obituary Example", href: "/dog-obituary-example", short: "How to write a beautiful dog obituary" },
  { title: "Cat Memorial Tribute Example", href: "/cat-memorial-tribute-example", short: "A heartfelt cat memorial tribute guide" },
  { title: "Pet Memorial Message Examples", href: "/pet-memorial-message", short: "Thoughtful pet memorial message ideas" },
  { title: "What to Write When a Dog Dies", href: "/what-to-write-when-a-dog-dies", short: "A gentle guide for writing a dog memorial" },
  { title: "What to Write When a Cat Dies", href: "/what-to-write-when-a-cat-dies", short: "A gentle guide for writing a cat memorial" },
  { title: "Pet Condolence Messages", href: "/pet-condolence-messages", short: "What to say when someone loses a pet" },
];

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

  const relatedArticles = ALL_ARTICLES.filter((a) => a.href !== slug).slice(0, 3);

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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <BrandLogo size="sm" onClick={() => navigate("/")} />
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-4 py-2 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
          >
            Create Your Tribute
          </Link>
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
                <h2 className="mb-3 text-2xl font-bold text-foreground">{definitionHeading}</h2>
                <p className="text-muted-foreground leading-relaxed">{definition}</p>
              </section>
            )}

            {/* Inline emotional CTA */}
            <div className="mb-6 text-center">
              <p className="mb-3 text-base italic text-foreground/70">Your pet deserves to be remembered.</p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline transition-colors"
              >
                <PawIcon className="h-4 w-4 shrink-0" />
                Honor your pet's memory in minutes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust signal */}
            <p className="mb-12 text-center text-sm text-muted-foreground/70">
              Created by pet parents, for pet parents.
            </p>
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

          {/* H2: Example Tribute */}
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
              Create a beautiful memorial for your pet
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
              Related Articles
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
