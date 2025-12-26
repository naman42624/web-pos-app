import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import {
  Package,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pickups() {
  const {
    sales,
    items: inventoryItems,
    products: readyProducts,
    updateSaleStatus,
  } = usePOSContext();

  const pickupOrders = sales.filter(
    (sale) => sale.orderType === "pickup_later",
  );

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
        composition.some(
          (cItem) =>
            cItem.itemId === pItem.itemId && cItem.quantity === pItem.quantity,
        ),
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
        status: "Product Not Ready",
        icon: AlertCircle,
        color: "bg-red-100 text-red-800 border-red-200",
        badge: "text-red-700",
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

  const handleStatusChange = async (
    saleId: string,
    newStatus:
      | "pending"
      | "confirmed"
      | "pick_up_ready"
      | "picked_up"
      | "cancelled",
  ) => {
    try {
      await updateSaleStatus(saleId, newStatus as any);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Failed to update status:", errorMsg);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pick_up_ready":
        return "bg-green-100 text-green-700 border-green-200";
      case "picked_up":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getDateGroup = (dateString: string | undefined) => {
    if (!dateString) return "No Date";

    const pickupDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = pickupDate.toDateString() === today.toDateString();
    const isTomorrow = pickupDate.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return formatDate(dateString);
  };

  const groupedOrders = pickupOrders.reduce(
    (groups, order) => {
      const dateGroup = getDateGroup(order.pickupDate);
      if (!groups[dateGroup]) {
        groups[dateGroup] = [];
      }
      groups[dateGroup].push(order);
      return groups;
    },
    {} as Record<string, typeof pickupOrders>,
  );

  const sortedGroupKeys = Object.keys(groupedOrders).sort((a, b) => {
    if (a === "No Date") return 1;
    if (b === "No Date") return -1;

    const aDate =
      a === "Today"
        ? new Date()
        : a === "Tomorrow"
          ? new Date(new Date().setDate(new Date().getDate() + 1))
          : new Date(a);
    const bDate =
      b === "Today"
        ? new Date()
        : b === "Tomorrow"
          ? new Date(new Date().setDate(new Date().getDate() + 1))
          : new Date(b);

    return aDate.getTime() - bDate.getTime();
  });

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Pickups
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
            Manage and track all scheduled pickups
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6 sm:space-y-8">
          {pickupOrders.length > 0 ? (
            sortedGroupKeys.map((dateGroup) => (
              <div key={dateGroup}>
                <h2 className="text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                  Pickups for {dateGroup}
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {groupedOrders[dateGroup].map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-4 sm:p-6">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                <h3 className="text-sm sm:text-lg font-semibold text-slate-900 truncate">
                                  Order {order.id.slice(-8).toUpperCase()}
                                </h3>
                                <select
                                  value={order.status || "pending"}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      order.id,
                                      e.target.value as
                                        | "pending"
                                        | "confirmed"
                                        | "pick_up_ready"
                                        | "picked_up"
                                        | "cancelled",
                                    )
                                  }
                                  className={cn(
                                    "px-2 py-1 rounded-lg text-xs sm:text-sm font-medium border outline-none transition-colors cursor-pointer",
                                    getStatusColor(order.status),
                                  )}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="pick_up_ready">
                                    Ready for Pickup
                                  </option>
                                  <option value="picked_up">Picked Up</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-500">
                                Created: {formatDate(order.date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Items Summary */}
                        <div className="mb-4 space-y-3">
                          {order.items.map((item) => {
                            const itemStatus = getItemStatus(
                              item,
                              order.pickupDate,
                            );
                            const StatusIcon = itemStatus.icon;
                            return (
                              <div
                                key={item.id}
                                className={`p-4 rounded-lg border ${itemStatus.color}`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {item.name} × {item.quantity} @ ₹
                                    {item.price.toFixed(2)} each
                                  </p>
                                  <div className="flex items-center gap-2 px-2 py-1 bg-white rounded border">
                                    <StatusIcon className="w-4 h-4" />
                                    <span
                                      className={`text-xs font-semibold ${itemStatus.badge}`}
                                    >
                                      {itemStatus.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Product Composition */}
                                {item.composition &&
                                  item.composition.length > 0 && (
                                    <div className="ml-4 mt-2 pt-2 border-t border-current border-opacity-30">
                                      <p className="text-xs font-semibold mb-2 opacity-80">
                                        Composition:
                                      </p>
                                      <div className="space-y-1">
                                        {item.composition.map((comp, idx) => {
                                          const isCustom =
                                            (comp as any).customName !==
                                            undefined;
                                          const itemName = isCustom
                                            ? (comp as any).customName
                                            : getItemName(comp.itemId);
                                          const itemPrice = isCustom
                                            ? (comp as any).customPrice || 0
                                            : getItemPrice(
                                                comp.itemId,
                                                undefined,
                                              );
                                          return (
                                            <p
                                              key={idx}
                                              className="text-xs opacity-75 ml-2"
                                            >
                                              • {itemName} × {comp.quantity} @ ₹
                                              {(itemPrice || 0).toFixed(2)} each
                                            </p>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Schedule Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-slate-600">
                                Pickup Date
                              </p>
                              <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">
                                {order.pickupDate
                                  ? formatDate(order.pickupDate)
                                  : "Not scheduled"}
                              </p>
                            </div>
                          </div>

                          {order.pickupTime && (
                            <div className="flex items-start gap-2 sm:gap-3">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs sm:text-sm text-slate-600">
                                  Pickup Time
                                </p>
                                <p className="font-semibold text-sm sm:text-base text-slate-900">
                                  {formatTime(order.pickupTime)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer - Total and Payment */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200">
                          <div>
                            <p className="text-xs sm:text-sm text-slate-600">
                              Total Amount
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900">
                              ₹{order.total.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xs sm:text-sm text-slate-600 capitalize mb-2 sm:mb-1">
                              Payment: {order.paymentMode}
                            </p>
                            {order.items.some(
                              (item) =>
                                getItemStatus(item, order.pickupDate).status ===
                                "Ready to be Picked",
                            ) ? (
                              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                Ready to be Picked
                              </div>
                            ) : (
                              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                Pending Pickup
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">
                No pickups scheduled
              </p>
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
