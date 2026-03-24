import PawIcon from "@/components/PawIcon";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const exampleTitle = "The One Who Greeted Everyone";

const exampleStory = [
  "Max didn't walk into rooms. He arrived. Full-body wiggle, tail going like a metronome set to allegro, tongue already out and looking for the nearest available face. If you'd never met a Labrador before, Max would have explained the entire breed to you in about four seconds.",
  "He was chocolate-brown, perpetually damp, and had the gravitational pull of a small planet. Strangers crossed the street to pet him. Children materialized out of nowhere. The UPS driver — who was terrified of dogs — once sat on the porch and let Max lean against his legs for ten minutes. 'He's different,' the driver said. He was.",
  "Walks were chaos. Beautiful, joyful, completely unmanageable chaos. Every tree was a headline, every squirrel was breaking news, and every other dog on the trail was a long-lost friend he hadn't seen in years. The Riveras stopped using retractable leashes after the Incident at the Farmer's Market, which they still don't talk about at dinner.",
  "But at home — at home he was a different animal. He'd collapse on the couch like someone had unplugged him, sigh once from somewhere deep in his chest, and fall asleep with his head on whatever lap was closest. His snoring rattled the windows. Nobody minded.",
  "He loved the beach. God, he loved the beach. The moment his paws hit sand he became something elemental — pure velocity and joy, crashing into waves, retrieving sticks nobody threw, shaking himself dry at the exact moment you'd put your phone away and thought it was safe.",
  "The collar is in a drawer now. The leash is in the closet. The house is clean in a way it never was before, and quieter in a way that nobody wanted.",
  "But sometimes, when someone rings the doorbell, everyone in the family still pauses for half a second. Listening for the scramble of paws on hardwood that isn't coming. Smiling anyway."
];

const ExampleTributeMax = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <title>Example Dog Tribute Story | VellumPet</title>
      <meta
        name="description"
        content="See an example dog tribute created with VellumPet. Turn your dog's memories into a beautiful tribute story in minutes."
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
            Max — {exampleTitle}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Max</span>
            <span aria-hidden="true">·</span>
            <span>Chocolate Labrador</span>
            <span aria-hidden="true">·</span>
            <span>2014 – 2025</span>
          </div>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Beloved companion to the Rivera family
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
              alt="Max the Chocolate Labrador"
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

export default ExampleTributeMax;
