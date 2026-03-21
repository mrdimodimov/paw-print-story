import { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "testMode";

/**
 * Activates test mode via `?test=true` URL parameter or localStorage.
 * Persists across sessions. Only available in development builds.
 */
export function useTestMode() {
  const [searchParams, setSearchParams] = useSearchParams();

  const isTestMode = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    const paramVal = searchParams.get("test");
    if (paramVal === "true") return true;
    if (paramVal === "false") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  }, [searchParams]);

  // Persist to localStorage when activated via URL
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const paramVal = searchParams.get("test");
    if (paramVal === "true") {
      localStorage.setItem(STORAGE_KEY, "true");
    } else if (paramVal === "false") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [searchParams]);

  const toggleTestMode = () => {
    if (!import.meta.env.DEV) return;
    if (isTestMode) {
      localStorage.removeItem(STORAGE_KEY);
      searchParams.delete("test");
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
      searchParams.set("test", "true");
    }
    setSearchParams(searchParams, { replace: true });
  };

  return { isTestMode, toggleTestMode };
}
