import React, { ReactNode } from "react";
import { usePOS } from "@/hooks/usePOS";
import { POSContext } from "./usePOSContext";

export function POSProvider({ children }: { children: ReactNode }) {
  const pos = usePOS();

  return (
    <POSContext.Provider value={pos}>
      {children}
    </POSContext.Provider>
  );
}
