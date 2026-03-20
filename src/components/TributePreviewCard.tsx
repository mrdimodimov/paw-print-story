import { motion } from "framer-motion";

interface TributePreviewCardProps {
  imageUrl: string;
  petName: string;
  years: string;
  memoryTitle: string;
  preview: string;
  index: number;
}

const TributePreviewCard = ({
  imageUrl,
  petName,
  years,
  memoryTitle,
  preview,
  index,
}: TributePreviewCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: 0.08 + index * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ once: true, amount: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-[0_12px_36px_-8px_hsl(32_40%_50%/0.2)]"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden sm:h-52">
        <img
          src={imageUrl}
          alt={`Tribute to ${petName}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {petName}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {years}
          </span>
        </div>

        <p className="mb-3 font-display text-sm italic text-primary/80">
          {memoryTitle}
        </p>

        {/* Preview text with fade */}
        <div className="relative flex-1">
          <p className="line-clamp-3 font-body text-sm leading-relaxed text-foreground/80">
            {preview}
          </p>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
        </div>
      </div>
    </motion.div>
  );
};

export default TributePreviewCard;
