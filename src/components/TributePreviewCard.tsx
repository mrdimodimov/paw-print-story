import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface TributePreviewCardProps {
  imageUrl: string;
  petName: string;
  years?: string;
  memoryTitle: string;
  preview: string;
  index: number;
  linkTo?: string;
  blurPreview?: boolean;
}

const TributePreviewCard = ({
  imageUrl,
  petName,
  years,
  memoryTitle,
  preview,
  index,
  linkTo,
  blurPreview,
}: TributePreviewCardProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: 0.08 + index * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ once: true, amount: 0.2 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/30 bg-white shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56">
        <img
          src={imageUrl}
          alt={`Tribute to ${petName}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {petName}
          </h3>
          {years && (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {years}
            </span>
          )}
        </div>

        <p className="mb-3 font-display text-sm font-medium italic text-primary/80">
          {memoryTitle}
        </p>

        {/* Preview text with fade */}
        <div className="relative flex-1">
          <p className={`line-clamp-3 font-display text-sm leading-relaxed text-foreground/70 ${blurPreview ? "blur-preview-text" : ""}`} style={{ overflowWrap: "break-word" }}>
            {preview}
          </p>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card via-card/80 to-transparent" />
        </div>

        {/* CTA */}
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary/60 transition-colors duration-200 group-hover:text-primary">
          View Tribute
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </motion.div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
};

export default TributePreviewCard;
