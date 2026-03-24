import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TierConfig } from "@/lib/types";

interface TierCardProps {
  tier: TierConfig;
  onSelect: () => void;
}

const TierCard = ({ tier, onSelect }: TierCardProps) => {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 transition-all ${
        tier.popular
          ? "border-primary shadow-glow scale-[1.03] md:scale-[1.07] bg-card ring-1 ring-primary/20"
          : "border-border shadow-soft hover:shadow-card"
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
          <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
            ⭐ Most Chosen by Pet Owners
          </span>
        </div>
      )}

      {tier.label && !tier.popular && (
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {tier.label}
        </p>
      )}

      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {tier.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">${tier.price}</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </div>
        {tier.description && (
          <p className={`mt-2 leading-relaxed ${tier.popular ? "text-sm text-muted-foreground" : "text-xs text-muted-foreground/70"}`}>
            {tier.description}
          </p>
        )}
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={tier.popular ? "default" : "outline"}
        className={`w-full ${tier.popular ? "shadow-glow" : ""}`}
        size={tier.popular ? "lg" : "default"}
        onClick={onSelect}
      >
        {tier.id === "story" ? "Create a Simple Tribute" : tier.id === "pack" ? "Create Their Full Story" : "Create a Lasting Memorial"}
      </Button>

      {tier.popular && (
        <div className="mt-3 space-y-1.5 text-center">
          <p className="text-xs text-muted-foreground">
            Everything you need to tell their full story — nothing unnecessary
          </p>
          <p className="text-xs text-primary/80">
            7-day satisfaction guarantee — or your money back
          </p>
        </div>
      )}

      {tier.micro_text && !tier.popular && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {tier.micro_text}
        </p>
      )}
    </div>
  );
};

export default TierCard;
