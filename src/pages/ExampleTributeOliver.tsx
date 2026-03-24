import PawIcon from "@/components/PawIcon";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const exampleTitle = "Where the Sunlight Always Found Him";

const exampleStory = [
  "The first thing you should know about Oliver is that he was never in a hurry. Not once. Not for food, not for attention, not for anything. He moved through the apartment like weather — slowly, inevitably, settling into whatever room felt right and staying there until it didn't.",
  "He had copper eyes and a grey coat that turned silver in certain light. He was beautiful in the way that cats are beautiful: completely, without effort, and without caring whether you noticed.",
  "His morning routine was precise. Bathroom counter while teeth were brushed. Kitchen windowsill while coffee brewed. The reading chair — not on it, behind it, wedged into that narrow gap between cushion and wall — by nine. He ran the household from that chair. James just paid the rent.",
  "Oliver spoke rarely. His meow was a single syllable, deployed only when absolutely necessary: closed doors, empty bowls, the inexplicable decision to run the vacuum on a Saturday morning. He had opinions about the vacuum. They were not favorable.",
  "But quiet cats have their own language.",
  "The soft thud of him landing on the bed at midnight. The barely-there rumble of his purr against the back of your knees on cold nights. The slow blink across the room — the loudest thing he ever said.",
  "Fourteen years went by like that. He spent most of them in a three-foot patch of afternoon sunlight on the kitchen floor.",
  "The light still comes through at the same time every day. It crosses the tiles, reaches that spot, and sits there. Empty. Warm. Waiting for someone who already knew exactly where to lie down."
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
src="https://ppfrtdbjsagytuhweywd.supabase.co/storage/v1/object/public/pet-photos/oliver.jpg"
              alt="Oliver the Grey Tabby cat"
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
