/**
 * GA4 funnel tracking for the tribute creation flow.
 *
 * Owns:
 *   - Per-step timing (mounted-at timestamps)
 *   - Total funnel time (started-at)
 *   - Step bookkeeping (so step_completed fires only once per step)
 *   - Source attribution (UTM + referrer classification)
 *   - Persistence in localStorage so a refresh mid-funnel doesn't restart timers
 *
 * All events route through `trackEvent` from `@/lib/gtag`, which handles
 * GA4 dispatch + dedupe + console logging. Source/UTM context is attached
 * to every event via `getSourceContext()`.
 */

import { trackEvent } from "@/lib/gtag";

const STATE_KEY = "vp_funnel_state_v1";
const UTM_KEY = "vp_utm";
const FIRST_TOUCH_KEY = "vp_first_touch";

/**
 * Name of the final funnel step (already normalized). Viewing this step is
 * treated as high purchase intent and fires `create_intent_high`.
 */
const FINAL_STEP_NAME = "style";

/**
 * Normalize a step name for analytics so casing/whitespace variations don't
 * fragment GA reports (e.g. "About Your Pet" -> "about_your_pet").
 */
function normalizeStepName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_");
}

interface FunnelState {
  /** ms timestamp when the user landed on /create */
  startedAt: number;
  /** Step name currently mounted (for exit tracking) */
  currentStep: string | null;
  /** ms timestamp when current step was mounted */
  currentStepStartedAt: number;
  /** Steps already completed (dedupe) */
  completed: string[];
  /** Whether create_started fired */
  startedFired: boolean;
  /** Whether tribute_published fired (suppresses exit_intent) */
  published: boolean;
  /** Whether exit_intent fired (prevents duplicate exits) */
  exited: boolean;
}

interface StoredUtm {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

interface SourceContext extends StoredUtm {
  source_page: string;
}

/* -------------------------------------------------------------------------- */
/* State helpers                                                              */
/* -------------------------------------------------------------------------- */

// In-memory mirror of `published` so we suppress exit_intent even if the state
// was cleared between trackTributePublished and the unmount cleanup.
let publishedInMemory = false;

function readState(): FunnelState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as FunnelState) : null;
  } catch {
    return null;
  }
}

function writeState(s: FunnelState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STATE_KEY);
  } catch {
    /* ignore */
  }
}

function getDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

/* -------------------------------------------------------------------------- */
/* Source attribution                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Returns a source-attribution context for GA events.
 *
 * Resolution order:
 *   1. UTM params on current URL (cached in localStorage as `vp_utm`)
 *   2. Previously cached UTM params (sticky across funnel)
 *   3. document.referrer classification (homepage / blog / internal / organic / social / external)
 *   4. "direct" / "unknown" fallback
 */
export function getSourceContext(): SourceContext {
  if (typeof window === "undefined") return { source_page: "direct" };

  // 1. Capture fresh UTM from current URL.
  let stored: StoredUtm = {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: StoredUtm = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    };
    if (utm.utm_source) {
      localStorage.setItem(UTM_KEY, JSON.stringify(utm));
      stored = utm;
    } else {
      const raw = localStorage.getItem(UTM_KEY);
      stored = raw ? (JSON.parse(raw) as StoredUtm) : {};
    }
  } catch {
    /* ignore */
  }

  if (stored.utm_source) {
    return {
      source_page: stored.utm_source,
      utm_source: stored.utm_source,
      utm_medium: stored.utm_medium ?? null,
      utm_campaign: stored.utm_campaign ?? null,
    };
  }

  // 2. Referrer-based classification.
  const ref = typeof document !== "undefined" ? document.referrer : "";
  if (!ref) return { source_page: "direct", ...stored };

  try {
    const url = new URL(ref);
    const host = url.hostname;

    if (host.includes("vellumpet.com") || url.origin === window.location.origin) {
      if (url.pathname === "/" || url.pathname === "") {
        return { source_page: "homepage", ...stored };
      }
      if (url.pathname.includes("quotes") || url.pathname.includes("messages")) {
        return { source_page: "blog", ...stored };
      }
      return { source_page: "internal", ...stored };
    }
    if (host.includes("google")) return { source_page: "organic", ...stored };
    if (host.includes("twitter") || host.includes("x.com")) return { source_page: "social", ...stored };
    if (host.includes("reddit")) return { source_page: "social", ...stored };
    if (host.includes("facebook") || host.includes("instagram")) return { source_page: "social", ...stored };
    return { source_page: "external", ...stored };
  } catch {
    return { source_page: "unknown", ...stored };
  }
}

/**
 * First-touch attribution: persists the FIRST acquisition source seen for this
 * browser and returns it for every subsequent event. This prevents internal
 * navigation (e.g. blog -> /create) from overwriting the original source.
 *
 * Resolution: returns the cached first-touch context if present, otherwise
 * captures the current `getSourceContext()` and persists it.
 */
export function getFirstTouch(): SourceContext {
  if (typeof window === "undefined") return { source_page: "direct" };
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    if (raw) return JSON.parse(raw) as SourceContext;
  } catch {
    /* ignore */
  }
  const ctx = getSourceContext();
  try {
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/* Debug                                                                       */
/* -------------------------------------------------------------------------- */

function debug(event: string, payload: Record<string, unknown>): void {
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.log("[FUNNEL]", event, payload);
  }
}

/* -------------------------------------------------------------------------- */
/* Public tracking API                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Fire `create_started` once per funnel session.
 * Initializes funnel timers in localStorage.
 */
export function trackCreateStarted(): void {
  const existing = readState();

  // Funnel restart: previous session existed but never published. Fire
  // `funnel_restarted` BEFORE the early return so we still capture the signal
  // even when create_started is suppressed (refresh case).
  if (existing?.startedFired && !existing.published) {
    const restartParams = {
      previous_steps_completed: existing.completed.length,
      ...getFirstTouch(),
    };
    debug("funnel_restarted", restartParams);
    trackEvent("funnel_restarted", restartParams);
  }

  // If we already started this session and the user just refreshed, don't re-fire.
  if (existing?.startedFired) return;

  publishedInMemory = false;

  const state: FunnelState = {
    startedAt: Date.now(),
    currentStep: null,
    currentStepStartedAt: Date.now(),
    completed: [],
    startedFired: true,
    published: false,
    exited: false,
  };
  writeState(state);

  const ctx = getFirstTouch();
  const params = {
    ...ctx,
    device: getDevice(),
    dedupe_key: `${state.startedAt}`,
    persist: true,
  };
  debug("create_started", { state, params });
  trackEvent("create_started", params);
}

/**
 * Mark a step as mounted — resets its timer and fires `step_viewed`.
 *
 * `step_viewed` is intentionally NOT deduped: if the user navigates back to a
 * previous step, that revisit still counts as a view. Timer resets only when
 * entering a NEW step (no-op if same step re-mounts due to React re-render).
 */
export function trackStepMounted(stepName: string, stepNumber?: number): void {
  const s = readState();
  if (!s) return;
  if (s.currentStep === stepName) return; // same step re-mount: no reset, no event

  s.currentStep = stepName;
  s.currentStepStartedAt = Date.now();
  writeState(s);

  const normalized = normalizeStepName(stepName);
  const ctx = getFirstTouch();
  const params: Record<string, unknown> = {
    step_name: normalized,
    ...ctx,
  };
  if (typeof stepNumber === "number") params.step_number = stepNumber;

  debug("step_viewed", params);
  trackEvent("step_viewed", params);

  // High-intent signal: viewing the final funnel step. Intentionally NOT
  // deduped — every view of the final step counts (e.g. user revisits).
  if (normalized === FINAL_STEP_NAME) {
    const intentParams: Record<string, unknown> = {
      step_name: normalized,
      ...ctx,
    };
    if (typeof stepNumber === "number") intentParams.step_number = stepNumber;
    debug("create_intent_high", intentParams);
    trackEvent("create_intent_high", intentParams);
  }
}

/**
 * Fire `step_completed` for the given step. Deduped per step name within
 * this funnel session so re-renders or back-and-forth navigation don't double-fire.
 *
 * `time_on_step` is clamped to [0, 600] seconds — anything outside that window
 * is treated as a stale/invalid timer (e.g. tab left open overnight) and zeroed out.
 */
export function trackStepCompleted(stepName: string, stepNumber: number): void {
  const s = readState();
  if (!s) return;
  if (s.completed.includes(stepName)) return;

  let time_on_step = Math.round((Date.now() - s.currentStepStartedAt) / 1000);
  if (time_on_step < 0 || time_on_step > 600) time_on_step = 0;

  s.completed.push(stepName);
  writeState(s);

  const ctx = getFirstTouch();
  const params = {
    step_name: normalizeStepName(stepName),
    step_number: stepNumber,
    time_on_step,
    ...ctx,
    dedupe_key: `${s.startedAt}:${stepName}`,
    persist: true,
  };
  debug("step_completed", params);
  trackEvent("step_completed", params);
}

export type CreateErrorType = "validation" | "upload_failed" | "unknown";

/** Fire `create_error`. Not deduped — every error counts. */
export function trackCreateError(stepName: string, errorType: CreateErrorType): void {
  const ctx = getFirstTouch();
  const params = {
    step_name: normalizeStepName(stepName),
    error_type: errorType,
    ...ctx,
  };
  debug("create_error", params);
  trackEvent("create_error", params);
}

/**
 * Fire `tribute_published` when the tribute is successfully created.
 * Deduped per tribute id so refreshes on the success page don't re-fire.
 *
 * Sets `published = true` (in-memory + persisted briefly) and clears funnel
 * state so any subsequent unmount-driven `trackExitIntent` is suppressed.
 */
export function trackTributePublished(params: {
  tributeId: string;
  hasPhotos: boolean;
  totalStepsCompleted?: number;
}): void {
  const s = readState();
  const total_time_spent = s
    ? Math.max(0, Math.round((Date.now() - s.startedAt) / 1000))
    : undefined;
  const total_steps_completed =
    params.totalStepsCompleted ?? (s ? s.completed.length : undefined);

  // Mark as published BEFORE firing so any racing exit handler bails out.
  publishedInMemory = true;
  if (s) {
    s.published = true;
    writeState(s);
  }

  const ctx = getFirstTouch();
  const eventParams = {
    total_steps_completed,
    total_time_spent,
    has_photos: params.hasPhotos,
    ...ctx,
    dedupe_key: params.tributeId,
    persist: true,
  };
  debug("tribute_published", eventParams);
  trackEvent("tribute_published", eventParams);

  // Funnel finished — clean up so a future visit starts fresh.
  clearState();
}

/**
 * Fire `exit_intent_create` when the user leaves /create without finishing.
 * Suppressed if the tribute was already published or if exit already fired.
 */
export function trackExitIntent(): void {
  if (publishedInMemory) return;
  const s = readState();
  if (!s) return;
  if (s.published) return;
  if (s.exited) return;

  const time_spent_total = Math.max(
    0,
    Math.round((Date.now() - s.startedAt) / 1000)
  );

  s.exited = true;
  writeState(s);

  const ctx = getSourceContext();
  const params = {
    last_step: s.currentStep ?? "intro",
    steps_completed_count: s.completed.length,
    time_spent_total,
    ...ctx,
    dedupe_key: `${s.startedAt}:exit`,
    persist: true,
  };
  debug("exit_intent_create", params);
  trackEvent("exit_intent_create", params);
}

/**
 * Returns true if the funnel state shows the user has finished
 * (either tribute_published cleared the state, or never started).
 */
export function isFunnelActive(): boolean {
  return !!readState();
}
