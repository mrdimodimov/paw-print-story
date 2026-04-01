import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import BrandLogo from "@/components/BrandLogo";
import CtaIcon from "@/components/CtaIcon";
import PawIcon from "@/components/PawIcon";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

const section = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
  viewport: { once: true },
});

const QuoteBlock = ({ text, author }: { text: string; author?: string }) => (
  <blockquote className="border-l-2 border-primary/30 pl-5 py-1">
    <p className="text-foreground/90 italic leading-relaxed">{text}</p>
    {author && (
      <footer className="mt-1 text-xs text-muted-foreground">— {author}</footer>
    )}
  </blockquote>
);

const RAINBOW_BRIDGE_FAQS = [
  { question: "What is the Rainbow Bridge for pets?", answer: "The Rainbow Bridge is a concept that describes a peaceful place where pets go after they pass away, where they are happy and wait to be reunited with their owners." },
  { question: "What are Rainbow Bridge quotes used for?", answer: "Rainbow Bridge quotes are used to comfort people after losing a pet and to express hope, love, and remembrance." },
  { question: "Can I use Rainbow Bridge quotes in a tribute?", answer: "Yes, many people include Rainbow Bridge quotes in memorial pages, sympathy messages, or social media posts to honor their pet." },
  { question: "Are Rainbow Bridge quotes only for dogs?", answer: "No, Rainbow Bridge quotes can be used for any pet, including cats and other animals." },
  { question: "How do I create a full memorial for my pet?", answer: "You can create a pet memorial page that includes quotes, photos, and stories to celebrate your pet's life and preserve their memory." },
];

const RainbowBridgeQuotes = () => {
  const navigate = useNavigate();

  const canonicalUrl = "https://paw-print-story.lovable.app/rainbow-bridge-quotes";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Rainbow Bridge Quotes: Comforting Words for Pet Loss",
    description:
      "Find comforting Rainbow Bridge quotes for dogs and cats. Meaningful words to remember your pet and cope with loss.",
    author: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    publisher: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    datePublished: "2025-03-27",
    dateModified: "2025-03-27",
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: RAINBOW_BRIDGE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Rainbow Bridge Quotes: Comforting Words for Pet Loss | VellumPet</title>
        <meta
          name="description"
          content="Find comforting Rainbow Bridge quotes for dogs and cats. Meaningful words to remember your pet and cope with loss."
        />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <SeoBreadcrumbs items={[
        { name: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
        { name: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes" },
      ]} />

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
        {/* ─── H1: Hero ─── */}
        <motion.section {...section()} className="mb-10">
          <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-[2.75rem]">
            Rainbow Bridge Quotes: Comforting Words for Pet Loss
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            When a beloved pet dies, the grief can feel overwhelming. One of the
            most enduring sources of comfort for pet owners is the idea of the
            Rainbow Bridge — a peaceful place where pets wait, healthy and happy,
            until they're reunited with the people who loved them.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            These rainbow bridge quotes are gathered here to help you find words
            when your own feel impossible. Whether you're looking for something
            to write in a card, share alongside{" "}
            <Link to="/pet-sympathy-messages" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet sympathy messages
            </Link>, or include in a{" "}
            <Link to="/pet-memorial" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet memorial page
            </Link>, we hope they bring you a moment of peace.
          </p>

          {/* Contextual Links */}
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="Related topics">
            {[
              { text: "Pet memorial quotes", href: "/pet-memorial-quotes" },
              { text: "Dog memorial quotes", href: "/dog-memorial-quotes" },
              { text: "Pet sympathy messages", href: "/pet-sympathy-messages" },
              { text: "Create a pet memorial page", href: "/pet-memorial" },
              { text: "Create a tribute", href: "/create" },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                {link.text}
              </Link>
            ))}
          </nav>

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

        {/* ─── H2: Definition ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            What Are Rainbow Bridge Quotes?
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            Rainbow Bridge quotes are comforting messages about the idea that pets who have passed away wait for their owners in a peaceful place called the Rainbow Bridge. These quotes help express grief, hope, and the belief of being reunited one day. They're often shared in{" "}
            <Link to="/pet-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet memorial quotes
            </Link>{" "}
            collections and alongside{" "}
            <Link to="/dog-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              dog memorial quotes
            </Link>.
          </p>
        </motion.section>

        {/* ─── H2: What Is the Rainbow Bridge? ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            What Is the Rainbow Bridge?
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              The Rainbow Bridge is a concept from a poem — often attributed to
              an anonymous author — that describes a meadow just beyond the edge
              of heaven. In this place, pets who have passed away are restored to
              health and happiness. They run and play until, one day, they sense
              their owner approaching. Then they race to meet them, and together
              they cross the Rainbow Bridge into eternity.
            </p>
            <p>
              It's a simple idea, but it resonates deeply with anyone who has lost
              a pet. It offers the comfort of reunion — the hope that the goodbye
              isn't truly final. For many, the Rainbow Bridge isn't about religion
              or belief. It's about love that doesn't end.
            </p>
          </div>
        </motion.section>

        {/* ─── H2: Short Rainbow Bridge Quotes ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Short Rainbow Bridge Quotes
          </h2>
          <p className="mb-6 text-muted-foreground">
            Brief, gentle words that capture the spirit of the Rainbow Bridge.
            Perfect for cards, frames, or quiet moments of remembrance.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="You're not gone. You're just waiting on the other side." />
            <QuoteBlock text="Run free until we meet again." />
            <QuoteBlock text="The Rainbow Bridge is where love waits." />
            <QuoteBlock text="Not goodbye — just see you later." />
            <QuoteBlock text="You crossed the bridge, but you never left my heart." />
            <QuoteBlock text="Somewhere beyond the clouds, a tail is wagging." />
            <QuoteBlock text="Until we meet again at the Rainbow Bridge, I carry you with me." />
            <QuoteBlock text="Death ends a life, not a bond." />
            <QuoteBlock text="You left paw prints on my heart that will never fade." />
            <QuoteBlock text="Over the bridge and into the light — rest now, sweet friend." />
            <QuoteBlock text="The bridge is made of love. You've already crossed it a thousand times." />
            <QuoteBlock text="I imagine you there — healthy, whole, and waiting." />
          </div>
        </motion.section>

        {/* ─── H2: Rainbow Bridge Quotes for Dogs ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Rainbow Bridge Quotes for Dogs
          </h2>
          <p className="mb-6 text-muted-foreground">
            Dogs give us everything — loyalty, joy, a reason to come home. These
            rainbow bridge quotes for dogs honour that bond. For more ways to
            remember your dog, see our guide on{" "}
            <Link to="/what-to-write-when-a-dog-dies" className="text-primary underline underline-offset-2 hover:text-primary/80">
              what to write when a dog dies
            </Link>.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="You were the best boy until the very end. Now you're the best boy on the other side." />
            <QuoteBlock text="Somewhere at the Rainbow Bridge, you're finally catching that squirrel." />
            <QuoteBlock text="You greeted me every day like I was the most important person in the world. I hope I made you feel the same." />
            <QuoteBlock text="The walks have ended, but the love hasn't. Wait for me, old friend." />
            <QuoteBlock text="I picture you there — running through open fields, ears back, tongue out, free." />
            <QuoteBlock text="You never needed words. You loved me in a language deeper than that." />
            <QuoteBlock text="A dog's love doesn't die. It just crosses the bridge ahead of you." />
            <QuoteBlock text="You made every house a home. Now the bridge is brighter because you're there." />
            <QuoteBlock text="Every stick, every ball, every muddy paw print — I wouldn't trade a single one." />
            <QuoteBlock text="Rest easy, good dog. I'll find you again." />
          </div>
        </motion.section>

        {/* ─── H2: Rainbow Bridge Quotes for Cats ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Rainbow Bridge Quotes for Cats
          </h2>
          <p className="mb-6 text-muted-foreground">
            Cats love quietly and fiercely on their own terms. These rainbow
            bridge quotes for cats reflect that gentle, independent spirit. You
            might also find comfort in our{" "}
            <Link to="/cat-memorial-tribute-example" className="text-primary underline underline-offset-2 hover:text-primary/80">
              cat memorial tribute example
            </Link>.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="You chose my lap out of every spot in the world. I'll never forget that." />
            <QuoteBlock text="Somewhere at the Rainbow Bridge, you're in a sunbeam — right where you belong." />
            <QuoteBlock text="You purred away every hard day I ever had. The silence now is the hardest part." />
            <QuoteBlock text="Cats don't follow anyone — but you followed me to the door every morning. I hope someone greets you at the bridge." />
            <QuoteBlock text="You were small and soft, and you made everything feel safe." />
            <QuoteBlock text="The windowsill is empty now, but I imagine you watching from somewhere higher." />
            <QuoteBlock text="You never needed me. You stayed because you wanted to. That meant everything." />
            <QuoteBlock text="I hope the bridge has warm blankets and all the cardboard boxes you could want." />
            <QuoteBlock text="Your quiet presence was louder than any words. I miss it every day." />
            <QuoteBlock text="You walked into my life so softly. And you left the same way." />
          </div>
        </motion.section>

        {/* ─── H2: Rainbow Bridge Quotes for Social Media ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Rainbow Bridge Quotes for Social Media
          </h2>
          <p className="mb-6 text-muted-foreground">
            Short, shareable lines for Instagram captions, stories, or tribute
            posts. For more caption-ready quotes, visit our{" "}
            <Link to="/pet-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet memorial quotes
            </Link>{" "}
            collection.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="Over the bridge. Never out of my heart." />
            <QuoteBlock text="Run free. I'll see you again." />
            <QuoteBlock text="The Rainbow Bridge has one more angel today." />
            <QuoteBlock text="Gone from my arms. Waiting at the bridge." />
            <QuoteBlock text="Love doesn't stop at the Rainbow Bridge." />
            <QuoteBlock text="Until we meet again, sweet one." />
            <QuoteBlock text="You made this world better just by being in it." />
            <QuoteBlock text="Forever in my heart. Forever at the bridge." />
          </div>
        </motion.section>

        {/* ─── H2: Why Rainbow Bridge Quotes Bring Comfort ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Why Rainbow Bridge Quotes Bring Comfort
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              Grief after losing a pet can feel isolating. People around you may
              not fully understand the depth of what you've lost — the daily
              routines, the companionship, the quiet presence that shaped your
              life in ways you didn't realize until it was gone.
            </p>
            <p>
              Rainbow Bridge quotes offer comfort because they give shape to a
              hope many of us carry — that our pets are somewhere safe, somewhere
              happy, and that the love between you didn't end at goodbye. They
              remind you that your grief is valid and that the bond you shared was
              real and meaningful.
            </p>
            <p>
              Reading or sharing these words can also help you feel less alone.
              When you find a quote that says exactly what you're feeling, it's a
              reminder that millions of other people have walked this same path —
              and found their way through it. You will too.
            </p>
          </div>
        </motion.section>

        {/* ─── H2: Creating a Lasting Memorial ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Creating a Lasting Memorial for Your Pet
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              A quote can capture a feeling, but it can't hold your pet's whole
              story — the way they tilted their head, the spot they always
              claimed, the morning routine that revolved around them. Those
              details deserve more than a single line.
            </p>
            <p>
              A memorial page lets you gather those memories into something
              permanent. With VellumPet, you share a few simple details about
              your pet and we craft a beautiful, heartfelt tribute that tells
              their story. It takes less than two minutes, requires no writing
              skill, and gives you a page you can keep, share, or revisit
              whenever you need to feel close to them again.
            </p>
            <p>
              For inspiration on what to include, explore our{" "}
              <Link to="/pet-memorial-message" className="text-primary underline underline-offset-2 hover:text-primary/80">
                pet memorial message examples
              </Link>.
            </p>
          </div>
        </motion.section>

        {/* ─── CTA Section ─── */}
        <motion.section
          {...section()}
          className="mb-16 rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10"
        >
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Create a Beautiful Memorial for Your Pet
          </h2>
          <p className="mb-6 text-muted-foreground">
            You don't need to be a writer. Share a few memories, and we'll
            create a tribute you can keep forever.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-8 py-4 text-base font-medium text-white shadow-glow transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
          >
            <CtaIcon className="shrink-0" size={22} />
            Try It with Your Own Memories →
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Takes less than 2 minutes
          </p>
        </motion.section>

        {/* ─── Related Articles ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Related Articles
          </h2>
          <div className="space-y-3">
            {[
              { title: "Pet Memorial Quotes", desc: "Meaningful quotes to remember your pet", href: "/pet-memorial-quotes" },
              { title: "Pet Sympathy Messages", desc: "What to say when someone loses a pet", href: "/pet-sympathy-messages" },
              { title: "How to Cope With Losing a Pet", desc: "A gentle guide to grief and healing", href: "/cope-with-losing-a-pet" },
              { title: "Pet Memorial Page Online", desc: "Create a beautiful online pet memorial", href: "/pet-memorial" },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ─── FAQ ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "What is the Rainbow Bridge for pets?", a: "The Rainbow Bridge is a concept that describes a peaceful place where pets go after they pass away, where they are happy and wait to be reunited with their owners." },
              { q: "What are Rainbow Bridge quotes used for?", a: "Rainbow Bridge quotes are used to comfort people after losing a pet and to express hope, love, and remembrance." },
              { q: "Can I use Rainbow Bridge quotes in a tribute?", a: "Yes, many people include Rainbow Bridge quotes in memorial pages, sympathy messages, or social media posts to honor their pet." },
              { q: "Are Rainbow Bridge quotes only for dogs?", a: "No, Rainbow Bridge quotes can be used for any pet, including cats and other animals." },
              { q: "How do I create a full memorial for my pet?", a: "You can create a pet memorial page that includes quotes, photos, and stories to celebrate your pet's life and preserve their memory." },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── Internal Links ─── */}
        <motion.section {...section()} className="mb-16">
          <h3 className="mb-4 text-xl font-bold text-foreground">Explore More Guides</h3>
          <ul className="space-y-2">
            {[
              { label: "Create a pet memorial page", href: "/pet-memorial" },
              { label: "Pet memorial quotes", href: "/pet-memorial-quotes" },
              { label: "How to cope with losing a pet", href: "/cope-with-losing-a-pet" },
              { label: "What to write when a cat dies", href: "/what-to-write-when-a-cat-dies" },
            ].map((link, i) => (
              <li key={i}>
                <Link to={link.href} className="inline-flex items-center gap-2 text-primary font-medium hover:underline transition-colors">
                  <PawIcon className="h-3.5 w-3.5 shrink-0" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* ─── Brand Line ─── */}
        <p className="mb-16 text-sm text-muted-foreground text-center">
          VellumPet helps pet owners create beautiful online memorial pages to honor their pets.
        </p>
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

export default RainbowBridgeQuotes;
