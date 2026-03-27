import BrandLogo from "@/components/BrandLogo";
import CtaIcon from "@/components/CtaIcon";
import PawIcon from "@/components/PawIcon";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

interface SeoArticleMeta {
  title: string;
  description: string;
}

interface SeoArticleProps {
  meta: SeoArticleMeta;
  heading: string;
  intro: string;
  exampleTitle: string;
  exampleBody: string[];
  tips: string[];
  tipsIntro?: string;
  outroHeading?: string;
  outro?: string;
}

const SeoArticleLayout = ({
  meta,
  heading,
  intro,
  exampleTitle,
  exampleBody,
  tips,
  tipsIntro = "Here are a few tips to help you write a tribute that feels personal and true to your pet's life.",
  outroHeading = "You Don't Have to Write It Alone",
  outro = "If putting your feelings into words feels overwhelming, VellumPet can help. Answer a few simple questions about your pet, and we'll craft a beautiful, heartfelt tribute for you.",
}: SeoArticleProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`https://paw-print-story.lovable.app${window?.location?.pathname ?? ""}`} />
      </Helmet>
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="tribute-container flex items-center justify-between py-4">
          <BrandLogo size="sm" onClick={() => navigate("/")} />
          <Button size="sm" onClick={() => navigate("/create")}>
            Create Your Tribute
          </Button>
        </div>
      </header>

      {/* Article */}
      <article className="tribute-section">
        <div className="tribute-container max-w-2xl">
          {/* H1 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              {heading}
            </h1>
            <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </motion.div>

          {/* Example Tribute Card */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="mb-5 text-2xl font-bold text-foreground">
              Example Tribute
            </h2>
            <div className="rounded-xl border border-border bg-card p-8 shadow-card md:p-10">
              <h3 className="mb-5 text-center font-display text-xl font-semibold text-foreground">
                {exampleTitle}
              </h3>
              <div className="space-y-4 font-body text-sm leading-relaxed text-foreground/90">
                {exampleBody.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Writing Tips */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Tips for Writing a Meaningful Tribute
            </h2>
            <p className="mb-6 text-muted-foreground">{tipsIntro}</p>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-foreground/90"
                >
                  <PawIcon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-14 rounded-xl border border-border bg-accent/30 p-8 text-center md:p-10"
          >
            <h2 className="mb-3 text-2xl font-bold text-foreground">
              {outroHeading}
            </h2>
            <p className="mb-6 text-muted-foreground">{outro}</p>
            <Button
              size="lg"
              className="px-8 py-5 text-base shadow-glow"
              onClick={() => navigate("/create")}
            >
              <CtaIcon className="mr-2 shrink-0" size={22} />
              Create a Tribute for Your Pet
            </Button>
          </motion.section>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <div className="tribute-container">
          <p>
            Made with <Heart className="inline h-3 w-3 text-primary" /> by{" "}
            {BRAND.name}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SeoArticleLayout;
