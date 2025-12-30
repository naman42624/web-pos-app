import { ReactNode } from "react";
import { usePOS } from "@/hooks/usePOS";
import { POSContext } from "./usePOSContext";

function POSProviderInner({ children }: { children: ReactNode }) {
  const pos = usePOS();
  return (
    <POSContext.Provider value={pos}>{children}</POSContext.Provider>
  );
}

export function POSProvider({ children }: { children: ReactNode }) {
  return <POSProviderInner>{children}</POSProviderInner>;
}
