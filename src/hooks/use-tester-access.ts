import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "tester_token";
const STATUS_KEY = "is_tester";

export function useTesterAccess() {
  const [searchParams] = useSearchParams();
  const [isTester, setIsTester] = useState(() => localStorage.getItem(STATUS_KEY) === "true");
  const [testerToken, setTesterToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

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
