import BrandLogo from "@/components/BrandLogo";
import CtaIcon from "@/components/CtaIcon";
import PawIcon from "@/components/PawIcon";
import TributePreviewCard from "@/components/TributePreviewCard";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, ArrowRight, BookOpen, Share2, Clock } from "lucide-react";
import { BRAND } from "@/lib/brand";

const EXAMPLE_TRIBUTE = {
  imageUrl: "/images/oliver-tribute.jpg",
  petName: "Oliver",
  years: "2010–2024",
  memoryTitle: "The One Who Chose Us",
  preview:
    "Oliver arrived on a grey November afternoon — not as a planned addition, but as a quiet inevitability. He had been found curled beneath the back steps of a neighbour's house, too thin and too still for a kitten so small...",
  linkTo: "/example-tribute/oliver",
};

const section = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
  viewport: { once: true },
});

const PetMemorial = () => {
  const navigate = useNavigate();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Pet Memorial Page Online | Create a Tribute",
    description:
      "Create a beautiful pet memorial page online. Turn your pet's memories into a heartfelt tribute story and shareable legacy page in minutes.",
    author: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    publisher: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    datePublished: "2025-03-01",
    dateModified: "2025-03-01",
    mainEntityOfPage: "https://paw-print-story.lovable.app/pet-memorial",
    url: "https://paw-print-story.lovable.app/pet-memorial",
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pet Memorial Page Online | Create a Tribute | VellumPet</title>
        <meta
          name="description"
          content="Create a beautiful pet memorial page online. Turn your pet's memories into a heartfelt online tribute, shareable memorial, and lasting legacy page in minutes."
        />
        <link rel="canonical" href="https://paw-print-story.lovable.app/pet-memorial" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <BrandLogo size="sm" onClick={() => navigate("/")} />
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-4 py-2 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
          >
            Create Your Tribute
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-[700px] px-5 py-16 md:py-20">
        {/* ─── 1. Hero ─── */}
        <motion.section {...section()} className="mb-16">
          <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-[2.75rem]">
            Create a Pet Memorial Page Online
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            When a pet passes away, the memories you shared deserve more than a
            quiet corner of your mind. A pet memorial page gives you a place to
            gather those moments — the walks, the quirks, the quiet comfort — and
            turn them into something lasting and beautiful.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-7 py-3.5 text-base font-medium text-white shadow-glow transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
          >
            <CtaIcon className="shrink-0" size={20} />
            Create Their Memorial
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Takes less than 2 minutes · No writing required
          </p>
        </motion.section>

        {/* ─── 2. What Is a Pet Memorial Page ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            What Is a Pet Memorial Page?
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              A pet memorial page is a dedicated online space where you can honor
              your pet's life with stories, photos, and heartfelt words. Unlike a
              social media post that quickly disappears in a feed, a memorial page
              is permanent — a place you and others can return to whenever you want
              to remember.
            </p>
            <p>
              Think of it as a living tribute. It can hold the story of how your
              pet came into your life, their personality, the habits that made you
              smile, and the quiet moments that meant the most. It's yours to keep,
              share, or simply visit whenever you need to feel close to them again.
            </p>
            <p>
              Memorial pages are especially meaningful because they can be shared
              with family and friends who also loved your pet. A single link lets
              everyone who cared about them read the story of their life and add
              their own memories.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-foreground">
              A pet memorial page typically includes:
            </h3>
            <ul className="space-y-2.5 pl-1">
              {[
                "A written tribute telling your pet's story",
                "Photos from different moments in their life",
                "A shareable link so family and friends can visit",
                "A permanent, private or public URL that won't disappear",
                "Space for others to leave memories and reactions",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/90">
                  <PawIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* ─── 3. Why Create a Pet Memorial ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Why Create a Pet Memorial?
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              Grief after losing a pet is real and valid. A memorial page gives you
              a constructive, gentle way to process that grief — not by moving on,
              but by holding on to what mattered most.
            </p>
            <p>
              Writing about your pet — or having someone help you write it — can be
              deeply therapeutic. It forces you to slow down, recall specific
              moments, and put into words the impact they had on your daily life.
              Many people find that creating a tribute brings comfort they didn't
              expect.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Emotional healing",
                desc: "Processing grief through memory and storytelling",
              },
              {
                icon: Share2,
                title: "Share with loved ones",
                desc: "A single link everyone who cared can visit",
              },
              {
                icon: BookOpen,
                title: "Preserve their story",
                desc: "A lasting tribute that won't fade or disappear",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-1 font-semibold text-foreground text-sm">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── 4. Example Pet Memorial ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Example Pet Memorial
          </h2>
          <p className="mb-6 text-muted-foreground">
            Here's what a finished pet memorial looks like. Each tribute is
            unique — crafted from the memories you share about your pet.
          </p>
          <div className="mx-auto max-w-xs">
            <TributePreviewCard {...EXAMPLE_TRIBUTE} index={0} />
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent/30 px-6 py-3 text-sm font-medium text-primary transition-all hover:bg-accent/50"
            >
              Create one like this for your pet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        {/* ─── 5. How to Create a Pet Memorial Page ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            How to Create a Pet Memorial Page
          </h2>
          <p className="mb-8 text-muted-foreground">
            With VellumPet, it takes less than two minutes. No writing skill
            needed — just a few memories.
          </p>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Answer a few gentle questions",
                body: "We'll ask about your pet's name, personality, favorite moments, and the things you miss most. Just short answers — a few words or a sentence each.",
              },
              {
                step: "2",
                title: "We write the tribute for you",
                body: "Using your memories, VellumPet crafts a heartfelt, beautifully written tribute story that captures your pet's life and personality.",
              },
              {
                step: "3",
                title: "Share or keep your memorial page",
                body: "Your tribute lives on its own permanent URL. Share it with family and friends, download a PDF, or simply keep it as a place to return to whenever you need.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {s.step}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── 6. Coping with Pet Loss ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Coping with Pet Loss
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
            The loss of a pet can feel surprisingly devastating. They're part of
              our daily routines, our emotional anchors, and often our closest
              companions. It's completely normal to grieve deeply — and to feel
              that others might not fully understand the weight of that loss. Our guide on{" "}
              <Link to="/cope-with-losing-a-pet" className="text-primary underline underline-offset-2 hover:text-primary/80">
                how to cope with losing a pet
              </Link>{" "}
              offers gentle, practical support.
            </p>
            <p>
              One of the most helpful things you can do is acknowledge the
              significance of your bond. Your pet was not "just" a pet — they were
              family. Giving yourself permission to grieve, without judgment, is
              the first step toward healing.
            </p>
            <p>
              Creating a memorial can be part of that process. Writing about your
              pet — or reading what someone else has written from your memories —
              helps you move through grief by celebrating what you had, rather than
              focusing only on the absence. Many people find that the act of
              remembering brings unexpected comfort and even moments of joy.
            </p>
            <p>
              If you're struggling, consider talking to someone who understands pet
              loss. You might also find comfort in{" "}
              <Link to="/rainbow-bridge-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Rainbow Bridge quotes
              </Link>{" "}
              or{" "}
              <Link to="/pet-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
                pet memorial quotes
              </Link>. There are grief support groups, hotlines, and counselors who
              specialize in exactly this kind of loss. You're not alone, and what
              you're feeling is valid.
            </p>
          </div>
        </motion.section>

        {/* ─── Hub: Explore by Topic ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Explore Our Pet Memorial Guides
          </h2>
          <p className="mb-8 text-muted-foreground">
            Whether you're looking for the right words, comfort during grief, or practical advice on writing a tribute, we have dedicated guides for every stage.
          </p>
          <div className="space-y-6">
            {[
              {
                title: "Pet Memorial Quotes",
                intro: "Curated quotes for dogs, cats, and all beloved pets — perfect for tribute pages, sympathy cards, and social media.",
                href: "/pet-memorial-quotes",
              },
              {
                title: "How to Cope With Losing a Pet",
                intro: "A gentle, practical guide to pet loss grief — why it hurts, what to expect, and healthy ways to move forward.",
                href: "/cope-with-losing-a-pet",
              },
              {
                title: "Dog Obituary Example",
                intro: "A full example of a dog obituary with step-by-step writing advice. See what a heartfelt tribute looks like.",
                href: "/dog-obituary-example",
              },
              {
                title: "Cat Memorial Tribute Example",
                intro: "A complete cat memorial tribute with tips for capturing your cat's quiet, independent personality.",
                href: "/cat-memorial-tribute-example",
              },
              {
                title: "Pet Sympathy Messages",
                intro: "What to say when someone you care about loses a pet — thoughtful messages for cards, texts, and conversations.",
                href: "/pet-sympathy-messages",
              },
              {
                title: "Rainbow Bridge Quotes",
                intro: "Comforting words drawn from the Rainbow Bridge tradition — for those who find solace in the hope of reunion.",
                href: "/rainbow-bridge-quotes",
              },
            ].map((hub) => (
              <Link
                key={hub.href}
                to={hub.href}
                className="group block rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {hub.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {hub.intro}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ─── 8. Final CTA ─── */}
        <motion.section
          {...section()}
          className="rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10"
        >
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Every Pet Deserves to Be Remembered
          </h2>
          <p className="mb-6 text-muted-foreground">
            You don't need to be a writer. Just share a few memories, and we'll
            create a beautiful tribute you can keep forever.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-8 py-4 text-base font-medium text-white shadow-glow transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
          >
            <CtaIcon className="shrink-0" size={22} />
            Create Their Memorial
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Takes less than 2 minutes · No writing required
          </p>
        </motion.section>
      </article>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-3xl px-5">
          <p>
            Made with <Heart className="inline h-3 w-3 text-primary" /> by{" "}
            {BRAND.name}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PetMemorial;
