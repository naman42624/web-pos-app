import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import { Package, Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react";

export default function Pickups() {
  const { sales, items: inventoryItems, products: readyProducts } = usePOSContext();

  const pickupOrders = sales.filter((sale) => sale.orderType === "pickup_later");

  const getItemName = (itemId?: string, customName?: string) => {
    if (customName) return customName;
    return itemId ? (inventoryItems.find((item) => item.id === itemId)?.name || "Unknown") : "Unknown";
  };

  const getItemPrice = (itemId?: string, customPrice?: number) => {
    if (customPrice !== undefined) return customPrice;
    return itemId ? (inventoryItems.find((item) => item.id === itemId)?.price || 0) : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "Not specified";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const isReadyProduct = (composition?: any[]) => {
    if (!composition || composition.length === 0) return false;
    return readyProducts.some((product) => {
      if (product.items.length !== composition.length) return false;
      return product.items.every((pItem) =>
        composition.some((cItem) => cItem.itemId === pItem.itemId && cItem.quantity === pItem.quantity)
      );
    });
  };

  const isPickupToday = (pickupDate?: string) => {
    if (!pickupDate) return false;
    const today = new Date().toDateString();
    const pickup = new Date(pickupDate).toDateString();
    return today === pickup;
  };

  const getItemStatus = (item: any, pickupDate?: string) => {
    const isReady = isReadyProduct(item.composition);
    const isToday = isPickupToday(pickupDate);

    if (isReady && isToday) {
      return {
        status: "Ready to be Picked",
        icon: CheckCircle,
        color: "bg-green-100 text-green-800 border-green-200",
        badge: "text-green-700",
      };
    } else if (isReady) {
      return {
        status: "Ready Product - Scheduled",
        icon: AlertCircle,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        badge: "text-blue-700",
      };
    } else if (isToday) {
      return {
        status: "Scheduled for Today",
        icon: AlertCircle,
        color: "bg-amber-100 text-amber-800 border-amber-200",
        badge: "text-amber-700",
      };
    } else {
      return {
        status: "Pending Pickup",
        icon: AlertCircle,
        color: "bg-slate-100 text-slate-800 border-slate-200",
        badge: "text-slate-700",
      };
    }
  };

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pickups</h1>
          <p className="text-slate-500 mt-2">
            Manage and track all scheduled pickups
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {pickupOrders.length > 0 ? (
            pickupOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Order {order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Created: {formatDate(order.date)}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 rounded-lg font-medium border text-sm bg-blue-100 text-blue-800 border-blue-200">
                      Pick Up Later
                    </span>
                  </div>

                  {/* Items Summary */}
                  <div className="mb-4 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-semibold text-slate-900 mb-2">
                          {item.name} × {item.quantity} @ ₹{item.price.toFixed(2)} each
                        </p>

                        {/* Product Composition */}
                        {item.composition && item.composition.length > 0 && (
                          <div className="ml-4 mt-2 pt-2 border-t border-slate-300">
                            <p className="text-xs font-semibold text-slate-700 mb-2">Composition:</p>
                            <div className="space-y-1">
                              {item.composition.map((comp, idx) => {
                                const isCustom = (comp as any).customName !== undefined;
                                const itemName = isCustom ? (comp as any).customName : getItemName(comp.itemId);
                                const itemPrice = isCustom ? (comp as any).customPrice : getItemPrice(comp.itemId);
                                return (
                                  <p key={idx} className="text-xs text-slate-600 ml-2">
                                    • {itemName} × {comp.quantity} @ ₹{itemPrice.toFixed(2)} each
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Schedule Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-600">Pickup Date</p>
                        <p className="font-semibold text-slate-900">
                          {order.pickupDate ? formatDate(order.pickupDate) : "Not scheduled"}
                        </p>
                      </div>
                    </div>

                    {order.pickupTime && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-600">Pickup Time</p>
                          <p className="font-semibold text-slate-900">{formatTime(order.pickupTime)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer - Total and Payment */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-sm text-slate-600">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ₹{order.total.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 capitalize mb-1">
                        Payment: {order.paymentMode}
                      </p>
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Pending Pickup
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">No pickups scheduled</p>
              <p className="text-slate-400 text-sm mt-2">
                Pickup orders will appear here once created
              </p>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
