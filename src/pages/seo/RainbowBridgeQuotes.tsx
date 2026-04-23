import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import BrandLogo from "@/components/BrandLogo";
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

const QuoteBlock = ({ text }: { text: string }) => (
  <blockquote className="border-l-2 border-primary/30 pl-5 py-1">
    <p className="text-foreground/90 leading-relaxed italic">{text}</p>
  </blockquote>
);

const InlineCta = ({
  emoji,
  heading,
  body,
}: {
  emoji?: string;
  heading: string;
  body: string;
}) => (
  <div className="my-10 rounded-2xl border border-border/60 bg-card p-6 shadow-soft md:p-8">
    <p className="mb-2 text-lg font-semibold text-foreground">
      {emoji ? <span className="mr-2">{emoji}</span> : null}
      {heading}
    </p>
    <p className="mb-5 text-foreground/80 leading-relaxed">{body}</p>
    <Link
      to="/create"
      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
    >
      Create Tribute
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

const RAINBOW_BRIDGE_FAQS = [
  {
    question: "What is the Rainbow Bridge?",
    answer:
      "The Rainbow Bridge is a poem and concept describing a peaceful place where pets go after they pass away — running freely, healthy and happy, until they're reunited with their owners one day. It has become a beloved source of comfort for grieving pet families around the world.",
  },
  {
    question: "What do you say about the Rainbow Bridge?",
    answer:
      "Common sentiments include \"Run free at the Rainbow Bridge,\" \"Until we meet again,\" or \"You're waiting on the other side.\" These messages offer comfort by framing death as a peaceful pause rather than an ending.",
  },
  {
    question: "Do all pets go to the Rainbow Bridge?",
    answer:
      "In the original poem and most retellings, yes — every cherished pet crosses the Rainbow Bridge. It's a symbolic place of peace meant to comfort anyone grieving the loss of an animal companion they loved.",
  },
  {
    question: "Where did the Rainbow Bridge poem come from?",
    answer:
      "The Rainbow Bridge poem was written anonymously in the 1980s and has been shared widely since, becoming one of the most quoted pieces of pet loss literature in the world.",
  },
  {
    question: "Can I use Rainbow Bridge quotes in a tribute?",
    answer:
      "Yes. Rainbow Bridge quotes are perfect for tribute pages, sympathy cards, engravings, and social media posts — anywhere you want to honor a pet's memory with comfort and grace.",
  },
];

const RainbowBridgeQuotes = () => {
  const navigate = useNavigate();
  const siteUrl = (import.meta.env.VITE_SITE_URL as string) || "https://vellumpet.com";
  const canonicalUrl = `${siteUrl}/rainbow-bridge-quotes`;

  const title = "40 Rainbow Bridge Quotes for Dogs & Pets (Beautiful & Comforting)";
  const description =
    "40 beautiful Rainbow Bridge quotes — classic, short, spiritual, and dedicated to dogs and cats. Find comforting words to honor a pet who has crossed over.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: { "@type": "Organization", name: "VellumPet", url: siteUrl },
    publisher: { "@type": "Organization", name: "VellumPet", url: siteUrl },
    datePublished: "2025-03-27",
    dateModified: "2026-04-23",
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
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <SeoBreadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
          { name: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes" },
        ]}
      />

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
        {/* H1 + Intro */}
        <motion.section {...section()} className="mb-8">
          <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-[2.75rem]">
            40 Rainbow Bridge Quotes for Dogs & Pets
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            The Rainbow Bridge is the place we imagine for them — a meadow on the edge of heaven
            where our pets are young again, healthy again, and waiting. There's no pain there. No
            fear. Just sunshine, soft grass, and the quiet certainty that one day, we'll see them
            again.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            For grieving pet families, the Rainbow Bridge is more than a metaphor. It's a way to
            hold onto love that didn't have anywhere else to go. These 40 Rainbow Bridge quotes
            gather the most beautiful, comforting words to honor a pet who has crossed over —
            whether you need something for a tribute, a card, an engraving, or a quiet moment with
            yourself.
          </p>
        </motion.section>

        {/* CTA #1 */}
        <InlineCta
          emoji="🌈"
          heading="Create a tribute for your pet waiting at the Rainbow Bridge."
          body="A lasting place for photos, stories, and the words that say what they meant to you."
        />

        {/* Classic Rainbow Bridge quotes */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Classic Rainbow Bridge Quotes
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            The most beloved lines from the Rainbow Bridge tradition — gentle, timeless, and
            instantly recognisable to anyone grieving a pet.
          </p>
          <div className="space-y-4">
            <QuoteBlock text={`"Just this side of heaven is a place called Rainbow Bridge."`} />
            <QuoteBlock text={`"There is a meadow where old friends meet, and no one is ever sick or sad again."`} />
            <QuoteBlock text={`"All the animals who had been ill or old are restored to health and vigor — they are happy and content."`} />
            <QuoteBlock text={`"They miss someone very special — someone who had to be left behind."`} />
            <QuoteBlock text={`"Then you cross Rainbow Bridge together, never again to be parted."`} />
            <QuoteBlock text={`"The Rainbow Bridge: where pain ends, love continues, and reunions are forever."`} />
            <QuoteBlock text={`"You are not gone. You are simply waiting on the other side."`} />
            <QuoteBlock text={`"Run free, sweet friend. I will see you at the Bridge."`} />
          </div>
        </motion.section>

        {/* Short quotes */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Short Rainbow Bridge Quotes
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Brief, beautiful lines for engravings, social posts, cards, or quiet remembrances.
          </p>
          <div className="space-y-4">
            <QuoteBlock text={`"Run free."`} />
            <QuoteBlock text={`"Until we meet again."`} />
            <QuoteBlock text={`"Wait for me at the Bridge."`} />
            <QuoteBlock text={`"No more pain — only meadows."`} />
            <QuoteBlock text={`"Forever loved, forever waiting."`} />
            <QuoteBlock text={`"See you on the other side."`} />
            <QuoteBlock text={`"Until I cross the Bridge to you."`} />
            <QuoteBlock text={`"Together again, one day."`} />
          </div>
        </motion.section>

        {/* Spiritual quotes */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Spiritual Rainbow Bridge Quotes
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For those who find comfort in faith, prayer, or the idea of something beyond — gentle
            words that honor both belief and loss.
          </p>
          <div className="space-y-4">
            <QuoteBlock text={`"Heaven has gates wide enough for every paw that ever loved a human."`} />
            <QuoteBlock text={`"God lent us an angel for a little while, and now they've gone home."`} />
            <QuoteBlock text={`"At the Rainbow Bridge, every soul is whole again, and every love is rewarded."`} />
            <QuoteBlock text={`"They wait in peace, knowing love is patient, even across this kind of distance."`} />
            <QuoteBlock text={`"Grace lives in the meadow on the edge of heaven, and so do they."`} />
            <QuoteBlock text={`"All love is eternal. The Bridge is just where ours waits for us."`} />
            <QuoteBlock text={`"In a place of light and gentle wind, your pet is safe — and remembering you."`} />
            <QuoteBlock text={`"Faith tells me I will see you again. Until then, I carry you."`} />
          </div>
        </motion.section>

        {/* CTA #2 — Mid-article */}
        <InlineCta
          heading="Keep their memory alive."
          body="Create a tribute page with photos, stories, and shared memories — a beautiful, permanent place to remember them."
        />

        {/* Quotes for dogs */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Rainbow Bridge Quotes for Dogs
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the dogs we lose — the loyal companions who waited at the door, walked at our
            side, and gave us a kind of love we'll never forget. See more in our{" "}
            <Link to="/dog-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              dog memorial quotes guide
            </Link>
            .
          </p>
          <div className="space-y-4">
            <QuoteBlock text={`"Run free at the Rainbow Bridge, my sweet boy. I'll see you there one day."`} />
            <QuoteBlock text={`"There's sunshine, fresh grass, and not a single sore paw at the Rainbow Bridge."`} />
            <QuoteBlock text={`"At the Bridge, no dog is ever lonely. I take comfort knowing you're among friends."`} />
            <QuoteBlock text={`"One day, I'll cross that Bridge. And you'll be the first to greet me — tail wagging, just like always."`} />
            <QuoteBlock text={`"You're young again, healthy again, and waiting. That's how I picture you now."`} />
            <QuoteBlock text={`"Heaven's gates open wider for the dogs who loved their humans well."`} />
            <QuoteBlock text={`"Some say all dogs go to heaven. I say: of course they do — they ARE heaven."`} />
            <QuoteBlock text={`"Until I see you at the Bridge, run free, sweet friend."`} />
          </div>
        </motion.section>

        {/* Quotes for cats */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Rainbow Bridge Quotes for Cats
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the cats we lose — the quiet companions who chose us, watched over us, and curled
            up close on the hardest days. See more in our{" "}
            <Link to="/cat-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              cat memorial quotes guide
            </Link>
            .
          </p>
          <div className="space-y-4">
            <QuoteBlock text={`"Curled up in sunshine at the Rainbow Bridge, waiting for the only human you ever truly chose."`} />
            <QuoteBlock text={`"At the Bridge, you have all the warm windowsills, and all the time in the world."`} />
            <QuoteBlock text={`"My quiet companion, run free in fields of sunlight and soft grass."`} />
            <QuoteBlock text={`"Some cats choose us once and love us forever. I will see you again at the Bridge."`} />
            <QuoteBlock text={`"Even at the Rainbow Bridge, I know you're the most regal soul there."`} />
            <QuoteBlock text={`"You're purring somewhere warm now, free of every ache. I love you, always."`} />
            <QuoteBlock text={`"Until I see you again — be still, be safe, be loved at the Bridge."`} />
            <QuoteBlock text={`"You were the gentle weight at the end of my bed. I'll feel you there forever."`} />
          </div>
        </motion.section>

        {/* How to use */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            How to Use Rainbow Bridge Quotes
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">On a tribute page</h3>
              <p className="text-foreground/80 leading-relaxed">
                Pair a Rainbow Bridge quote with a favourite photo and a memory to create
                something that honors your pet's whole life — not just their loss.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">In a sympathy card</h3>
              <p className="text-foreground/80 leading-relaxed">
                Open with a quote, then add one personal sentence about the pet. That small touch
                makes the message feel personal rather than templated.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">As an engraving</h3>
              <p className="text-foreground/80 leading-relaxed">
                Short Rainbow Bridge quotes (2–6 words) work beautifully on urns, plaques, and
                memorial jewellery.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">For an anniversary</h3>
              <p className="text-foreground/80 leading-relaxed">
                Share a quote alongside a favourite photo on the anniversary of their passing — a
                gentle, meaningful way to mark the day.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA #3 — End */}
        <InlineCta
          heading="Honor them forever."
          body="Create a personalized tribute page with photos, stories, and the words that say everything love can hold."
        />

        {/* FAQ */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {RAINBOW_BRIDGE_FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{faq.question}</h3>
                <p className="text-foreground/80 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Internal links */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Related Reading
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Home", href: "/" },
              { label: "Create a Pet Memorial", href: "/pet-memorial" },
              { label: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
              { label: "Dog Memorial Quotes", href: "/dog-memorial-quotes" },
              { label: "Cat Memorial Quotes", href: "/cat-memorial-quotes" },
              { label: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
              { label: "Pet Loss Messages", href: "/pet-loss-messages" },
              { label: "Pet Memorial Prayers", href: "/pet-memorial-prayers" },
              { label: "Cope With Losing a Pet", href: "/cope-with-losing-a-pet" },
              { label: "Pet Loss Poems", href: "/pet-loss-poems" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="inline-flex items-center gap-2 text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  <Heart className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Footer */}
        <footer className="mt-16 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. Helping pet owners create lasting tributes.
          </p>
        </footer>
      </article>
    </div>
  );
};

export default RainbowBridgeQuotes;
