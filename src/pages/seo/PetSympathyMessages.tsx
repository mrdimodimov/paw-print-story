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

const MessageBlock = ({ text }: { text: string }) => (
  <blockquote className="border-l-2 border-primary/30 pl-5 py-1">
    <p className="text-foreground/90 leading-relaxed">{text}</p>
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

const PET_SYMPATHY_FAQS = [
  {
    question: "How do you express sympathy for pet loss?",
    answer:
      "Acknowledge the loss as real, use the pet's name, and avoid minimising language like \"it was just a pet.\" A short, sincere message that names what they're feeling is more meaningful than something polished.",
  },
  {
    question: "What is a short condolence message?",
    answer:
      "A short condolence message is a brief, sincere note of sympathy — usually one or two sentences. Examples: \"I'm so sorry about [name]. They were so loved\" or \"Thinking of you. Sending love.\"",
  },
  {
    question: "Should you send a message when a pet dies?",
    answer:
      "Yes, always. Even a few words mean a great deal. People who lose pets often feel their grief isn't fully understood — a thoughtful message lets them know it is.",
  },
  {
    question: "Is it okay to mention the pet by name?",
    answer:
      "Yes — it's often the most meaningful thing you can do. Saying their name acknowledges them as an individual who was loved, not just \"a pet.\"",
  },
  {
    question: "What should I avoid saying?",
    answer:
      "Avoid \"it was just a pet,\" \"you can get another one,\" or comparisons to other losses. Focus on empathy and acknowledgement instead of trying to explain or fix the grief.",
  },
];

const PetSympathyMessages = () => {
  const navigate = useNavigate();
  const siteUrl = (import.meta.env.VITE_SITE_URL as string) || "https://vellumpet.com";
  const canonicalUrl = `${siteUrl}/pet-sympathy-messages`;

  const title = "50 Sympathy Messages for the Loss of a Pet (Heartfelt & Meaningful)";
  const description =
    "50 heartfelt sympathy messages for the loss of a pet — general, dog, cat, religious, and messages for close friends to comfort someone grieving.";

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
    mainEntity: PET_SYMPATHY_FAQS.map((faq) => ({
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
          { name: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
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
            50 Sympathy Messages for the Loss of a Pet
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            When someone you care about loses a pet, the silence can feel louder than anything you
            could say. You want to reach out — but worry about getting the words wrong, sounding
            hollow, or making it worse. The truth is: showing up matters more than perfection.
            Even a single sincere sentence can carry someone through a heavy day.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            These 50 sympathy messages were written for grief that's deeply real — and often
            quietly carried. Whether the loss is a dog, a cat, or another beloved companion,
            you'll find words here that honor the pet, acknowledge the bond, and remind your
            person they're not grieving alone.
          </p>
        </motion.section>

        {/* CTA #1 */}
        <InlineCta
          emoji="💔"
          heading="Honor their pet's memory."
          body="Create a tribute page in their pet's name — a lasting place for photos, stories, and shared messages of love."
        />

        {/* General sympathy messages */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            General Sympathy Messages
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Universal messages that work for any pet — sincere, warm, and easy to send in a card,
            text, or social reply.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I'm so sorry about [name]. They were so loved." />
            <MessageBlock text="Thinking of you today. Sending so much love." />
            <MessageBlock text="No words feel big enough. Just know I'm here." />
            <MessageBlock text="They were lucky to have you as their person." />
            <MessageBlock text="Your home won't feel the same. I'm thinking of you." />
            <MessageBlock text="They lived the best life because of you." />
            <MessageBlock text="Holding you in my heart." />
            <MessageBlock text="A pet like that comes along once. I'm so sorry." />
            <MessageBlock text="Sending peace and comfort during this hard time." />
            <MessageBlock text="So sorry for your loss. Take all the time you need." />
          </div>
        </motion.section>

        {/* Messages for dog loss */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Dog Loss
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the loss of a dog — a daily companion, greeter at the door, and steady presence
            through every season. See more in our{" "}
            <Link to="/dog-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              dog memorial quotes guide
            </Link>
            .
          </p>
          <div className="space-y-4">
            <MessageBlock text="So sorry about [name]. They were such a good dog." />
            <MessageBlock text="The way [name] greeted everyone — that kind of joy is rare. I'm so sorry." />
            <MessageBlock text="A dog like [name] becomes the heartbeat of a home. We'll miss them too." />
            <MessageBlock text="Run free, sweet [name]. Sending love to you and your family." />
            <MessageBlock text="[Name] was lucky to have you. You gave them the most beautiful life." />
            <MessageBlock text="Sending love. The bond you shared with [name] was something special." />
            <MessageBlock text="I'll always remember [name]'s gentle soul. So sorry for your loss." />
            <MessageBlock text="No more pain, just peace. Run free, [name]." />
          </div>
        </motion.section>

        {/* Messages for cat loss */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Cat Loss
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the loss of a cat — a quiet comfort, a constant companion, and the soft weight of
            love at the end of the bed. See more in our{" "}
            <Link to="/cat-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              cat memorial quotes guide
            </Link>
            .
          </p>
          <div className="space-y-4">
            <MessageBlock text="So sorry about [name]. They were a beautiful soul." />
            <MessageBlock text="Cats choose their humans, and [name] chose so well. Sending love." />
            <MessageBlock text="The quiet [name] left behind is its own kind of grief. I'm so sorry." />
            <MessageBlock text="They picked you for a reason. [Name] was so loved — and they knew it." />
            <MessageBlock text="A cat's love is quiet, but unmistakable. [Name] gave you so much of it." />
            <MessageBlock text="Sending peace. [Name] is curled up somewhere warm now, free of all pain." />
            <MessageBlock text="The empty spot on the windowsill says everything. So sorry for your loss." />
            <MessageBlock text="[Name] had the best life with you. Thank you for loving them so well." />
          </div>
        </motion.section>

        {/* CTA #2 — Mid-article */}
        <InlineCta
          heading="Create something they can keep forever."
          body="Turn your message into a tribute page with photos, stories, and shared memories — a meaningful gift for someone grieving."
        />

        {/* Religious messages */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Religious & Spiritual Messages
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For friends and family who find comfort in faith, prayer, or the idea of something
            beyond — gentle messages that honor both belief and loss.
          </p>
          <div className="space-y-4">
            <MessageBlock text="Praying for comfort and peace for you and your family during this heartbreaking time." />
            <MessageBlock text="May [name] rest peacefully at the Rainbow Bridge, where there's no more pain — only sunshine and soft grass." />
            <MessageBlock text="Heaven has a new four-legged angel today. [Name] will be watching over you." />
            <MessageBlock text="May the love you shared with [name] be a light that guides you through this grief." />
            <MessageBlock text="Holding you in prayer. May you feel surrounded by love and good memories." />
            <MessageBlock text="[Name] is at peace now — running free, waiting for the day you meet again." />
            <MessageBlock text="Some souls leave paw prints on our hearts forever. [Name] was one of them." />
            <MessageBlock text="May God's peace rest gently on your heart in this season of grief." />
          </div>
        </motion.section>

        {/* Messages for close friends */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Close Friends
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the people you know deeply — the ones who don't need formality, just truth and
            presence.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I know [name] wasn't just a pet to you — they were family. I'm here whenever you need me." />
            <MessageBlock text="I wish I could take this pain away. Just know that I love you, and I'm here for however long this takes." />
            <MessageBlock text="Your grief shows how deeply you loved. And that's a beautiful, painful, impossible thing." />
            <MessageBlock text="I loved [name] too. I'll miss them. And I'll be here for you through all of this." />
            <MessageBlock text="I'm bringing dinner over this week. Don't argue. Just tell me when." />
            <MessageBlock text="There's no timeline for this kind of grief. Take all the time you need. I'm not going anywhere." />
            <MessageBlock text="I keep thinking about all the times [name] greeted me at your door. I'm so sorry." />
            <MessageBlock text="You gave [name] the most wonderful life. They knew it every single day." />
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            How to Make Your Message Meaningful
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Use the pet's name</h3>
              <p className="text-foreground/80 leading-relaxed">
                Names matter. Saying it acknowledges this pet as an individual who was loved.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Mention something specific
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                A shared memory, a habit, the way they greeted you — small details show this pet
                was loved beyond their own home.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Avoid minimising language
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Skip "it was just a pet" and "you can get another one." Both reduce a real loss to
                something replaceable.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Follow up later</h3>
              <p className="text-foreground/80 leading-relaxed">
                A check-in two or three weeks after the loss often means more than the initial
                message. Grief lasts longer than the cards do.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA #3 — End */}
        <InlineCta
          heading="Preserve their memory beautifully."
          body="Create a personalized tribute page — a lasting gift to honor the pet they loved most."
        />

        {/* FAQ */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {PET_SYMPATHY_FAQS.map((faq) => (
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
              { label: "Pet Loss Messages", href: "/pet-loss-messages" },
              { label: "Pet Condolence Messages", href: "/pet-condolence-messages" },
              { label: "Pet Memorial Quotes", href: "/pet-memorial-quotes" },
              { label: "Dog Memorial Quotes", href: "/dog-memorial-quotes" },
              { label: "Cat Memorial Quotes", href: "/cat-memorial-quotes" },
              { label: "Loss of Dog Messages to a Friend", href: "/loss-of-dog-messages-to-a-friend" },
              { label: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes" },
              { label: "Cope With Losing a Pet", href: "/cope-with-losing-a-pet" },
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

export default PetSympathyMessages;
