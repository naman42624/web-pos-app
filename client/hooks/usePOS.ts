import { useState, useEffect } from "react";
import * as api from "@/lib/api";

export interface ProductItem {
  itemId?: string;
  customName?: string;
  customPrice?: number;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  items: ProductItem[];
}

export interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  productId?: string;
  composition?: Array<{
    itemId?: string;
    customName?: string;
    customPrice?: number;
    quantity: number;
  }>;
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
  paymentModes?: ("cash" | "upi" | "credit" | "cod")[];
  paymentAmounts?: Record<string, number>;
  customerId?: string;
  total: number;
  date: string;
  orderType: "pickup" | "pickup_later" | "delivery";
  pickupDate?: string;
  pickupTime?: string;
  deliveryDetails?: DeliveryDetails;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  deliveryCharges?: number;
  status?:
    | "pending"
    | "pick_up_ready"
    | "in_transit"
    | "delivered"
    | "cancelled"
    | "delivery_attempted_once"
    | "delivery_attempted_twice";
  paymentStatus?: "pending" | "paid";
  assignedDeliveryBoyId?: string;
  isQuickSale?: boolean;
}

export interface Address {
  id: string;
  label: string;
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

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  pin: string;
  idProofUrl?: string;
  status: "available" | "busy";
  createdAt: string;
}

export interface DeliveryAssignment {
  id: string;
  saleId: string;
  deliveryBoyId: string;
  assignedAt: string;
  status: "assigned" | "in_transit" | "delivered" | "cancelled";
}

export interface Settings {
  id: string;
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  logoUrl?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessZip?: string;
  taxId?: string;
  billingEmail?: string;
  billingName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  paymentTerms?: string;
  currency: string;
  timezone: string;
  theme: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export function usePOS() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load of all data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load items first (foundational data)
        await loadItems().catch((e) =>
          console.error("Error loading items:", e),
        );

        // Then load other data in parallel (excluding products for now)
        await Promise.all([
          loadCustomers().catch((e) =>
            console.error("Error loading customers:", e),
          ),
          loadSales().catch((e) => console.error("Error loading sales:", e)),
          loadCreditRecords().catch((e) =>
            console.error("Error loading credit records:", e),
          ),
          loadDeliveryBoys().catch((e) =>
            console.error("Error loading delivery boys:", e),
          ),
          loadSettings().catch((e) =>
            console.error("Error loading settings:", e),
          ),
        ]);

        // Load products last to avoid database overload
        await loadProducts().catch((e) =>
          console.error("Error loading products:", e),
        );
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load Items
  const loadItems = async () => {
    try {
      const data = await api.fetchItems();
      setItems(
        data.map((item: any) => ({
          id: item._id,
          name: item.name,
          price: parseFloat(item.price),
          stock: item.stock,
          image: item.image,
        })),
      );
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const addItem = async (item: Omit<Item, "id">) => {
    try {
      const data = await api.createItem({
        name: item.name,
        price: item.price,
        stock: item.stock,
        image: item.image,
      });

      const newItem = {
        id: data._id,
        name: data.name,
        price: parseFloat(data.price),
        stock: data.stock,
        image: data.image,
      };

      setItems([...items, newItem]);
      return newItem;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  const updateItem = async (id: string, item: Partial<Item>) => {
    try {
      await api.updateItem(id, {
        ...(item.name && { name: item.name }),
        ...(item.price !== undefined && { price: item.price }),
        ...(item.stock !== undefined && { stock: item.stock }),
        ...(item.image !== undefined && { image: item.image }),
      });

      setItems(items.map((i) => (i.id === id ? { ...i, ...item } : i)));
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.deleteItem(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  };

  const updateItemStock = async (itemId: string, quantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newStock = Math.max(0, item.stock - quantity);
    await updateItem(itemId, { stock: newStock });
  };

  // Load Products
  const loadProducts = async () => {
    try {
      const productsData = await api.fetchProducts();

      if (!productsData || productsData.length === 0) {
        setProducts([]);
        return;
      }

      const products = productsData.map((product: any) => ({
        id: product._id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        stock: product.stock || 0,
        image: product.image,
        items: product.items || [],
      }));

      setProducts(products);
    } catch (error) {
      console.error("Error in loadProducts:", error);
      setProducts([]);
    }
  };

  // Product items are already loaded with the product data
  const loadProductItems = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId);
      return product?.items || [];
    } catch (error) {
      console.error(`Error in loadProductItems for ${productId}:`, error);
      return [];
    }
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const data = await api.createProduct({
        name: product.name,
        price: product.price,
        stock: product.stock || 0,
        image: product.image,
        items: product.items,
      });

      const newProduct = {
        id: data._id,
        name: data.name,
        price: parseFloat(data.price) || 0,
        stock: data.stock || 0,
        image: data.image,
        items: data.items || product.items,
      };

      setProducts([...products, newProduct]);
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await api.updateProduct(id, {
        ...(product.name && { name: product.name }),
        ...(product.price !== undefined && { price: product.price }),
        ...(product.stock !== undefined && { stock: product.stock }),
        ...(product.image !== undefined && { image: product.image }),
        ...(product.items && { items: product.items }),
      });

      setProducts(products.map((p) => (p.id === id ? { ...p, ...product } : p)));
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const decrementProductStock = async (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock - quantity);
    await updateProduct(productId, { stock: newStock });
  };

  // Load Customers
  const loadCustomers = async () => {
    try {
      const data = await api.fetchCustomers();
      const customersData = data.map((customer: any) => ({
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        altPhone: customer.altPhone,
        email: customer.email,
        organization: customer.organization,
        addresses: customer.addresses || [],
        totalCredit: customer.totalCredit || 0,
      }));
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const addCustomer = async (customer: Omit<Customer, "id">) => {
    try {
      const data = await api.createCustomer({
        name: customer.name,
        phone: customer.phone,
        altPhone: customer.altPhone,
        email: customer.email,
        organization: customer.organization,
        addresses: customer.addresses,
        totalCredit: 0,
      });

      const newCustomer: Customer = {
        id: data._id,
        name: data.name,
        phone: data.phone,
        altPhone: data.altPhone,
        email: data.email,
        organization: data.organization,
        addresses: data.addresses || [],
        totalCredit: 0,
      };

      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  };

  const getCustomerByIds = (ids: string[]) => {
    return customers.filter((c) => ids.includes(c.id));
  };

  const getCreditRecordsByCustomer = (customerId: string) => {
    return creditRecords.filter((c) => c.customerId === customerId);
  };

  // Load Sales
  const loadSales = async () => {
    try {
      const data = await api.fetchSales();
      const sales = data.map((sale: any) => ({
        id: sale._id,
        items: sale.items || [],
        paymentMode: sale.paymentMode,
        paymentModes: sale.paymentModes,
        paymentAmounts: sale.paymentAmounts,
        customerId: sale.customerId,
        total: parseFloat(sale.total),
        date: sale.date,
        orderType: sale.orderType,
        pickupDate: sale.pickupDate,
        pickupTime: sale.pickupTime,
        discountType: sale.discountType,
        discountValue: sale.discountValue ? parseFloat(sale.discountValue) : undefined,
        discountAmount: sale.discountAmount
          ? parseFloat(sale.discountAmount)
          : undefined,
        deliveryCharges: sale.deliveryCharges
          ? parseFloat(sale.deliveryCharges)
          : undefined,
        deliveryDetails: sale.deliveryDetails,
        status: sale.status || "pending",
        paymentStatus: sale.paymentStatus || "pending",
        assignedDeliveryBoyId: sale.assignedDeliveryBoyId,
        isQuickSale: sale.isQuickSale || false,
      }));
      setSales(sales);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  // Load sale details with items when needed
  const loadSaleDetails = async (saleId: string) => {
    try {
      const saleData = await api.fetchSale(saleId);
      const saleItems = saleData.items || [];

      setSales((prevSales) =>
        prevSales.map((s) => (s.id === saleId ? { ...s, items: saleItems } : s)),
      );

      return saleItems;
    } catch (error) {
      console.error("Error loading sale items:", error);
      return [];
    }
  };

  const addSale = async (sale: Omit<Sale, "id" | "date">) => {
    try {
      const saleData = await api.createSale({
        items: sale.items,
        paymentMode: sale.paymentMode,
        paymentModes: sale.paymentModes,
        paymentAmounts: sale.paymentAmounts,
        customerId: sale.customerId,
        orderType: sale.orderType,
        pickupDate: sale.pickupDate,
        pickupTime: sale.pickupTime,
        discountType: sale.discountType,
        discountValue: sale.discountValue,
        discountAmount: sale.discountAmount,
        deliveryCharges: sale.deliveryCharges,
        deliveryDetails: sale.deliveryDetails,
        date: new Date().toISOString(),
        total: sale.total,
        status: "pending",
        paymentStatus: "pending",
        isQuickSale: sale.isQuickSale || false,
      });

      const saleId = saleData._id;

      // Handle credit records
      if (sale.paymentMode === "credit" && sale.customerId) {
        try {
          await api.createCreditRecord({
            customerId: sale.customerId,
            amount: sale.total,
            saleId,
            date: new Date().toISOString(),
          });

          // Update customer total credit
          const customer = customers.find((c) => c.id === sale.customerId);
          if (customer) {
            await api.updateCustomer(sale.customerId, {
              totalCredit: customer.totalCredit + sale.total,
            });
          }
        } catch (creditError) {
          console.error("Error adding credit record:", creditError);
        }
      }

      // Decrement product stock for ready products sold
      if (sale.items && sale.items.length > 0) {
        for (const item of sale.items) {
          if (item.productId) {
            await decrementProductStock(item.productId, item.quantity);
          }
        }
      }

      await loadSales();
      await loadCreditRecords();
      if (sale.customerId) await loadCustomers();

      const newSale: Sale = {
        id: saleId,
        items: sale.items,
        paymentMode: sale.paymentMode,
        paymentModes: sale.paymentModes,
        paymentAmounts: sale.paymentAmounts,
        customerId: sale.customerId,
        total: sale.total,
        date: new Date().toISOString(),
        orderType: sale.orderType,
        pickupDate: sale.pickupDate,
        pickupTime: sale.pickupTime,
        discountType: sale.discountType,
        discountValue: sale.discountValue,
        discountAmount: sale.discountAmount,
        deliveryCharges: sale.deliveryCharges,
        deliveryDetails: sale.deliveryDetails,
        paymentStatus: "pending",
        status: "pending",
        isQuickSale: sale.isQuickSale || false,
      };

      setSales([...sales, newSale]);
      return newSale;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error adding sale:", errorMsg);
      throw error;
    }
  };

  const updateSaleStatus = async (
    saleId: string,
    status:
      | "pending"
      | "pick_up_ready"
      | "in_transit"
      | "delivered"
      | "cancelled"
      | "delivery_attempted_once"
      | "delivery_attempted_twice",
  ) => {
    try {
      await api.updateSale(saleId, { status });
      setSales(
        sales.map((sale) => (sale.id === saleId ? { ...sale, status } : sale)),
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error updating sale status:", errorMsg);
      throw error;
    }
  };

  const markCashOnDeliveryReceived = async (saleId: string) => {
    try {
      await api.updateSale(saleId, { paymentStatus: "paid" });
      setSales(
        sales.map((sale) =>
          sale.id === saleId ? { ...sale, paymentStatus: "paid" } : sale,
        ),
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error marking COD as received:", errorMsg);
      throw error;
    }
  };

  const recordPayment = async (saleId: string, amountReceived: number) => {
    try {
      const sale = sales.find((s) => s.id === saleId);
      if (!sale) {
        throw new Error("Sale not found");
      }

      if (sale.paymentMode !== "credit") {
        throw new Error("Only credit sales can be marked as paid");
      }

      if (amountReceived <= 0) {
        throw new Error("Amount received must be greater than 0");
      }

      if (amountReceived > sale.total) {
        throw new Error(
          `Amount received cannot exceed ₹${sale.total.toLocaleString("en-IN")}`,
        );
      }

      const isPaid = amountReceived === sale.total;

      // Update sale payment status
      await api.updateSale(saleId, {
        paymentStatus: isPaid ? "paid" : "pending",
      });

      // Update customer total credit
      if (sale.customerId) {
        const customer = customers.find((c) => c.id === sale.customerId);
        if (customer) {
          const newTotalCredit = Math.max(
            0,
            customer.totalCredit - amountReceived,
          );
          await api.updateCustomer(sale.customerId, {
            totalCredit: newTotalCredit,
          });
        }
      }

      // Update local state
      setSales(
        sales.map((s) =>
          s.id === saleId
            ? { ...s, paymentStatus: isPaid ? "paid" : s.paymentStatus }
            : s,
        ),
      );

      // Reload customers to reflect updated credit
      await loadCustomers();
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  };

  // Load Credit Records
  const loadCreditRecords = async () => {
    try {
      const data = await api.fetchCreditRecords();
      setCreditRecords(
        data.map((record: any) => ({
          id: record._id,
          customerId: record.customerId,
          amount: parseFloat(record.amount),
          date: record.date,
          saleId: record.saleId,
        })),
      );
    } catch (error) {
      console.error("Error loading credit records:", error);
    }
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

  // Load Delivery Boys
  const loadDeliveryBoys = async () => {
    try {
      const data = await api.fetchDeliveryBoys();
      if (data && data.length > 0) {
        setDeliveryBoys(
          data.map((boy: any) => ({
            id: boy._id,
            name: boy.name,
            phone: boy.phone,
            pin: boy.pin,
            idProofUrl: boy.idProofUrl,
            status: boy.status,
            createdAt: boy.createdAt,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading delivery boys:", error);
    }
  };

  // Load Settings
  async function loadSettings() {
    try {
      const data = await api.fetchSettings();
      if (data) {
        setSettings({
          id: data._id,
          businessName: data.businessName,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          logoUrl: data.logoUrl,
          businessAddress: data.businessAddress,
          businessCity: data.businessCity,
          businessState: data.businessState,
          businessZip: data.businessZip,
          taxId: data.taxId,
          billingEmail: data.billingEmail,
          billingName: data.billingName,
          billingAddress: data.billingAddress,
          billingCity: data.billingCity,
          billingState: data.billingState,
          billingZip: data.billingZip,
          paymentTerms: data.paymentTerms,
          currency: data.currency,
          timezone: data.timezone,
          theme: data.theme,
          language: data.language,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  // Update Settings
  async function updateSettings(updatedSettings: Partial<Settings>) {
    try {
      const data = await api.updateSettings(updatedSettings);

      // Update local state
      if (settings) {
        setSettings({
          ...settings,
          ...updatedSettings,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  const addDeliveryBoy = async (
    boy: Omit<DeliveryBoy, "id" | "createdAt">,
    idProofFile?: File,
  ) => {
    try {
      const data = await api.createDeliveryBoy({
        name: boy.name,
        phone: boy.phone,
        pin: boy.pin,
        idProofUrl: boy.idProofUrl,
        status: boy.status,
      });

      const newBoy: DeliveryBoy = {
        id: data._id,
        name: data.name,
        phone: data.phone,
        pin: data.pin,
        idProofUrl: data.idProofUrl,
        status: data.status,
        createdAt: data.createdAt,
      };

      setDeliveryBoys([newBoy, ...deliveryBoys]);
      return newBoy;
    } catch (error) {
      console.error("Error adding delivery boy:", error);
      throw error;
    }
  };

  const updateDeliveryBoy = async (
    id: string,
    updates: Partial<Omit<DeliveryBoy, "id" | "createdAt">>,
    idProofFile?: File,
  ) => {
    try {
      await api.updateDeliveryBoy(id, updates);

      setDeliveryBoys(
        deliveryBoys.map((boy) =>
          boy.id === id ? { ...boy, ...updates } : boy,
        ),
      );
    } catch (error) {
      console.error("Error updating delivery boy:", error);
      throw error;
    }
  };

  const deleteDeliveryBoy = async (id: string) => {
    try {
      // Implement delete function in API
      await fetch(`/api/data/delivery-boys/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setDeliveryBoys(deliveryBoys.filter((boy) => boy.id !== id));
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
      throw error;
    }
  };

  const verifyDeliveryBoyPin = async (phone: string, pin: string) => {
    const boy = deliveryBoys.find((b) => b.phone === phone && b.pin === pin);
    return boy || null;
  };

  const assignDeliveryBoy = async (saleId: string, deliveryBoyId: string) => {
    const { data, error } = await supabase
      .from("delivery_assignments")
      .upsert({
        sale_id: saleId,
        delivery_boy_id: deliveryBoyId,
        assigned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error assigning delivery boy:", error);
      throw error;
    }

    // Update sale with delivery_boy_id
    const { error: saleError } = await supabase
      .from("sales")
      .update({ delivery_boy_id: deliveryBoyId })
      .eq("id", saleId);

    if (saleError) {
      console.error("Error updating sale with delivery boy:", saleError);
      throw saleError;
    }

    // Update local sales state
    setSales(
      sales.map((s) =>
        s.id === saleId ? { ...s, assignedDeliveryBoyId: deliveryBoyId } : s,
      ),
    );

    return data;
  };

  const getDeliveryBoyAssignments = async (deliveryBoyId: string) => {
    const { data, error } = await supabase
      .from("delivery_assignments")
      .select("*")
      .eq("delivery_boy_id", deliveryBoyId)
      .in("status", ["assigned", "in_transit"]);

    if (error) {
      console.error("Error fetching delivery boy assignments:", error);
      return [];
    }

    return data.map((assignment: any) => ({
      id: assignment.id,
      saleId: assignment.sale_id,
      deliveryBoyId: assignment.delivery_boy_id,
      assignedAt: assignment.assigned_at,
      status: assignment.status,
    }));
  };

  return {
    sales,
    items,
    customers,
    creditRecords,
    products,
    deliveryBoys,
    settings,
    loading,
    addSale,
    loadSaleDetails,
    updateSaleStatus,
    recordPayment,
    markCashOnDeliveryReceived,
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
    loadProductItems,
    addDeliveryBoy,
    updateDeliveryBoy,
    deleteDeliveryBoy,
    verifyDeliveryBoyPin,
    assignDeliveryBoy,
    getDeliveryBoyAssignments,
    loadDeliveryBoys,
    updateSettings,
  };
}
