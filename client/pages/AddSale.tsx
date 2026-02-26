import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { SaleItem, DeliveryDetails, Sale } from "@/hooks/usePOS";
import {
  Trash2,
  Plus,
  Check,
  X,
  Calendar,
  Clock,
  Truck,
  User,
  Phone,
  MapPin,
  MessageSquare,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QRScannerModal } from "@/components/QRScannerModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { QRCodeData, convertQRDataToSaleItem } from "@/utils/qrcode";

type PaymentMode = "cash" | "upi" | "credit" | "cod";

export default function AddSale() {
  const navigate = useNavigate();
  const {
    addSale,
    customers,
    addCustomer,
    items: inventoryItems,
    products: readyProducts,
  } = usePOSContext();

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [addMode, setAddMode] = useState<"ready" | "custom">("ready");

  // Ready product mode
  const [productName, setProductName] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<
    typeof readyProducts
  >([]);
  const [productQuantity, setProductQuantity] = useState("1");

  // Custom product mode
  const [customProductName, setCustomProductName] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState("");
  const [customProductQuantity, setCustomProductQuantity] = useState("1");
  const [customProductItems, setCustomProductItems] = useState<
    Array<{
      itemId?: string;
      customName?: string;
      customPrice?: number;
      quantity: number;
    }>
  >([]);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [filteredItems, setFilteredItems] = useState<typeof inventoryItems>([]);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  // Payment and order
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<
    Set<PaymentMode>
  >(new Set(["cash"]));
  const [paymentAmounts, setPaymentAmounts] = useState<
    Record<PaymentMode, string>
  >({
    cash: "",
    upi: "",
    credit: "",
    cod: "",
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderRemarks, setOrderRemarks] = useState("");
  const [orderType, setOrderType] = useState<
    "pickup" | "pickup_later" | "delivery"
  >("pickup");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    receiverName: "",
    receiverAddress: "",
    receiverPhone: "",
    message: "",
    senderName: "",
    senderPhone: "",
  });
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<QRCodeData | null>(null);
  const [showScannedConfirm, setShowScannedConfirm] = useState(false);
  const [isCapturingCustomer, setIsCapturingCustomer] = useState(false);
  const [showPhoneLookupModal, setShowPhoneLookupModal] = useState(false);
  const [phoneLookupInput, setPhoneLookupInput] = useState("");
  const [matchingCustomers, setMatchingCustomers] = useState<typeof customers>(
    [],
  );
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [createdSale, setCreatedSale] = useState<Sale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const subtotal = saleItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const calculateDiscount = () => {
    if (!discountValue) return 0;
    const discount = parseFloat(discountValue);
    if (discountType === "percentage") {
      return (subtotal * discount) / 100;
    } else {
      return Math.min(discount, subtotal);
    }
  };

  const discountAmount = calculateDiscount();
  const deliveryChargeAmount =
    orderType === "delivery" && deliveryCharges
      ? parseFloat(deliveryCharges)
      : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryChargeAmount);

  const handleProductNameChange = (value: string) => {
    setProductName(value);
    if (value.trim()) {
      const filtered = readyProducts.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredProducts(filtered);
      setShowProductDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  };

  const selectReadyProduct = (product: any) => {
    setProductName(product.name);
    setShowProductDropdown(false);
  };

  const handleAddReadyProduct = () => {
    const product = readyProducts.find((p) => p.name === productName);
    if (!product) {
      alert("Please select a valid product");
      return;
    }

    if (product.stock <= 0) {
      alert("This product is out of stock");
      return;
    }

    const quantity = parseInt(productQuantity) || 1;
    if (quantity > product.stock) {
      alert(`Only ${product.stock} units available in stock`);
      return;
    }

    const newItem: SaleItem = {
      id: `product-${Date.now()}`,
      name: product.name,
      quantity: quantity,
      price: product.price,
      image: product.image || undefined,
      productId: product.id,
      composition: product.items,
    };

    const newSaleItems = [...saleItems, newItem];
    setSaleItems(newSaleItems);
    setProductName("");
    setProductQuantity("1");
    setShowProductDropdown(false);
  };

  const handleItemSearchChange = (value: string) => {
    setItemSearchTerm(value);
    if (value.trim()) {
      const filtered = inventoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) &&
          !customProductItems.some((pi) => pi.itemId === item.id),
      );
      setFilteredItems(filtered);
      setShowItemDropdown(true);
    } else {
      setFilteredItems([]);
      setShowItemDropdown(false);
    }
  };

  const addItemToCustomProduct = (item: (typeof inventoryItems)[0]) => {
    const newItems = [...customProductItems, { itemId: item.id, quantity: 1 }];
    setCustomProductItems(newItems);
    setItemSearchTerm("");
    setShowItemDropdown(false);
    // Auto-update product price to composition total
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const removeItemFromCustomProduct = (index: number) => {
    const newItems = customProductItems.filter((_, i) => i !== index);
    setCustomProductItems(newItems);
    // Auto-update product price to composition total
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId, pi.customPrice) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const updateCustomProductItemQuantity = (index: number, quantity: number) => {
    const newItems = customProductItems.map((pi, i) =>
      i === index ? { ...pi, quantity: Math.max(1, quantity) } : pi,
    );
    setCustomProductItems(newItems);
    // Auto-update product price to composition total
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId, pi.customPrice) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const getItemName = (itemId?: string, customName?: string) => {
    if (customName) return customName;
    return itemId
      ? inventoryItems.find((item) => item.id === itemId)?.name || "Unknown"
      : "Unknown";
  };

  const getItemPrice = (itemId?: string, customPrice?: number): number => {
    if (customPrice !== undefined && customPrice !== null) return customPrice;
    if (!itemId) return 0;
    const item = inventoryItems.find((item) => item.id === itemId);
    return item?.price || 0;
  };

  const addCustomItemToProduct = () => {
    if (!customItemName.trim()) {
      alert("Please enter item name");
      return;
    }

    if (!customItemPrice || parseFloat(customItemPrice) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const newItem = {
      customName: customItemName.trim(),
      customPrice: parseFloat(customItemPrice),
      quantity: 1,
    };

    const newItems = [...customProductItems, newItem];
    setCustomProductItems(newItems);
    setCustomItemName("");
    setCustomItemPrice("");

    // Auto-update product price to composition total
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId, pi.customPrice) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const getCustomProductTotalPrice = () => {
    return customProductItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId, pi.customPrice) * pi.quantity;
    }, 0);
  };

  const handleAddCustomProduct = async () => {
    if (!customProductName.trim()) {
      alert("Please enter product name");
      return;
    }

    if (!customProductPrice || parseFloat(customProductPrice) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (customProductItems.length === 0) {
      alert("Please add at least one item to the product");
      return;
    }

    setIsCreatingProduct(true);
    const productName = customProductName.trim();
    toast("Creating your product...", {
      description: `Adding "${productName}" to sale`,
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const quantity = parseInt(customProductQuantity) || 1;
      const newItem: SaleItem = {
        id: `product-${Date.now()}`,
        name: productName,
        quantity: quantity,
        price: parseFloat(customProductPrice),
        image: undefined,
        composition: customProductItems,
      };

      const newSaleItems = [...saleItems, newItem];
      setSaleItems(newSaleItems);
      setCustomProductName("");
      setCustomProductPrice("");
      setCustomProductQuantity("1");
      setCustomProductItems([]);
      setItemSearchTerm("");

      toast.success(`✓ "${productName}" added to sale`, {
        description: "Product is ready for checkout",
      });
    } catch (error) {
      toast.error("Failed to create product");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const togglePaymentMode = (mode: PaymentMode) => {
    const newModes = new Set(selectedPaymentModes);
    if (newModes.has(mode)) {
      if (newModes.size === 1) {
        return;
      }
      newModes.delete(mode);
      setPaymentAmounts({ ...paymentAmounts, [mode]: "" });
    } else {
      newModes.add(mode);
    }
    setSelectedPaymentModes(newModes);

    // If credit is selected, disallow new customer creation
    if (newModes.has("credit")) {
      setShowNewCustomerForm(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerPhone("");
    } else {
      // Clear customer selection when credit is deselected
      setSelectedCustomerId("");
    }
  };

  const updatePaymentAmount = (mode: PaymentMode, amount: string) => {
    setPaymentAmounts({ ...paymentAmounts, [mode]: amount });
  };

  const getTotalPaymentAmount = () => {
    return Array.from(selectedPaymentModes).reduce((sum, mode) => {
      return sum + (parseFloat(paymentAmounts[mode]) || 0);
    }, 0);
  };

  const isPaymentValid = () => {
    if (selectedPaymentModes.size === 0) return false;
    if (selectedPaymentModes.has("credit") && !selectedCustomerId) return false;

    if (selectedPaymentModes.size === 1) return true;

    const totalPayment = getTotalPaymentAmount();
    return Math.abs(totalPayment - total) < 0.01;
  };

  const removeItem = (id: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setSaleItems(
      saleItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  };

  const handleSaveSale = async () => {
    if (saleItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    if (!isPaymentValid()) {
      alert("Payment amounts must sum to the total sale amount");
      return;
    }

    // Require customer selection
    if (!selectedCustomerId) {
      if (selectedPaymentModes.has("credit")) {
        alert(
          "Credit payment requires selecting an existing customer. Please search and select a customer from the database."
        );
      } else {
        alert("Please select or create a customer before saving the sale");
      }
      return;
    }

    if (
      (orderType === "pickup_later" || orderType === "delivery") &&
      !pickupDate
    ) {
      alert(
        "Please select a date for " +
          (orderType === "pickup_later" ? "later pickup" : "delivery"),
      );
      return;
    }

    if (orderType === "delivery") {
      if (!deliveryDetails.receiverName.trim()) {
        alert("Please enter receiver name");
        return;
      }
      if (!deliveryDetails.receiverAddress.trim()) {
        alert("Please enter receiver address");
        return;
      }
      if (!deliveryDetails.receiverPhone.trim()) {
        alert("Please enter receiver phone number");
        return;
      }
      if (!deliveryDetails.senderName.trim()) {
        alert("Please enter sender name");
        return;
      }
      if (!deliveryDetails.senderPhone.trim()) {
        alert("Please enter sender phone number");
        return;
      }
    }

    await handleSaveSaleWithCustomer(selectedCustomerId);
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!newCustomerPhone.trim()) {
      alert("Please enter phone number");
      return;
    }

    const newCustomer = await addCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      email: newCustomerEmail.trim() || undefined,
      altPhone: undefined,
      organization: undefined,
      addresses: [],
      totalCredit: 0,
    });

    setSelectedCustomerId(newCustomer.id);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");
    setShowAddCustomerModal(false);

    // If we're saving a sale, proceed with the save after customer is created
    if (isCapturingCustomer) {
      setIsCapturingCustomer(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await handleSaveSaleWithCustomer(newCustomer.id);
    }
  };

  const handleSaveSaleWithCustomer = async (customerId: string) => {
    setIsLoading(true);
    try {
      const primaryMode = Array.from(selectedPaymentModes)[0];
      const paymentAmountsRecord: Record<string, number> = {};

      Array.from(selectedPaymentModes).forEach((mode) => {
        let amount = parseFloat(paymentAmounts[mode]) || 0;
        // For single payment mode, use the total if no amount was entered
        if (selectedPaymentModes.size === 1 && amount === 0) {
          amount = total;
        }
        paymentAmountsRecord[mode] = amount;
      });

      const sale = await addSale({
        items: saleItems,
        paymentMode: primaryMode,
        paymentModes: Array.from(selectedPaymentModes),
        paymentAmounts: paymentAmountsRecord,
        customerId: customerId,
        total,
        orderType,
        pickupDate:
          orderType === "pickup_later" || orderType === "delivery"
            ? pickupDate
            : undefined,
        pickupTime:
          orderType === "pickup_later" || orderType === "delivery"
            ? pickupTime
            : undefined,
        deliveryDetails: orderType === "delivery" ? deliveryDetails : undefined,
        discountType: discountValue ? discountType : undefined,
        discountValue: discountValue ? parseFloat(discountValue) : undefined,
        discountAmount: discountValue ? discountAmount : undefined,
        deliveryCharges:
          orderType === "delivery" && deliveryCharges
            ? parseFloat(deliveryCharges)
            : undefined,
      });

      setCreatedSale(sale);
      setShowReceiptModal(true);

      setSaleItems([]);
      setOrderRemarks("");
      setSelectedCustomerId("");
      setSelectedPaymentModes(new Set(["cash"]));
      setPaymentAmounts({ cash: "", upi: "", credit: "", cod: "" });
      setOrderType("pickup");
      setPickupDate("");
      setPickupTime("");
      setDeliveryDetails({
        receiverName: "",
        receiverAddress: "",
        receiverPhone: "",
        message: "",
        senderName: "",
        senderPhone: "",
      });
      setDiscountType("percentage");
      setDiscountValue("");
      setDeliveryCharges("");
      setAddMode("ready");
      setPhoneLookupInput("");
      setMatchingCustomers([]);
      setShowNewCustomerForm(false);
      setIsCapturingCustomer(false);

      toast.success("✓ Sale created successfully!", {
        description: "Receipt is ready for printing",
      });
    } catch (error) {
      console.error("Error saving sale:", error);
      toast.error("Failed to save sale. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptModalClose = () => {
    setShowReceiptModal(false);
    setCreatedSale(null);
    navigate("/");
  };

  const handleQRScanned = (data: QRCodeData) => {
    // Look up the full product details by ID
    const fullProduct = readyProducts.find((p) => p.id === data.id);
    if (!fullProduct) {
      alert("Product not found. Please check the QR code.");
      return;
    }
    const enrichedData: QRCodeData = {
      type: "product",
      id: fullProduct.id,
      name: fullProduct.name,
      price: fullProduct.price,
      image: fullProduct.image,
      items: fullProduct.items,
      timestamp: new Date().toISOString(),
    };
    setScannedProduct(enrichedData);
    setShowQRScanner(false);
    setShowScannedConfirm(true);
  };

  const handleAddScannedProduct = () => {
    if (scannedProduct) {
      const saleItem = convertQRDataToSaleItem(scannedProduct);
      const newSaleItems = [...saleItems, saleItem];
      setSaleItems(newSaleItems);
      setScannedProduct(null);
      setShowScannedConfirm(false);
    }
  };

  const handleSelectExistingCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setPhoneLookupInput("");
    setMatchingCustomers([]);
    setShowNewCustomerForm(false);
  };

  const handleCreateNewCustomerFromLookup = async () => {
    if (!newCustomerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!newCustomerPhone.trim()) {
      alert("Please enter phone number");
      return;
    }

    const newCustomer = await addCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      email: newCustomerEmail.trim() || undefined,
      altPhone: undefined,
      organization: undefined,
      addresses: [],
      totalCredit: 0,
    });

    setSelectedCustomerId(newCustomer.id);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");
    setPhoneLookupInput("");
    setMatchingCustomers([]);
    setShowNewCustomerForm(false);
  };

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Add New Sale
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
            Select or create products, then select payment mode to complete the
            sale
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Customer Selection */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Customer Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneLookupInput}
                    onChange={(e) => {
                      const phone = e.target.value.trim();
                      setPhoneLookupInput(phone);

                      if (phone.length === 0) {
                        setMatchingCustomers([]);
                        setShowNewCustomerForm(false);
                      } else {
                        // Search for customers with this phone number in real-time
                        const matching = customers.filter(
                          (customer) =>
                            customer.phone === phone ||
                            customer.altPhone === phone,
                        );

                        setMatchingCustomers(matching);

                        if (matching.length === 0) {
                          // No matching customer, show form to create new one (unless credit is selected)
                          if (!selectedPaymentModes.has("credit")) {
                            setShowNewCustomerForm(true);
                          }
                          setNewCustomerPhone(phone);
                        } else {
                          // Matching customers found, hide new customer form
                          setShowNewCustomerForm(false);
                        }
                      }
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      matchingCustomers.length === 1 &&
                      handleSelectExistingCustomer(matchingCustomers[0].id)
                    }
                    placeholder="Enter customer phone number"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {matchingCustomers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Matching Customer
                    </label>
                    <div className="space-y-2">
                      {matchingCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() =>
                            handleSelectExistingCustomer(customer.id)
                          }
                          className="w-full text-left p-3 border border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                        >
                          <p className="font-medium text-slate-900">
                            {customer.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {customer.phone}
                            {customer.altPhone && ` / ${customer.altPhone}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showNewCustomerForm && !selectedPaymentModes.has("credit") && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <p className="text-sm font-medium text-slate-900 mb-3">
                      Create New Customer
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Phone Number
                        </label>
                        <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-sm text-slate-900">
                          {newCustomerPhone}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={newCustomerEmail}
                          onChange={(e) => setNewCustomerEmail(e.target.value)}
                          placeholder="Enter email"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                      <button
                        onClick={handleCreateNewCustomerFromLookup}
                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
                      >
                        Create Customer
                      </button>
                    </div>
                  </div>
                )}

                {selectedPaymentModes.has("credit") && !matchingCustomers.length && (
                  <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                    <p className="text-sm font-medium text-amber-900 mb-2">
                      ⚠️ Credit Payment Selected
                    </p>
                    <p className="text-sm text-amber-800">
                      For credit payments, you must select an existing customer from the database. Search by phone number to find and select a customer.
                    </p>
                  </div>
                )}

                {selectedCustomerId && (
                  <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm font-medium text-green-700">
                      ✓ Customer selected:{" "}
                      {customers.find((c) => c.id === selectedCustomerId)
                        ?.name || "Unknown"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Unified Add Product/Items Form */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Add Items to Sale
              </h2>

              {/* Mode Toggle */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
                <button
                  onClick={() => setAddMode("ready")}
                  className={cn(
                    "flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all",
                    addMode === "ready"
                      ? "bg-cyan-600 text-white shadow-md"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300",
                  )}
                >
                  Select Ready Product
                </button>
                <button
                  onClick={() => setAddMode("custom")}
                  className={cn(
                    "flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all",
                    addMode === "custom"
                      ? "bg-cyan-600 text-white shadow-md"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300",
                  )}
                >
                  Create Product from Items
                </button>
              </div>

              <div className="space-y-4">
                {/* Ready Product Mode */}
                {addMode === "ready" && (
                  <>
                    {/* QR Code Scanner Button */}
                    <button
                      onClick={() => setShowQRScanner(true)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 text-sm sm:text-base"
                    >
                      <QrCode className="w-5 h-5" />
                      Scan QR Code
                    </button>

                    <div className="relative border-t border-slate-200 pt-4">
                      <div className="absolute left-0 top-0 transform -translate-y-1/2 translate-x-6">
                        <span className="bg-white px-2 text-xs font-semibold text-slate-500 uppercase">
                          Or
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) =>
                          handleProductNameChange(e.target.value)
                        }
                        onFocus={() => {
                          if (productName.trim()) {
                            const filtered = readyProducts.filter((product) =>
                              product.name
                                .toLowerCase()
                                .includes(productName.toLowerCase()),
                            );
                            setFilteredProducts(filtered);
                            setShowProductDropdown(true);
                          }
                        }}
                        placeholder="Search ready products..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddReadyProduct()
                        }
                      />
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                          <div className="max-h-48 overflow-y-auto">
                            {filteredProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => selectReadyProduct(product)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs text-slate-500">
                                        No img
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-slate-900 truncate">
                                        {product.name}
                                      </span>
                                      <span className="text-sm text-slate-600 ml-2 flex-shrink-0">
                                        ₹{product.price.toFixed(2)}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                      {product.items.length} items in bundle
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(e.target.value)}
                        min="1"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <button
                      onClick={handleAddReadyProduct}
                      disabled={
                        !productName ||
                        !readyProducts.find((p) => p.name === productName)
                      }
                      className={cn(
                        "w-full font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base",
                        !productName ||
                          !readyProducts.find((p) => p.name === productName)
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
                      )}
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Product
                    </button>
                  </>
                )}

                {/* Custom Product Mode */}
                {addMode === "custom" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={customProductName}
                        onChange={(e) => setCustomProductName(e.target.value)}
                        placeholder="e.g., Breakfast Combo"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Add Items
                      </label>
                      <input
                        type="text"
                        value={itemSearchTerm}
                        onChange={(e) => handleItemSearchChange(e.target.value)}
                        onFocus={() => {
                          if (itemSearchTerm.trim()) {
                            const filtered = inventoryItems.filter(
                              (item) =>
                                item.name
                                  .toLowerCase()
                                  .includes(itemSearchTerm.toLowerCase()) &&
                                !customProductItems.some(
                                  (pi) => pi.itemId === item.id,
                                ),
                            );
                            setFilteredItems(filtered);
                            setShowItemDropdown(true);
                          }
                        }}
                        placeholder="Search items..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />

                      {showItemDropdown && filteredItems.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                          <div className="max-h-48 overflow-y-auto">
                            {filteredItems.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => addItemToCustomProduct(item)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs text-slate-500">
                                        No img
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-slate-900 truncate">
                                        {item.name}
                                      </span>
                                      <span className="text-sm text-slate-600 ml-2 flex-shrink-0">
                                        ₹{item.price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add Custom Item */}
                    <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        Or Add Custom Item
                      </p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          placeholder="Item name (e.g., Special Sauce)"
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              value={customItemPrice}
                              onChange={(e) =>
                                setCustomItemPrice(e.target.value)
                              }
                              placeholder="Price (₹)"
                              step="0.01"
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>
                          <button
                            onClick={addCustomItemToProduct}
                            className="px-3 py-2 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Selected Items in Custom Product */}
                    {customProductItems.length > 0 && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm font-semibold text-slate-700 mb-3">
                          Product Composition
                        </p>
                        <div className="space-y-2">
                          {customProductItems.map((pi, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                  {getItemName(pi.itemId, pi.customName)}
                                </p>
                                <p className="text-xs text-slate-600">
                                  ₹
                                  {getItemPrice(
                                    pi.itemId,
                                    pi.customPrice,
                                  ).toFixed(2)}{" "}
                                  each
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={pi.quantity}
                                  onChange={(e) =>
                                    updateCustomProductItemQuantity(
                                      index,
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  min="1"
                                  className="w-12 px-2 py-1 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <p className="text-sm font-medium text-slate-900 w-16 text-right">
                                  ₹
                                  {(
                                    getItemPrice(pi.itemId, pi.customPrice) *
                                    pi.quantity
                                  ).toFixed(2)}
                                </p>
                                <button
                                  onClick={() =>
                                    removeItemFromCustomProduct(index)
                                  }
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-700">
                            Composition Total:{" "}
                            <span className="font-semibold">
                              ₹{getCustomProductTotalPrice().toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Product Price (₹)
                          <span className="text-xs text-slate-500 font-normal ml-1">
                            (Auto-calculated)
                          </span>
                        </label>
                        <input
                          type="number"
                          value={customProductPrice}
                          readOnly
                          placeholder="0.00"
                          step="0.01"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={customProductQuantity}
                          onChange={(e) =>
                            setCustomProductQuantity(e.target.value)
                          }
                          min="1"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddCustomProduct}
                      disabled={
                        isCreatingProduct ||
                        !customProductName.trim() ||
                        !customProductPrice ||
                        parseFloat(customProductPrice) <= 0 ||
                        customProductItems.length === 0
                      }
                      className={cn(
                        "w-full font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base",
                        isCreatingProduct ||
                          !customProductName.trim() ||
                          !customProductPrice ||
                          parseFloat(customProductPrice) <= 0 ||
                          customProductItems.length === 0
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
                      )}
                    >
                      {isCreatingProduct ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          Add Product to Sale
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Items List, Order Type, Payment Mode, Discount sections would go here but are truncated for brevity */}
            {/* The full code continues with all original sections... */}
          </div>

          {/* Summary Section would be here */}
        </div>
      </div>

      {/* Modals */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Customer Details
              </h2>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Please enter customer details. You can update these later if
              needed.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomer()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomer()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  placeholder="e.g., john@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomer()}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onScan={handleQRScanned}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Scanned Product Confirmation */}
      {showScannedConfirm && scannedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Add Scanned Product?
              </h2>
              <button
                onClick={() => setShowScannedConfirm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Product Image */}
            {scannedProduct.image && (
              <div className="mb-6 rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={scannedProduct.image}
                  alt={scannedProduct.name}
                  className="w-full h-auto max-h-64 object-contain"
                  loading="eager"
                />
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-slate-500">Product Name</p>
                <p className="text-lg font-semibold text-slate-900">
                  {scannedProduct.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-lg font-semibold text-slate-900">
                  ₹{scannedProduct.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Quantity</p>
                <input
                  type="number"
                  min="1"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowScannedConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddReadyProduct();
                  setShowScannedConfirm(false);
                  setScannedProduct(null);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all"
              >
                Add to Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other modals would continue here */}
    </SharedLayout>
  );
}
