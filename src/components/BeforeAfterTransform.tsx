import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const BeforeAfterTransform = () => {
  const navigate = useNavigate();

  return (
    <section className="tribute-section bg-secondary/30">
      <div className="tribute-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
            From a Few Memories to Something You Can Keep
          </h2>
          <p className="text-base text-muted-foreground">
            You share the moments. We shape them into a tribute.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Before: raw input */}
          <motion.div
            initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col rounded-2xl border border-border/50 bg-background p-7 shadow-soft"
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What you share
            </p>
            <div className="flex-1 space-y-3 font-body text-sm leading-relaxed text-foreground/70">
              <p>"She used to wait by the door every evening with her leash."</p>
              <p>"Her favorite spot was the sunny patch on the kitchen floor."</p>
              <p>"She was scared of thunder but brave about everything else."</p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Just a few answers — no writing skill needed.
            </p>
          </motion.div>

          {/* Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div className="rounded-full bg-accent p-3">
              <ArrowRight className="h-5 w-5 text-primary md:rotate-0 rotate-90" />
            </div>
          </motion.div>

          {/* After: polished tribute */}
          <motion.div
            initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-7 shadow-card"
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-primary/70">
              What you receive
            </p>
            <p className="mb-2 font-display text-sm italic text-primary/80">
              The Door That Was Never Empty
            </p>
            <div className="relative flex-1 font-body text-sm leading-relaxed text-foreground/90">
              <p>
                She waited by the door every evening, leash already in her mouth, as if choosing your next small adventure together was the most natural thing in the world. The sunny patch on the kitchen floor was hers alone — she'd stretch into it like she'd invented the concept of rest, warming herself through quiet afternoons while the house moved around her.
              </p>
              <p className="mt-3">
                She flinched at thunder but stood her ground against everything else — the mailman, the neighbor's cat, the vacuum cleaner she never quite forgave...
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
          className="mt-10 text-center"
        >
          <button
            onClick={() => navigate("/create")}
            className="group inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground/80 shadow-sm transition-all hover:border-primary/40 hover:bg-accent/20 hover:text-foreground active:scale-[0.97]"
          >
            Try it with your own memories
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterTransform;
