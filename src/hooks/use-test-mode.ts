import { useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "testMode";
const FOUNDER_KEY = "founderMode";

/**
 * Activates test mode via:
 *   - `?test=true` URL parameter
 *   - `?preview=founder` (auto-enables founder + test mode)
 *   - localStorage persistence
 *
 * Only available in development builds.
 */
export function useTestMode() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Detect & persist founder mode from URL
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (searchParams.get("preview") === "founder") {
      localStorage.setItem(FOUNDER_KEY, "true");
      localStorage.setItem(STORAGE_KEY, "true");
    }
    const testParam = searchParams.get("test");
    if (testParam === "true") {
      localStorage.setItem(STORAGE_KEY, "true");
    } else if (testParam === "false") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [searchParams]);

  const isFounderMode = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    return localStorage.getItem(FOUNDER_KEY) === "true";
  }, [searchParams]);

  const isTestMode = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    const testParam = searchParams.get("test");
    if (testParam === "true") return true;
    if (testParam === "false") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  }, [searchParams]);

  const toggleTestMode = useCallback(() => {
    if (!import.meta.env.DEV) return;
    const next = new URLSearchParams(searchParams);
    if (isTestMode) {
      localStorage.removeItem(STORAGE_KEY);
      next.delete("test");
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
      next.set("test", "true");
    }
    setSearchParams(next, { replace: true });
  }, [isTestMode, searchParams, setSearchParams]);

  const disableFounderMode = useCallback(() => {
    localStorage.removeItem(FOUNDER_KEY);
    localStorage.removeItem(STORAGE_KEY);
    const next = new URLSearchParams(searchParams);
    next.delete("test");
    next.delete("preview");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return { isTestMode, isFounderMode, toggleTestMode, disableFounderMode };
}
