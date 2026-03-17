import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import examplePhoto from "@/assets/example-tribute-bella.jpg";

const exampleTitle = "The Dog Who Never Missed a Sunset Walk";

const exampleStory = [
  "Luna had a way of knowing when the light outside started to turn golden. She would appear at the door, tail sweeping slow arcs, watching you with those deep brown eyes that said everything without a word. It didn't matter what you were doing — if the sun was going down, Luna was ready to walk.",
  "She was a Golden Retriever in every sense of the word. Warm, steady, endlessly patient. The kind of dog who would sit beside you during a thunderstorm, not because she wasn't afraid, but because she knew you might be. She leaned into people the way some dogs lean into the wind — fully, without hesitation.",
  "Mornings with Luna always started the same way. She would stretch across the kitchen floor while breakfast was being made, one ear cocked toward the sound of the coffee grinder, the other tracking footsteps. She had a particular fondness for toast crusts, which she accepted with a gentleness that made you forget she weighed eighty pounds.",
  "In the park, Luna was a diplomat. She greeted every dog with a calm, tail-low curiosity, diffusing tense encounters with nothing more than a slow wag and a polite sniff. Children adored her. She would sit perfectly still while tiny hands patted her head, occasionally offering a single lick that sent them into fits of laughter.",
  "Her favorite spot in the house was the window seat in the living room. She would rest her chin on the cushion and watch the street for hours — the mail carrier, the neighbor's cat, the occasional squirrel that dared to cross the lawn. Sarah often joked that Luna was the neighborhood watch.",
  "On the harder days, Luna didn't try to fix things. She just stayed close. She would press her side against your leg or rest her head on your knee, breathing slowly, as if reminding you that not every moment needed words. That quiet presence was her greatest gift.",
  "Twelve years passed faster than anyone expected. The walks got shorter, the naps got longer, and the grey crept across her muzzle like morning frost. But her eyes never lost that gentle spark — the one that said, 'I'm still here. I'm still yours.'",
  "Luna left behind a leash that still hangs by the front door, a spot on the couch that no one else sits in, and a family that learned what unconditional love really looks like. Not from a book or a sermon, but from a dog who showed up every single day and gave everything she had.",
  "The sunsets still come. And sometimes, just for a moment, it feels like she's still waiting by the door."
];


const ExampleTribute = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* SEO meta is handled by Helmet or document head in a real setup */}
      <title>Example Pet Tribute Story | VellumPet</title>
      <meta
        name="description"
        content="See an example pet tribute created with VellumPet. Turn your pet's memories into a beautiful tribute story in minutes." />
      

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
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
        {/* Example label */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex justify-center">
          
          <span className="rounded-full border border-primary/30 bg-accent/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Example Tribute
          </span>
        </motion.div>

        {/* Title & pet details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center">
          
<h1 className="mb-4 font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
            Luna — {exampleTitle}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Luna</span>
            <span aria-hidden="true">·</span>
            <span>Golden Retriever</span>
            <span aria-hidden="true">·</span>
            <span>2012 – 2024</span>
          </div>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Beloved companion to Sarah
          </p>
        </motion.div>

        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12 flex justify-center">
          
          <div className="overflow-hidden rounded-xl border border-border shadow-card">
            <img

              alt="Luna the Golden Retriever"
              className="h-auto w-full max-w-sm object-cover"
              loading="lazy" src="/lovable-uploads/9de65cee-31e7-4d1e-bbe8-83f80983da9c.jpg" />
            
          </div>
        </motion.div>

        {/* Tribute story */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-14 rounded-xl border border-border bg-card p-8 shadow-card md:p-10">
          
          <div className="space-y-4 font-body text-sm leading-relaxed text-foreground/90 md:text-base md:leading-relaxed">
            {exampleStory.map((paragraph, i) =>
            <p key={i}>{paragraph}</p>
            )}
          </div>
        </motion.article>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10">
          
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
            onClick={() => navigate("/create")}>
            
            <PawPrint className="mr-2 h-5 w-5" />
            Create Your Tribute
          </Button>
        </motion.section>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>);

};

export default ExampleTribute;