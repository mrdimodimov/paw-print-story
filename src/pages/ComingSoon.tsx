import PawIcon from "@/components/PawIcon";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-lg"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-accent p-5">
            < className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h1 className="mb-4 font-display text-4xl font-bold text-foreground md:text-5xl">
          {BRAND.name} is Coming Soon
        </h1>

        <p className="mb-3 text-lg text-muted-foreground">
          A beautiful way to remember and celebrate the life of your beloved pet.
        </p>

        <p className="mb-10 text-sm text-muted-foreground/70">
          We are preparing the experience. The full tribute generator will launch soon.
        </p>

        <Button
          size="lg"
          className="px-8 py-6 text-base shadow-glow"
          onClick={() => window.open("mailto:hello@vellumpet.com?subject=Early Access Request", "_blank")}
        >
          <Heart className="mr-2 h-5 w-5" />
          Join the Early Access List
        </Button>
      </motion.div>

      <p className="mt-16 text-xs text-muted-foreground/50">
        Made with <Heart className="inline h-3 w-3 text-primary" /> by {BRAND.name}
      </p>
    </div>
  );
};

export default ComingSoon;
