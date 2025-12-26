import { useState } from "react";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { Product, ProductItem } from "@/hooks/usePOS";
import { Trash2, Plus, Edit2, X, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRCodeModal } from "@/components/QRCodeModal";

export default function ReadyProducts() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    items: inventoryItems,
  } = usePOSContext();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    selectedItems: [] as Array<{
      itemId?: string;
      customName?: string;
      customPrice?: number;
      quantity: number;
    }>,
  });
  const [searchItem, setSearchItem] = useState("");
  const [filteredItems, setFilteredItems] = useState<typeof inventoryItems>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [selectedProductForQR, setSelectedProductForQR] =
    useState<Product | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [autoprint, setAutoprint] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      image: "",
      selectedItems: [],
    });
    setSearchItem("");
    setCustomItemName("");
    setCustomItemPrice("");
    setEditingProductId(null);
    setShowItemDropdown(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      price: (product.price || 0).toString(),
      image: product.image || "",
      selectedItems: product.items,
    });
    setEditingProductId(product.id);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

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

    if (formData.selectedItems.length === 0) {
      alert("Please add at least one item to the product");
      return;
    }

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      image: formData.image || undefined,
      items: formData.selectedItems,
    };

    if (editingProductId) {
      await updateProduct(editingProductId, productData);
      closeModal();
    } else {
      const newProduct = await addProduct(productData);
      closeModal();

      // Auto-print QR code for new products
      if (newProduct) {
        setTimeout(() => {
          setSelectedProductForQR(newProduct);
          setShowQRModal(true);
          setAutoprint(true);
        }, 500);
      }
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Ready Products
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Create and manage pre-configured products made from items
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center sm:justify-start gap-2 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Product Image */}
                <div
                  onClick={() => openEditModal(product)}
                  className="h-40 sm:h-48 bg-slate-100 overflow-hidden cursor-pointer hover:bg-slate-200 transition-colors group"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                      <span className="text-slate-400 text-xs sm:text-sm">
                        Click to add image
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
                      ₹{(product.price || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Composition ({product.items.length} items)
                    </p>
                    <div className="space-y-1">
                      {product.items.map((pi, idx) => {
                        const isCustom = (pi as any).customName !== undefined;
                        const itemName = isCustom
                          ? (pi as any).customName
                          : getItemName(pi.itemId);
                        const itemPrice = isCustom
                          ? (pi as any).customPrice || 0
                          : getItemPrice(pi.itemId, undefined);
                        return (
                          <div
                            key={idx}
                            className="flex justify-between text-xs text-slate-600"
                          >
                            <span>
                              {itemName} × {pi.quantity}
                            </span>
                            <span className="font-medium">
                              ₹{((itemPrice || 0) * pi.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProductForQR(product);
                          setShowQRModal(true);
                          setAutoprint(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium rounded-lg transition-colors text-xs sm:text-sm"
                      >
                        <QrCode className="w-4 h-4" />
                        QR
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors text-xs sm:text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete product "${product.name}"?`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No products yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first ready product by combining items
            </p>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </button>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingProductId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Breakfast Combo"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Product Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {formData.price && (
                    <p className="text-sm text-slate-600 mt-2">
                      Composition value: ₹
                      {calculateCompositionPrice().toFixed(2)}
                      {parseFloat(formData.price) >
                        calculateCompositionPrice() && (
                        <span className="text-green-600 ml-2">
                          (+₹
                          {(
                            parseFloat(formData.price) -
                            calculateCompositionPrice()
                          ).toFixed(2)}{" "}
                          margin)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Product Image */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Image (Optional)
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
                    {formData.image ? (
                      <label htmlFor="product-image-upload" className="cursor-pointer block">
                        <div className="mb-3">
                          <img
                            src={formData.image}
                            alt="Product preview"
                            className="w-32 h-32 object-cover rounded-lg mx-auto"
                          />
                        </div>
                        <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          Click to change image
                        </p>
                      </label>
                    ) : (
                      <label htmlFor="product-image-upload" className="cursor-pointer block">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          Click to upload image
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </label>
                    )}
                  </div>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove image
                    </button>
                  )}
                </div>

                {/* Items Section */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Add Items to Product
                  </label>

                  {/* Search and Add Items */}
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
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-900">
                                    {item.name}
                                  </span>
                                  <span className="text-sm text-slate-600">
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
                            onChange={(e) => setCustomItemPrice(e.target.value)}
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

                  {/* Selected Items */}
                  {formData.selectedItems.length > 0 ? (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      {formData.selectedItems.map((pi, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {getItemName(pi.itemId, pi.customName)}
                            </p>
                            <p className="text-sm text-slate-600">
                              ₹
                              {getItemPrice(pi.itemId, pi.customPrice).toFixed(
                                2,
                              )}{" "}
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
                      No items added yet. Search and add items above or add
                      custom items.
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {editingProductId ? "Update" : "Create"} Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedProductForQR && (
          <QRCodeModal
            product={selectedProductForQR}
            onClose={() => {
              setShowQRModal(false);
              setSelectedProductForQR(null);
              setAutoprint(false);
            }}
            autoprint={autoprint}
          />
        )}
      </div>
    </SharedLayout>
  );
}
