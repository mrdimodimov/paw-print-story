import { useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "testMode";
const FOUNDER_KEY = "founderMode";

/**
 * Activates test mode via:
 *   - `?test=true` URL parameter
 *   - `?preview=founder` (auto-enables founder + test mode)
 *   - localStorage persistence
 */
export function useTestMode() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Detect & persist founder/test mode from URL
  useEffect(() => {
    if (searchParams.get("preview") === "founder") {
      localStorage.setItem(FOUNDER_KEY, "true");
      localStorage.setItem(STORAGE_KEY, "true");
      console.log("FounderMode: activated via URL param");
    }
    const testParam = searchParams.get("test");
    if (testParam === "true") {
      localStorage.setItem(STORAGE_KEY, "true");
      console.log("TestMode: activated via URL param");
    } else if (testParam === "false") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [searchParams]);

  const isFounderMode = useMemo(() => {
    const val = localStorage.getItem(FOUNDER_KEY) === "true";
    console.log("FounderMode:", val);
    return val;
  }, [searchParams]);

  const isTestMode = useMemo(() => {
    const testParam = searchParams.get("test");
    if (testParam === "true") return true;
    if (testParam === "false") return false;
    const val = localStorage.getItem(STORAGE_KEY) === "true";
    console.log("TestMode:", val);
    return val;
  }, [searchParams]);

  const toggleTestMode = useCallback(() => {
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
