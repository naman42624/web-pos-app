import { useState } from "react";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import { Product, ProductItem } from "@/hooks/usePOS";
import { Trash2, Plus, Edit2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReadyProducts() {
  const { products, addProduct, updateProduct, deleteProduct, items: inventoryItems } = usePOSContext();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    selectedItems: [] as Array<{ itemId?: string; customName?: string; customPrice?: number; quantity: number }>,
  });
  const [searchItem, setSearchItem] = useState("");
  const [filteredItems, setFilteredItems] = useState<typeof inventoryItems>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

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
      price: product.price.toString(),
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
          !formData.selectedItems.some((pi) => pi.itemId === item.id)
      );
      setFilteredItems(filtered);
      setShowItemDropdown(true);
    } else {
      setFilteredItems([]);
      setShowItemDropdown(false);
    }
  };

  const addItemToProduct = (item: typeof inventoryItems[0]) => {
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

  const removeItemFromProduct = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((pi) => pi.itemId !== itemId),
    }));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.map((pi) =>
        pi.itemId === itemId ? { ...pi, quantity: Math.max(1, quantity) } : pi
      ),
    }));
  };

  const handleSaveProduct = () => {
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
      updateProduct(editingProductId, productData);
    } else {
      addProduct(productData);
    }

    closeModal();
  };

  const getItemName = (itemId?: string, customName?: string) => {
    if (customName) return customName;
    return itemId ? (inventoryItems.find((item) => item.id === itemId)?.name || "Unknown") : "Unknown";
  };

  const getItemPrice = (itemId?: string, customPrice?: number) => {
    if (customPrice !== undefined) return customPrice;
    return itemId ? (inventoryItems.find((item) => item.id === itemId)?.price || 0) : 0;
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ready Products</h1>
            <p className="text-slate-500 mt-2">
              Create and manage pre-configured products made from items
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="h-48 bg-slate-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-slate-400 text-sm">No image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">₹{product.price.toFixed(2)}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Composition ({product.items.length} items)
                    </p>
                    <div className="space-y-1">
                      {product.items.map((pi) => (
                        <div key={pi.itemId} className="flex justify-between text-xs text-slate-600">
                          <span>{getItemName(pi.itemId)} × {pi.quantity}</span>
                          <span className="font-medium">₹{(getItemPrice(pi.itemId) * pi.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete product "${product.name}"?`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg transition-colors text-sm"
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products yet</h3>
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {formData.price && (
                    <p className="text-sm text-slate-600 mt-2">
                      Composition value: ₹{calculateCompositionPrice().toFixed(2)}
                      {parseFloat(formData.price) > calculateCompositionPrice() && (
                        <span className="text-green-600 ml-2">
                          (+₹{(parseFloat(formData.price) - calculateCompositionPrice()).toFixed(2)} margin)
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
                  <textarea
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Paste base64 encoded image data here..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
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
                              item.name.toLowerCase().includes(searchItem.toLowerCase()) &&
                              !formData.selectedItems.some((pi) => pi.itemId === item.id)
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
                                  <span className="text-xs text-slate-500">No img</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-900">{item.name}</span>
                                  <span className="text-sm text-slate-600">₹{item.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Items */}
                  {formData.selectedItems.length > 0 ? (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      {formData.selectedItems.map((pi) => (
                        <div
                          key={pi.itemId}
                          className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{getItemName(pi.itemId)}</p>
                            <p className="text-sm text-slate-600">
                              ₹{getItemPrice(pi.itemId).toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={pi.quantity}
                              onChange={(e) =>
                                updateItemQuantity(pi.itemId, parseInt(e.target.value) || 1)
                              }
                              min="1"
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <p className="font-medium text-slate-900 w-20 text-right">
                              ₹{(getItemPrice(pi.itemId) * pi.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeItemFromProduct(pi.itemId)}
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
                      No items added yet. Search and add items above.
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
      </div>
    </SharedLayout>
  );
}
