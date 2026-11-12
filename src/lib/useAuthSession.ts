import { useCallback, useEffect, useState } from "react";
import { authClient } from "./auth";

type SessionData = {
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
  session: {
    id: string;
    userId: string;
    [key: string]: unknown;
  };
} | null;

export function useAuthSession() {
  const [session, setSession] = useState<SessionData>(null);
  const [isPending, setIsPending] = useState(true);

  const refresh = useCallback(async () => {
    setIsPending(true);
    try {
      const result = await authClient.getSession();
      setSession((result.data as SessionData | null) ?? null);
    } catch {
      setSession(null);
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { session, isPending, refresh };
}
