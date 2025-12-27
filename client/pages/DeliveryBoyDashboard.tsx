import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePOSContext } from "@/contexts/usePOSContext";
import {
  LogOut,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryBoySession {
  id: string;
  name: string;
  phone: string;
  status: "available" | "busy";
}

export default function DeliveryBoyDashboard() {
  const navigate = useNavigate();
  const { sales, updateSaleStatus } = usePOSContext();

  const [session, setSession] = useState<DeliveryBoySession | null>(null);
  const [myDeliveries, setMyDeliveries] = useState<(typeof sales)[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const sessionData = localStorage.getItem("deliveryBoySession");
    if (!sessionData) {
      navigate("/delivery-boy/login");
      return;
    }

    const parsedSession = JSON.parse(sessionData) as DeliveryBoySession;
    setSession(parsedSession);

    // Filter sales assigned to this delivery boy that are in transit
    const assigned = sales.filter(
      (sale) =>
        sale.assignedDeliveryBoyId === parsedSession.id &&
        (sale.status === "in_transit" || sale.status === "delivered"),
    );

    setMyDeliveries(assigned);
    setCompletedCount(assigned.filter((s) => s.status === "delivered").length);
  }, [sales, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("deliveryBoySession");
    navigate("/delivery-boy/login");
  };

  const handleMarkDelivered = async (saleId: string) => {
    try {
      await updateSaleStatus(saleId, "delivered");
      alert("Order marked as delivered!");
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert("Failed to mark order as delivered");
    }
  };

  if (!session) {
    return null;
  }

  const inTransitDeliveries = myDeliveries.filter(
    (s) => s.status === "in_transit",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Delivery Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {session.name}
                </h2>
                <p className="text-slate-600">Phone: {session.phone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      session.status === "available"
                        ? "bg-green-500"
                        : "bg-yellow-500",
                    )}
                  />
                  <span className="text-sm font-medium text-slate-600">
                    Status:{" "}
                    {session.status === "available" ? "Available" : "Busy"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Pending Deliveries</p>
            <p className="text-3xl font-bold text-slate-900">
              {inTransitDeliveries.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Completed Today</p>
            <p className="text-3xl font-bold text-green-600">
              {completedCount}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Total Assigned</p>
            <p className="text-3xl font-bold text-blue-600">
              {myDeliveries.length}
            </p>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-6">
          {inTransitDeliveries.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Deliveries to Complete ({inTransitDeliveries.length})
              </h2>
              <div className="space-y-4">
                {inTransitDeliveries.map((delivery, index) => (
                  <div
                    key={delivery.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Truck className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              Order #{index + 1}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Order ID: {delivery.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            ₹{delivery.total.toLocaleString("en-IN")}
                          </p>
                          <p className="text-sm text-slate-600 capitalize">
                            {delivery.paymentMode}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4 space-y-2">
                        {delivery.items.map((item) => (
                          <div key={item.id} className="text-sm text-slate-600">
                            • {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>

                      {/* Delivery Details */}
                      {delivery.deliveryDetails && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-slate-900 mb-3">
                            Delivery Details
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-600">
                                  Receiver Name
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                  {delivery.deliveryDetails.receiverName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-600">
                                  Receiver Phone
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                  {delivery.deliveryDetails.receiverPhone}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-600">
                                  Address
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                  {delivery.deliveryDetails.receiverAddress}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Schedule */}
                      {delivery.pickupDate && (
                        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(delivery.pickupDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </div>
                          {delivery.pickupTime && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {delivery.pickupTime}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => handleMarkDelivered(delivery.id)}
                        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Mark as Delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : completedCount > 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-slate-900 font-semibold text-lg mb-2">
                All Deliveries Completed!
              </p>
              <p className="text-slate-600">
                You've completed {completedCount} deliveries today
              </p>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">
                No deliveries assigned yet
              </p>
              <p className="text-slate-400 text-sm mt-2">
                You will see deliveries here once they're assigned
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
