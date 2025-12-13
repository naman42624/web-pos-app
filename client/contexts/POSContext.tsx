import React, { createContext, useContext, ReactNode } from "react";
import {
  usePOS,
  Sale,
  Customer,
  CreditRecord,
  SaleItem,
} from "@/hooks/usePOS";

interface POSContextType {
  sales: Sale[];
  customers: Customer[];
  creditRecords: CreditRecord[];
  addSale: (sale: Omit<Sale, "id" | "date">) => Sale;
  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  getCustomerByIds: (ids: string[]) => Customer[];
  getCreditRecordsByCustomer: (customerId: string) => CreditRecord[];
  getTodaySalesTotal: () => number;
  getTodayTransactionCount: () => number;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: ReactNode }) {
  const pos = usePOS();

  return (
    <POSContext.Provider value={pos}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOSContext() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOSContext must be used within POSProvider");
  }
  return context;
}
