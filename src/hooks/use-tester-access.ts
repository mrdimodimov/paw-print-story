import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "tester_token";
const STATUS_KEY = "is_tester";

export function useTesterAccess() {
  const [searchParams] = useSearchParams();

  // Synchronous initial detection: URL param OR localStorage
  const urlTokenInitial = searchParams.get("tester");
  const storedToken = localStorage.getItem(TOKEN_KEY);
  const initialToken = urlTokenInitial || storedToken;
  const initialTester = !!initialToken || localStorage.getItem(STATUS_KEY) === "true";

  // Also sync to sessionStorage for analytics
  if (urlTokenInitial) {
    sessionStorage.setItem("tester_source", urlTokenInitial);
    localStorage.setItem(TOKEN_KEY, urlTokenInitial);
  }

  const [isTester, setIsTester] = useState(initialTester);
  const [testerToken, setTesterToken] = useState<string | null>(initialToken);

  console.log("[tester-access] source:", initialToken, "isTester:", initialTester);

  useEffect(() => {
    // Pick token from URL param first, then localStorage
    const urlToken = searchParams.get("tester");
    const token = urlToken || localStorage.getItem(TOKEN_KEY);

    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken);
      setTesterToken(urlToken);
    }

    if (!token) {
      setIsTester(false);
      localStorage.removeItem(STATUS_KEY);
      return;
    }

    // Validate against DB
    supabase
      .from("tester_access" as any)
      .select("id")
      .eq("token", token)
      .eq("is_active", true)
      .limit(1)
      .then(({ data }) => {
        const valid = !!(data && (data as any[]).length > 0);
        setIsTester(valid);
        if (valid) {
          localStorage.setItem(STATUS_KEY, "true");
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          localStorage.removeItem(STATUS_KEY);
          localStorage.removeItem(TOKEN_KEY);
          setTesterToken(null);
        }
      });
  }, [searchParams]);

  return { isTester, testerToken };
}
