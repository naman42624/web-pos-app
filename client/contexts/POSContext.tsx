import { ReactNode } from "react";
import { usePOS } from "@/hooks/usePOS";
import { POSContext, usePOSContext } from "./usePOSContext";

export { usePOSContext };

export function POSProvider({ children }: { children: ReactNode }) {
  const pos = usePOS();

  return (
    <POSContext.Provider value={pos}>
      {children}
    </POSContext.Provider>
  );
}
