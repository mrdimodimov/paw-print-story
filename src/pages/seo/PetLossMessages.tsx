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

const PET_LOSS_FAQS = [
  {
    question: "What to say when someone loses a pet?",
    answer:
      "Keep it sincere and personal. Use the pet's name, acknowledge that this is a real loss, and avoid clichés. Something as simple as \"I'm so sorry about [name]. They were so loved\" is enough.",
  },
  {
    question: "Is it okay to send condolences for a pet?",
    answer:
      "Absolutely. Pet grief is real grief, and most owners deeply appreciate any acknowledgement of their loss. A short message, card, or memorial gesture can mean the world.",
  },
  {
    question: "How do you comfort someone grieving a pet?",
    answer:
      "Acknowledge their grief without minimising it, listen more than you speak, and follow up beyond the first week. Practical gestures — a meal, a check-in, helping create a memorial — often help more than words alone.",
  },
  {
    question: "Should I mention the pet by name?",
    answer:
      "Yes. Using the pet's name shows you saw them as an individual, not just \"a pet.\" It makes any message immediately more personal and meaningful.",
  },
  {
    question: "Is a card or text better?",
    answer:
      "Both work. A text reaches them instantly during the hardest moments; a card shows extra thought and gives them something to keep. The most important thing is to reach out at all.",
  },
];

const PetLossMessages = () => {
  const navigate = useNavigate();
  const siteUrl = (import.meta.env.VITE_SITE_URL as string) || "https://vellumpet.com";
  const canonicalUrl = `${siteUrl}/pet-loss-messages`;

  const title = "60 Pet Loss Messages to Comfort Someone Grieving";
  const description =
    "60 heartfelt pet loss messages — short sympathies, messages for friends, family, children, and formal condolences to comfort someone grieving a pet.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: { "@type": "Organization", name: "VellumPet", url: siteUrl },
    publisher: { "@type": "Organization", name: "VellumPet", url: siteUrl },
    datePublished: "2026-04-23",
    dateModified: "2026-04-23",
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PET_LOSS_FAQS.map((faq) => ({
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
          { name: "Pet Loss Messages", href: "/pet-loss-messages" },
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
            60 Pet Loss Messages to Comfort Someone Grieving
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            When someone loses a pet, finding the right words feels almost impossible. You want to
            comfort them without minimising the loss — to say something that lands gently, not
            something hollow. The truth is, there are no perfect words for this. There are only
            honest ones.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            These 60 pet loss messages are written for exactly that moment. Short and long,
            casual and formal, for friends, family, coworkers, and even children — each one is a
            way to say: I see your grief, and I'm here.
          </p>
        </motion.section>

        {/* CTA #1 */}
        <InlineCta
          emoji="💔"
          heading="Help them remember their pet forever."
          body="Create a tribute page in their pet's name — a lasting place for photos, stories, and shared memories."
        />

        {/* Short sympathy messages */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Short Sympathy Messages
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Brief, heartfelt lines for a text, card, or quick reply. Short doesn't mean shallow.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I'm so sorry about [name]. They were so loved." />
            <MessageBlock text="Thinking of you today. Sending love." />
            <MessageBlock text="No words feel big enough. Just know I'm here." />
            <MessageBlock text="They were lucky to have you as their person." />
            <MessageBlock text="Sending you so much love right now." />
            <MessageBlock text="Your home won't feel the same. I'm thinking of you." />
            <MessageBlock text="They lived the best life because of you." />
            <MessageBlock text="Holding you in my heart." />
            <MessageBlock text="A pet like that comes along once. I'm so sorry." />
            <MessageBlock text="So sorry for your loss. Take all the time you need." />
            <MessageBlock text="Wishing you peace and comfort during this hard time." />
            <MessageBlock text="They were family. I'm grieving with you." />
          </div>
        </motion.section>

        {/* Messages for friends */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Friends
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Warm, personal words for the friend who just lost their best companion.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I keep thinking about all the times [name] greeted me at your door. They had the sweetest soul. I'm so sorry." />
            <MessageBlock text="I know [name] wasn't just a pet — they were family. I'm here whenever you want to talk, cry, or just sit in the quiet." />
            <MessageBlock text="Losing a pet is one of those griefs people don't always understand. But I do. And I'm here for you." />
            <MessageBlock text="There's no timeline for this kind of grief. Take all the time you need. I'm not going anywhere." />
            <MessageBlock text="You gave [name] the most beautiful life. That matters more than anything." />
            <MessageBlock text="I loved [name] too. I'll miss them. And I'll be here for you through all of this." />
            <MessageBlock text="I'm bringing dinner over this week. Don't argue. Just tell me when." />
            <MessageBlock text="Your grief shows how deeply you loved. And that's something rare and beautiful." />
          </div>
        </motion.section>

        {/* Messages for family */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Family
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            For the family members who shared their home with this beloved companion.
          </p>
          <div className="space-y-4">
            <MessageBlock text="[Name] was part of our family. I'll miss them too. Sending love to all of you." />
            <MessageBlock text="The house won't feel the same without [name]. We're heartbroken with you." />
            <MessageBlock text="Thinking of you all today. [Name] was so loved by everyone who knew them." />
            <MessageBlock text="Sending love to the whole family. [Name] gave us so many beautiful memories." />
            <MessageBlock text="I know how much [name] meant to all of you. I'm so sorry for our shared loss." />
            <MessageBlock text="They were a wonderful part of our family story. We'll never forget them." />
            <MessageBlock text="Holding all of you close in my heart right now." />
            <MessageBlock text="Some pets become the heartbeat of a home. [Name] was that for us." />
          </div>
        </motion.section>

        {/* CTA #2 — Mid-article */}
        <InlineCta
          heading="Turn your message into something lasting."
          body="Create a tribute page with photos, stories, and shared memories — a meaningful gift for someone grieving."
        />

        {/* Messages for children */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Messages for Children
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Gentle, age-appropriate words to help a child understand and process the loss of a
            beloved pet.
          </p>
          <div className="space-y-4">
            <MessageBlock text="[Name] loved you so much. They were so happy to be your friend." />
            <MessageBlock text="It's okay to feel sad. [Name] was a really special pet, and missing them means you loved them very much." />
            <MessageBlock text="[Name] had the best life because of you. You made every day better for them." />
            <MessageBlock text="Even though [name] isn't here, the love you shared will always be with you." />
            <MessageBlock text="It's okay to cry. Big feelings mean you had a big love." />
            <MessageBlock text="[Name] is at peace now — running, playing, and remembering all the love you gave them." />
            <MessageBlock text="You were the best human a pet could ever ask for. [Name] knew that every single day." />
            <MessageBlock text="Sometimes the hardest goodbyes happen because of the biggest loves. I'm here if you want to talk." />
          </div>
        </motion.section>

        {/* Formal condolence messages */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Formal Condolence Messages
          </h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            Respectful, professional wording for cards, workplace messages, or more reserved
            relationships.
          </p>
          <div className="space-y-4">
            <MessageBlock text="Please accept my sincere condolences on the loss of [name]. They were a beloved member of your family." />
            <MessageBlock text="I was deeply saddened to hear about [name]. Sending you and your family thoughts of comfort during this difficult time." />
            <MessageBlock text="My heartfelt sympathies on the passing of [name]. May the memories you shared bring you peace." />
            <MessageBlock text="With deepest sympathy on the loss of your beloved companion. [Name] will be missed." />
            <MessageBlock text="Please know that you and your family are in my thoughts. [Name] was a wonderful companion." />
            <MessageBlock text="Wishing you strength and comfort during this time of loss. [Name] meant so much to so many." />
            <MessageBlock text="I extend my deepest condolences. The bond you shared with [name] was truly special." />
            <MessageBlock text="With sincere sympathy for your loss. [Name] left a lasting mark on everyone who knew them." />
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
                Names matter. Saying it acknowledges this pet as an individual, not just a generic
                companion.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Mention something specific
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                A shared memory, a habit you noticed, the way they greeted you — small details
                show that this pet was loved beyond their own home.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Avoid minimising</h3>
              <p className="text-foreground/80 leading-relaxed">
                Skip phrases like "it was just a pet" or "you can get another one." They reduce a
                real loss to something replaceable.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Follow up later</h3>
              <p className="text-foreground/80 leading-relaxed">
                A check-in two or three weeks after the loss often means more than the initial
                message. Grief lasts longer than the cards.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA #3 — End */}
        <InlineCta
          heading="Give them something meaningful."
          body="Create a personalized tribute page — a lasting gift to honor the pet they loved."
        />

        {/* FAQ */}
        <motion.section {...section(0.05)} className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {PET_LOSS_FAQS.map((faq) => (
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

export default PetLossMessages;
