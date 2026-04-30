import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  isQuoteLine,
  stripQuotes,
  savePrefillQuote,
  readPrefillQuote,
} from "@/lib/quote-prefill";
import { trackEvent } from "@/lib/analytics";

/**
 * Interactive quote block used across SEO listicle pages.
 * Click → save quote to prefill storage → show floating CTA.
 */
export function InteractiveQuoteBlock({ text, slug }: { text: string; slug?: string }) {
  const clean = stripQuotes(text);
  const [selected, setSelected] = useState(() => readPrefillQuote() === clean);

  // Re-render this block as "selected" if a sibling block updates storage.
  // Cheap approach: poll storage on focus (no global subscribe needed).
  const onClick = () => {
    savePrefillQuote(clean);
    setSelected(true);
    trackEvent("quote_selected", { metadata: { quote: clean, slug } });
    // Notify floating bar via storage event (manual dispatch since same tab)
    window.dispatchEvent(new CustomEvent("vp_prefill_quote_changed", { detail: clean }));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`block w-full rounded-lg border px-5 py-4 text-left transition-all duration-300 ${
        selected
          ? "scale-[1.02] border-2 border-primary/70 bg-primary/10 shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.35)]"
          : "border-l-2 border-y-0 border-r-0 border-primary/30 bg-transparent hover:border-l-primary hover:bg-accent/30"
      }`}
    >
      <p className="italic leading-relaxed text-foreground/90">{text}</p>
      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
        {selected ? (
          <>
            <Check className="h-3.5 w-3.5" /> This is now part of your tribute
          </>
        ) : (
          <>
            Use this to start your tribute <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </span>
      {selected && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          This will be included in your tribute
        </p>
      )}
    </button>
  );
}

/**
 * Page-level floating CTA. Watches the prefill quote and shows a fixed
 * bottom bar that links to /create?prefill=1.
 */
export function PrefillFloatingBar({ slug }: { slug?: string }) {
  const [quote, setQuote] = useState<string | null>(() => readPrefillQuote());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | null;
      setQuote(detail || readPrefillQuote());
    };
    window.addEventListener("vp_prefill_quote_changed", handler);
    return () => window.removeEventListener("vp_prefill_quote_changed", handler);
  }, []);

  return (
    <AnimatePresence>
      {quote && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)] backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-foreground">Start your tribute with this</p>
              <p className="truncate text-xs italic text-muted-foreground">"{quote}"</p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-1">
              <Link
                to="/create?prefill=1"
                onClick={() =>
                  trackEvent("prefill_continue_clicked", {
                    metadata: { source: "floating_bar", slug },
                  })
                }
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--cta-from)),hsl(var(--cta-to)))] px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-card"
              >
                Continue with this quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-muted-foreground">This will be included in your tribute</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { isQuoteLine, stripQuotes };
