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

const Q = ({ text }: { text: string }) => (
  <blockquote className="border-l-2 border-primary/30 pl-5 py-1">
    <p className="text-foreground/90 italic leading-relaxed">{text}</p>
  </blockquote>
);

const ShortDogMemorialQuotes = () => {
  const navigate = useNavigate();
  const canonicalUrl = "https://paw-print-story.lovable.app/short-dog-memorial-quotes";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Short Dog Memorial Quotes: Simple Words to Remember Your Dog",
    description: "Find short dog memorial quotes, simple remembrance messages, and meaningful words to honor your beloved dog.",
    author: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    publisher: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    datePublished: "2025-03-27",
    dateModified: "2025-03-27",
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Short Dog Memorial Quotes: Simple Words to Remember Your Dog | VellumPet</title>
        <meta name="description" content="Find short dog memorial quotes, simple remembrance messages, and meaningful words to honor your beloved dog." />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <BrandLogo size="sm" onClick={() => navigate("/")} />
          <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-4 py-2 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card">
            Create Your Tribute
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-[700px] px-5 py-16 md:py-20">
        {/* H1 */}
        <motion.section {...section()} className="mb-16">
          <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-[2.75rem]">
            Short Dog Memorial Quotes: Simple Words to Remember Your Dog
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            Sometimes the shortest words carry the deepest meaning. When you've lost a dog, you don't always need a long tribute or a poem — sometimes just a few honest words are enough to say everything you're feeling.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            These short dog memorial quotes are here for those moments — when you need something brief for a card, a caption, an engraving, or simply to hold close. If you're looking for a more lasting way to remember your dog, you can{" "}
            <Link to="/pet-memorial" className="text-primary underline underline-offset-2 hover:text-primary/80">
              create a pet memorial page
            </Link>{" "}
            in just a few minutes. For support with the grief itself, our guide on{" "}
            <Link to="/cope-with-losing-a-pet" className="text-primary underline underline-offset-2 hover:text-primary/80">
              coping with pet loss
            </Link>{" "}
            may help.
          </p>
        </motion.section>

        {/* Very Short */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Very Short Dog Memorial Quotes</h2>
          <p className="mb-6 text-muted-foreground">Ultra-short lines — perfect for engravings, ornaments, or moments when less is more.</p>
          <div className="space-y-3">
            <Q text="Forever my good boy." />
            <Q text="Best friend. Always." />
            <Q text="Run free, sweet dog." />
            <Q text="Gone too soon." />
            <Q text="My heart. My dog." />
            <Q text="Loved beyond words." />
            <Q text="Until we meet again." />
            <Q text="Always by my side." />
            <Q text="The best of us." />
            <Q text="Rest now, old friend." />
            <Q text="Tail wags forever." />
            <Q text="Love without end." />
            <Q text="You were everything." />
            <Q text="My shadow. My heart." />
            <Q text="Home isn't the same." />
            <Q text="Forever grateful." />
          </div>
        </motion.section>

        {/* Simple & Meaningful */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Short Dog Memorial Quotes — Simple and Meaningful</h2>
          <p className="mb-6 text-muted-foreground">
            A little longer, but still brief. These dog remembrance quotes capture the bond without needing many words. For even more, see our full{" "}
            <Link to="/pet-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">pet memorial quotes</Link> collection.
          </p>
          <div className="space-y-4">
            <Q text="You were my favourite hello and my hardest goodbye." />
            <Q text="The house is quieter now. I didn't think I'd miss the noise this much." />
            <Q text="You taught me what loyalty really looks like." />
            <Q text="I loved you your whole life. I'll miss you for the rest of mine." />
            <Q text="The leash hangs by the door, and I can't bring myself to move it." />
            <Q text="You were just a dog to the world. To me, you were the world." />
            <Q text="Every walk, every nap, every greeting — I'd do it all again." />
            <Q text="You made the ordinary feel extraordinary." />
            <Q text="The best part of my day was always you." />
            <Q text="I didn't just lose a dog. I lost my daily joy." />
            <Q text="You gave me more than I could ever give you back." />
            <Q text="Some dogs leave paw prints that last forever." />
          </div>
        </motion.section>

        {/* Instagram */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Short Dog Memorial Quotes for Instagram</h2>
          <p className="mb-6 text-muted-foreground">Caption-ready lines to honour your dog online. Short enough to pair with a photo and still say everything.</p>
          <div className="space-y-3">
            <Q text="You were my whole heart." />
            <Q text="The best boy I'll ever know." />
            <Q text="Gone from my side, never from my soul." />
            <Q text="Love you forever, miss you always." />
            <Q text="No dog will ever replace you." />
            <Q text="My first thought every morning. My last thought every night." />
            <Q text="You made this life so much better." />
            <Q text="Still looking for you in every room." />
            <Q text="The goodest boy deserved the longest life." />
            <Q text="Heaven gained the best dog today." />
            <Q text="You were worth every muddy paw print." />
            <Q text="My favourite chapter had four legs." />
          </div>
        </motion.section>

        {/* Cards */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Short Dog Memorial Quotes for Cards</h2>
          <p className="mb-6 text-muted-foreground">
            Writing a sympathy card for someone who lost a dog? These short messages offer comfort without feeling forced. See our{" "}
            <Link to="/pet-sympathy-messages" className="text-primary underline underline-offset-2 hover:text-primary/80">pet sympathy messages</Link>{" "}
            for more options.
          </p>
          <div className="space-y-4">
            <Q text="They were the best companion. I'm so sorry for your loss." />
            <Q text="What a beautiful life you gave them. Thinking of you." />
            <Q text="No words feel big enough. Just know I'm here." />
            <Q text="The love you shared was something special. I'm sorry it hurts." />
            <Q text="They were lucky to have you. And you were lucky to have them." />
            <Q text="Sending love during this hard time. They were a wonderful dog." />
            <Q text="Your home won't feel the same. I'm thinking of you." />
            <Q text="A dog like that only comes along once. I'm so sorry." />
          </div>
        </motion.section>

        {/* Personalized */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Personalized Short Quotes for Your Dog</h2>
          <p className="mb-4 text-foreground/90 leading-relaxed">
            The most meaningful quote is often one you write yourself — even if it's just a few words. Here are some ways to personalise a short dog memorial quote:
          </p>
          <ul className="space-y-3 pl-1">
            {[
              { title: "Add their name", desc: "\"Run free, Max. You were the best.\"" },
              { title: "Mention a habit", desc: "\"No one will ever steal socks like you did.\"" },
              { title: "Reference your routine", desc: "\"Our morning walks were the best part of my day.\"" },
              { title: "Keep it honest", desc: "\"I miss the sound of your paws on the kitchen floor.\"" },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground/90">
                <PawIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium">{item.title}</span>
                  <span className="text-muted-foreground"> — {item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            You don't need to be a writer. The details only you know are what make a quote truly yours. For help turning memories into a full tribute, explore our{" "}
            <Link to="/dog-obituary-example" className="text-primary underline underline-offset-2 hover:text-primary/80">dog obituary example</Link>.
          </p>
        </motion.section>

        {/* When to Use */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">When to Use Short Dog Memorial Quotes</h2>
          <p className="mb-6 text-muted-foreground">Short dog remembrance quotes work beautifully in many settings:</p>
          <ul className="space-y-2.5 pl-1">
            {[
              "On a tribute page — set the tone for your dog's memorial",
              "Social media — pair with a photo for a heartfelt post",
              "Sympathy cards — offer comfort to a friend who lost their dog",
              "Memorial keepsakes — engrave on a stone, ornament, or frame",
              "Photo albums — add meaning alongside your favourite pictures",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground/90">
                <PawIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            For comforting words rooted in the Rainbow Bridge tradition, see our{" "}
            <Link to="/rainbow-bridge-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">Rainbow Bridge quotes</Link>.
          </p>
        </motion.section>

        {/* Create a Tribute */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Create a Lasting Tribute for Your Dog</h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              A short quote captures a feeling — but your dog's story deserves more than a single line. The way they greeted you at the door, the spot they claimed as theirs, the silly things they did that no one else will ever do quite the same way.
            </p>
            <p>
              With VellumPet, you can turn a few simple memories into a beautiful, heartfelt tribute page. No writing skill needed — just share their name, their quirks, and what you miss most. We'll craft a story that captures who they were.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section {...section()} className="mb-16 rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10">
          <h2 className="mb-3 text-2xl font-bold text-foreground">Create a Beautiful Memorial for Your Dog</h2>
          <p className="mb-6 text-muted-foreground">Share a few memories and we'll craft a tribute you can keep forever.</p>
          <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-8 py-4 text-base font-medium text-white shadow-glow transition-all duration-200 hover:scale-[1.02] hover:shadow-card">
            <CtaIcon className="shrink-0" size={22} />
            Create Their Memorial
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">Takes less than 2 minutes · No writing required</p>
        </motion.section>

        {/* Related */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Related Articles</h2>
          <div className="space-y-3">
            {[
              { title: "Pet Memorial Quotes", desc: "Meaningful quotes for dogs, cats, and all pets", href: "/pet-memorial-quotes" },
              { title: "Rainbow Bridge Quotes", desc: "Comforting words for pet loss", href: "/rainbow-bridge-quotes" },
              { title: "Dog Obituary Example", desc: "How to write a beautiful dog obituary", href: "/dog-obituary-example" },
            ].map((link) => (
              <Link key={link.href} to={link.href} className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </motion.section>
      </article>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-3xl px-5">
          <p>Made with <Heart className="inline h-3 w-3 text-primary" /> by {BRAND.name}</p>
        </div>
      </footer>
    </div>
  );
};

export default ShortDogMemorialQuotes;
