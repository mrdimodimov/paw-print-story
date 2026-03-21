import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Activates test mode via `?test=true` URL parameter.
 * Test mode is only available in development builds.
 */
export function useTestMode() {
  const [searchParams] = useSearchParams();

  const isTestMode = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    return searchParams.get("test") === "true";
  }, [searchParams]);

  return { isTestMode };
}
