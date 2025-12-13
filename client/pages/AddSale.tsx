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
  const { addSale, customers, addCustomer } = usePOSContext();

  const [items, setItems] = useState<SaleItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
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
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const togglePaymentMode = (mode: PaymentMode) => {
    const newModes = new Set(selectedPaymentModes);
    if (newModes.has(mode)) {
      if (newModes.size === 1) {
        return; // At least one mode must be selected
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

  const getPaymentBreakdown = () => {
    const breakdown: Record<PaymentMode, number> = { cash: 0, upi: 0, credit: 0 };
    selectedPaymentModes.forEach((mode) => {
      const amount = parseFloat(paymentAmounts[mode]) || 0;
      breakdown[mode] = amount;
    });
    return breakdown;
  };

  const getTotalPaymentAmount = () => {
    return Array.from(selectedPaymentModes).reduce((sum, mode) => {
      return sum + (parseFloat(paymentAmounts[mode]) || 0);
    }, 0);
  };

  const isPaymentValid = () => {
    if (selectedPaymentModes.size === 0) return false;
    if (selectedPaymentModes.has("credit") && !selectedCustomerId) return false;

    // If only one payment mode, it's valid
    if (selectedPaymentModes.size === 1) return true;

    // For multiple modes, amounts must be entered and sum to total
    const totalPayment = getTotalPaymentAmount();
    return Math.abs(totalPayment - total) < 0.01; // Allow for floating point precision
  };

  const addItem = () => {
    if (!itemName.trim() || !itemPrice || parseFloat(itemPrice) <= 0) {
      alert("Please enter valid item details");
      return;
    }

    const newItem: SaleItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      quantity: parseInt(itemQuantity) || 1,
      price: parseFloat(itemPrice),
    };

    setItems([...items, newItem]);
    setItemName("");
    setItemQuantity("1");
    setItemPrice("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const handleSaveSale = async () => {
    if (items.length === 0) {
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
      // Use the first payment mode (or primary mode if multiple)
      const primaryMode = Array.from(selectedPaymentModes)[0];
      addSale({
        items,
        paymentMode: primaryMode,
        customerId: selectedPaymentModes.has("credit") ? selectedCustomerId : undefined,
        total,
        orderType,
        pickupDate: (orderType === "pickup_later" || orderType === "delivery") ? pickupDate : undefined,
        pickupTime: (orderType === "pickup_later" || orderType === "delivery") ? pickupTime : undefined,
        deliveryDetails: orderType === "delivery" ? deliveryDetails : undefined,
      });

      setItems([]);
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
            Enter items and select payment mode to complete the sale
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Item Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Add Items
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Chai, Samosa, Juice..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      min="1"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      onKeyDown={(e) => e.key === "Enter" && addItem()}
                    />
                  </div>
                </div>

                <button
                  onClick={addItem}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Items</h2>

              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
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
                {items.map((item) => (
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
                    ₹{total.toFixed(2)}
                  </span>
                </div>

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

              <div className="pt-4 border-t-2 border-blue-300 flex justify-between text-lg">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-blue-700">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleSaveSale}
                disabled={isLoading || items.length === 0 || !isPaymentValid()}
                className={cn(
                  "w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
                  isLoading || items.length === 0 || !isPaymentValid()
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
