import PawIcon from "@/components/PawIcon";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { TIERS } from "@/lib/types";
import TierCard from "@/components/TierCard";
import GuaranteeBadge from "@/components/GuaranteeBadge";
import RecentlyRemembered from "@/components/RecentlyRemembered";
import TributePreviewCard from "@/components/TributePreviewCard";
import BeforeAfterTransform from "@/components/BeforeAfterTransform";
const STORAGE_BASE = "https://ppfrtdbjsagytuhweywd.supabase.co/storage/v1/object/public/pet-photos";
const tributeLuna = `${STORAGE_BASE}/luna.jpg`;
const tributeWhiskers = `${STORAGE_BASE}/oliver.jpg`;
const tributeMax = `${STORAGE_BASE}/max.jpg`;
const tributeClover = `${STORAGE_BASE}/clover.jpg`;
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span style={{ marginTop: "-1px" }}><PawIcon className="h-8 w-8 text-primary" size={30} /></span>
            <span className="font-display text-xl font-medium text-foreground" style={{ letterSpacing: "0.06em" }}>
              <span style={{ letterSpacing: "0.01em" }}>V</span>ellum<span style={{ letterSpacing: "-0.01em" }}>P</span>et
            </span>
          </div>
          <Button size="sm" onClick={() => navigate("/create")} className="text-xs">
            Create Your Tribute
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="tribute-container max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left"
            >
              <p className="mb-4 font-display text-sm tracking-wide text-muted-foreground">
                Turn a few simple memories into a beautiful tribute
              </p>
              <h1 className="mb-5 font-display text-4xl font-bold leading-[1.15] md:text-5xl lg:text-[3.4rem]" style={{ color: "hsl(20, 22%, 14%)" }}>
                When saying goodbye is hard, keep their{" "}
                <span className="font-extrabold" style={{ color: "hsl(28, 46%, 44%)" }}>story alive</span>.
              </h1>
              <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
                Answer a few simple questions, and we'll turn your memories into
                a heartfelt tribute you can keep, read, and share.
              </p>
              <Button
                size="lg"
                className="px-10 py-6 text-lg"
                onClick={() => navigate("/create")}
              >
                <PawIcon className="mr-3 !h-[30px] !w-[30px] shrink-0 -mt-[1px] opacity-[0.92]" size={30} />
                Create Their Tribute
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Takes less than 2 minutes — no writing needed
              </p>
            </motion.div>

            {/* Right — visual preview card */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div
                className="overflow-hidden border border-border/50 bg-card shadow-card"
                style={{ borderRadius: "20px", padding: "1.75rem" }}
              >
                {/* Pet image */}
                <div className="mb-5 overflow-hidden" style={{ borderRadius: "14px" }}>
                  <img
                    src={tributeLuna}
                    alt="Luna — example pet tribute"
                    className="aspect-[4/3] w-full object-cover"
                    loading="eager"
                  />
                </div>

                {/* Tribute text excerpt */}
                <p className="mb-1 font-display text-lg font-semibold text-foreground">
                  Luna
                </p>
                <p className="mb-4 text-xs tracking-wide text-muted-foreground/70">
                  Example tribute
                </p>
                <p className="font-display text-[0.92rem] leading-[1.85] text-foreground/85">
                  She had a way of knowing exactly when you needed her. Not with
                  grand gestures — just a quiet arrival at your feet, a warm
                  weight against your leg that said,{" "}
                  <em className="text-primary/70">"I'm here."</em>
                </p>
                <p className="mt-4 font-display text-[0.92rem] leading-[1.85] text-foreground/85 blur-preview-text">
                  Mornings started with the sound of her paws on the kitchen
                  floor. She'd sit by the door and wait — not impatiently, but
                  like she trusted you'd always come back.
                </p>
                <span
                  className="mt-4 inline-block cursor-pointer text-sm font-medium text-primary hover:underline"
                  onClick={() => navigate("/example-tribute")}
                >
                  Read full tribute →
                </span>
              </div>
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-primary/5 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Preview — horizontal scroll */}
      <section className="tribute-section bg-section-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
              A Glimpse of Your Pet's Tribute
            </h2>
            <p className="text-base text-muted-foreground">
              A preview of the story we'll create from your memories
            </p>
          </motion.div>

          <div className="-mx-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-5" style={{ scrollSnapType: "x mandatory" }}>
              {[
                {
                  imageUrl: tributeWhiskers,
                  petName: "Oliver",
                  memoryTitle: "Where the Sunlight Always Found Him",
                  preview: "He claimed the same patch of afternoon light on the kitchen floor every single day, stretching into warmth like he'd invented rest.",
                  linkTo: "/example-tribute/oliver",
                  blurPreview: true,
                },
                {
                  imageUrl: tributeMax,
                  petName: "Max",
                  memoryTitle: "The One Who Greeted Everyone",
                  preview: "He never met a stranger. Every visitor was welcomed with a full-body wiggle that could knock a toddler over.",
                  linkTo: "/example-tribute/max",
                },
                {
                  imageUrl: tributeLuna,
                  petName: "Luna",
                  memoryTitle: "The Door That Was Never Empty",
                  preview: "She waited by the front window every afternoon, tail wagging the moment she heard the car pull into the driveway.",
                  linkTo: "/example-tribute",
                },
                {
                  imageUrl: tributeClover,
                  petName: "Clover",
                  memoryTitle: "Soft Thumps in the Evening",
                  preview: "She'd thump her feet at exactly 7pm, demanding her evening greens with a patience that lasted about three seconds.",
                  linkTo: "/example-tribute/clover",
                },
              ].map((card, i) => (
                <div
                  key={card.petName}
                  className="w-[280px] flex-shrink-0 sm:w-[300px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <TributePreviewCard {...card} index={i} />
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-col items-center gap-3 text-center"
          >
            <Link
              to="/create"
              className="inline-block text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              Create your pet's story →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="tribute-section">
        <div className="tribute-container text-center">
          <h2 className="mb-12 text-3xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Share a Few Memories",
                desc: "Answer a few simple questions about your pet — no writing required.",
              },
              {
                icon: BookOpen,
                title: "We Create Your Tribute",
                desc: "Your memories are transformed into a heartfelt, beautifully written story.",
              },
              {
                icon: FileText,
                title: "Keep and Share It",
                desc: "Download your tribute or create a memorial page to share with others.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 rounded-full bg-accent p-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before → After Transformation */}
      <BeforeAfterTransform />

      {/* Social proof — Recently Remembered */}
      <RecentlyRemembered />

      {/* Pricing */}
      <section className="tribute-section bg-section-alt">
        <div className="tribute-container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
              Choose How You'll Keep Their Memory Alive
            </h2>
            <p className="text-base text-muted-foreground">
              Start simple, or create something truly unforgettable.
            </p>
            <p className="mt-3 text-sm text-muted-foreground/70">
              Most people choose the middle option to create a complete, lasting tribute.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {(() => {
              const mobileTiers = [TIERS[1], TIERS[0], TIERS[2]];
              const desktopTiers = TIERS;
              return (
                <>
                  <div className="contents md:hidden">
                    {mobileTiers.map((tier, i) => (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <TierCard
                          tier={tier}
                          onSelect={() =>
                            navigate(`/create?tier=${tier.id}`)
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="contents hidden md:contents">
                    {desktopTiers.map((tier, i) => (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="hidden md:block"
                      >
                        <TierCard
                          tier={tier}
                          onSelect={() =>
                            navigate(`/create?tier=${tier.id}`)
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
          <div className="mt-8">
            <GuaranteeBadge />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            One-time payment · No subscription · Yours forever
          </p>
        </div>
      </section>

      {/* Guarantee + FAQ */}
      <section className="tribute-section">
        <div className="tribute-container max-w-2xl">
          <GuaranteeBadge variant="card" />

          <div className="mt-12">
            <h2 className="mb-6 text-center font-display text-2xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="refunds">
                <AccordionTrigger className="text-left font-display text-base font-medium">
                  Do you offer refunds?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes. We offer a 7-Day Tribute Satisfaction Guarantee. If the
                  tribute doesn't feel right to you, simply contact us within 7
                  days of purchase and we'll issue a full refund. We may ask for
                  feedback so we can improve future tributes, but there's no
                  complicated process.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="how-long">
                <AccordionTrigger className="text-left font-display text-base font-medium">
                  How long does it take to create a tribute?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  The questionnaire takes about 2 minutes. Your tribute is
                  generated within seconds after you submit your answers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="edit">
                <AccordionTrigger className="text-left font-display text-base font-medium">
                  Can I edit my tribute after it's generated?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes. Every tribute can be edited before downloading. You can
                  also regenerate it if you'd like a different version.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 text-sm text-muted-foreground">
        <div className="tribute-container">
          <div className="mb-8 grid gap-6 text-center md:grid-cols-3 md:text-left">
            <div>
              <h4 className="mb-3 font-display text-sm font-semibold text-foreground">
                Pet Memorial Guides
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dog-obituary-example"
                    className="transition-colors hover:text-primary"
                  >
                    Dog Obituary Example
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cat-memorial-tribute-example"
                    className="transition-colors hover:text-primary"
                  >
                    Cat Memorial Tribute Example
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pet-memorial-message"
                    className="transition-colors hover:text-primary"
                  >
                    Pet Memorial Messages
                  </Link>
                </li>
                <li>
                  <Link
                    to="/what-to-write-when-a-dog-dies"
                    className="transition-colors hover:text-primary"
                  >
                    What to Write When a Dog Dies
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/privacy"
                className="transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="transition-colors hover:text-primary"
              >
                Terms
              </Link>
            </div>
            <div className="flex flex-col items-center md:items-end md:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/create")}
                className="text-xs"
              >
                <PawIcon className="mr-3 !h-[22px] !w-[22px] shrink-0 -mt-[1px]" size={22} />
                Create a Beautiful Tribute for Your Pet
              </Button>
            </div>
          </div>
          <p className="mb-2 text-center text-xs text-muted-foreground/70">
            Your memories are private and never used for AI training.
          </p>
          <p className="text-center">
            Made with <Heart className="inline h-3 w-3 text-primary" /> by{" "}
            {BRAND.name}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
