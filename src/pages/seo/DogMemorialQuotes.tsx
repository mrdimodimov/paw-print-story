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

const DOG_MEMORIAL_FAQS = [
  {
    question: "What is a good quote for a dog who passed away?",
    answer:
      "A good quote captures something true about your dog — their loyalty, their joy, or the love they gave. Short examples like 'Forever a good boy' or 'You left paw prints on my heart' work beautifully on cards, engravings, and memorial pages.",
  },
  {
    question: "How do you honor a dog's memory?",
    answer:
      "Honor your dog's memory by writing about them, sharing photos, lighting a candle on their anniversary, or creating an online tribute page where friends and family can share stories. The act of remembering is itself a form of love.",
  },
  {
    question: "What is the Rainbow Bridge?",
    answer:
      "The Rainbow Bridge is a poem and concept that describes a peaceful place where pets go after they pass — running freely, healthy and happy, until they're reunited with their owners one day. It has become a beloved source of comfort for grieving pet families.",
  },
  {
    question: "Are short or long quotes better?",
    answer:
      "Both have their place. Short quotes work well for engravings, social media, and cards. Longer reflections suit memorial pages, eulogies, and personal letters. The right length is whichever feels true.",
  },
  {
    question: "Can I use these quotes in a tribute page?",
    answer:
      "Yes. These quotes are meant to be shared, adapted, and personalised. Pair one with a photo and a memory to create something lasting on a tribute page.",
  },
];

const DogMemorialQuotes = () => {
  const navigate = useNavigate();
  const siteUrl = (import.meta.env.VITE_SITE_URL as string) || "https://vellumpet.com";
  const canonicalUrl = `${siteUrl}/dog-memorial-quotes`;

  const title = "75 Dog Memorial Quotes to Honor Your Beloved Pet";
  const description =
    "75 heartfelt dog memorial quotes — short, emotional, unconditional love, grief, and Rainbow Bridge quotes to honor your beloved dog's life.";

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
    mainEntity: DOG_MEMORIAL_FAQS.map((faq) => ({
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
          { name: "Dog Memorial Quotes", href: "/dog-memorial-quotes" },
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
            75 Dog Memorial Quotes to Honor Your Beloved Pet
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            Losing a dog is losing a member of your family. The wagging tail at the door, the
            warmth at your feet, the quiet presence during your hardest days — all of it suddenly
            still. Words can't undo that absence, but the right ones can help carry it. They can
            honor a life that meant everything.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            These 75 dog memorial quotes are gathered for exactly that purpose. Use them on a
            tribute page, in a sympathy card, on an engraving, or simply hold them in your heart.
            Each one was chosen to honor what your dog gave you — and to gently remind you that
            love like that doesn't disappear.
          </p>
        </motion.section>

        {/* CTA #1 */}
        <InlineCta
          emoji="💔"
          heading="Lost your best friend?"
          body="Create a beautiful tribute page in minutes — a lasting place for photos, stories, and the words that say what they meant to you."
        />

        {/* Short memorial quotes */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Short Dog Memorial Quotes
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Brief, beautiful lines for engravings, cards, social posts, and quiet moments of
            remembrance.
          </p>
          <div className="space-y-4">
            <QuoteBlock text='"Forever a good boy."' />
            <QuoteBlock text='"Gone, but never forgotten."' />
            <QuoteBlock text='"You left paw prints on my heart."' />
            <QuoteBlock text='"Run free, sweet friend."' />
            <QuoteBlock text='"Loved beyond words. Missed beyond measure."' />
            <QuoteBlock text='"Until we meet again."' />
            <QuoteBlock text='"My best friend, always."' />
            <QuoteBlock text='"A good dog. The best dog. My dog."' />
            <QuoteBlock text='"Your love stayed. Only your body left."' />
            <QuoteBlock text='"Life is quieter without you."' />
            <QuoteBlock text='"Once in a lifetime. That was you."' />
            <QuoteBlock text='"Forever in my heart, forever by my side."' />
            <QuoteBlock text='"Thank you for every moment."' />
            <QuoteBlock text='"You were enough. You were everything."' />
            <QuoteBlock text='"Good dogs go to good places."' />
          </div>
        </motion.section>

        {/* Emotional quotes */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Emotional Dog Memorial Quotes
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For when you need words that match the size of what you're feeling.
          </p>
          <div className="space-y-4">
            <QuoteBlock text='"No one greeted me like you did. That kind of love is rare."' />
            <QuoteBlock text='"Every morning began the same way — you, wagging your tail, as though it had been years since you last saw me."' />
            <QuoteBlock text='"I miss the sound of your paws on the kitchen floor."' />
            <QuoteBlock text='"You were more than a good dog. You were the best part of every day."' />
            <QuoteBlock text='"The house is the same. The walls, the floors, the routine. But without you, none of it feels like home."' />
            <QuoteBlock text='"You taught me what it means to be loved without conditions, and I will spend the rest of my life trying to live up to that."' />
            <QuoteBlock text={`"They say grief is the price we pay for love. If that's true, you were worth every tear."`} />
            <QuoteBlock text='"I keep waiting to hear your nails on the floor. I think I always will."' />
            <QuoteBlock text={`"Some bonds don't end. They just change shape."`} />
            <QuoteBlock text={`"Goodbye is the hardest word I've ever had to say to you."`} />
            <QuoteBlock text='"You were here for the worst days of my life and made them survivable."' />
            <QuoteBlock text={`"I didn't know my heart could break this way."`} />
          </div>
        </motion.section>

        {/* Quotes about unconditional love */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Quotes About Unconditional Love
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the love only a dog can give — patient, steady, and entirely yours.
          </p>
          <div className="space-y-4">
            <QuoteBlock text='"Dogs love us in a way humans rarely manage — completely, daily, without keeping score."' />
            <QuoteBlock text={`"You loved me on my worst days as much as my best. That's a kind of grace I'll never forget."`} />
            <QuoteBlock text='"There is no love so pure as the love of a dog who chose you."' />
            <QuoteBlock text={`"You didn't care what I did, what I earned, or what I looked like. You just wanted me home."`} />
            <QuoteBlock text={`"A dog's loyalty is the rarest gift in the world. I'm grateful you gave it to me."`} />
            <QuoteBlock text={`"You were proof that love doesn't need words."`} />
            <QuoteBlock text='"They asked nothing of me except presence. And gave everything in return."' />
            <QuoteBlock text='"You loved me longer than most people ever bothered to try."' />
            <QuoteBlock text='"My dog reminded me, every single day, that I was worth coming home to."' />
            <QuoteBlock text='"Love like yours is the kind of thing the rest of the world should aspire to."' />
            <QuoteBlock text={`"You followed me from room to room because being near me was enough. I'll never forget that."`} />
          </div>
        </motion.section>

        {/* CTA #2 — Mid-article */}
        <InlineCta
          heading="Turn these quotes into a lasting memory."
          body="Create a tribute with photos and stories — a beautiful, permanent place to remember your dog."
        />

        {/* Quotes about loss and grief */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Quotes About Loss and Grief
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Words that meet you in the middle of grief — without flinching, without rushing you
            through it.
          </p>
          <div className="space-y-4">
            <QuoteBlock text='"Grief is just love with nowhere to go."' />
            <QuoteBlock text='"The pain of losing you is only matched by the joy of having known you."' />
            <QuoteBlock text='"Some absences are louder than presence."' />
            <QuoteBlock text={`"You don't 'get over' losing a dog. You just learn to carry the weight differently."`} />
            <QuoteBlock text='"What we have once enjoyed deeply, we can never lose. All that we love deeply becomes a part of us."' />
            <QuoteBlock text={`"The bond doesn't break. It just stretches across whatever comes next."`} />
            <QuoteBlock text='"Sorrow is the price of having loved something that good."' />
            <QuoteBlock text='"There is no grief like the grief that does not speak. Pet loss is real loss."' />
            <QuoteBlock text={`"I'll grieve you for as long as I loved you. So, always."`} />
            <QuoteBlock text={`"You took a piece of me with you. I'm not asking for it back."`} />
            <QuoteBlock text='"Tears are the silent language of grief. And I have so many things to say."' />
            <QuoteBlock text='"How lucky I am to have something that makes saying goodbye so hard."' />
          </div>
        </motion.section>

        {/* Rainbow Bridge quotes */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Rainbow Bridge Quotes
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Gentle, comforting words for those who find solace in the idea that our dogs are
            waiting somewhere beautiful.{" "}
            <Link to="/rainbow-bridge-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Browse the full Rainbow Bridge quotes collection →
            </Link>
          </p>
          <div className="space-y-4">
            <QuoteBlock text='"Just this side of heaven is a place called Rainbow Bridge."' />
            <QuoteBlock text={`"Run free at the Rainbow Bridge, my sweet friend. I'll see you there one day."`} />
            <QuoteBlock text={`"You're not gone — you're just waiting for me on the other side of the Bridge."`} />
            <QuoteBlock text={`"There's sunshine, fresh grass, and not a single sore paw at the Rainbow Bridge."`} />
            <QuoteBlock text='"Until I see you at the Bridge, run free, sweet boy."' />
            <QuoteBlock text={`"At the Rainbow Bridge, no dog is ever lonely. I take comfort knowing you're among friends."`} />
            <QuoteBlock text={`"One day, I'll cross that Bridge. And you'll be the first to greet me — tail wagging, just like always."`} />
            <QuoteBlock text='"The Rainbow Bridge: where pain ends, love continues, and reunions are forever."' />
            <QuoteBlock text={`"You're young again, healthy again, and waiting. That's how I picture you now."`} />
            <QuoteBlock text={`"Heaven's gates open wider for the dogs who loved their humans well."`} />
            <QuoteBlock text='"Some say all dogs go to heaven. I say: of course they do — they ARE heaven."' />
          </div>
        </motion.section>

        {/* How to use */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            How to Use These Quotes
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">On a tribute page</h3>
              <p className="text-foreground/80 leading-relaxed">
                Pair a quote with a photo and a personal memory to create something that honors
                the full life of your dog — not just their loss.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">In a sympathy card</h3>
              <p className="text-foreground/80 leading-relaxed">
                Open with a quote, then add one personal sentence about the dog. That small
                personal touch makes the message land.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">As an engraving</h3>
              <p className="text-foreground/80 leading-relaxed">
                Short quotes (2–6 words) work best for urns, plaques, and jewellery. Choose words
                that capture your dog's essence in one breath.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">For social media</h3>
              <p className="text-foreground/80 leading-relaxed">
                Quotes paired with a favourite photo are a quiet, meaningful way to share the news
                or mark an anniversary.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA #3 — End */}
        <InlineCta
          heading="Honor their life properly."
          body="Create a personalized tribute page with photos, stories, and the quotes that say everything words can hold."
        />

        {/* FAQ */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {DOG_MEMORIAL_FAQS.map((faq) => (
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
              { label: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes" },
              { label: "Dog Loss Quotes", href: "/dog-loss-quotes" },
              { label: "Short Dog Memorial Quotes", href: "/short-dog-memorial-quotes" },
              { label: "What to Write When a Dog Dies", href: "/what-to-write-when-a-dog-dies" },
              { label: "Loss of Dog Messages to a Friend", href: "/loss-of-dog-messages-to-a-friend" },
              { label: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
              { label: "Pet Condolence Messages", href: "/pet-condolence-messages" },
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

export default DogMemorialQuotes;
