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
      className={`relative flex flex-col rounded-xl border p-6 transition-shadow ${
        tier.popular
          ? "border-primary shadow-glow"
          : "border-border shadow-soft hover:shadow-card"
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Star className="h-3 w-3" /> Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {tier.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">${tier.price}</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </div>
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
        className="w-full"
        onClick={onSelect}
      >
        Get Started
      </Button>
    </div>
  );
};

export default TierCard;
