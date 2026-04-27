/**
 * GA4 funnel tracking for the tribute creation flow.
 *
 * Owns:
 *   - Per-step timing (mounted-at timestamps)
 *   - Total funnel time (started-at)
 *   - Step-completion bookkeeping (so each step fires only once)
 *   - Persistence in localStorage so a refresh mid-funnel doesn't restart timers
 *
 * All events route through `trackEvent` from `@/lib/gtag`, which already handles
 * GA4 dispatch + dedupe + console logging.
 */

import { trackEvent } from "@/lib/gtag";

const STATE_KEY = "vp_funnel_state_v1";

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
}

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

function deriveSourcePage(): "homepage" | "blog" | "direct" | string {
  if (typeof document === "undefined") return "direct";
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const url = new URL(ref);
    // Same-origin internal navigation: classify by pathname
    if (url.origin === window.location.origin) {
      const path = url.pathname;
      if (path === "/" || path === "") return "homepage";
      // Treat any other internal page as "blog" (SEO articles, gallery, etc.)
      return "blog";
    }
    // External referrer
    return url.hostname;
  } catch {
    return "direct";
  }
}

/**
 * Fire `create_started` once per funnel session.
 * Initializes funnel timers in localStorage.
 */
export function trackCreateStarted(): void {
  const existing = readState();
  // If we already started this session and the user just refreshed, don't re-fire.
  if (existing?.startedFired) return;

  const state: FunnelState = {
    startedAt: Date.now(),
    currentStep: null,
    currentStepStartedAt: Date.now(),
    completed: [],
    startedFired: true,
  };
  writeState(state);

  trackEvent("create_started", {
    source_page: deriveSourcePage(),
    device: getDevice(),
    dedupe_key: `${state.startedAt}`,
    persist: true,
  });
}

/**
 * Mark a step as mounted — starts its timer.
 * Safe to call repeatedly; only the first call per step name resets the timer.
 */
export function trackStepMounted(stepName: string): void {
  const s = readState();
  if (!s) return;
  if (s.currentStep === stepName) return; // already on this step
  s.currentStep = stepName;
  s.currentStepStartedAt = Date.now();
  writeState(s);
}

/**
 * Fire `step_completed` for the given step. Deduped per step name within
 * this funnel session so re-renders or back-and-forth navigation don't double-fire.
 */
export function trackStepCompleted(stepName: string, stepNumber: number): void {
  const s = readState();
  if (!s) return;
  if (s.completed.includes(stepName)) return;

  const time_on_step = Math.max(
    0,
    Math.round((Date.now() - s.currentStepStartedAt) / 1000)
  );

  s.completed.push(stepName);
  writeState(s);

  trackEvent("step_completed", {
    step_name: stepName,
    step_number: stepNumber,
    time_on_step,
    dedupe_key: `${s.startedAt}:${stepName}`,
    persist: true,
  });
}

export type CreateErrorType = "validation" | "upload_failed" | "unknown";

/** Fire `create_error`. Not deduped — every error counts. */
export function trackCreateError(stepName: string, errorType: CreateErrorType): void {
  trackEvent("create_error", {
    step_name: stepName,
    error_type: errorType,
  });
}

/**
 * Fire `tribute_published` when the tribute is successfully created.
 * Deduped per tribute id so refreshes on the success page don't re-fire.
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

  trackEvent("tribute_published", {
    total_steps_completed,
    total_time_spent,
    has_photos: params.hasPhotos,
    dedupe_key: params.tributeId,
    persist: true,
  });

  // Funnel finished — clean up so a future visit starts fresh.
  clearState();
}

/**
 * Fire `exit_intent_create` when the user leaves /create without finishing.
 * Called from Questionnaire's unmount cleanup. Deduped per funnel session
 * so a refresh-then-leave doesn't fire twice.
 */
export function trackExitIntent(): void {
  const s = readState();
  if (!s) return;

  const time_spent_total = Math.max(
    0,
    Math.round((Date.now() - s.startedAt) / 1000)
  );

  trackEvent("exit_intent_create", {
    last_step: s.currentStep ?? "intro",
    steps_completed_count: s.completed.length,
    time_spent_total,
    dedupe_key: `${s.startedAt}:exit`,
    persist: true,
  });
}

/**
 * Returns true if the funnel state shows the user has finished
 * (either tribute_published cleared the state, or never started).
 */
export function isFunnelActive(): boolean {
  return !!readState();
}
