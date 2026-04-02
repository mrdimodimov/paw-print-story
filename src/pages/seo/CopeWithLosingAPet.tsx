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

const COPE_FAQS = [
  { question: "Is it normal to grieve a pet?", answer: "Yes. Research shows that pet loss grief can be as intense as losing a human loved one. Your bond was real, and your feelings are completely valid." },
  { question: "How long does pet grief last?", answer: "There's no set timeline. Grief is different for everyone. Some people feel better in weeks, others take months. There's no 'right' pace." },
  { question: "Should I get another pet after losing one?", answer: "Only when you feel genuinely ready. A new pet is never a replacement — it's a new relationship. Wait until the idea brings excitement, not guilt." },
  { question: "How can I help a child cope with losing a pet?", answer: "Be honest using age-appropriate language, let them express feelings, and involve them in remembering — like choosing a photo or sharing a favourite memory." },
  { question: "Does creating a memorial help with grief?", answer: "Many people find it deeply therapeutic. Writing about your pet — or having VellumPet help you — gives grief a place to go and creates something lasting you can return to." },
];

const CopeWithLosingAPet = () => {
  const navigate = useNavigate();

  const canonicalUrl = "https://paw-print-story.lovable.app/cope-with-losing-a-pet";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Cope With Losing a Pet: A Gentle Guide to Grief",
    description:
      "Learn how to cope with losing a pet, understand pet loss grief, and find comforting ways to remember your beloved companion.",
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
    mainEntity: COPE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Cope With Losing a Pet: A Gentle Guide to Grief | VellumPet</title>
        <meta
          name="description"
          content="Learn how to cope with losing a pet, understand pet loss grief, and find comforting ways to remember your beloved companion."
        />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <SeoBreadcrumbs items={[
        { name: "Cope With Losing a Pet", href: "/cope-with-losing-a-pet" },
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
        {/* ─── H1 ─── */}
        <motion.section {...section()} className="mb-16">
          <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-foreground md:text-4xl lg:text-[2.75rem]">
            How to Cope With Losing a Pet: A Gentle Guide to Grief
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            If you're reading this, you've probably lost a pet recently — or
            you're preparing yourself for that moment. Either way, what you're
            feeling is real, and it matters. Pets aren't accessories to our
            lives. They're woven into the fabric of our daily routines, our
            emotional wellbeing, and our sense of home.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            Learning how to cope with losing a pet isn't about "getting over it."
            It's about finding ways to carry the love forward while giving
            yourself permission to grieve. Whether you're looking to{" "}
            <Link to="/pet-memorial" className="text-primary underline underline-offset-2 hover:text-primary/80">
              create a pet memorial page
            </Link>{" "}
            or simply need support, this guide is here to help — not with
            quick fixes, but with honest, gentle support.
          </p>
        </motion.section>

        {/* ─── Why It Hurts So Much ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Why Losing a Pet Hurts So Much
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              The bond between a person and their pet is built on years of
              daily, unspoken connection. Your pet was there when you woke up
              and when you came home. They didn't care about your bad days —
              they just showed up, consistently and unconditionally.
            </p>
            <p>
              When that presence disappears, the void it leaves is enormous.
              You're not just losing a companion — you're losing a routine, a
              source of comfort, and often the most reliable emotional
              connection in your life. Whether you're grieving a dog, a cat, or
              any other pet, the pain of pet loss grief is deeply valid.
            </p>
            <p>
              Research has shown that the grief people experience after losing a
              pet can be just as intense as the grief felt after losing a human
              loved one. If anyone tells you it's "just a pet," know that your
              feelings tell a truer story than their words.
            </p>
          </div>
        </motion.section>

        {/* ─── Common Feelings ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Common Feelings After Losing a Pet
          </h2>
          <p className="mb-6 text-muted-foreground">
            Grief doesn't follow a neat path. You might experience any
            combination of these emotions — sometimes all in the same day.
          </p>
          <ul className="space-y-3 pl-1">
            {[
              { title: "Deep sadness", desc: "A heaviness that sits with you, especially in quiet moments." },
              { title: "Guilt", desc: "Wondering if you did enough, or made the right decision at the end." },
              { title: "Loneliness", desc: "The house feels emptier than it should. The silence is noticeable." },
              { title: "Denial", desc: "Moments where you forget they're gone — reaching for the leash, listening for their sound." },
              { title: "Emptiness", desc: "A feeling that something fundamental is missing from your day." },
              { title: "Relief", desc: "If your pet was suffering, feeling relief is normal — and it doesn't diminish your love." },
              { title: "Anger", desc: "At the situation, at the unfairness, sometimes even at yourself." },
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
          <p className="mt-6 text-sm text-foreground/80">
            All of these are normal. None of them mean you're weak. They mean
            you loved deeply — and that's never something to apologise for.
          </p>
        </motion.section>

        {/* ─── Healthy Ways to Cope ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Healthy Ways to Cope With Losing a Pet
          </h2>
          <p className="mb-6 text-muted-foreground">
            There's no single right way to grieve. But there are things that can
            help you move through the pain without getting stuck in it.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Allow yourself to grieve</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                Don't rush yourself. Don't set a timeline. Grief takes as long
                as it takes, and suppressing it only delays the healing. Cry
                when you need to. Sit with the sadness when it comes.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Talk about your pet</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                Say their name. Share stories. Tell people about the funny
                thing they used to do or the habit that drove you crazy but
                you'd give anything to see again. Talking about them keeps
                their memory alive — and it helps you process the loss.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Keep photos and memories close</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                Don't feel pressure to put away their things immediately. Some
                people find comfort in keeping a favourite toy or blanket
                nearby. Others create a small memorial space with photos.
                There's no wrong way to hold on to what matters. For words
                that capture your feelings, browse our{" "}
                <Link to="/pet-memorial-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  pet memorial quotes
                </Link>.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Create a ritual</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                Light a candle on their birthday. Take a walk on the route you
                used to share. Plant something in their honour. Rituals give
                grief a place to go — they turn raw emotion into something
                intentional and meaningful.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Write about them</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                Even a few sentences can help. Writing about your pet — what
                they meant to you, the moments you shared — can be
                surprisingly therapeutic. If writing feels too hard, tools like
                VellumPet can help you turn simple memories into a beautiful
                tribute. You can also find guidance in our article on{" "}
                <Link to="/dog-obituary-example" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  writing a dog obituary
                </Link>.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Don't compare your grief</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                Whether you had your pet for two years or fifteen, whether
                they were a golden retriever or a goldfish — your bond was
                real. Losing a dog grief and losing a cat grief may look
                different, but they carry the same weight. Don't let anyone
                minimise what you're going through.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── Should You Get Another Pet? ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Should You Get Another Pet?
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              This question comes up often — sometimes too soon. Well-meaning
              friends might suggest a new pet as a way to "fill the gap," but
              the truth is more nuanced than that.
            </p>
            <p>
              Getting another pet is a personal decision, and there's no right
              timeline. Some people find that opening their home to a new animal
              helps with healing. Others need months or years before they're
              ready. Neither response is wrong.
            </p>
            <p>
              What matters is that a new pet is never a <em>replacement</em>.
              Each animal is unique, and the bond you build with a new companion
              will be its own story — not a continuation of the one that ended.
              Wait until you feel genuinely ready, not just lonely.
            </p>
          </div>
        </motion.section>

        {/* ─── Helping Children ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Helping Children Cope With Pet Loss
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              For many children, a pet's death is their first experience with
              loss. How you respond can shape the way they understand grief for
              years to come.
            </p>
            <p>
              Be honest in age-appropriate language. Saying "they went to
              sleep" can create confusion — children may become afraid of
              bedtime. Instead, use gentle but clear words: "They died because
              their body stopped working. It wasn't anyone's fault."
            </p>
            <p>
              Let children express their feelings however they need to —
              through tears, drawing, talking, or even silence. Involve them
              in remembering: ask them to share a favourite memory, draw a
              picture, or help choose a photo for a memorial. Feeling included
              in the process helps children process loss in a healthy way.
            </p>
            <p>
              The{" "}
              <Link to="/rainbow-bridge-quotes" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Rainbow Bridge concept
              </Link>{" "}
              can be especially comforting for younger children — the idea that
              their pet is happy and waiting for them.
            </p>
          </div>
        </motion.section>

        {/* ─── When Grief Feels Overwhelming ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            When Grief Feels Overwhelming
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              Most people find that the intensity of pet loss grief softens
              over time. But for some, the sadness lingers in a way that
              interferes with daily life — difficulty sleeping, loss of
              appetite, withdrawing from people you care about, or a heaviness
              that doesn't lift after weeks.
            </p>
            <p>
              If that's where you are, please know that reaching out is a sign
              of strength, not weakness. Consider talking to a friend who
              understands, or seeking support from a counsellor who
              specialises in grief. There are pet loss support groups — both
              online and in person — where you can connect with people who
              truly understand what you're going through.
            </p>
            <p>
              You don't have to carry this alone. And you don't have to be
              "over it" by any particular date. Healing isn't linear, and
              there's no finish line. There's only forward — at whatever pace
              feels right for you.
            </p>
          </div>
        </motion.section>

        {/* ─── Creating a Memorial ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Creating a Memorial Can Help With Healing
          </h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              One of the most meaningful things you can do while coping with
              pet loss is to create something lasting in your pet's honour. A
              memorial gives your grief a place to go — and transforms raw
              emotion into something you can hold on to.
            </p>
            <p>
              Writing about your pet — or having someone help you write it —
              forces you to slow down and remember the specific moments that
              made them who they were. Not just the big moments, but the small
              ones: the way they greeted you, the spot they always claimed,
              the sound of their breathing at night.
            </p>
            <p>
              With VellumPet, you don't need to write a single word yourself.
              Share a few simple memories — their name, their quirks, the
              things you miss most — and we'll craft a heartfelt tribute that
              tells their story. It takes less than two minutes, and the
              result is something you can keep, share with family, or revisit
              whenever you need to feel close to them again.
            </p>
            <p>
              For inspiration, explore our{" "}
              <Link to="/pet-memorial-message" className="text-primary underline underline-offset-2 hover:text-primary/80">
                pet memorial message examples
              </Link>{" "}
              — or simply start creating.
            </p>
          </div>
        </motion.section>

        {/* ─── Hub: Related Guides ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            More Guides for Pet Loss
          </h2>
          <p className="mb-8 text-muted-foreground">
            Grief looks different for everyone. These guides offer comfort, words, and practical support for every stage of pet loss.
          </p>
          <div className="space-y-6">
            {[
              {
                title: "Pet Memorial Quotes",
                intro: "Meaningful quotes for dogs, cats, and all pets — words to capture the bond and keep close during grief.",
                href: "/pet-memorial-quotes",
              },
              {
                title: "Rainbow Bridge Quotes",
                intro: "Comforting words rooted in the Rainbow Bridge tradition — for those who find peace in the hope of reunion.",
                href: "/rainbow-bridge-quotes",
              },
              {
                title: "Pet Sympathy Messages",
                intro: "What to say when someone you care about is going through pet loss — messages for cards, texts, and conversations.",
                href: "/pet-sympathy-messages",
              },
              {
                title: "What to Write When a Dog Dies",
                intro: "A gentle, practical guide for writing a tribute or memorial when you've lost a dog.",
                href: "/what-to-write-when-a-dog-dies",
              },
              {
                title: "What to Write When a Cat Dies",
                intro: "How to capture your cat's quiet, independent personality in a memorial that feels honest and true.",
                href: "/what-to-write-when-a-cat-dies",
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

        {/* ─── CTA ─── */}
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
            Create Their Memorial
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Takes less than 2 minutes · No writing required
          </p>
        </motion.section>

        {/* ─── Related Articles ─── */}
        <motion.section {...section()} className="mb-16">
          <h2 className="mb-5 text-2xl font-bold text-foreground">
            Related Articles
          </h2>
          <div className="space-y-3">
            {[
              { title: "Pet Memorial Message Examples", desc: "Thoughtful pet memorial message ideas", href: "/pet-memorial-message" },
              { title: "Pet Sympathy Messages", desc: "What to say when someone loses a pet", href: "/pet-sympathy-messages" },
              { title: "Rainbow Bridge Quotes", desc: "Comforting words for pet loss", href: "/rainbow-bridge-quotes" },
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
              { q: "Is it normal to grieve a pet?", a: "Yes. Research shows that pet loss grief can be as intense as losing a human loved one. Your bond was real, and your feelings are completely valid." },
              { q: "How long does pet grief last?", a: "There's no set timeline. Grief is different for everyone. Some people feel better in weeks, others take months. There's no 'right' pace." },
              { q: "Should I get another pet after losing one?", a: "Only when you feel genuinely ready. A new pet is never a replacement — it's a new relationship. Wait until the idea brings excitement, not guilt." },
              { q: "How can I help a child cope with losing a pet?", a: "Be honest using age-appropriate language, let them express feelings, and involve them in remembering — like choosing a photo or sharing a favourite memory." },
              { q: "Does creating a memorial help with grief?", a: "Many people find it deeply therapeutic. Writing about your pet — or having VellumPet help you — gives grief a place to go and creates something lasting you can return to." },
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
              { label: "Pet sympathy messages", href: "/pet-sympathy-messages" },
              { label: "What to write when a dog dies", href: "/what-to-write-when-a-dog-dies" },
              { label: "Pet grief quotes", href: "/pet-grief-quotes" },
              { label: "Grieving pet quotes", href: "/grieving-pet-quotes" },
              { label: "Missing my pet quotes", href: "/missing-my-pet-quotes" },
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

export default CopeWithLosingAPet;
