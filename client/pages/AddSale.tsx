import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import { SaleItem } from "@/hooks/usePOS";
import { Trash2, Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMode = "cash" | "upi" | "credit";

export default function AddSale() {
  const navigate = useNavigate();
  const { addSale, customers, addCustomer } = usePOSContext();

  const [items, setItems] = useState<SaleItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderRemarks, setOrderRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

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

    if (paymentMode === "credit" && !selectedCustomerId) {
      alert("Please select a customer for credit sale");
      return;
    }

    setIsLoading(true);
    try {
      addSale({
        items,
        paymentMode,
        customerId: paymentMode === "credit" ? selectedCustomerId : undefined,
        total,
      });

      setItems([]);
      setOrderRemarks("");
      setSelectedCustomerId("");

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

            {/* Payment Mode Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Payment Mode
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {(["cash", "upi", "credit"] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setPaymentMode(mode);
                      if (mode !== "credit") {
                        setSelectedCustomerId("");
                      }
                    }}
                    className={cn(
                      "relative p-4 rounded-lg border-2 font-semibold text-center transition-all duration-200",
                      paymentMode === mode
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    )}
                  >
                    {paymentMode === mode && (
                      <Check className="w-5 h-5 absolute top-2 right-2" />
                    )}
                    <span className="capitalize block">{mode}</span>
                  </button>
                ))}
              </div>

              {paymentMode === "credit" && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Customer
                  </label>
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
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {paymentMode}
                  </span>
                </div>
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
                disabled={isLoading || items.length === 0}
                className={cn(
                  "w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
                  isLoading || items.length === 0
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
      </div>
    </SharedLayout>
  );
}
