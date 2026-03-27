import React from "react";
import BrandLogo from "@/components/BrandLogo";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import examplePhoto from "@/assets/example-tribute-bella.jpg";

const exampleTitle = "The Dog Who Never Missed a Sunset Walk";

const exampleStory = [
  "The leash hung by the front door. Luna knew the sound of it being lifted off the hook — the faint clink of the metal clasp — and she'd be there before you'd even turned around. Eighty pounds of golden fur, trembling with a joy so complete it made you wonder what you'd been worried about all day.",
  "She wasn't a complicated dog.",
  "She liked walks, toast crusts, and lying across your feet while you read. She liked thunderstorms less, but she'd sit through them pressed against your leg, breathing slow and steady, as though she'd decided that if someone had to be brave, it might as well be her.",
  "In the park she moved through the world like someone running for office — greeting every dog, charming every child, diffusing the occasional tense standoff between a terrier and a German Shepherd with nothing more than a slow wag and a well-timed sit. People who didn't know her name knew her face. The mail carrier brought her biscuits.",
  "Sarah used to say Luna was the only member of the family who never had a bad day. That wasn't quite true. But Luna's bad days looked like everyone else's good ones — a little quieter, a little slower, still ending with her chin on the windowsill, watching the street like she was keeping score of something only she understood.",
  "Twelve years. The walks got shorter. The naps stretched longer. Grey crept across her muzzle the way winter creeps into November — slowly, then all at once.",
  "But those eyes. Those deep, root-beer brown eyes never changed. They still said the same thing at twelve that they'd said at two: I'm here. That's enough, isn't it?",
  "The leash still hangs by the front door. Nobody's moved it.",
  "And sometimes, in that quiet moment just before evening settles in, you swear you can hear the faint clink of metal — like she's still there, waiting."
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
            <BrandLogo size="sm" />
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
          <p className="mt-3 text-xs text-muted-foreground/60">
            Example tribute created from real memories
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
              loading="lazy" src="https://ppfrtdbjsagytuhweywd.supabase.co/storage/v1/object/public/pet-photos/luna.jpg" />
            
          </div>
        </motion.div>

        {/* Tribute story */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-14 rounded-xl border border-border bg-card p-8 shadow-card md:p-10">
          
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

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10">
          
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
            onClick={() => navigate("/create")}>
            <PawIcon className="mr-3 !h-[30px] !w-[30px] shrink-0 -mt-[1px] opacity-[0.92]" size={30} />
            Create Your Tribute
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Takes less than 2 minutes · No writing needed
          </p>
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