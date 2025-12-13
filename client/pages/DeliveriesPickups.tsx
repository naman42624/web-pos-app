import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import { Truck, Clock, MapPin, Phone, User, Package, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeliveriesPickups() {
  const { sales } = usePOSContext();

  const deliveryAndPickupOrders = sales.filter(
    (sale) => sale.orderType === "pickup_later" || sale.orderType === "delivery"
  );

  const getOrderTypeLabel = (orderType: string) => {
    if (orderType === "pickup_later") return "Pick Up Later";
    if (orderType === "delivery") return "Delivery";
    return orderType;
  };

  const getOrderTypeColor = (orderType: string) => {
    if (orderType === "pickup_later") return "bg-blue-100 text-blue-800 border-blue-200";
    if (orderType === "delivery") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
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

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Deliveries & Pickups</h1>
          <p className="text-slate-500 mt-2">
            Manage scheduled deliveries and later pickups
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {deliveryAndPickupOrders.length > 0 ? (
            deliveryAndPickupOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {order.orderType === "delivery" ? (
                        <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Truck className="w-6 h-6 text-amber-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Order {order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Created: {formatDate(order.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium border text-sm",
                        getOrderTypeColor(order.orderType)
                      )}
                    >
                      {getOrderTypeLabel(order.orderType)}
                    </span>
                  </div>

                  {/* Items Summary */}
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-slate-600">
                          • {item.name} × {item.quantity} @ ₹{item.price.toFixed(2)} each
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-600">
                          {order.orderType === "delivery" ? "Delivery Date" : "Pickup Date"}
                        </p>
                        <p className="font-semibold text-slate-900">
                          {order.pickupDate ? formatDate(order.pickupDate) : "Not scheduled"}
                        </p>
                      </div>
                    </div>

                    {order.pickupTime && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-600">
                            {order.orderType === "delivery" ? "Delivery Time" : "Pickup Time"}
                          </p>
                          <p className="font-semibold text-slate-900">{formatTime(order.pickupTime)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery Details (if delivery) */}
                  {order.orderType === "delivery" && order.deliveryDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Receiver
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">Name</p>
                              <p className="font-medium text-slate-900">
                                {order.deliveryDetails.receiverName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">Phone</p>
                              <p className="font-medium text-slate-900">
                                {order.deliveryDetails.receiverPhone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">Address</p>
                              <p className="font-medium text-slate-900 text-sm">
                                {order.deliveryDetails.receiverAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Sender
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">Name</p>
                              <p className="font-medium text-slate-900">
                                {order.deliveryDetails.senderName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-slate-600">Phone</p>
                              <p className="font-medium text-slate-900">
                                {order.deliveryDetails.senderPhone}
                              </p>
                            </div>
                          </div>
                          {order.deliveryDetails.message && (
                            <div className="flex items-start gap-2">
                              <div>
                                <p className="text-sm text-slate-600">Message</p>
                                <p className="font-medium text-slate-900 text-sm">
                                  {order.deliveryDetails.message}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

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
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {order.orderType === "delivery" ? "Pending Delivery" : "Pending Pickup"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">No deliveries or pickups scheduled</p>
              <p className="text-slate-400 text-sm mt-2">
                Orders with scheduled dates will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
