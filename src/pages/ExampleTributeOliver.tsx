import PawIcon from "@/components/PawIcon";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const exampleTitle = "Where the Sunlight Always Found Him";

const exampleStory = [
  "Oliver never announced himself. He simply appeared — on the arm of the couch, the edge of the desk, the one square of afternoon light that moved across the kitchen floor like clockwork. He had a way of claiming space without demanding it, as if the whole house had been arranged for his comfort and everyone else was just visiting.",
  "He was a grey tabby with copper eyes that could hold a stare longer than most people. Not aggressive, never confrontational — just deeply, unmovably certain of himself. He watched the world from windowsills with the patience of someone who had already figured everything out.",
  "Mornings belonged to him. He would sit on the bathroom counter while teeth were brushed, occasionally batting at the faucet stream with one precise paw. He tolerated being held for exactly four seconds before a gentle but firm push with his back legs signaled that the audience was over.",
  "His favorite place was the reading chair. Not on it — behind it, wedged into the narrow space between the cushion and the wall. From there he could observe the entire living room, half-hidden, like a cat-shaped secret the house kept for itself.",
  "He was never loud. His meow was more of a suggestion — a single, soft syllable that meant 'door' or 'dinner' or simply 'I see you.' He purred like a small engine on cold nights, curled against the back of your knees under the covers.",
  "Fourteen years is a long time and no time at all. The house is quieter now — not because it was ever loud, but because the particular silence Oliver carried with him had a weight to it. A presence. The kind you only notice once it's gone.",
  "The sunlight still crosses the kitchen floor every afternoon. It reaches the same spot, at the same time, and lingers there as if waiting for someone who already knows exactly where to lie down."
];

const ExampleTributeOliver = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <title>Example Cat Tribute Story | VellumPet</title>
      <meta
        name="description"
        content="See an example cat tribute created with VellumPet. Turn your cat's memories into a beautiful tribute story in minutes."
      />

      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <PawIcon className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">
              {BRAND.name}
            </span>
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
            Oliver — {exampleTitle}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Oliver</span>
            <span aria-hidden="true">·</span>
            <span>Grey Tabby</span>
            <span aria-hidden="true">·</span>
            <span>2010 – 2024</span>
          </div>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Beloved companion to James
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
              src={"/lovable-uploads/9de65cee-31e7-4d1e-bbe8-83f80983da9c.jpg"}
              alt="Oliver the Grey Tabby"
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
              <p key={i}>{paragraph}</p>
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
            Create a Tribute for Your Own Pet
          </h2>
          <p className="mb-6 text-sm text-muted-foreground md:text-base">
            Share your pet's memories and VellumPet will turn them into a beautiful tribute story.
          </p>
          <Button
            size="lg"
            className="px-8 py-5 text-base shadow-glow"
            onClick={() => navigate("/create")}
          >
            <PawIcon className="mr-3 !h-[30px] !w-[30px] shrink-0 -mt-[1px] opacity-[0.92]" size={30} />
            Create Your Tribute
          </Button>
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

export default ExampleTributeOliver;
