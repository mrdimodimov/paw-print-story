/**
 * Client-side email send guard — prevents duplicate/spam email triggers.
 *
 * Features:
 * - 60s cooldown per key (survives page reload via localStorage)
 * - In-memory ref guard for rapid double-clicks
 * - Dev-mode kill switch (emails are disabled unless test mode is on)
 * - Logging of every attempt
 */

const COOLDOWN_MS = 60_000; // 60 seconds
const PREFIX = "email_guard_";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

/** Returns true if the key is still in cooldown. */
export function isInCooldown(key: string): boolean {
  const ts = safeGet(`${PREFIX}${key}`);
  if (!ts) return false;
  return Date.now() - Number(ts) < COOLDOWN_MS;
}

/** Mark a key as "just sent" to start the cooldown window. */
export function markSent(key: string) {
  safeSet(`${PREFIX}${key}`, String(Date.now()));
}

/**
 * Returns true if email sending is allowed in this environment.
 * In development builds, emails are ONLY sent when test mode is active.
 * In production builds, emails are always allowed.
 */
export function isEmailEnabled(isTestMode: boolean): boolean {
  if (import.meta.env.PROD) return true;
  // Dev mode: only allow when test mode is explicitly on
  return isTestMode;
}

/**
 * Log every email trigger attempt for debugging.
 * In production this is a no-op to keep console clean.
 */
export function logEmailAttempt(
  action: string,
  key: string,
  outcome: "sent" | "blocked_cooldown" | "blocked_dev" | "blocked_duplicate" | "error",
  detail?: string,
) {
  const entry = {
    ts: new Date().toISOString(),
    action,
    key,
    outcome,
    ...(detail ? { detail } : {}),
  };
  if (import.meta.env.DEV) {
    console.log("[EmailGuard]", entry);
  }
}
