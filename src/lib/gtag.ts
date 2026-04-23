/**
 * Google Analytics (GA4) helper.
 *
 * Use `trackEvent(name, params)` instead of calling `gtag` directly.
 * Includes a lightweight de-duplication layer:
 *   - In-memory `Set` prevents the same event firing twice in the same tab session
 *     for events that include a stable `dedupe_key` param.
 *   - For events that should survive a page refresh (e.g. `payment_success`),
 *     pass `{ dedupe_key, persist: true }` and we'll use sessionStorage.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const memoryDedupe = new Set<string>();
const STORAGE_PREFIX = "ga_evt_";

function alreadyFired(key: string, persist: boolean): boolean {
  if (persist) {
    try {
      if (sessionStorage.getItem(STORAGE_PREFIX + key)) return true;
      sessionStorage.setItem(STORAGE_PREFIX + key, "1");
      return false;
    } catch {
      // sessionStorage may be unavailable (Safari private mode) — fall through
    }
  }
  if (memoryDedupe.has(key)) return true;
  memoryDedupe.add(key);
  return false;
}

export interface TrackEventParams {
  [key: string]: unknown;
  /** Unique key for de-duplication. If omitted, event always fires. */
  dedupe_key?: string;
  /** Persist dedupe across reloads via sessionStorage. */
  persist?: boolean;
}

export function trackEvent(name: string, params: TrackEventParams = {}): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  const { dedupe_key, persist, ...rest } = params;

  if (dedupe_key) {
    const fullKey = `${name}:${dedupe_key}`;
    if (alreadyFired(fullKey, !!persist)) return;
  }

  try {
    console.log("GA Event:", name, rest);
    window.gtag("event", name, rest);
  } catch (err) {
    console.warn("[gtag]", name, err);
  }
}
