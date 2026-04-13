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

const MessageBlock = ({ text }: { text: string }) => (
  <blockquote className="border-l-2 border-primary/30 pl-5 py-1">
    <p className="text-foreground/90 leading-relaxed">{text}</p>
  </blockquote>
);

const PET_SYMPATHY_FAQS = [
  { question: "What do you say when someone loses a pet?", answer: "Offer simple, sincere words of comfort and acknowledge their loss. Use the pet's name if you know it." },
  { question: "What are good pet sympathy messages?", answer: "Short, heartfelt messages that express care and understanding. Focus on the bond between the pet and the owner." },
  { question: "Should I send a message when a pet dies?", answer: "Yes, even a short message can provide comfort and let the person know you care." },
  { question: "What should you avoid saying?", answer: "Avoid minimizing the loss or comparing it to other situations. Focus on empathy and acknowledgement." },
  { question: "Can I create a memorial page for someone else's pet?", answer: "Yes, it can be a meaningful tribute that brings together photos, stories, and memories in one place." },
];

const PetSympathyMessages = () => {
  const navigate = useNavigate();
  const canonicalUrl = "https://paw-print-story.lovable.app/pet-sympathy-messages";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What to Say When a Pet Dies (Heartfelt Sympathy Messages That Help)",
    description: "Not sure what to say when a pet dies? Use these heartfelt sympathy messages and comforting words for someone grieving a dog or pet.",
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
    mainEntity: PET_SYMPATHY_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>What to Say When a Pet Dies (Heartfelt Sympathy Messages That Help)</title>
        <meta name="description" content="Not sure what to say when a pet dies? Use these heartfelt sympathy messages and comforting words for someone grieving a dog or pet." />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <SeoBreadcrumbs items={[
        { name: "Pet Sympathy Messages", href: "/pet-sympathy-messages" },
      ]} />

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
        <motion.section {...section()} className="mb-10">
          <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-[2.75rem]">
            What to Say When a Pet Dies (Heartfelt Messages That Help)
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            Knowing what to say when a pet dies is never easy. Pets are family, and their loss can be deeply painful. These sympathy messages will help you express compassion, support, and understanding during one of the hardest moments someone can face.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            These pet sympathy messages are here to help. Whether you're writing a card, sending a text, or helping someone{" "}
            <Link to="/pet-memorial" className="text-primary underline underline-offset-2 hover:text-primary/80">
              create a pet memorial
            </Link>, you'll find words that acknowledge the loss without minimising it — because pets aren't "just" pets. They're family. You may also find comfort in our collection of{" "}
            <Link to="/rainbow-bridge-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Rainbow Bridge quotes
            </Link>{" "}
            or our guide on{" "}
            <Link to="/cope-with-losing-a-pet" className="text-primary underline underline-offset-2 hover:text-primary/80">
              how to cope with losing a pet
            </Link>.
          </p>

          {/* Contextual Links */}
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="Related topics">
            {[
              { text: "Pet memorial quotes", href: "/pet-memorial-quotes" },
              { text: "Rainbow Bridge quotes", href: "/rainbow-bridge-quotes" },
              { text: "What to write when a dog dies", href: "/what-to-write-when-a-dog-dies" },
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
        </motion.section>

        {/* ─── H2: Definition ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            What Are Pet Sympathy Messages?
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            Pet sympathy messages are words of comfort shared with someone who has lost a pet. They help express compassion, support, and understanding during a difficult time.
          </p>
        </motion.section>

        {/* Simple Pet Sympathy Messages */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Simple Pet Sympathy Messages</h2>
          <p className="mb-6 text-muted-foreground">Short, heartfelt pet condolence messages that work for any situation — a card, a text, or a quiet word in person.</p>
          <div className="space-y-4">
            <MessageBlock text="I'm so sorry for your loss. They were lucky to have you." />
            <MessageBlock text="There are no words, but I'm thinking of you." />
            <MessageBlock text="They were loved, and that love will never go away." />
            <MessageBlock text="I know how much they meant to you. I'm here if you need anything." />
            <MessageBlock text="Your home won't feel the same, and I'm sorry for that." />
            <MessageBlock text="What a beautiful life you gave them." />
            <MessageBlock text="The bond you shared was something special. I'm so sorry it hurts right now." />
            <MessageBlock text="Sending you so much love during this time." />
            <MessageBlock text="They were a wonderful companion, and they'll be deeply missed." />
            <MessageBlock text="I wish I could take this pain away. Just know I'm here." />
            <MessageBlock text="You gave them a life full of love. That's the greatest gift." />
            <MessageBlock text="I hope the memories bring you comfort in time." />
          </div>
        </motion.section>

        {/* Dog Sympathy Messages */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Pet Sympathy Messages for a Dog</h2>
          <p className="mb-6 text-muted-foreground">
            Dogs leave such a specific kind of absence — the empty doorway, the quiet mornings. These dog sympathy messages honour that. For more on writing about a dog's life, see our{" "}
            <Link to="/dog-obituary-example" className="text-primary underline underline-offset-2 hover:text-primary/80">dog obituary example</Link>.
          </p>
          <div className="space-y-4">
            <MessageBlock text="They were the best dog — and you were the best person for them." />
            <MessageBlock text="No one greeted you like they did. That kind of love is rare." />
            <MessageBlock text="I'll always remember the way they'd light up when you walked in." />
            <MessageBlock text="The walks, the tail wags, the muddy paws — I know you'd give anything for one more day of it." />
            <MessageBlock text="They didn't just live with you. They lived for you." />
            <MessageBlock text="Every dog deserves to be loved the way you loved them." />
            <MessageBlock text="I can't imagine your mornings without them. I'm so sorry." />
            <MessageBlock text="They were such a good dog. And that's because they had a good person." />
            <MessageBlock text="The house must feel so quiet now. I'm thinking of you." />
            <MessageBlock text="You gave them the best life a dog could ask for." />
          </div>
        </motion.section>

        {/* Cat Sympathy Messages */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Pet Sympathy Messages for a Cat</h2>
          <p className="mb-6 text-muted-foreground">
            Cats grieve quietly, and so do the people who love them. These cat sympathy messages reflect that gentle, private kind of bond. You might also appreciate our{" "}
            <Link to="/cat-memorial-tribute-example" className="text-primary underline underline-offset-2 hover:text-primary/80">cat memorial tribute example</Link>.
          </p>
          <div className="space-y-4">
            <MessageBlock text="They chose you — and that says everything about the home you gave them." />
            <MessageBlock text="A cat's love is quiet, but the loss is loud. I'm so sorry." />
            <MessageBlock text="I know the empty spot on the couch feels unbearable right now." />
            <MessageBlock text="They had such a gentle presence. Your home must miss them as much as you do." />
            <MessageBlock text="The purring, the head nudges, the way they curled up next to you — those moments mattered." />
            <MessageBlock text="Cats don't love easily, but they loved you. That was clear." />
            <MessageBlock text="I'm so sorry. The quiet companionship of a cat is irreplaceable." />
            <MessageBlock text="They lived a warm, safe, loved life. That's because of you." />
            <MessageBlock text="I'll miss seeing photos of them in their favourite spot." />
            <MessageBlock text="You gave them a beautiful life. I hope that brings you some comfort." />
          </div>
        </motion.section>

        {/* More Personal Messages */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">More Personal Pet Sympathy Messages</h2>
          <p className="mb-6 text-muted-foreground">
            When you know the person — and the pet — well, a longer, more personal message can mean the world. These go a little deeper.
          </p>
          <div className="space-y-4">
            <MessageBlock text="I remember the first time I met them — you could tell right away how loved they were. I'm so sorry you're going through this. They had a wonderful life because of you." />
            <MessageBlock text="I know people sometimes don't understand how much a pet can mean. But I do. What you're feeling is completely valid, and I'm here for you however you need." />
            <MessageBlock text="You were their whole world, and they were clearly a huge part of yours. The grief you're feeling is a reflection of the love you shared — and that's something beautiful, even when it hurts." />
            <MessageBlock text="I've been thinking about you all day. I know how much they meant to your daily life — the routines, the comfort, the companionship. I'm so sorry that's been taken from you." />
            <MessageBlock text="Losing them doesn't just change your home — it changes your whole rhythm. I wish I could make it easier. Just know I'm thinking of you and honouring the bond you had." />
          </div>
        </motion.section>

        {/* What to Say and Avoid */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">What to Say (and What to Avoid)</h2>
          <p className="mb-6 text-muted-foreground">
            Knowing what to say when someone loses a pet can feel tricky. Here's a simple guide to help you get it right.
          </p>

          <h3 className="mb-3 font-semibold text-foreground">What helps:</h3>
          <ul className="mb-6 space-y-2.5 pl-1">
            {[
              "Acknowledge the loss directly — don't dance around it",
              "Use the pet's name if you know it",
              "Share a specific memory you have of their pet",
              "Say \"I'm here\" or \"I'm thinking of you\" — simple is powerful",
              "Validate their grief — say it's okay to feel this way",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground/90">
                <PawIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="mb-3 font-semibold text-foreground">What to avoid:</h3>
          <ul className="space-y-2.5 pl-1">
            {[
              "\"It was just a pet\" — this dismisses real grief",
              "\"You can always get another one\" — a new pet isn't a replacement",
              "\"At least they had a good life\" — true, but unhelpful when someone is hurting",
              "\"I know how you feel\" — unless you truly do, let them lead",
              "Comparing their loss to your own — keep the focus on them",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground/90">
                <span className="mt-1 h-4 w-4 shrink-0 text-muted-foreground">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Ways to Support */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Ways to Support Someone Who Lost a Pet</h2>
          <p className="mb-6 text-muted-foreground">
            Beyond words, there are small gestures that can mean more than you'd expect. If you're looking for comforting words to include, our{" "}
            <Link to="/pet-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">pet memorial quotes</Link>{" "}
            and{" "}
            <Link to="/rainbow-bridge-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">Rainbow Bridge quotes</Link>{" "}
            collections may help.
          </p>
          <ul className="space-y-3 pl-1">
            {[
              { title: "Send a message", desc: "Even a short text shows you're thinking of them. Don't overthink it." },
              { title: "Share a memory", desc: "If you knew the pet, share a specific moment you remember. It means more than a generic \"sorry.\"" },
              { title: "Send a small gesture", desc: "Flowers, a favourite treat, a handwritten card — something tangible that says \"I see your pain.\"" },
              { title: "Check in later", desc: "Grief doesn't end after the first week. A message two weeks later can be the most meaningful one." },
              { title: "Help create a memorial", desc: "Offer to help them write a tribute or collect photos. It's a meaningful way to honour the pet's life." },
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
        </motion.section>

        {/* Creating a Memorial */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Creating a Memorial for a Loved One's Pet</h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              One of the most meaningful things you can do for someone who has lost a pet is to help them remember. A memorial page gathers the moments that mattered — the habits, the personality, the quiet comfort — and turns them into something lasting.
            </p>
            <p>
              With VellumPet, you can create a tribute in under two minutes. Share a few details about the pet — their name, their quirks, the things that made them special — and we'll craft a heartfelt story that captures their life. It's a gift that says more than any sympathy card ever could.
            </p>
            <p>
              Whether you create it for yourself or for someone you love, a memorial page is a place to return to — a permanent, beautiful reminder that the bond they shared was real and meaningful.
            </p>
          </div>
        </motion.section>

        {/* ─── Hub: Related Guides ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            More Guides for Supporting Pet Loss
          </h2>
          <p className="mb-8 text-muted-foreground">
            Whether you're looking for the right words, helping someone grieve, or creating something lasting, these guides can help.
          </p>
          <div className="space-y-6">
            {[
              {
                title: "Pet Condolence Messages",
                intro: "Longer, more personal condolence messages — including a full example letter — for when you want to go beyond a short text.",
                href: "/pet-condolence-messages",
              },
              {
                title: "How to Cope With Losing a Pet",
                intro: "A gentle, practical guide to understanding pet loss grief and finding healthy ways through it.",
                href: "/cope-with-losing-a-pet",
              },
              {
                title: "Pet Memorial Quotes",
                intro: "Curated quotes for dogs, cats, and all pets — perfect for cards, tributes, and moments of remembrance.",
                href: "/pet-memorial-quotes",
              },
              {
                title: "Rainbow Bridge Quotes",
                intro: "Comforting words drawn from the Rainbow Bridge tradition — especially helpful for those finding comfort in the hope of reunion.",
                href: "/rainbow-bridge-quotes",
              },
              {
                title: "What to Write When a Dog Dies",
                intro: "A gentle guide for writing a tribute or memorial when you've lost a dog.",
                href: "/what-to-write-when-a-dog-dies",
              },
              {
                title: "What to Write When a Cat Dies",
                intro: "How to capture your cat's quiet, independent personality in a memorial that feels true.",
                href: "/what-to-write-when-a-cat-dies",
              },
              {
                title: "Create a Pet Memorial Page",
                intro: "Turn a few memories into a beautiful, lasting tribute page — a meaningful gesture for yourself or for someone you care about.",
                href: "/pet-memorial",
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

        {/* CTA */}
        <motion.section {...section()} className="mb-16 rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10">
          <h2 className="mb-3 text-2xl font-bold text-foreground">Create a Beautiful Memorial for a Loved One's Pet</h2>
          <p className="mb-6 text-muted-foreground">Creating a memorial page can be a meaningful way to honor a pet's life. VellumPet helps pet owners create beautiful online memorial pages.</p>
          <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-8 py-4 text-base font-medium text-white shadow-glow transition-all duration-200 hover:scale-[1.02] hover:shadow-card">
            <CtaIcon className="shrink-0" size={22} />
            Create Their Memorial
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">Takes less than 2 minutes · No writing required</p>
        </motion.section>


        {/* ─── When to Use ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-foreground">When to Use These Messages</h2>
          <p className="mb-3 text-muted-foreground leading-relaxed">
            Knowing when to reach out matters just as much as knowing what to say. These messages are designed for real situations where someone you care about is hurting.
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>Immediately after hearing about a friend's or coworker's pet loss</li>
            <li>When writing a sympathy card or sending a thoughtful text</li>
            <li>As a comment on a social media post about a pet who has passed</li>
            <li>When you want to check in with someone weeks after their loss — grief doesn't end quickly</li>
            <li>When helping someone <Link to="/pet-memorial" className="text-primary underline underline-offset-2 hover:text-primary/80">create a memorial page</Link> for their pet</li>
          </ul>
        </motion.section>

        {/* ─── How to Choose ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-foreground">How to Choose the Right Message</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li><strong>Keep it genuine</strong> — a short, honest message is always better than something overly polished</li>
            <li><strong>Use their pet's name</strong> — it shows you see the pet as an individual, not just "a pet"</li>
            <li><strong>Avoid clichés</strong> — phrases like "they're in a better place" can feel dismissive; focus on acknowledging the pain instead</li>
            <li><strong>Match the format</strong> — a text message can be brief; a card or <Link to="/pet-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">memorial quote</Link> can carry more weight</li>
            <li><strong>Offer support</strong> — sometimes "I'm here for you" means more than any quote</li>
          </ul>
        </motion.section>

        {/* ─── Example Messages ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Examples of Pet Sympathy Messages</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              "I just heard about your loss, and I wanted you to know I'm thinking of you. Pets leave such a deep mark on our lives, and it's clear how much love you gave each other. Take all the time you need."
            </p>
            <p>
              "I remember how your eyes would light up when you talked about them. That kind of bond doesn't just disappear — it stays with you. I'm so sorry you're going through this, and I'm here if you need anything at all."
            </p>
            <p>
              "There's no timeline for grief, especially when it's someone who was part of your daily life. I hope you find comfort in the memories you made together. They were lucky to have you as their person."
            </p>
          </div>
        </motion.section>

        {/* Related */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Related Articles</h2>
          <div className="space-y-3">
            {[
              { title: "Pet Memorial Message Examples", desc: "Thoughtful pet memorial message ideas", href: "/pet-memorial-message" },
              { title: "What to Write When a Dog Dies", desc: "A gentle guide for writing a dog memorial", href: "/what-to-write-when-a-dog-dies" },
              { title: "How to Cope With Losing a Pet", desc: "A gentle guide to grief and healing", href: "/cope-with-losing-a-pet" },
              { title: "Pet Memorial Page Online", desc: "Create a beautiful online pet memorial", href: "/pet-memorial" },
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

        {/* ─── FAQ ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "What do you say when someone loses a pet?", a: "Offer simple, sincere words of comfort and acknowledge their loss. Use the pet's name if you know it." },
              { q: "What are good pet sympathy messages?", a: "Short, heartfelt messages that express care and understanding. Focus on the bond between the pet and the owner." },
              { q: "Should I send a message when a pet dies?", a: "Yes, even a short message can provide comfort and let the person know you care." },
              { q: "What should you avoid saying?", a: "Avoid minimizing the loss or comparing it to other situations. Focus on empathy and acknowledgement." },
              { q: "Can I create a memorial page for someone else's pet?", a: "Yes, it can be a meaningful tribute that brings together photos, stories, and memories in one place." },
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
              { label: "Rainbow Bridge quotes", href: "/rainbow-bridge-quotes" },
              { label: "Dog obituary example", href: "/dog-obituary-example" },
              { label: "Pet condolence messages", href: "/pet-condolence-messages" },
              { label: "Short pet loss messages", href: "/short-pet-loss-messages" },
              { label: "Pet grief quotes", href: "/pet-grief-quotes" },
              { label: "Loss of dog messages to a friend", href: "/loss-of-dog-messages-to-a-friend" },
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

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-3xl px-5">
          <p>Made with <Heart className="inline h-3 w-3 text-primary" /> by {BRAND.name}</p>
        </div>
      </footer>
    </div>
  );
};

export default PetSympathyMessages;
