import { Shield } from "lucide-react";

interface GuaranteeBadgeProps {
  variant?: "inline" | "card";
}

const GuaranteeBadge = ({ variant = "inline" }: GuaranteeBadgeProps) => {
  if (variant === "card") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border/50 bg-card/60 p-7 text-center shadow-soft">
        <div className="mb-3 flex justify-center">
          <div className="rounded-full bg-accent p-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
          7-Day Tribute Satisfaction Guarantee
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Losing a pet is incredibly hard, and we want every tribute to feel meaningful and personal.
          If the tribute we create doesn't feel right to you, just contact us within 7 days of purchase
          and we'll issue a full refund.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          We may ask what didn't resonate so we can keep improving, but there's no complicated process.
        </p>
      </div>
    );
  }

  return (
    <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Shield className="h-4 w-4 text-primary" />
      <span>
        7-Day Tribute Satisfaction Guarantee — If the tribute doesn't feel right, we'll refund you.
      </span>
    </p>
  );
};

export default GuaranteeBadge;
