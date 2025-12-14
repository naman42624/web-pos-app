import { useState } from "react";

export interface ProductItem {
  itemId: string; // Reference to an existing Item
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  items: ProductItem[]; // Composition of items
}

export interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string; // Base64 encoded image data
}

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string; // Optional image from inventory item
}

export interface DeliveryDetails {
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  message?: string;
  senderName: string;
  senderPhone: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  paymentMode: "cash" | "upi" | "credit";
  customerId?: string;
  total: number;
  date: string;
  orderType: "pickup" | "pickup_later" | "delivery";
  pickupDate?: string; // ISO date string for later pickup or delivery
  pickupTime?: string; // Time in HH:MM format
  deliveryDetails?: DeliveryDetails;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  deliveryCharges?: number; // Optional delivery charges for delivery orders
}

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Office"
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  organization?: string;
  addresses: Address[];
  totalCredit: number;
}

export interface CreditRecord {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  saleId: string;
}

const initialItems: Item[] = [
  {
    id: "item-1",
    name: "Chai",
    price: 20,
    stock: 50,
  },
  {
    id: "item-2",
    name: "Samosa",
    price: 15,
    stock: 30,
  },
  {
    id: "item-3",
    name: "Juice",
    price: 40,
    stock: 25,
  },
  {
    id: "item-4",
    name: "Biscuits",
    price: 10,
    stock: 100,
  },
  {
    id: "item-5",
    name: "Coffee",
    price: 30,
    stock: 40,
  },
];

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@example.com",
    altPhone: "9876543220",
    organization: "Kumar Enterprises",
    addresses: [
      {
        id: "1-1",
        label: "Office",
        street: "123 Business Street",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
      },
    ],
    totalCredit: 5000,
  },
  {
    id: "2",
    name: "Priya Singh",
    phone: "9876543211",
    email: "priya@example.com",
    altPhone: "9876543221",
    organization: "Singh & Co.",
    addresses: [
      {
        id: "2-1",
        label: "Home",
        street: "456 Residential Lane",
        city: "Delhi",
        state: "Delhi",
        zip: "110001",
      },
    ],
    totalCredit: 3500,
  },
  {
    id: "3",
    name: "Amit Patel",
    phone: "9876543212",
    email: "amit@example.com",
    organization: "Patel Trading",
    addresses: [
      {
        id: "3-1",
        label: "Office",
        street: "789 Commerce Plaza",
        city: "Bangalore",
        state: "Karnataka",
        zip: "560001",
      },
    ],
    totalCredit: 2000,
  },
];

export function usePOS() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const addSale = (sale: Omit<Sale, "id" | "date">) => {
    const newSale: Sale = {
      ...sale,
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
    };

    setSales([...sales, newSale]);

    if (sale.paymentMode === "credit" && sale.customerId) {
      const creditRecord: CreditRecord = {
        id: `credit-${Date.now()}`,
        customerId: sale.customerId,
        amount: sale.total,
        date: new Date().toISOString(),
        saleId: newSale.id,
      };
      setCreditRecords([...creditRecords, creditRecord]);

      setCustomers(
        customers.map((c) =>
          c.id === sale.customerId
            ? { ...c, totalCredit: c.totalCredit + sale.total }
            : c
        )
      );
    }

    return newSale;
  };

  const addCustomer = (customer: Omit<Customer, "id">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `customer-${Date.now()}`,
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };

  const getCustomerByIds = (ids: string[]) => {
    return customers.filter((c) => ids.includes(c.id));
  };

  const getCreditRecordsByCustomer = (customerId: string) => {
    return creditRecords.filter((c) => c.customerId === customerId);
  };

  const getTodaySalesTotal = () => {
    const today = new Date().toDateString();
    return sales
      .filter((s) => new Date(s.date).toDateString() === today)
      .reduce((sum, s) => sum + s.total, 0);
  };

  const getTodayTransactionCount = () => {
    const today = new Date().toDateString();
    return sales.filter((s) => new Date(s.date).toDateString() === today)
      .length;
  };

  const addItem = (item: Omit<Item, "id">) => {
    const newItem: Item = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setItems([...items, newItem]);
    return newItem;
  };

  const updateItem = (id: string, item: Partial<Item>) => {
    setItems(items.map((i) => (i.id === id ? { ...i, ...item } : i)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItemStock = (itemId: string, quantity: number) => {
    setItems(
      items.map((i) =>
        i.id === itemId ? { ...i, stock: Math.max(0, i.stock - quantity) } : i
      )
    );
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}`,
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...product } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return {
    sales,
    items,
    customers,
    creditRecords,
    products,
    addSale,
    addItem,
    updateItem,
    deleteItem,
    updateItemStock,
    addCustomer,
    getCustomerByIds,
    getCreditRecordsByCustomer,
    getTodaySalesTotal,
    getTodayTransactionCount,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
