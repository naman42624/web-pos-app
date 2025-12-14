import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import { SaleItem, DeliveryDetails } from "@/hooks/usePOS";
import { Trash2, Plus, Check, X, Calendar, Clock, Truck, User, Phone, MapPin, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMode = "cash" | "upi" | "credit";

export default function AddSale() {
  const navigate = useNavigate();
  const { addSale, customers, addCustomer, items: inventoryItems, products: readyProducts } = usePOSContext();

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [addMode, setAddMode] = useState<"ready" | "custom">("ready");

  // Ready product mode
  const [productName, setProductName] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<typeof readyProducts>([]);
  const [productQuantity, setProductQuantity] = useState("1");

  // Custom product mode
  const [customProductName, setCustomProductName] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState("");
  const [customProductQuantity, setCustomProductQuantity] = useState("1");
  const [customProductItems, setCustomProductItems] = useState<Array<{ itemId: string; quantity: number }>>([]);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [filteredItems, setFilteredItems] = useState<typeof inventoryItems>([]);

  // Payment and order
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<Set<PaymentMode>>(new Set(["cash"]));
  const [paymentAmounts, setPaymentAmounts] = useState<Record<PaymentMode, string>>({
    cash: "",
    upi: "",
    credit: "",
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderRemarks, setOrderRemarks] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "pickup_later" | "delivery">("pickup");
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
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");

  const subtotal = saleItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

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
  const deliveryChargeAmount = orderType === "delivery" && deliveryCharges ? parseFloat(deliveryCharges) : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryChargeAmount);

  const handleProductNameChange = (value: string) => {
    setProductName(value);
    if (value.trim()) {
      const filtered = readyProducts.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
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

    const quantity = parseInt(productQuantity) || 1;
    const newItem: SaleItem = {
      id: `product-${Date.now()}`,
      name: product.name,
      quantity: quantity,
      price: product.price,
      image: product.image || undefined,
    };

    setSaleItems([...saleItems, newItem]);
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
          !customProductItems.some((pi) => pi.itemId === item.id)
      );
      setFilteredItems(filtered);
      setShowItemDropdown(true);
    } else {
      setFilteredItems([]);
      setShowItemDropdown(false);
    }
  };

  const addItemToCustomProduct = (item: typeof inventoryItems[0]) => {
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

  const removeItemFromCustomProduct = (itemId: string) => {
    const newItems = customProductItems.filter((pi) => pi.itemId !== itemId);
    setCustomProductItems(newItems);
    // Auto-update product price to composition total
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const updateCustomProductItemQuantity = (itemId: string, quantity: number) => {
    const newItems = customProductItems.map((pi) =>
      pi.itemId === itemId ? { ...pi, quantity: Math.max(1, quantity) } : pi
    );
    setCustomProductItems(newItems);
    // Auto-update product price to composition total
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const getItemName = (itemId: string) => {
    return inventoryItems.find((item) => item.id === itemId)?.name || "Unknown";
  };

  const getItemPrice = (itemId: string) => {
    return inventoryItems.find((item) => item.id === itemId)?.price || 0;
  };

  const getCustomProductTotalPrice = () => {
    return customProductItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId) * pi.quantity;
    }, 0);
  };

  const handleAddCustomProduct = () => {
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

    const quantity = parseInt(customProductQuantity) || 1;
    const newItem: SaleItem = {
      id: `product-${Date.now()}`,
      name: customProductName.trim(),
      quantity: quantity,
      price: parseFloat(customProductPrice),
      image: undefined,
    };

    setSaleItems([...saleItems, newItem]);
    setCustomProductName("");
    setCustomProductPrice("");
    setCustomProductQuantity("1");
    setCustomProductItems([]);
    setItemSearchTerm("");
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

    if (mode !== "credit" && !newModes.has("credit")) {
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
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
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

    if (selectedPaymentModes.has("credit") && !selectedCustomerId) {
      alert("Please select a customer for credit sale");
      return;
    }

    if ((orderType === "pickup_later" || orderType === "delivery") && !pickupDate) {
      alert("Please select a date for " + (orderType === "pickup_later" ? "later pickup" : "delivery"));
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

    setIsLoading(true);
    try {
      const primaryMode = Array.from(selectedPaymentModes)[0];
      addSale({
        items: saleItems,
        paymentMode: primaryMode,
        customerId: selectedPaymentModes.has("credit") ? selectedCustomerId : undefined,
        total,
        orderType,
        pickupDate: (orderType === "pickup_later" || orderType === "delivery") ? pickupDate : undefined,
        pickupTime: (orderType === "pickup_later" || orderType === "delivery") ? pickupTime : undefined,
        deliveryDetails: orderType === "delivery" ? deliveryDetails : undefined,
        discountType: discountValue ? discountType : undefined,
        discountValue: discountValue ? parseFloat(discountValue) : undefined,
        discountAmount: discountValue ? discountAmount : undefined,
        deliveryCharges: orderType === "delivery" && deliveryCharges ? parseFloat(deliveryCharges) : undefined,
      });

      setSaleItems([]);
      setOrderRemarks("");
      setSelectedCustomerId("");
      setSelectedPaymentModes(new Set(["cash"]));
      setPaymentAmounts({ cash: "", upi: "", credit: "" });
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
      setProductName("");
      setProductQuantity("1");
      setCustomProductName("");
      setCustomProductPrice("");
      setCustomProductQuantity("1");
      setCustomProductItems([]);

      setTimeout(() => {
        setIsLoading(false);
        navigate("/");
      }, 500);
    } catch (error) {
      console.error("Error saving sale:", error);
      setIsLoading(false);
      alert("Error saving sale");
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!newCustomerPhone.trim()) {
      alert("Please enter phone number");
      return;
    }

    const newCustomer = addCustomer({
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
  };

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Sale</h1>
          <p className="text-slate-500 mt-2">
            Select or create products, then select payment mode to complete the sale
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unified Add Product/Items Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Add Items to Sale
              </h2>

              {/* Mode Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setAddMode("ready")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
                    addMode === "ready"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  )}
                >
                  Select Ready Product
                </button>
                <button
                  onClick={() => setAddMode("custom")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
                    addMode === "custom"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  )}
                >
                  Create Product from Items
                </button>
              </div>

              <div className="space-y-4">
                {/* Ready Product Mode */}
                {addMode === "ready" && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => handleProductNameChange(e.target.value)}
                        onFocus={() => {
                          if (productName.trim()) {
                            const filtered = readyProducts.filter((product) =>
                              product.name.toLowerCase().includes(productName.toLowerCase())
                            );
                            setFilteredProducts(filtered);
                            setShowProductDropdown(true);
                          }
                        }}
                        placeholder="Search ready products..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleAddReadyProduct()}
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
                                      <span className="text-xs text-slate-500">No img</span>
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
                      disabled={!productName || !readyProducts.find((p) => p.name === productName)}
                      className={cn(
                        "w-full font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
                        !productName || !readyProducts.find((p) => p.name === productName)
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      )}
                    >
                      <Plus className="w-5 h-5" />
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
                                item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) &&
                                !customProductItems.some((pi) => pi.itemId === item.id)
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
                                      <span className="text-xs text-slate-500">No img</span>
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

                    {/* Selected Items in Custom Product */}
                    {customProductItems.length > 0 && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-sm font-semibold text-slate-700 mb-3">
                          Product Composition
                        </p>
                        <div className="space-y-2">
                          {customProductItems.map((pi) => (
                            <div
                              key={pi.itemId}
                              className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                  {getItemName(pi.itemId)}
                                </p>
                                <p className="text-xs text-slate-600">
                                  ₹{getItemPrice(pi.itemId).toFixed(2)} each
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={pi.quantity}
                                  onChange={(e) =>
                                    updateCustomProductItemQuantity(
                                      pi.itemId,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  min="1"
                                  className="w-12 px-2 py-1 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <p className="text-sm font-medium text-slate-900 w-16 text-right">
                                  ₹{(getItemPrice(pi.itemId) * pi.quantity).toFixed(2)}
                                </p>
                                <button
                                  onClick={() => removeItemFromCustomProduct(pi.itemId)}
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
                            Composition Total: <span className="font-semibold">₹{getCustomProductTotalPrice().toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Product Price (₹)
                          <span className="text-xs text-slate-500 font-normal ml-1">(Auto-calculated)</span>
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
                          onChange={(e) => setCustomProductQuantity(e.target.value)}
                          min="1"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddCustomProduct}
                      disabled={
                        !customProductName.trim() ||
                        !customProductPrice ||
                        parseFloat(customProductPrice) <= 0 ||
                        customProductItems.length === 0
                      }
                      className={cn(
                        "w-full font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
                        !customProductName.trim() ||
                          !customProductPrice ||
                          parseFloat(customProductPrice) <= 0 ||
                          customProductItems.length === 0
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      )}
                    >
                      <Plus className="w-5 h-5" />
                      Add Product to Sale
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Sale Items</h2>

              {saleItems.length > 0 ? (
                <div className="space-y-3">
                  {saleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-slate-500">No img</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {item.quantity} × ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <p className="font-bold text-slate-900 w-20 text-right">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">
                  No items added yet
                </p>
              )}
            </div>

            {/* Order Type Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Order Type
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {(["pickup", "pickup_later", "delivery"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setOrderType(type);
                      if (type === "pickup") {
                        setPickupDate("");
                        setPickupTime("");
                      }
                    }}
                    className={cn(
                      "relative p-4 rounded-lg border-2 font-semibold text-center transition-all duration-200",
                      orderType === type
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    )}
                  >
                    {orderType === type && (
                      <Check className="w-5 h-5 absolute top-2 right-2" />
                    )}
                    <span className="block">
                      {type === "pickup" && "Pick Up"}
                      {type === "pickup_later" && "Pick Up Later"}
                      {type === "delivery" && "Delivery"}
                    </span>
                  </button>
                ))}
              </div>

              {(orderType === "pickup_later" || orderType === "delivery") && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {orderType === "pickup_later" ? "Pickup Date" : "Delivery Date"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {orderType === "pickup_later" ? "Pickup Time" : "Delivery Time"}
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}

              {orderType === "delivery" && (
                <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg mt-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-amber-600" />
                    Delivery Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Receiver Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryDetails.receiverName}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, receiverName: e.target.value })}
                        placeholder="e.g., John Doe"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Receiver Phone No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={deliveryDetails.receiverPhone}
                        onChange={(e) => setDeliveryDetails({ ...deliveryDetails, receiverPhone: e.target.value })}
                        placeholder="e.g., 9876543210"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Receiver Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={deliveryDetails.receiverAddress}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, receiverAddress: e.target.value })}
                      placeholder="Enter complete delivery address"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message (Optional)
                    </label>
                    <textarea
                      value={deliveryDetails.message}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, message: e.target.value })}
                      placeholder="Add any special instructions or delivery notes"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="border-t border-amber-200 pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Sender Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Sender Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={deliveryDetails.senderName}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, senderName: e.target.value })}
                          placeholder="e.g., Jane Smith"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Sender Phone No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={deliveryDetails.senderPhone}
                          onChange={(e) => setDeliveryDetails({ ...deliveryDetails, senderPhone: e.target.value })}
                          placeholder="e.g., 9876543210"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-amber-200 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Delivery Charges (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-medium">₹</span>
                      <input
                        type="number"
                        value={deliveryCharges}
                        onChange={(e) => setDeliveryCharges(e.target.value)}
                        placeholder="e.g., 50"
                        step="0.01"
                        min="0"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Leave blank if no delivery charges apply
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Mode Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Payment Mode
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {(["cash", "upi", "credit"] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => togglePaymentMode(mode)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 font-semibold text-center transition-all duration-200",
                      selectedPaymentModes.has(mode)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    )}
                  >
                    {selectedPaymentModes.has(mode) && (
                      <Check className="w-5 h-5 absolute top-2 right-2" />
                    )}
                    <span className="capitalize block">{mode}</span>
                  </button>
                ))}
              </div>

              {selectedPaymentModes.size > 1 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 mb-4">
                    Enter amount for each payment method (must sum to ₹{total.toFixed(2)})
                  </p>
                  <div className="space-y-3">
                    {Array.from(selectedPaymentModes).map((mode) => (
                      <div key={mode} className="flex items-center gap-3">
                        <label className="min-w-20 text-sm font-medium text-slate-700 capitalize">
                          {mode}:
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-600">₹</span>
                          <input
                            type="number"
                            value={paymentAmounts[mode]}
                            onChange={(e) => updatePaymentAmount(mode, e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-white rounded border border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Entered:</span>
                      <span className={cn(
                        "font-semibold",
                        Math.abs(getTotalPaymentAmount() - total) < 0.01
                          ? "text-green-600"
                          : "text-red-600"
                      )}>
                        ₹{getTotalPaymentAmount().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Expected Total:</span>
                      <span className="font-semibold text-slate-900">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentModes.has("credit") && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Select Customer
                    </label>
                    <button
                      onClick={() => setShowAddCustomerModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add New
                    </button>
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} (₹{customer.totalCredit.toLocaleString(
                          "en-IN"
                        )})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Discount Section */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-4 font-semibold">
                  Discount (Optional)
                </label>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setDiscountType("percentage")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
                      discountType === "percentage"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    )}
                  >
                    % Percentage
                  </button>
                  <button
                    onClick={() => setDiscountType("fixed")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
                      discountType === "fixed"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    )}
                  >
                    ₹ Fixed Amount
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {discountType === "percentage" ? "Discount (%)" : "Discount (₹)"}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "e.g., 10" : "e.g., 100"}
                    step={discountType === "percentage" ? "0.1" : "0.01"}
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {discountValue && (
                    <p className="text-sm text-slate-600 mt-2">
                      Discount Amount: ₹{discountAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Remarks */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Order Remarks
                </label>
                <textarea
                  value={orderRemarks}
                  onChange={(e) => setOrderRemarks(e.target.value)}
                  placeholder="Add any special instructions or notes for this order..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Summary</h2>

              <div className="space-y-3 border-b border-blue-200 pb-6">
                {saleItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {discountValue && (
                  <div className="flex justify-between text-amber-600 text-sm">
                    <span>Discount ({discountType === "percentage" ? `${discountValue}%` : `₹${discountValue}`})</span>
                    <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {deliveryChargeAmount > 0 && (
                  <div className="flex justify-between text-orange-600 text-sm">
                    <span>Delivery Charges</span>
                    <span className="font-medium">+₹{deliveryChargeAmount.toFixed(2)}</span>
                  </div>
                )}

                {selectedPaymentModes.size === 1 ? (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {Array.from(selectedPaymentModes)[0]}
                    </span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <p className="text-xs text-slate-500 font-medium mb-2">Payment Breakdown</p>
                    <div className="space-y-1">
                      {Array.from(selectedPaymentModes).map((mode) => {
                        const amount = parseFloat(paymentAmounts[mode]) || 0;
                        return (
                          <div key={mode} className="flex justify-between text-sm">
                            <span className="text-slate-600 capitalize">{mode}:</span>
                            <span className="font-medium text-slate-900">
                              ₹{amount.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(orderType === "pickup_later" || orderType === "delivery") && (
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      {orderType === "pickup_later" ? "Pickup" : "Delivery"}
                    </p>
                    <p className="text-sm text-slate-700 bg-white rounded px-2 py-1">
                      {pickupDate && new Date(pickupDate).toLocaleDateString("en-IN")} {pickupTime && `at ${pickupTime}`}
                    </p>
                  </div>
                )}

                {orderType === "delivery" && deliveryDetails.receiverName && (
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <p className="text-xs text-slate-500 font-medium mb-2">Delivery Info</p>
                    <div className="text-xs text-slate-700 bg-white rounded px-2 py-1 space-y-1">
                      <p><span className="font-medium">To:</span> {deliveryDetails.receiverName}</p>
                      <p><span className="font-medium">Phone:</span> {deliveryDetails.receiverPhone}</p>
                      <p><span className="font-medium">From:</span> {deliveryDetails.senderName}</p>
                    </div>
                  </div>
                )}

                {orderRemarks && (
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <p className="text-xs text-slate-500 font-medium mb-1">Remarks</p>
                    <p className="text-sm text-slate-700 bg-white rounded px-2 py-1">
                      {orderRemarks}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t-2 border-blue-300">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {discountValue && (
                  <div className="flex justify-between text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium">
                      Discount ({discountType === "percentage" ? `${discountValue}%` : `₹${discountValue}`})
                    </span>
                    <span className="font-semibold">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {deliveryChargeAmount > 0 && (
                  <div className="flex justify-between text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium">Delivery Charges</span>
                    <span className="font-semibold">
                      +₹{deliveryChargeAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-lg pt-2">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-blue-700">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSaveSale}
                disabled={isLoading || saleItems.length === 0 || !isPaymentValid()}
                className={cn(
                  "w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
                  isLoading || saleItems.length === 0 || !isPaymentValid()
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg"
                )}
              >
                <Check className="w-5 h-5" />
                {isLoading ? "Saving..." : "Save Sale"}
              </button>
            </div>
          </div>
        </div>

        {/* Add Customer Modal */}
        {showAddCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add New Customer</h2>
                <button
                  onClick={() => setShowAddCustomerModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

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
      </div>
    </SharedLayout>
  );
}
