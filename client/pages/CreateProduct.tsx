import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { Product, ProductItem } from "@/hooks/usePOS";
import { Trash2, Plus, ArrowLeft, Camera, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRCodeModal } from "@/components/QRCodeModal";

export default function CreateProduct() {
  const navigate = useNavigate();
  const { addProduct, items: inventoryItems } = usePOSContext();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    selectedItems: [] as ProductItem[],
  });
  const [searchItem, setSearchItem] = useState("");
  const [filteredItems, setFilteredItems] = useState<typeof inventoryItems>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [selectedProductForQR, setSelectedProductForQR] =
    useState<Product | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemSearchChange = (value: string) => {
    setSearchItem(value);
    if (value.trim()) {
      const filtered = inventoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) &&
          !formData.selectedItems.some((pi) => pi.itemId === item.id),
      );
      setFilteredItems(filtered);
      setShowItemDropdown(true);
    } else {
      setFilteredItems([]);
      setShowItemDropdown(false);
    }
  };

  const addItemToProduct = (item: (typeof inventoryItems)[0]) => {
    const newProductItem: ProductItem = {
      itemId: item.id,
      quantity: 1,
    };
    setFormData((prev) => ({
      ...prev,
      selectedItems: [...prev.selectedItems, newProductItem],
    }));
    setSearchItem("");
    setShowItemDropdown(false);
  };

  const removeItemFromProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((_, i) => i !== index),
    }));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.map((pi, i) =>
        i === index ? { ...pi, quantity: Math.max(1, quantity) } : pi,
      ),
    }));
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      alert("Please enter product name");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert("Please enter a valid stock quantity");
      return;
    }

    if (formData.selectedItems.length === 0) {
      alert("Please add at least one item to the product");
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: formData.image || undefined,
        items: formData.selectedItems,
      };

      const newProduct = await addProduct(productData);

      if (newProduct) {
        setSelectedProductForQR(newProduct);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

    setFormData((prev) => ({
      ...prev,
      selectedItems: [...prev.selectedItems, newItem],
    }));
    setCustomItemName("");
    setCustomItemPrice("");
  };

  const calculateCompositionPrice = () => {
    return formData.selectedItems.reduce((sum, pi) => {
      const itemPrice = getItemPrice(pi.itemId, pi.customPrice);
      return sum + itemPrice * pi.quantity;
    }, 0);
  };

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/ready-products")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Create New Product
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Combine items to create a ready-to-sell product
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Breakfast Combo"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
              />
            </div>

            {/* Product Price */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Product Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
              />
              {formData.price && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-slate-700">
                    Composition value:{" "}
                    <span className="font-semibold">
                      ₹{calculateCompositionPrice().toFixed(2)}
                    </span>
                  </p>
                  {parseFloat(formData.price) > calculateCompositionPrice() && (
                    <p className="text-sm text-green-700 mt-1 font-semibold">
                      Profit margin: +₹
                      {(
                        parseFloat(formData.price) - calculateCompositionPrice()
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Stock Quantity */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
              />
              <p className="text-xs text-slate-500 mt-2">
                Number of units available for sale
              </p>
            </div>

            {/* Product Image */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Product Image{" "}
                <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        setFormData({ ...formData, image: base64 });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="product-image-upload"
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        setFormData({ ...formData, image: base64 });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="product-image-camera"
                />
                {formData.image ? (
                  <div className="space-y-3">
                    <img
                      src={formData.image}
                      alt="Product preview"
                      className="w-40 h-40 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm font-medium text-blue-600">
                      Change image
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <label
                        htmlFor="product-image-camera"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Camera
                      </label>
                      <label
                        htmlFor="product-image-upload"
                        className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Gallery
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-5xl">📷</div>
                    <p className="text-sm font-semibold text-slate-700">
                      Add product image
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <label
                        htmlFor="product-image-camera"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Take Photo
                      </label>
                      <label
                        htmlFor="product-image-upload"
                        className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Choose File
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Add Items to Product
              </h2>

              {/* Search Items */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchItem}
                  onChange={(e) => handleItemSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchItem.trim()) {
                      const filtered = inventoryItems.filter(
                        (item) =>
                          item.name
                            .toLowerCase()
                            .includes(searchItem.toLowerCase()) &&
                          !formData.selectedItems.some(
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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addItemToProduct(item)}
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
                )}
              </div>

              {/* Add Custom Item */}
              <div className="border border-slate-300 rounded-lg p-3 sm:p-4 bg-slate-50 mb-4">
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
                        onChange={(e) => setCustomItemPrice(e.target.value)}
                        placeholder="Price (₹)"
                        step="0.01"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button
                      onClick={addCustomItemToProduct}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Items */}
              {formData.selectedItems.length > 0 ? (
                <div className="space-y-3">
                  {formData.selectedItems.map((pi, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {getItemName(pi.itemId, pi.customName)}
                        </p>
                        <p className="text-sm text-slate-600">
                          ₹{getItemPrice(pi.itemId, pi.customPrice).toFixed(2)}{" "}
                          each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={pi.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              index,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          min="1"
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <p className="font-medium text-slate-900 w-20 text-right">
                          ₹
                          {(
                            getItemPrice(pi.itemId, pi.customPrice) *
                            pi.quantity
                          ).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItemFromProduct(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg text-center">
                  No items added yet. Search and add items above or add custom
                  items.
                </p>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 sticky top-20">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
                    Product Name
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {formData.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
                    Selling Price
                  </p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {formData.price
                      ? `₹${parseFloat(formData.price).toFixed(2)}`
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
                    Stock Quantity
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formData.stock || "—"} units
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
                    Items Count
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formData.selectedItems.length} item
                    {formData.selectedItems.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {formData.selectedItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
                      Composition Cost
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      ₹{calculateCompositionPrice().toFixed(2)}
                    </p>
                  </div>
                )}

                {formData.price && formData.selectedItems.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
                      Profit Margin
                    </p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        parseFloat(formData.price) >=
                          calculateCompositionPrice()
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      ₹
                      {Math.abs(
                        parseFloat(formData.price) -
                          calculateCompositionPrice(),
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveProduct}
                  disabled={
                    isSubmitting ||
                    !formData.name.trim() ||
                    !formData.price ||
                    parseFloat(formData.price) <= 0 ||
                    formData.selectedItems.length === 0
                  }
                  className={cn(
                    "w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
                    isSubmitting ||
                      !formData.name.trim() ||
                      !formData.price ||
                      parseFloat(formData.price) <= 0 ||
                      formData.selectedItems.length === 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Product
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate("/ready-products")}
                  className="w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && selectedProductForQR && (
          <QRCodeModal
            product={selectedProductForQR}
            onClose={() => {
              setShowQRModal(false);
              setSelectedProductForQR(null);
              navigate("/ready-products");
            }}
            autoprint={true}
          />
        )}
      </div>
    </SharedLayout>
  );
}
