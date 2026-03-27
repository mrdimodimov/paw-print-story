import React from "react";
import BrandLogo from "@/components/BrandLogo";
import PawIcon from "@/components/PawIcon";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const exampleTitle = "Soft Thumps in the Evening";

const exampleStory = [
  "Seven o'clock. Two thumps.",
  "That was Clover's way. Not a request — a notification. Greens. Now. She had communicated this every single evening for eight years, and she had never once considered the possibility that the greens might not appear. They always did. She was right to be confident.",
  "She was a Holland Lop with ears like crushed velvet and a nose that never, ever stopped. Everything was assessed by smell — shoes first, then hands, then the suspicious corner of whatever book you'd left on the floor. She filed things away. You could see her doing it. She was building a map of the house that only she could read.",
  "Clover loved cardboard the way some people love crossword puzzles. Toilet paper rolls were disassembled with surgical precision. Amazon boxes were reduced to confetti within the hour. Emma once left a cereal box too close to the edge of the counter. She found it twenty minutes later, gutted, in the hallway. Clover sat beside it, looking satisfied.",
  "She liked being held. Unusual for a rabbit — and she knew it. She'd climb into your lap uninvited, tuck her head beneath your chin, and stay there — ten minutes, sometimes twenty — her fur impossibly soft against your throat, her breathing so slow you'd match it without realizing.",
  "On warm days in the garden she'd binky — sudden, vertical leaps of pure joy, followed by a sprint in no particular direction. It looked like a glitch in the physics engine. It was the best thing in the world.",
  "The hay is swept up now. The pellets are gone from behind the couch. The cardboard recycling has, for the first time in eight years, made it to the curb intact.",
  "But at seven o'clock, the house still holds its breath."
];

const ExampleTributeClover = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <title>Example Rabbit Tribute Story | VellumPet</title>
      <meta
        name="description"
        content="See an example rabbit tribute created with VellumPet. Turn your pet's memories into a beautiful tribute story in minutes."
      />

      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>
          <Button size="sm" onClick={() => navigate("/create")}>
            Create Your Tribute
          </Button>
        </div>
      </header>

      <main className="tribute-container max-w-2xl py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <span className="rounded-full border border-primary/30 bg-accent/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Example Tribute
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-4 font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
            Clover — {exampleTitle}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Clover</span>
            <span aria-hidden="true">·</span>
            <span>Holland Lop Rabbit</span>
            <span aria-hidden="true">·</span>
            <span>2017 – 2025</span>
          </div>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Beloved companion to Emma
          </p>
          <p className="mt-3 text-xs text-muted-foreground/60">
            Example tribute created from real memories
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12 flex justify-center"
        >
          <div className="overflow-hidden rounded-xl border border-border shadow-card">
            <img
src="https://ppfrtdbjsagytuhweywd.supabase.co/storage/v1/object/public/pet-photos/clover.jpg"
              alt="Clover the Holland Lop Rabbit"
              className="h-auto w-full max-w-sm object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-14 rounded-xl border border-border bg-card p-8 shadow-card md:p-10"
        >
          <div className="space-y-4 font-body text-sm leading-relaxed text-foreground/90 md:text-base md:leading-relaxed">
            {exampleStory.map((paragraph, i) => (
              <React.Fragment key={i}>
                <p>{paragraph}</p>
                {i === 2 && (
                  <div className="my-6 text-center">
                    <p className="text-sm italic text-muted-foreground">
                      Your pet deserves to be remembered like this.
                    </p>
                    <span
                      className="mt-2 inline-block cursor-pointer text-sm font-medium text-foreground hover:underline"
                      onClick={() => navigate("/create")}
                    >
                      Continue your pet's story →
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.article>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10"
        >
          <Heart className="mx-auto mb-4 h-7 w-7 text-primary" />
          <h2 className="mb-3 font-display text-2xl font-bold text-foreground">
            Create something like this for your pet
          </h2>
          <p className="mb-6 text-sm text-muted-foreground md:text-base">
            Answer a few simple questions — we'll turn your memories into a story you can keep forever.
          </p>
          <Button
            size="lg"
            className="px-8 py-5 text-base shadow-glow"
            onClick={() => navigate("/create")}
          >
            <PawIcon className="mr-3 !h-[30px] !w-[30px] shrink-0 -mt-[1px] opacity-[0.92]" size={30} variant="white" />
            Create Your Tribute
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Takes less than 2 minutes · No writing needed
          </p>
        </motion.section>

        <div className="mt-10 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ExampleTributeClover;
