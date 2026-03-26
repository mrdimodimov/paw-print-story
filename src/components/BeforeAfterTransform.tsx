import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const bullets = [
  "Waited by the door every evening",
  "Loved the sunny kitchen spot",
  "Scared of thunder, but brave",
];

const BeforeAfterTransform = () => {
  const navigate = useNavigate();

  return (
    <section className="tribute-section bg-section-alt">
      <div className="tribute-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-medium text-primary/70">
            Turn a few simple memories into a beautiful tribute.
          </p>
          <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
            From a Few Memories to Something You Can Keep
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* LEFT: Raw Input */}
          <motion.div
            initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col rounded-2xl border border-border/40 bg-muted/50 p-7"
          >
            <p className="mb-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What you share
            </p>
            <ul className="flex-1 space-y-3">
              {bullets.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-2.5 rounded-lg border border-border/30 bg-[hsl(30_20%_95%)] px-3.5 py-2.5"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span className="font-body text-[13px] font-medium leading-relaxed text-[hsl(20_15%_24%)]">
                    {b}
                  </span>
                </motion.li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground/70">
              Just a few answers — no writing skill needed.
            </p>
          </motion.div>

          {/* CENTER: Transformation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full bg-accent p-3 shadow-soft"
            >
              <ArrowRight className="h-5 w-5 text-primary md:rotate-0 rotate-90" />
            </motion.div>
            <span className="hidden md:block text-[11px] font-medium text-muted-foreground/60 text-center leading-tight">
              Turning memories
              <br />
              into a story…
            </span>
          </motion.div>

          {/* RIGHT: Final Tribute */}
          <motion.div
            initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-7 shadow-card"
          >
            <div className="mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary/60" />
              <p className="text-xs font-medium uppercase tracking-wider text-primary/70">
                What you receive
              </p>
            </div>
            <p className="mb-3 font-display text-sm italic text-primary/80">
              The Door That Was Never Empty
            </p>
            <div className="relative flex-1 font-body leading-relaxed text-foreground/90">
              <p className="text-[15px]">
                <span className="font-medium text-foreground">
                  She waited by the door every evening, leash already in her mouth,
                </span>{" "}
                as if choosing your next small adventure together was the most
                natural thing in the world.
              </p>
              <p className="mt-3 text-sm text-foreground/75">
                The sunny patch on the kitchen floor was hers alone — she'd stretch
                into it like she'd invented the concept of rest. She flinched at
                thunder but stood her ground against everything else…
              </p>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center gap-1.5 text-center"
        >
          <Button onClick={() => navigate("/create")} className="group">
            Try it with your own memories
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Button>
          <span className="text-xs text-muted-foreground/60">
            Takes less than 2 minutes
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterTransform;
