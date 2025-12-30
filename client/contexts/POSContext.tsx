import { ReactNode, useMemo } from "react";
import { usePOS } from "@/hooks/usePOS";
import { useAuth } from "@/contexts/AuthContext";
import { POSContext } from "./usePOSContext";

export function POSProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const pos = usePOS(!!session && !authLoading);

  const contextValue = useMemo(() => pos, [pos]);

  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
}
