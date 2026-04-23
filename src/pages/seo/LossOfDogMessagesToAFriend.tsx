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

const LOSS_OF_DOG_FAQS = [
  {
    question: "What do you say when someone loses a dog?",
    answer:
      "Keep it simple and sincere. Say you're sorry, use the dog's name, and acknowledge that this is a real loss. Something like 'I'm so sorry about [name]. They were such a good dog' is enough.",
  },
  {
    question: "How do you comfort someone who lost a pet?",
    answer:
      "Acknowledge their grief as valid, avoid clichés like 'it was just a dog,' and offer practical support — a meal, a check-in text a week later, or help creating a memorial. Presence matters more than perfect words.",
  },
  {
    question: "Is losing a dog like losing a family member?",
    answer:
      "For most owners, yes. Dogs share daily routines, milestones, and unconditional love for years. Grief from losing a dog is real and deserves the same compassion as any other family loss.",
  },
  {
    question: "Should I send a card or a text?",
    answer:
      "Either works. A text reaches them immediately; a card shows extra thought. What matters most is reaching out at all — a late message is always better than silence.",
  },
  {
    question: "Can I create a memorial for a friend's dog?",
    answer:
      "Yes. A tribute page with photos, stories, and shared memories is one of the most meaningful gifts you can give a grieving friend.",
  },
];

const LossOfDogMessagesToAFriend = () => {
  const navigate = useNavigate();
  const siteUrl = (import.meta.env.VITE_SITE_URL as string) || "https://vellumpet.com";
  const canonicalUrl = `${siteUrl}/loss-of-dog-messages-to-a-friend`;

  const title = "50 Heartfelt Loss of Dog Messages to a Friend (What to Say When a Dog Dies)";
  const description =
    "50+ heartfelt loss of dog messages to send a friend. Find the right words to say when a dog dies — short, long, religious, and coworker-appropriate examples.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: { "@type": "Organization", name: "VellumPet", url: siteUrl },
    publisher: { "@type": "Organization", name: "VellumPet", url: siteUrl },
    datePublished: "2026-04-09",
    dateModified: "2026-04-23",
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: LOSS_OF_DOG_FAQS.map((faq) => ({
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
          { name: "Loss of Dog Messages to a Friend", href: "/loss-of-dog-messages-to-a-friend" },
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
            50 Heartfelt Loss of Dog Messages to a Friend
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            When a friend loses their dog, words feel impossibly small. You want to say something
            meaningful without minimising their grief — but the silence feels worse. These messages
            were written for exactly that moment: simple, sincere words that tell your friend you
            understand their pain, that their dog mattered, and that you're here.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            You don't have to find the perfect words. You just have to show up. Below are 50+
            messages — short, long, spiritual, and workplace-appropriate — to help you do exactly
            that.
          </p>
        </motion.section>

        {/* CTA #1 — After intro */}
        <InlineCta
          emoji="💔"
          heading="Recently lost a beloved pet?"
          body="Create a beautiful online tribute in minutes — a lasting place for photos, stories, and memories."
        />

        {/* Short sympathy messages */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Short Sympathy Messages
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Quick messages for a text, card, or social media reply. Keep them sincere — short
            doesn't mean shallow.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I'm so sorry about [dog's name]. They were such a good dog." />
            <MessageBlock text="Thinking of you today. I know how much they meant to you." />
            <MessageBlock text="No words feel big enough. Just know I'm here." />
            <MessageBlock text="They were lucky to have you as their person." />
            <MessageBlock text="I'm so sorry for your loss. They were a beautiful soul." />
            <MessageBlock text="Your home won't feel the same. I'm thinking of you." />
            <MessageBlock text="They lived the best life because of you." />
            <MessageBlock text="Sending you so much love right now." />
            <MessageBlock text="A dog like that comes along once. I'm so sorry." />
            <MessageBlock text="Holding you and your family in my heart." />
          </div>
        </motion.section>

        {/* Longer heartfelt messages */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Longer Heartfelt Messages
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For when a few words aren't enough — these messages take time to acknowledge the
            weight of what your friend is carrying.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I keep thinking about all the times [name] greeted me at your door. They had the sweetest personality, and I'm so sorry you're going through this." />
            <MessageBlock text="Losing a dog is one of those griefs people don't always understand. But I do. And I'm here for whatever you need — whenever you need it." />
            <MessageBlock text="There's no timeline for this kind of grief. Take all the time you need. I'm not going anywhere." />
            <MessageBlock text="You gave [name] the most wonderful life. That matters more than anything, and they knew it every single day." />
            <MessageBlock text="The bond you had was something rare. I'm heartbroken for you, and I'll be thinking of you in the quiet moments when it hurts the most." />
            <MessageBlock text="Every dog deserves an owner like you. [Name] was so loved — and that love is something they carried with them always." />
          </div>
        </motion.section>

        {/* CTA #2 — Mid-article */}
        <InlineCta
          heading="Want to turn your message into a lasting memory?"
          body="Create a tribute page with photos, stories, and shared messages — a meaningful gift for a grieving friend."
        />

        {/* Messages for close friends */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Close Friends
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the people you know deeply — the ones who don't need formality, just truth.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I know [name] wasn't just a pet to you — they were family. I'm here if you need to talk, cry, or just sit in the quiet." />
            <MessageBlock text="I wish I could take this pain away. Just know that I love you and I'm here, for however long this takes." />
            <MessageBlock text="Your grief shows how deeply you loved. And that's a beautiful, painful, impossible thing." />
            <MessageBlock text="I remember the way [name] used to [specific memory]. They brought so much joy into your life — and into mine, too." />
            <MessageBlock text="I'm bringing dinner over this week. Don't argue. Just tell me when." />
            <MessageBlock text="I loved [name] too. I'll miss them. And I'll be here for you through all of this." />
          </div>
        </motion.section>

        {/* Messages for coworkers */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Coworkers
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Warm but professional — these strike the right tone for a workplace card, email, or
            Slack message.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I was so sorry to hear about [name]. Please take whatever time you need — we'll cover things here." />
            <MessageBlock text="Thinking of you and your family during this difficult time. [Name] was clearly so loved." />
            <MessageBlock text="I know how much [name] meant to you. Sending you my deepest sympathies." />
            <MessageBlock text="No need to reply — just wanted you to know I'm thinking of you. So sorry for your loss." />
            <MessageBlock text="Please don't worry about work. We've got you covered. Take care of yourself." />
            <MessageBlock text="Sending warm thoughts to you and your family. [Name] was a wonderful companion." />
          </div>
        </motion.section>

        {/* Religious / Spiritual messages */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Religious & Spiritual Messages
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For friends who find comfort in faith or the idea of something beyond — gentle
            messages that honour both belief and loss.
          </p>
          <div className="space-y-4">
            <MessageBlock text="May [name] rest peacefully at the Rainbow Bridge, where there's no more pain — only sunshine and soft grass." />
            <MessageBlock text="Praying for comfort and peace for you and your family during this heartbreaking time." />
            <MessageBlock text="May the love you shared with [name] be a light that guides you through this grief." />
            <MessageBlock text="Heaven has a new four-legged angel today. [Name] will be watching over you." />
            <MessageBlock text="Holding you in prayer. May you feel surrounded by love and good memories." />
            <MessageBlock text="[Name] is at peace now — running free, waiting for the day you meet again." />
            <MessageBlock text="Some souls leave paw prints on our hearts forever. [Name] was one of them." />
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            How to Make Your Message Personal
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Use the dog's name</h3>
              <p className="text-foreground/80 leading-relaxed">
                Saying their name acknowledges that this dog mattered as an individual — not just
                as a pet.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Mention a specific memory
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Even a small detail — the way they greeted you, a funny habit — shows your friend
                that their dog was loved beyond their own home.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Avoid minimising language
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Skip "it was just a dog" and "you can get another one." Both reduce a real loss to
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

        {/* CTA #3 — End of article */}
        <InlineCta
          heading="Honor their memory properly."
          body="Create a personalized tribute page with photos, stories, and shared memories — a lasting place to remember the dog they loved."
        />

        {/* FAQ */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {LOSS_OF_DOG_FAQS.map((faq) => (
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
              { label: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
              { label: "Pet Condolence Messages", href: "/pet-condolence-messages" },
              { label: "Dog Memorial Quotes", href: "/dog-memorial-quotes" },
              { label: "Dog Loss Quotes", href: "/dog-loss-quotes" },
              { label: "What to Write When a Dog Dies", href: "/what-to-write-when-a-dog-dies" },
              { label: "Rainbow Bridge Quotes", href: "/rainbow-bridge-quotes" },
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

export default LossOfDogMessagesToAFriend;
