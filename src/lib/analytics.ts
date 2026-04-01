import { supabase } from "@/integrations/supabase/client";

const TESTER_SOURCE_KEY = "tester_source";

/** Capture ?tester= param into sessionStorage on page load */
export function captureTesterSource(): string | null {
  const params = new URLSearchParams(window.location.search);
  const tester = params.get("tester");
  if (tester) {
    sessionStorage.setItem(TESTER_SOURCE_KEY, tester);
  }
  return sessionStorage.getItem(TESTER_SOURCE_KEY);
}

/** Get the stored tester source (or null) */
export function getTesterSource(): string | null {
  return sessionStorage.getItem(TESTER_SOURCE_KEY);
}

/** Track an analytics event (fire-and-forget) */
export function trackEvent(
  eventName: string,
  options?: {
    tributeId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const testerSource = getTesterSource();
  const payload = {
    event_name: eventName,
    tester_source: testerSource,
    tribute_id: options?.tributeId || null,
    metadata: options?.metadata || null,
  };

  // Fire and forget — don't block UI
  supabase
    .from("analytics_events" as any)
    .insert(payload)
    .then(({ error }) => {
      if (error) console.warn("[analytics]", eventName, error.message);
    });
}
