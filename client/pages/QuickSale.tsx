import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { SaleItem, Sale } from "@/hooks/usePOS";
import { Trash2, Plus, Check, X, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRScannerModal } from "@/components/QRScannerModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { QRCodeData, convertQRDataToSaleItem } from "@/utils/qrcode";

type PaymentMode = "cash" | "upi" | "credit";

export default function QuickSale() {
  const navigate = useNavigate();
  const {
    addSale,
    addCustomer,
    customers,
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

  // Payment
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<
    Set<PaymentMode>
  >(new Set(["cash"]));
  const [paymentAmounts, setPaymentAmounts] = useState<
    Record<PaymentMode, string>
  >({
    cash: "",
    upi: "",
    credit: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<QRCodeData | null>(null);
  const [showScannedConfirm, setShowScannedConfirm] = useState(false);
  const [creditCustomerSearch, setCreditCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<typeof customers>(
    [],
  );
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [createdSale, setCreatedSale] = useState<Sale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const subtotal = saleItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const calculateGST = () => {
    let totalGST = 0;
    saleItems.forEach((item) => {
      const itemAmount = item.quantity * item.price;
      const itemData = inventoryItems.find((i) => i.id === item.id);
      const gstRate = itemData?.gstRate || 0;

      if (gstRate > 0) {
        const baseAmount = itemAmount / (1 + gstRate / 100);
        const gstAmount = itemAmount - baseAmount;
        totalGST += gstAmount;
      }
    });
    return totalGST;
  };

  const gstAmount = calculateGST();
  const total = subtotal;

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

    const quantity = parseInt(productQuantity) || 1;
    const newItem: SaleItem = {
      id: `product-${Date.now()}`,
      name: product.name,
      quantity: quantity,
      price: product.price,
      image: product.image || undefined,
      composition: product.items,
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
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice((pi as any).itemId, (pi as any).customPrice) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const removeItemFromCustomProduct = (index: number) => {
    const newItems = customProductItems.filter((_, i) => i !== index);
    setCustomProductItems(newItems);
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice((pi as any).itemId, (pi as any).customPrice) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const updateCustomProductItemQuantity = (index: number, quantity: number) => {
    const newItems = customProductItems.map((pi, i) =>
      i === index ? { ...pi, quantity: Math.max(1, quantity) } : pi,
    );
    setCustomProductItems(newItems);
    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice((pi as any).itemId, (pi as any).customPrice) * pi.quantity;
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

    const newTotal = newItems.reduce((sum, pi) => {
      return sum + getItemPrice((pi as any).itemId, (pi as any).customPrice) * pi.quantity;
    }, 0);
    setCustomProductPrice(newTotal.toString());
  };

  const getCustomProductTotalPrice = () => {
    return customProductItems.reduce((sum, pi) => {
      return sum + getItemPrice(pi.itemId, pi.customPrice) * pi.quantity;
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
      composition: customProductItems,
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

      // Clear customer selection when credit is deselected
      if (mode === "credit") {
        setSelectedCustomerId(null);
        setCreditCustomerSearch("");
      }
    } else {
      newModes.add(mode);
    }
    setSelectedPaymentModes(newModes);
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
      setSaleItems([...saleItems, saleItem]);
      setScannedProduct(null);
      setShowScannedConfirm(false);
    }
  };

  const handleCreditCustomerSearch = (value: string) => {
    setCreditCustomerSearch(value);
    if (value.trim()) {
      const filtered = customers.filter((customer) =>
        customer.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(true);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      setSelectedCustomerId(null);
    }
  };

  const handleSelectCreditCustomer = (
    customerId: string,
    customerName: string,
  ) => {
    setSelectedCustomerId(customerId);
    setCreditCustomerSearch(customerName);
    setShowCustomerDropdown(false);
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

    const primaryMode = Array.from(selectedPaymentModes)[0];

    // Require customer selection for credit payments
    if (primaryMode === "credit" && !selectedCustomerId) {
      alert(
        "Credit payment requires selecting an existing customer. Please search and select a customer from the database."
      );
      return;
    }

    setIsLoading(true);
    try {
      const customerId = selectedCustomerId || undefined;

      const sale = await addSale({
        items: saleItems,
        paymentMode: primaryMode,
        paymentModes: [primaryMode],
        paymentAmounts: { [primaryMode]: total },
        total,
        subtotal,
        gstAmount,
        customerId,
        orderType: "pickup",
        isQuickSale: true,
      });

      setCreatedSale(sale);
      setShowReceiptModal(true);

      setSaleItems([]);
      setSelectedPaymentModes(new Set(["cash"]));
      setPaymentAmounts({ cash: "", upi: "", credit: "" });
      setAddMode("ready");
      setCreditCustomerSearch("");
      setSelectedCustomerId(null);

      toast.success("✓ Sale registered successfully!", {
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

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Quick Sale
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
            Fast checkout - add items and select payment mode
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Add Product/Items Form */}
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
                  Add Items
                </button>
              </div>

              <div className="space-y-4">
                {/* Ready Product Mode */}
                {addMode === "ready" && (
                  <>
                    {/* QR Code Scanner Button */}
                    <button
                      onClick={() => setShowQRScanner(true)}
                      className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold py-5 px-6 sm:py-2 sm:px-4 rounded-lg shadow-md transition-all duration-200 text-lg sm:text-base"
                    >
                      <QrCode className="w-7 h-7 sm:w-5 sm:h-5" />
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
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
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
                                className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0"
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
                          : "bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white",
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
                        placeholder="e.g., Custom Bundle"
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
                                className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0"
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
                          placeholder="Item name"
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
                        !customProductName.trim() ||
                        !customProductPrice ||
                        parseFloat(customProductPrice) <= 0 ||
                        customProductItems.length === 0
                      }
                      className={cn(
                        "w-full font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base",
                        !customProductName.trim() ||
                          !customProductPrice ||
                          parseFloat(customProductPrice) <= 0 ||
                          customProductItems.length === 0
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white",
                      )}
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Product to Sale
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Sale Items
              </h2>

              {saleItems.length > 0 ? (
                <div className="space-y-3">
                  {saleItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-slate-500">
                                No img
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">
                              {item.name}
                            </p>
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
                                parseInt(e.target.value) || 1,
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

                      {/* Product Composition */}
                      {item.composition && item.composition.length > 0 && (
                        <div className="border-t border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">
                            Composition:
                          </p>
                          <div className="space-y-1">
                            {item.composition.map((comp, idx) => {
                              const isCustom =
                                (comp as any).customName !== undefined;
                              const itemName = isCustom
                                ? (comp as any).customName
                                : getItemName(comp.itemId);
                              const itemPrice = isCustom
                                ? (comp as any).customPrice || 0
                                : getItemPrice(comp.itemId, undefined);
                              return (
                                <div
                                  key={idx}
                                  className="flex justify-between text-xs text-slate-600 px-2"
                                >
                                  <span>
                                    {itemName} × {comp.quantity}
                                  </span>
                                  <span className="font-medium">
                                    ₹
                                    {((itemPrice || 0) * comp.quantity).toFixed(
                                      2,
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Payment Mode
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                {(["cash", "upi", "credit"] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => togglePaymentMode(mode)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 font-semibold text-center transition-all duration-200",
                      selectedPaymentModes.has(mode)
                        ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                    )}
                  >
                    {selectedPaymentModes.has(mode) && (
                      <Check className="w-5 h-5 absolute top-2 right-2" />
                    )}
                    <span className="capitalize block">{mode}</span>
                  </button>
                ))}
              </div>

              {selectedPaymentModes.has("credit") && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-900 mb-3">
                    ⚠️ Credit Payment Selected
                  </p>
                  <p className="text-sm text-amber-800 mb-4">
                    For credit payments, you must select an existing customer from the database.
                  </p>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={creditCustomerSearch}
                      onChange={(e) =>
                        handleCreditCustomerSearch(e.target.value)
                      }
                      onFocus={() => {
                        if (creditCustomerSearch.trim()) {
                          const filtered = customers.filter((customer) =>
                            customer.name
                              .toLowerCase()
                              .includes(creditCustomerSearch.toLowerCase()),
                          );
                          setFilteredCustomers(filtered);
                          setShowCustomerDropdown(true);
                        }
                      }}
                      placeholder="Search customer by name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() =>
                              handleSelectCreditCustomer(
                                customer.id,
                                customer.name,
                              )
                            }
                            className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-900">
                                {customer.name}
                              </span>
                              <span className="text-sm text-slate-500">
                                {customer.phone || "No phone"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {creditCustomerSearch.trim() &&
                     filteredCustomers.length === 0 && (
                      <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded border border-red-200">
                        No customers found matching "{creditCustomerSearch}". Please check the spelling or select from the list above.
                      </div>
                    )}
                  </div>
                  {selectedCustomerId && (
                    <p className="text-sm text-green-700 mt-2">
                      ✓ Customer selected: {customers.find(c => c.id === selectedCustomerId)?.name}
                    </p>
                  )}
                </div>
              )}

              {selectedPaymentModes.size > 1 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 mb-4">
                    Enter amount for each payment method (must sum to ₹
                    {total.toFixed(2)})
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
                            onChange={(e) =>
                              updatePaymentAmount(mode, e.target.value)
                            }
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
                      <span
                        className={cn(
                          "font-semibold",
                          Math.abs(getTotalPaymentAmount() - total) < 0.01
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
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
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl shadow-sm border border-blue-200 p-4 sm:p-6 lg:sticky lg:top-24 space-y-4 sm:space-y-6">
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
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {gstAmount > 0 && (
                  <div className="flex justify-between text-sm text-amber-700 bg-amber-50 p-2 rounded">
                    <span>GST (Tax)</span>
                    <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t border-cyan-200">
                  <span className="text-slate-900">Total</span>
                  <span className="text-cyan-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSaveSale}
                disabled={
                  isLoading ||
                  saleItems.length === 0 ||
                  !isPaymentValid() ||
                  (selectedPaymentModes.has("credit") &&
                    !selectedCustomerId &&
                    !creditCustomerSearch.trim())
                }
                className={cn(
                  "w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-white",
                  isLoading ||
                    saleItems.length === 0 ||
                    !isPaymentValid() ||
                    (selectedPaymentModes.has("credit") &&
                      !selectedCustomerId &&
                      !creditCustomerSearch.trim())
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 shadow-md hover:shadow-lg",
                )}
              >
                {isLoading ? "Processing..." : "Register Sale"}
              </button>
            </div>
          </div>
        </div>

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
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Add Scanned Product?
              </h2>

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

              <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Product Name</p>
                  <p className="font-semibold text-slate-900">
                    {scannedProduct.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-slate-600">Price</p>
                    <p className="font-semibold text-slate-900">
                      ₹{scannedProduct.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Default Qty</p>
                    <p className="font-semibold text-slate-900">
                      1
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Composition */}
              {scannedProduct.items && scannedProduct.items.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    Composition ({scannedProduct.items.length} items)
                  </p>
                  <div className="space-y-2">
                    {scannedProduct.items.map((item, idx) => {
                      const isCustom = (item as any).customName !== undefined;
                      const itemName = isCustom
                        ? (item as any).customName
                        : inventoryItems.find((i) => i.id === item.itemId)
                            ?.name || "Unknown";
                      const itemPrice = isCustom
                        ? (item as any).customPrice || 0
                        : inventoryItems.find((i) => i.id === item.itemId)
                            ?.price || 0;
                      return (
                        <div
                          key={idx}
                          className="flex justify-between text-xs p-2 bg-white rounded border border-blue-100"
                        >
                          <span className="text-slate-700">
                            {itemName} × {item.quantity}
                          </span>
                          <span className="font-medium text-slate-900">
                            ₹{((itemPrice || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowScannedConfirm(false);
                    setScannedProduct(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddScannedProduct}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {createdSale && (
          <ReceiptModal
            sale={createdSale}
            isOpen={showReceiptModal}
            onClose={handleReceiptModalClose}
          />
        )}
      </div>
    </SharedLayout>
  );
}
