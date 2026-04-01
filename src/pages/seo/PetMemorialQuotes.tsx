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

const PET_MEMORIAL_QUOTES_FAQS = [
  { question: "What are pet memorial quotes?", answer: "Pet memorial quotes are short messages or phrases used to remember and honor a pet who has passed away. They help express love, grief, and the lasting bond between a pet and their owner." },
  { question: "What should I write for a pet memorial?", answer: "Write something honest — their name, a favourite memory, and what they meant to you. A few heartfelt sentences are more powerful than anything polished." },
  { question: "Can I use pet memorial quotes for social media?", answer: "Yes. Short quotes work well as Instagram captions, story overlays, or Facebook posts alongside a photo of your pet." },
  { question: "How do I choose the right pet memorial quote?", answer: "Pick a quote that reflects your pet's personality or the feeling they gave you. The right quote should feel like it was written about them." },
  { question: "Can I create a full memorial page instead of just using quotes?", answer: "Yes. VellumPet lets you create a personalised memorial page in under two minutes — just share a few memories and we'll craft a beautiful tribute." },
];

const PetMemorialQuotes = () => {
  const navigate = useNavigate();

  const canonicalUrl = "https://paw-print-story.lovable.app/pet-memorial-quotes";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Pet Memorial Quotes: Meaningful Words to Remember Your Pet",
    description:
      "Find meaningful pet memorial quotes, dog and cat remembrance quotes, and short messages to honor your beloved pet.",
    author: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    publisher: { "@type": "Organization", name: "VellumPet", url: "https://paw-print-story.lovable.app" },
    datePublished: "2025-03-25",
    dateModified: "2025-03-25",
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PET_MEMORIAL_QUOTES_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pet Memorial Quotes: Meaningful Words to Remember Your Pet | VellumPet</title>
        <meta
          name="description"
          content="Find meaningful pet memorial quotes, dog and cat remembrance quotes, and short messages to honor your beloved pet."
        />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <SeoBreadcrumbs items={[
        { name: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
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
            Pet Memorial Quotes: Meaningful Words to Remember Your Pet
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            Losing a pet leaves a silence that's hard to describe. The walks that
            no longer happen, the empty spot on the couch, the quiet that settles
            where a greeting used to be. When grief is this personal, finding the
            right words can feel impossible.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            These pet memorial quotes are here to help — whether you're writing a
            tribute, sending a{" "}
            <Link to="/pet-sympathy-messages" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet sympathy message
            </Link>, or simply looking for words that
            match what you're feeling. If you're looking to create a lasting{" "}
            <Link to="/pet-memorial" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet memorial page
            </Link>, these words can be a meaningful starting point. Some are short enough for a caption. Others
            carry the weight of a longer goodbye. All of them honour the bond
            between a person and their pet.
          </p>

          {/* Contextual Links */}
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="Related topics">
            {[
              { text: "Rainbow Bridge quotes", href: "/rainbow-bridge-quotes" },
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
            What Are Pet Memorial Quotes?
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            Pet memorial quotes are short messages or phrases used to remember and honor a pet who has passed away. They help express love, grief, and the lasting bond between a pet and their owner. Whether used on a{" "}
            <Link to="/pet-memorial" className="text-primary underline underline-offset-2 hover:text-primary/80">
              memorial page
            </Link>, in a sympathy card, or as a social media caption, they give voice to feelings that are hard to put into words.
          </p>
        </motion.section>

        {/* ─── H2: Short Pet Memorial Quotes ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Short Pet Memorial Quotes
          </h2>
          <p className="mb-6 text-muted-foreground">
            Sometimes a few words say everything. These short{" "}
            <Link to="/pet-remembrance-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet remembrance quotes
            </Link>{" "}
            are perfect for engraving, framing, or simply holding close.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="You were my favourite hello and my hardest goodbye." />
            <QuoteBlock text="No longer by my side, but forever in my heart." />
            <QuoteBlock text="Until we meet again at the rainbow bridge." />
            <QuoteBlock text="The smallest paws leave the deepest prints." />
            <QuoteBlock text="You taught me what unconditional love looks like." />
            <QuoteBlock text="Gone from my sight, but never from my heart." />
            <QuoteBlock text="You were more than a pet. You were home." />
            <QuoteBlock text="I loved you for your whole life. I'll miss you for the rest of mine." />
            <QuoteBlock text="Some souls just leave paw prints wherever they go." />
            <QuoteBlock text="Thank you for choosing me as your person." />
            <QuoteBlock text="Grief is the price we pay for love — and it was worth every moment." />
            <QuoteBlock text="You made the ordinary extraordinary, just by being there." />
          </div>
        </motion.section>

        {/* ─── H2: Dog Memorial Quotes ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Dog Memorial Quotes
          </h2>
          <p className="mb-6 text-muted-foreground">
            Dogs have a way of filling every room they walk into — and leaving an
            unbearable quiet when they're gone. These dog memorial quotes capture
            that particular kind of love. If you're also looking for help writing
            a full tribute, our{" "}
            <Link to="/dog-obituary-example" className="text-primary underline underline-offset-2 hover:text-primary/80">
              dog obituary example
            </Link>{" "}
            can guide you.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="He was just a dog, they said. But he was everything to me." />
            <QuoteBlock text="Dogs come into our lives to teach us about love, and they leave to teach us about loss." />
            <QuoteBlock text="You were the best part of every walk, every morning, every day." />
            <QuoteBlock text="A good dog never truly leaves. They just walk beside you in a different way." />
            <QuoteBlock text="The world felt safer with you by my side." />
            <QuoteBlock text="You never judged, never wavered, never left. Until you had to." />
            <QuoteBlock text="Every treat, every belly rub, every walk — I'd do it all again for one more day with you." />
            <QuoteBlock text="You gave me the kind of loyalty most people only dream about." />
            <QuoteBlock text="My shadow, my companion, my heart. Rest now, sweet friend." />
            <QuoteBlock text="The leash hangs by the door. The house has never been this quiet." />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Looking for guidance on what to say?{" "}
            <Link to="/what-to-write-when-a-dog-dies" className="text-primary underline underline-offset-2 hover:text-primary/80">
              What to write when a dog dies
            </Link>{" "}
            offers a gentle, practical approach.
          </p>
        </motion.section>

        {/* ─── H2: Cat Memorial Quotes ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Cat Memorial Quotes
          </h2>
          <p className="mb-6 text-muted-foreground">
            Cats choose us on their own terms — and the bond they offer is
            unlike anything else. These cat memorial quotes reflect the quiet,
            independent love only a cat person truly understands. For a full
            tribute example, see our{" "}
            <Link to="/cat-memorial-tribute-example" className="text-primary underline underline-offset-2 hover:text-primary/80">
              cat memorial tribute guide
            </Link>.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="You chose me, and that was the greatest gift I ever received." />
            <QuoteBlock text="The purring has stopped, and the silence is deafening." />
            <QuoteBlock text="You ruled this house with grace, and I was happy to let you." />
            <QuoteBlock text="Cats leave paw prints not just on floors, but on souls." />
            <QuoteBlock text="You slept on my chest and made every worry feel lighter." />
            <QuoteBlock text="A cat's love is quiet, steady, and completely on their terms. I wouldn't have had it any other way." />
            <QuoteBlock text="You taught me that silence can be the deepest kind of company." />
            <QuoteBlock text="The window ledge is empty now. The sunlight doesn't look the same." />
            <QuoteBlock text="You were small, but you filled every corner of this home." />
            <QuoteBlock text="I'll miss the way you curled into me like I was the safest place in the world." />
          </div>
        </motion.section>

        {/* ─── H2: Pet Memorial Quotes for Instagram ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Pet Memorial Quotes for Instagram
          </h2>
          <p className="mb-6 text-muted-foreground">
            Short, shareable lines that work perfectly as captions or story
            overlays when you want to honour your pet online.
          </p>
          <div className="space-y-4">
            <QuoteBlock text="Forever my favourite hello." />
            <QuoteBlock text="You made this life so much softer." />
            <QuoteBlock text="Gone too soon. Loved beyond words." />
            <QuoteBlock text="The best things in life have four legs." />
            <QuoteBlock text="You were the love story I never expected." />
            <QuoteBlock text="Tiny paws, enormous heart." />
            <QuoteBlock text="My heart still looks for you in every room." />
            <QuoteBlock text="You'll always be my favourite chapter." />
          </div>
        </motion.section>

        {/* ─── H2: How to Use Pet Memorial Quotes ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            How to Use Pet Memorial Quotes
          </h2>
          <p className="mb-6 text-foreground/90 leading-relaxed">
            Pet memorial quotes can bring comfort in many different settings.
            Here are some meaningful ways to use them:
          </p>
          <ul className="space-y-3 pl-1">
            {[
              { title: "On a tribute page", desc: "Add a quote to your pet's online memorial to set the tone for their story." },
              { title: "In a sympathy card", desc: "A thoughtful quote can say what's hard to express when consoling a friend." },
              { title: "On social media", desc: "Share a short quote alongside a photo to honour your pet publicly." },
              { title: "On memorial keepsakes", desc: "Engrave a favourite quote on a stone, frame, ornament, or piece of jewellery." },
              { title: "In a photo album or scrapbook", desc: "Pair quotes with photos to create a lasting physical tribute." },
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
          <p className="mt-6 text-sm text-muted-foreground">
            For more ideas on memorial messages, explore our{" "}
            <Link to="/pet-memorial-message" className="text-primary underline underline-offset-2 hover:text-primary/80">
              pet memorial message examples
            </Link>.
          </p>
        </motion.section>

        {/* ─── H2: Create a Personal Pet Memorial ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Create a Personal Pet Memorial
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              Quotes can capture a feeling, but they can't tell your pet's story.
              The way they greeted you at the door, the spot they claimed as
              theirs, the quiet moments that meant the most — those details are
              yours alone.
            </p>
            <p>
              A personalised tribute goes beyond a single line. It weaves your
              memories into a narrative that feels true to who they were. It's the
              difference between borrowing someone else's words and speaking from
              your own heart.
            </p>
            <p>
              With VellumPet, you don't need to be a writer. Share a few memories
              — their name, their habits, what you miss most — and we'll craft a
              beautiful, heartfelt tribute that captures their life and
              personality. It takes less than two minutes, and the result is
              something you can keep, share, and return to whenever you need to
              feel close to them again.
            </p>
            <p>
              A quote remembers the feeling. A tribute remembers <em>them</em>.
            </p>
          </div>
        </motion.section>

        {/* ─── Hub: Explore Quotes by Topic ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Explore Memorial Quotes by Topic
          </h2>
          <p className="mb-8 text-muted-foreground">
            Looking for something more specific? We've created dedicated guides for different types of pet memorial quotes — each with curated collections and writing advice.
          </p>
          <div className="space-y-6">
            {[
              {
                title: "Dog Memorial Quotes",
                intro: "Dogs give us a loyalty that reshapes our lives. These quotes capture the walks, the greetings, and the quiet companionship that only a dog owner understands.",
                href: "/dog-memorial-quotes",
              },
              {
                title: "Cat Memorial Quotes",
                intro: "Cats love on their own terms — a slow blink, a chosen lap, a purr in the dark. These quotes honour the quiet, independent bond between a person and their cat.",
                href: "/cat-memorial-quotes",
              },
              {
                title: "Short Dog Memorial Quotes",
                intro: "Sometimes a few words say everything. Ultra-short quotes perfect for engravings, captions, sympathy cards, and moments when less is more.",
                href: "/short-dog-memorial-quotes",
              },
              {
                title: "Rainbow Bridge Quotes",
                intro: "The Rainbow Bridge offers comfort through the hope of reunion. These quotes draw on that tradition — gentle words for the hardest goodbyes.",
                href: "/rainbow-bridge-quotes",
              },
              {
                title: "Pet Remembrance Quotes",
                intro: "For dogs, cats, rabbits, birds, and every animal who shared your life. Universal words of remembrance that honour any beloved pet.",
                href: "/pet-remembrance-quotes",
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
              { title: "Rainbow Bridge Quotes", desc: "Comforting words for pet loss", href: "/rainbow-bridge-quotes" },
              { title: "Short Dog Memorial Quotes", desc: "Simple words to remember your dog", href: "/short-dog-memorial-quotes" },
              { title: "Pet Memorial Message Examples", desc: "Thoughtful pet memorial message ideas", href: "/pet-memorial-message" },
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
              { q: "What are pet memorial quotes?", a: "Pet memorial quotes are short messages or phrases used to remember and honor a pet who has passed away. They help express love, grief, and the lasting bond between a pet and their owner." },
              { q: "What should I write for a pet memorial?", a: "Write something honest — their name, a favourite memory, and what they meant to you. A few heartfelt sentences are more powerful than anything polished." },
              { q: "Can I use pet memorial quotes for social media?", a: "Yes. Short quotes work well as Instagram captions, story overlays, or Facebook posts alongside a photo of your pet." },
              { q: "How do I choose the right pet memorial quote?", a: "Pick a quote that reflects your pet's personality or the feeling they gave you. The right quote should feel like it was written about them." },
              { q: "Can I create a full memorial page instead of just using quotes?", a: "Yes. VellumPet lets you create a personalised memorial page in under two minutes — just share a few memories and we'll craft a beautiful tribute." },
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
              { label: "Rainbow Bridge quotes", href: "/rainbow-bridge-quotes" },
              { label: "What to write when a dog dies", href: "/what-to-write-when-a-dog-dies" },
              { label: "Pet sympathy messages", href: "/pet-sympathy-messages" },
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

export default PetMemorialQuotes;
