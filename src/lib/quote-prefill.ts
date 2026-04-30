/**
 * Shared utilities for SEO quote → tribute prefill flow.
 *
 * Selecting a quote on any SEO page stores it in localStorage under
 * `vp_prefill_quote` and the /create page picks it up to seed the tribute.
 */

export const PREFILL_QUOTE_KEY = "vp_prefill_quote";

const EMOTIONAL_KEYWORDS = ["miss", "love", "remember", "heart", "gone", "loss"];

/** A line is treated as a quote if it's wrapped in quotes OR is long AND personal/emotional */
export function isQuoteLine(s: string): boolean {
  const t = (s ?? "").trim();
  if (t.length < 3) return false;
  const first = t[0];
  const last = t[t.length - 1];
  const openers = ['"', "\u201C", "'", "\u2018"];
  const closers = ['"', "\u201D", "'", "\u2019"];
  const wrapped = openers.includes(first) && closers.includes(last);
  if (wrapped) return true;
  if (t.length <= 40) return false;
  const lower = t.toLowerCase();
  const hasPronoun =
    lower.includes(" you") ||
    lower.includes("you ") ||
    lower.includes(" i ") ||
    lower.startsWith("i ");
  const hasEmotional = EMOTIONAL_KEYWORDS.some((k) => lower.includes(k));
  return hasPronoun || hasEmotional;
}

/** Strip outer straight or curly quotes */
export function stripQuotes(s: string): string {
  return (s ?? "")
    .trim()
    .replace(/^["'\u201C\u2018]+|["'\u201D\u2019]+$/g, "")
    .trim();
}

/** Persist a selected quote for the /create flow */
export function savePrefillQuote(quote: string): void {
  try {
    localStorage.setItem(PREFILL_QUOTE_KEY, stripQuotes(quote));
  } catch {
    /* private mode / disabled storage — ignore */
  }
}

/** Read the persisted quote (or null) */
export function readPrefillQuote(): string | null {
  try {
    const v = localStorage.getItem(PREFILL_QUOTE_KEY);
    return v && v.trim() ? v : null;
  } catch {
    return null;
  }
}

/** Clear the persisted quote */
export function clearPrefillQuote(): void {
  try {
    localStorage.removeItem(PREFILL_QUOTE_KEY);
  } catch {
    /* ignore */
  }
}
