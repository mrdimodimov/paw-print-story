import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, PawPrint, FileText, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { TIERS } from "@/lib/types";
import TierCard from "@/components/TierCard";
import GuaranteeBadge from "@/components/GuaranteeBadge";
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
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {BRAND.name}
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/create")}>
            
            Create Your Tribute
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="tribute-section text-center">
        <div className="tribute-container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}>
            
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-accent p-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              {BRAND.tagline}
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              {BRAND.subtitle}
            </p>
            <Button
              size="lg"
              className="px-8 py-6 text-lg shadow-glow"
              onClick={() => navigate("/create")}>
              
              <PawPrint className="mr-2 h-5 w-5" />
              Create Your Tribute
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Takes about 3 minutes.</p>
          </motion.div>
        </div>
      </section>

      {/* Remember Them */}
      <section className="tribute-section bg-accent/30 border-double border-4">
        <div className="tribute-container max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            
            <h2 className="mb-6 font-display text-3xl font-bold text-foreground">
              Remember Them
            </h2>
            <p className="mb-8 text-base leading-relaxed text-muted-foreground">
              Before writing a tribute, take a quiet moment to think about what made your pet special.
            </p>
            <div className="mb-8 space-y-5">
              {[
              "What was their favorite place to sleep?",
              "What small habit always made you smile?",
              "What is one memory you will always carry with you?"].
              map((prompt, i) =>
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
                viewport={{ once: true }}
                className="font-display text-lg italic text-foreground/80 font-extrabold">
                
                  {prompt}
                </motion.p>
              )}
            </div>
            <p className="mb-4 text-base font-medium text-foreground/70">
              These small memories are what make a tribute truly meaningful.
            </p>
            <p className="mb-8 text-base text-muted-foreground">
              When you're ready, we'll help turn those memories into a beautiful tribute.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-5 text-base"
              onClick={() => navigate("/create")}>
              
              <PawPrint className="mr-2 h-5 w-5" />
              Start a Tribute
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary/40 tribute-section">
        <div className="tribute-container text-center">
          <h2 className="mb-12 text-3xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
            { icon: PawPrint, title: "Tell Us About Your Pet", desc: "Answer a few simple questions about their personality, habits, and favorite memories." },
            { icon: BookOpen, title: "Generate Your Tribute", desc: "VellumPet turns your memories into a heartfelt tribute story." },
            { icon: FileText, title: "Share or Download", desc: "Download your tribute or share a beautiful memorial page with friends and family." }].
            map((step, i) =>
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center">
              
                <div className="mb-4 rounded-full bg-accent p-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Example Tribute */}
      <section className="tribute-section">
        <div className="tribute-container max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground">
              See What a Tribute Looks Like
            </h2>
            <p className="mb-8 text-base text-muted-foreground">
              Here is an example tribute created from just a few memories.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-6 rounded-xl border border-border bg-card p-8 text-left shadow-card md:p-10">
            
            <h3 className="mb-5 text-center font-display text-xl font-semibold text-foreground">
              In Loving Memory of Bella
            </h3>
            <div className="space-y-4 font-body text-sm leading-relaxed text-foreground/90">
              <p>
                Bella had a way of turning the simplest moments into something special. Every afternoon she waited by the front window, tail wagging the moment she heard the car pull into the driveway.
              </p>
              <p>
                She loved long walks through the park, especially when the wind carried new smells and the promise of adventure. But her favorite place was always close to her family — curled up on the couch, quietly watching the room as if she knew she belonged exactly there.
              </p>
              <p>
                Bella wasn't just a pet. She was part of the rhythm of everyday life — the soft footsteps behind you in the kitchen, the excited greeting at the door, the quiet comfort of her presence on difficult days.
              </p>
              <p>
                Those small moments are what will be remembered most.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6">
            
            <p className="text-sm italic text-muted-foreground">
              Created from answers that took less than 5 minutes.
            </p>
            <Button
              size="lg"
              className="px-8 py-5 text-base shadow-glow"
              onClick={() => navigate("/create")}>
              
              <PawPrint className="mr-2 h-5 w-5" />
              Create a Tribute for Your Pet
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="tribute-section">
        <div className="tribute-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Choose Your Tribute
            </h2>
            <p className="text-muted-foreground">
              Every pet deserves to be remembered beautifully.
            </p>
          </div>
          {/* Mobile: Tier 2 first, then 1, then 3 */}
          <div className="grid gap-6 md:grid-cols-3">
            {(() => {
              const mobileTiers = [TIERS[1], TIERS[0], TIERS[2]];
              const desktopTiers = TIERS;
              return (
                <>
                  {/* Mobile order */}
                  <div className="contents md:hidden">
                    {mobileTiers.map((tier, i) => (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <TierCard tier={tier} onSelect={() => navigate(`/create?tier=${tier.id}`)} />
                      </motion.div>
                    ))}
                  </div>
                  {/* Desktop order */}
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
                        <TierCard tier={tier} onSelect={() => navigate(`/create?tier=${tier.id}`)} />
                      </motion.div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Every tribute can be edited before downloading.
          </p>
          <div className="mt-6">
            <GuaranteeBadge />
          </div>
        </div>
      </section>

      {/* Guarantee + FAQ */}
      <section className="tribute-section bg-accent/20">
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
                  Yes. We offer a 7-Day Tribute Satisfaction Guarantee. If the tribute doesn't feel
                  right to you, simply contact us within 7 days of purchase and we'll issue a full
                  refund. We may ask for feedback so we can improve future tributes, but there's no
                  complicated process.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="how-long">
                <AccordionTrigger className="text-left font-display text-base font-medium">
                  How long does it take to create a tribute?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  The questionnaire takes about 5 minutes. Your tribute is generated within seconds
                  after you submit your answers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="edit">
                <AccordionTrigger className="text-left font-display text-base font-medium">
                  Can I edit my tribute after it's generated?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes. Every tribute can be edited before downloading. You can also regenerate it
                  if you'd like a different version.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 text-sm text-muted-foreground">
        <div className="tribute-container">
          <div className="mb-8 grid gap-6 text-center md:grid-cols-2 md:text-left">
            <div>
              <h4 className="mb-3 font-display text-sm font-semibold text-foreground">
                Pet Memorial Guides
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dog-obituary-example" className="hover:text-primary transition-colors">
                    Dog Obituary Example
                  </Link>
                </li>
                <li>
                  <Link to="/cat-memorial-tribute-example" className="hover:text-primary transition-colors">
                    Cat Memorial Tribute Example
                  </Link>
                </li>
                <li>
                  <Link to="/pet-memorial-message" className="hover:text-primary transition-colors">
                    Pet Memorial Messages
                  </Link>
                </li>
                <li>
                  <Link to="/what-to-write-when-a-dog-dies" className="hover:text-primary transition-colors">
                    What to Write When a Dog Dies
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-end md:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/create")}
              >
                <PawPrint className="mr-2 h-4 w-4" />
                Create Your Tribute
              </Button>
            </div>
          </div>
          <p className="text-center">
            Made with <Heart className="inline h-3 w-3 text-primary" /> by {BRAND.name}
          </p>
        </div>
      </footer>
    </div>);

};

export default Landing;