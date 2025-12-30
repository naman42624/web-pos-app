import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

export function usePOS(isAuthReady: boolean = false) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creditRecords, setCreditRecords] = useState<CreditRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load of all data - only when authenticated
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

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
  }, [isAuthReady]);

  // Load Items
  const loadItems = async () => {
    const { data, error } = await supabase.from("items").select("*");
    if (error) {
      console.error("Error loading items:", error);
      return;
    }
    setItems(
      data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        stock: item.stock,
        image: item.image,
      })),
    );
  };

  const addItem = async (item: Omit<Item, "id">) => {
    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          name: item.name,
          price: item.price,
          stock: item.stock,
          image: item.image,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding item:", error);
      throw error;
    }

    const newItem = {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      stock: data.stock,
      image: data.image,
    };

    setItems([...items, newItem]);
    return newItem;
  };

  const updateItem = async (id: string, item: Partial<Item>) => {
    const { error } = await supabase
      .from("items")
      .update({
        ...(item.name && { name: item.name }),
        ...(item.price !== undefined && { price: item.price }),
        ...(item.stock !== undefined && { stock: item.stock }),
        ...(item.image !== undefined && { image: item.image }),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating item:", error);
      throw error;
    }

    setItems(items.map((i) => (i.id === id ? { ...i, ...item } : i)));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) {
      console.error("Error deleting item:", error);
      throw error;
    }

    setItems(items.filter((i) => i.id !== id));
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
      // Fetch products without images first (fast)
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, stock");

      if (productsError) {
        console.error(
          "Error loading products:",
          productsError.message || productsError,
        );
        setProducts([]);
        return;
      }

      if (!productsData || productsData.length === 0) {
        setProducts([]);
        return;
      }

      const initialProducts = productsData.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        stock: product.stock || 0,
        image: undefined,
        items: [],
      }));

      setProducts(initialProducts);

      // Load images in batches in the background
      loadProductImagesInBatches(productsData.map((p: any) => p.id));
    } catch (error) {
      console.error("Error in loadProducts:", error);
      setProducts([]);
    }
  };

  // Load product images in batches to avoid timeout
  const loadProductImagesInBatches = async (productIds: string[]) => {
    const batchSize = 5;

    for (let i = 0; i < productIds.length; i += batchSize) {
      const batch = productIds.slice(i, i + batchSize);

      try {
        const { data: batchProducts, error } = await supabase
          .from("products")
          .select("id, image")
          .in("id", batch);

        if (!error && batchProducts) {
          setProducts((prev) =>
            prev.map((product) => {
              const updated = batchProducts.find(
                (p: any) => p.id === product.id,
              );
              return updated ? { ...product, image: updated.image } : product;
            }),
          );
        }
      } catch (err) {
        console.error(`Error loading images batch ${i / batchSize + 1}:`, err);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };

  // Load product items - called when viewing/editing a product
  const loadProductItems = async (productId: string) => {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from("product_items")
        .select("product_id, item_id, custom_name, custom_price, quantity")
        .eq("product_id", productId);

      if (itemsError) {
        console.error(
          `Error loading items for product ${productId}:`,
          itemsError.message || itemsError,
        );
        return [];
      }

      return (itemsData || []).map((pi: any) => ({
        itemId: pi.item_id,
        customName: pi.custom_name,
        customPrice: pi.custom_price ? parseFloat(pi.custom_price) : undefined,
        quantity: pi.quantity,
      }));
    } catch (error) {
      console.error(`Error in loadProductItems for ${productId}:`, error);
      return [];
    }
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: product.name,
          price: product.price,
          stock: product.stock || 0,
          image: product.image,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      throw error;
    }

    const productId = data.id;

    // Insert product items
    if (product.items && product.items.length > 0) {
      const { error: itemsError } = await supabase.from("product_items").insert(
        product.items.map((pi) => ({
          product_id: productId,
          item_id: pi.itemId,
          custom_name: pi.customName,
          custom_price: pi.customPrice,
          quantity: pi.quantity,
        })),
      );

      if (itemsError) {
        console.error("Error adding product items:", itemsError);
        throw itemsError;
      }
    }

    const newProduct = {
      id: productId,
      name: data.name,
      price: parseFloat(data.price) || 0,
      stock: data.stock || 0,
      image: data.image,
      items: product.items,
    };

    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const { error } = await supabase
      .from("products")
      .update({
        ...(product.name && { name: product.name }),
        ...(product.price !== undefined && { price: product.price }),
        ...(product.stock !== undefined && { stock: product.stock }),
        ...(product.image !== undefined && { image: product.image }),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    if (product.items) {
      // Delete existing items
      await supabase.from("product_items").delete().eq("product_id", id);

      // Insert new items
      if (product.items.length > 0) {
        await supabase.from("product_items").insert(
          product.items.map((pi) => ({
            product_id: id,
            item_id: pi.itemId,
            custom_name: pi.customName,
            custom_price: pi.customPrice,
            quantity: pi.quantity,
          })),
        );
      }
    }

    setProducts(products.map((p) => (p.id === id ? { ...p, ...product } : p)));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }

    setProducts(products.filter((p) => p.id !== id));
  };

  const decrementProductStock = async (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock - quantity);
    await updateProduct(productId, { stock: newStock });
  };

  // Load Customers
  const loadCustomers = async () => {
    const { data, error } = await supabase.from("customers").select("*");
    if (error) {
      console.error("Error loading customers:", error);
      return;
    }

    const customersWithAddresses = await Promise.all(
      data.map(async (customer: any) => {
        const { data: addressesData } = await supabase
          .from("addresses")
          .select("*")
          .eq("customer_id", customer.id);

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          altPhone: customer.alt_phone,
          email: customer.email,
          organization: customer.organization,
          addresses: addressesData
            ? addressesData.map((addr: any) => ({
                id: addr.id,
                label: addr.label,
                street: addr.street,
                city: addr.city,
                state: addr.state,
                zip: addr.zip,
              }))
            : [],
          totalCredit: parseFloat(customer.total_credit),
        };
      }),
    );

    setCustomers(customersWithAddresses);
  };

  const addCustomer = async (customer: Omit<Customer, "id">) => {
    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          name: customer.name,
          phone: customer.phone,
          alt_phone: customer.altPhone,
          email: customer.email,
          organization: customer.organization,
          total_credit: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding customer:", error);
      throw error;
    }

    const newCustomer: Customer = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      altPhone: data.alt_phone,
      email: data.email,
      organization: data.organization,
      addresses: [],
      totalCredit: 0,
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

  // Load Sales - simplified to avoid N+1 queries
  const loadSales = async () => {
    const { data, error } = await supabase.from("sales").select("*");
    if (error) {
      console.error("Error loading sales:", error);
      return;
    }

    const simpleSales = data.map((sale: any) => ({
      id: sale.id,
      items: [],
      paymentMode: sale.payment_mode,
      paymentModes: sale.payment_modes,
      paymentAmounts: sale.payment_amounts,
      customerId: sale.customer_id,
      total: parseFloat(sale.total),
      date: sale.date,
      orderType: sale.order_type,
      pickupDate: sale.pickup_date,
      pickupTime: sale.pickup_time,
      discountType: sale.discount_type,
      discountValue: sale.discount_value
        ? parseFloat(sale.discount_value)
        : undefined,
      discountAmount: sale.discount_amount
        ? parseFloat(sale.discount_amount)
        : undefined,
      deliveryCharges: sale.delivery_charges
        ? parseFloat(sale.delivery_charges)
        : undefined,
      deliveryDetails: sale.delivery_receiver_name
        ? {
            receiverName: sale.delivery_receiver_name,
            receiverAddress: sale.delivery_receiver_address,
            receiverPhone: sale.delivery_receiver_phone,
            message: sale.delivery_message,
            senderName: sale.delivery_sender_name,
            senderPhone: sale.delivery_sender_phone,
          }
        : undefined,
      status: sale.status || "pending",
      paymentStatus: sale.payment_status || "pending",
      assignedDeliveryBoyId: sale.delivery_boy_id,
      isQuickSale: sale.is_quick_sale || false,
    }));

    setSales(simpleSales);
  };

  // Load sale details with items when needed
  const loadSaleDetails = async (saleId: string) => {
    const { data: itemsData, error } = await supabase
      .from("sale_items")
      .select("*")
      .eq("sale_id", saleId);

    if (error) {
      console.error("Error loading sale items:", error);
      return [];
    }

    if (!itemsData) return [];

    const saleItems = await Promise.all(
      itemsData.map(async (si: any) => {
        const { data: compData } = await supabase
          .from("sale_item_composition")
          .select("*")
          .eq("sale_item_id", si.id);

        return {
          id: si.id,
          name: si.name,
          quantity: si.quantity,
          price: parseFloat(si.price),
          image: si.image,
          productId: si.product_id,
          composition: compData
            ? compData.map((c: any) => ({
                itemId: c.item_id,
                customName: c.custom_name,
                customPrice: c.custom_price
                  ? parseFloat(c.custom_price)
                  : undefined,
                quantity: c.quantity,
              }))
            : undefined,
        };
      }),
    );

    setSales((prevSales) =>
      prevSales.map((s) =>
        s.id === saleId ? { ...s, items: saleItems } : s,
      ),
    );

    return saleItems;
  };

  const addSale = async (sale: Omit<Sale, "id" | "date">) => {
    const { data, error } = await supabase
      .from("sales")
      .insert([
        {
          total: sale.total,
          payment_mode: sale.paymentMode,
          payment_modes: sale.paymentModes,
          payment_amounts: sale.paymentAmounts,
          customer_id: sale.customerId,
          order_type: sale.orderType,
          pickup_date: sale.pickupDate,
          pickup_time: sale.pickupTime,
          discount_type: sale.discountType,
          discount_value: sale.discountValue,
          discount_amount: sale.discountAmount,
          delivery_charges: sale.deliveryCharges,
          delivery_receiver_name: sale.deliveryDetails?.receiverName,
          delivery_receiver_address: sale.deliveryDetails?.receiverAddress,
          delivery_receiver_phone: sale.deliveryDetails?.receiverPhone,
          delivery_message: sale.deliveryDetails?.message,
          delivery_sender_name: sale.deliveryDetails?.senderName,
          delivery_sender_phone: sale.deliveryDetails?.senderPhone,
          date: new Date().toISOString(),
          is_quick_sale: sale.isQuickSale || false,
        },
      ])
      .select()
      .single();

    if (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error adding sale:", errorMsg);
      throw error;
    }

    const saleId = data.id;

    // Insert sale items
    if (sale.items && sale.items.length > 0) {
      const { data: itemsData } = await supabase
        .from("sale_items")
        .insert(
          sale.items.map((si) => ({
            sale_id: saleId,
            name: si.name,
            quantity: si.quantity,
            price: si.price,
            image: si.image,
          })),
        )
        .select();

      // Insert sale item compositions
      if (itemsData && sale.items.some((si) => si.composition)) {
        for (let i = 0; i < sale.items.length; i++) {
          if (
            sale.items[i].composition &&
            sale.items[i].composition!.length > 0
          ) {
            await supabase.from("sale_item_composition").insert(
              sale.items[i].composition!.map((comp) => ({
                sale_item_id: itemsData[i].id,
                item_id: comp.itemId,
                custom_name: comp.customName,
                custom_price: comp.customPrice,
                quantity: comp.quantity,
              })),
            );
          }
        }
      }
    }

    // Handle credit records
    if (sale.paymentMode === "credit" && sale.customerId) {
      const { error: creditError } = await supabase
        .from("credit_records")
        .insert([
          {
            customer_id: sale.customerId,
            amount: sale.total,
            sale_id: saleId,
            date: new Date().toISOString(),
          },
        ]);

      if (creditError) {
        console.error("Error adding credit record:", creditError);
      }

      // Update customer total credit
      const customer = customers.find((c) => c.id === sale.customerId);
      if (customer) {
        await supabase
          .from("customers")
          .update({ total_credit: customer.totalCredit + sale.total })
          .eq("id", sale.customerId);
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
    const { error } = await supabase
      .from("sales")
      .update({ status })
      .eq("id", saleId);

    if (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error updating sale status:", errorMsg);
      throw error;
    }

    setSales(
      sales.map((sale) => (sale.id === saleId ? { ...sale, status } : sale)),
    );
  };

  const markCashOnDeliveryReceived = async (saleId: string) => {
    const { error } = await supabase
      .from("sales")
      .update({ payment_status: "paid" })
      .eq("id", saleId);

    if (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error marking COD as received:", errorMsg);
      throw error;
    }

    setSales(
      sales.map((sale) =>
        sale.id === saleId ? { ...sale, paymentStatus: "paid" } : sale,
      ),
    );
  };

  const recordPayment = async (saleId: string, amountReceived: number) => {
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
    const { error: saleError } = await supabase
      .from("sales")
      .update({ payment_status: isPaid ? "paid" : "pending" })
      .eq("id", saleId);

    if (saleError) {
      const errorMsg =
        saleError instanceof Error
          ? saleError.message
          : JSON.stringify(saleError);
      console.error("Error recording payment:", errorMsg);
      throw saleError;
    }

    // Update customer total credit
    if (sale.customerId) {
      const customer = customers.find((c) => c.id === sale.customerId);
      if (customer) {
        const newTotalCredit = Math.max(
          0,
          customer.totalCredit - amountReceived,
        );
        const { error: customerError } = await supabase
          .from("customers")
          .update({ total_credit: newTotalCredit })
          .eq("id", sale.customerId);

        if (customerError) {
          const errorMsg =
            customerError instanceof Error
              ? customerError.message
              : JSON.stringify(customerError);
          console.error("Error updating customer credit:", errorMsg);
          throw customerError;
        }
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
  };

  // Load Credit Records
  const loadCreditRecords = async () => {
    const { data, error } = await supabase.from("credit_records").select("*");
    if (error) {
      console.error("Error loading credit records:", error);
      return;
    }

    setCreditRecords(
      data.map((record: any) => ({
        id: record.id,
        customerId: record.customer_id,
        amount: parseFloat(record.amount),
        date: record.date,
        saleId: record.sale_id,
      })),
    );
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
      const { data, error } = await supabase
        .from("delivery_boys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading delivery boys:", error);
        return;
      }

      if (data && data.length > 0) {
        setDeliveryBoys(
          data.map((boy: any) => ({
            id: boy.id,
            name: boy.name,
            phone: boy.phone,
            pin: boy.pin,
            idProofUrl: boy.id_proof_url,
            status: boy.status,
            createdAt: boy.created_at,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading delivery boys:", error);
    }
  };

  // Load Settings
  async function loadSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error loading settings:", error);
      return;
    }

    setSettings({
      id: data.id,
      businessName: data.business_name,
      businessEmail: data.business_email,
      businessPhone: data.business_phone,
      logoUrl: data.logo_url,
      businessAddress: data.business_address,
      businessCity: data.business_city,
      businessState: data.business_state,
      businessZip: data.business_zip,
      taxId: data.tax_id,
      billingEmail: data.billing_email,
      billingName: data.billing_name,
      billingAddress: data.billing_address,
      billingCity: data.billing_city,
      billingState: data.billing_state,
      billingZip: data.billing_zip,
      paymentTerms: data.payment_terms,
      currency: data.currency,
      timezone: data.timezone,
      theme: data.theme,
      language: data.language,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  // Update Settings
  async function updateSettings(updatedSettings: Partial<Settings>) {
    const updateData: Record<string, any> = {};

    // Map camelCase to snake_case for database
    Object.entries(updatedSettings).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (
        snakeKey !== "id" &&
        snakeKey !== "created_at" &&
        snakeKey !== "updated_at"
      ) {
        updateData[snakeKey] = value;
      }
    });

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("settings")
      .update(updateData)
      .eq("id", settings?.id || "");

    if (error) {
      console.error("Error updating settings:", error);
      throw error;
    }

    // Update local state
    if (settings) {
      setSettings({
        ...settings,
        ...updatedSettings,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const addDeliveryBoy = async (
    boy: Omit<DeliveryBoy, "id" | "createdAt">,
    idProofFile?: File,
  ) => {
    let idProofUrl: string | undefined;

    if (idProofFile) {
      const fileExt = idProofFile.name.split(".").pop();
      const fileName = `${boy.phone}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("delivery_boy_id_proofs")
        .upload(fileName, idProofFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading ID proof:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("delivery_boy_id_proofs")
        .getPublicUrl(uploadData.path);

      idProofUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("delivery_boys")
      .insert([
        {
          name: boy.name,
          phone: boy.phone,
          pin: boy.pin,
          id_proof_url: idProofUrl,
          status: boy.status,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding delivery boy:", error);
      throw error;
    }

    const newBoy: DeliveryBoy = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      pin: data.pin,
      idProofUrl: data.id_proof_url,
      status: data.status,
      createdAt: data.created_at,
    };

    setDeliveryBoys([newBoy, ...deliveryBoys]);
    return newBoy;
  };

  const updateDeliveryBoy = async (
    id: string,
    updates: Partial<Omit<DeliveryBoy, "id" | "createdAt">>,
    idProofFile?: File,
  ) => {
    let idProofUrl = updates.idProofUrl;

    if (idProofFile) {
      const fileExt = idProofFile.name.split(".").pop();
      const fileName = `${updates.phone || id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("delivery_boy_id_proofs")
        .upload(fileName, idProofFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading ID proof:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("delivery_boy_id_proofs")
        .getPublicUrl(uploadData.path);

      idProofUrl = publicUrlData.publicUrl;
    }

    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.pin) updateData.pin = updates.pin;
    if (updates.status) updateData.status = updates.status;
    if (idProofUrl) updateData.id_proof_url = idProofUrl;

    const { error } = await supabase
      .from("delivery_boys")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating delivery boy:", error);
      throw error;
    }

    setDeliveryBoys(
      deliveryBoys.map((boy) =>
        boy.id === id ? { ...boy, ...updates, idProofUrl } : boy,
      ),
    );
  };

  const deleteDeliveryBoy = async (id: string) => {
    const { error } = await supabase
      .from("delivery_boys")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting delivery boy:", error);
      throw error;
    }

    setDeliveryBoys(deliveryBoys.filter((boy) => boy.id !== id));
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
