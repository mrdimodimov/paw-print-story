import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, PawPrint, FileText, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { TIERS } from "@/lib/types";
import TierCard from "@/components/TierCard";
import GuaranteeBadge from "@/components/GuaranteeBadge";
import RecentlyRemembered from "@/components/RecentlyRemembered";
import TributePreviewCard from "@/components/TributePreviewCard";
import tributeLuna from "@/assets/tribute-preview-luna.jpg";
import tributeWhiskers from "@/assets/tribute-preview-whiskers.jpg";
import tributeMona from "@/assets/tribute-preview-mona.jpg";
import tributeBear from "@/assets/tribute-preview-bear.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";

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
            <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              When Words Are Hard to Find
            </h1>
            <p className="mb-3 font-display text-xl text-foreground/80 md:text-2xl">
              A beautiful way to remember the pet you loved.
            </p>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Turn your memories into a heartfelt tribute you can keep and share forever.
            </p>
            <Button
              size="lg"
              className="px-8 py-6 text-lg shadow-glow"
              onClick={() => navigate("/create")}>
              <PawPrint className="mr-2 h-5 w-5" />
              Create Your Tribute
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Takes less than 2 minutes · No writing needed · Private &amp; secure</p>
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
              Before writing a tribute, take a quiet moment to reflect on what made your pet special.
            </p>
            <div className="mb-8 space-y-5">
              {[
              "What was their favorite place to sleep?",
              "What small habits made you smile?",
              "What are the moments you'll always carry with you?"].
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
              These moments matter more than we realize. A tribute helps you hold onto them.
            </p>
            <p className="mb-8 text-base font-semibold text-foreground/80">
              Start your tribute and turn these memories into something lasting.
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

      {/* How It Works */}
      <section className="bg-secondary/40 tribute-section">
        <div className="tribute-container text-center">
          <h2 className="mb-12 text-3xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
            { icon: PawPrint, title: "Share a Few Memories", desc: "Answer a few simple questions about your pet — no writing required." },
            { icon: BookOpen, title: "We Create Your Tribute", desc: "Your memories are transformed into a heartfelt, beautifully written story." },
            { icon: FileText, title: "Keep and Share It", desc: "Download your tribute or create a memorial page to share with others." }].
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
            <p className="mb-3 text-sm font-medium text-primary/80">
              A real example created from just a few memories.
            </p>
            <p className="mb-10 text-base text-muted-foreground">
              Here is an example tribute created from just a few memories.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 rounded-xl border border-border bg-card p-10 text-left shadow-card md:p-12">
            <p className="mb-2 text-center font-display text-lg italic text-primary/80">
              The Dog Who Made Every Homecoming a Celebration
            </p>
            <h3 className="mb-6 text-center font-display text-xl font-semibold text-foreground">
              In Loving Memory of Luna   
            </h3>
            <div className="space-y-4 font-body text-sm leading-relaxed text-foreground/90">
              <p>
                Luna had a way of turning the simplest moments into something special. Every afternoon she waited by the front window, tail wagging the moment she heard the car pull into the driveway.
              </p>
              <p>
                She loved long walks through the park, especially when the wind carried new smells and the promise of adventure. But her favorite place was always close to her family — curled up on the couch, quietly watching the room as if she knew she belonged exactly there.
              </p>
              <p>
                Luna wasn't just a pet. She was part of the rhythm of everyday life — the soft footsteps behind you in the kitchen, the excited greeting at the door, the quiet comfort of her presence on difficult days.
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
            <Link
              to="/example-tribute"
              className="inline-block font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors text-lg">
              
              See the full example tribute →
            </Link>
            <p className="mb-2 font-display text-lg font-semibold text-foreground">
              Every pet leaves a story behind.
            </p>
            <p className="mb-6 text-base text-muted-foreground">
              Let VellumPet help you tell it.
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

      {/* Emotional pre-pricing block */}
      <section className="tribute-section">
        <div className="tribute-container max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4">
            
            <p className="font-display text-xl leading-relaxed text-foreground md:text-3xl">
              Pets are family. Their memories deserve more than a few photos on a phone.
            </p>
            <p className="text-base text-muted-foreground">
              VellumPet helps you turn those memories into something lasting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="tribute-section">
        <div className="tribute-container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Choose How You Want to Remember Your Pet
            </h2>
            <p className="text-base text-muted-foreground">
              Create something meaningful, lasting, and truly personal.
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
                    {mobileTiers.map((tier, i) =>
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}>
                      
                        <TierCard tier={tier} onSelect={() => navigate(`/create?tier=${tier.id}`)} />
                      </motion.div>
                    )}
                  </div>
                  {/* Desktop order */}
                  <div className="contents hidden md:contents">
                    {desktopTiers.map((tier, i) =>
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="hidden md:block">
                      
                        <TierCard tier={tier} onSelect={() => navigate(`/create?tier=${tier.id}`)} />
                      </motion.div>
                    )}
                  </div>
                </>);

            })()}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            One-time payment · No subscription
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your tribute is created in seconds and can be edited before you download or share.
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground/70">
            Digital product — ready to print, frame, or keep digitally. No physical item shipped.
          </p>
          <div className="mt-6">
            <GuaranteeBadge />
          </div>
        </div>
      </section>

      {/* Recently Remembered Pets */}
      <RecentlyRemembered />

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
                  The questionnaire takes about 2 minutes. Your tribute is generated within seconds
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
          <div className="mb-8 grid gap-6 text-center md:grid-cols-3 md:text-left">
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
            <div className="flex flex-col items-center gap-2">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
            <div className="flex flex-col items-center md:items-end md:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/create")}>
                <PawPrint className="mr-2 h-4 w-4" />
                Create a Beautiful Tribute for Your Pet
              </Button>
            </div>
          </div>
          <p className="mb-2 text-center text-xs text-muted-foreground/70">
            Your memories are private and never used for AI training.
          </p>
          

          
          <p className="text-center">
            Made with <Heart className="inline h-3 w-3 text-primary" /> by {BRAND.name}
          </p>
        </div>
      </footer>
    </div>);

};

export default Landing;