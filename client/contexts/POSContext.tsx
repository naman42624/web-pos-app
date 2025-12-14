import React, { createContext, useContext, ReactNode } from "react";
import {
  usePOS,
  Sale,
  Customer,
  CreditRecord,
  SaleItem,
  Product,
  Item,
} from "@/hooks/usePOS";

interface POSContextType {
  sales: Sale[];
  customers: Customer[];
  creditRecords: CreditRecord[];
  items: Item[];
  products: Product[];
  addSale: (sale: Omit<Sale, "id" | "date">) => Sale;
  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  getCustomerByIds: (ids: string[]) => Customer[];
  getCreditRecordsByCustomer: (customerId: string) => CreditRecord[];
  getTodaySalesTotal: () => number;
  getTodayTransactionCount: () => number;
  addItem: (item: Omit<Item, "id">) => Item;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  updateItemStock: (itemId: string, quantity: number) => void;
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
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
