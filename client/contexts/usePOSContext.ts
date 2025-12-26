import { createContext, useContext } from "react";
import { usePOS } from "@/hooks/usePOS";

type POSContextType = ReturnType<typeof usePOS>;

export const POSContext = createContext<POSContextType | undefined>(undefined);

export function usePOSContext() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOSContext must be used within POSProvider");
  }
  return context;
}
