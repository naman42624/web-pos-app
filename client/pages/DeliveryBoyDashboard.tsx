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
  ChevronRight,
  DollarSign,
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
  const {
    sales,
    updateSaleStatus,
    updateDeliveryBoy,
    markCashOnDeliveryReceived,
  } = usePOSContext();

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

  const handleToggleStatus = async () => {
    if (!session) return;

    const newStatus = session.status === "available" ? "busy" : "available";

    try {
      await updateDeliveryBoy(session.id, { status: newStatus });

      const updatedSession = { ...session, status: newStatus };
      setSession(updatedSession);
      localStorage.setItem(
        "deliveryBoySession",
        JSON.stringify(updatedSession),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
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

  const handleMarkCashReceived = async (saleId: string) => {
    try {
      await markCashOnDeliveryReceived(saleId);
      alert("Cash payment marked as received!");
    } catch (error) {
      console.error("Error marking cash as received:", error);
      alert("Failed to mark cash as received");
    }
  };

  const isCODOrder = (delivery: (typeof sales)[0]) => {
    return (
      delivery.paymentModes?.includes("cod") ||
      delivery.paymentMode === "cod"
    );
  };

  const getCODAmount = (delivery: (typeof sales)[0]) => {
    if (delivery.paymentAmounts && delivery.paymentAmounts.cod) {
      return delivery.paymentAmounts.cod;
    }
    // Fallback to total if it's a COD order but no breakdown exists
    if (isCODOrder(delivery)) {
      return delivery.total;
    }
    return 0;
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
                <button
                  onClick={handleToggleStatus}
                  className={cn(
                    "flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-200",
                    session.status === "available"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      session.status === "available"
                        ? "bg-green-500"
                        : "bg-yellow-500",
                    )}
                  />
                  <span className="text-sm">
                    Status:{" "}
                    {session.status === "available" ? "Available" : "Busy"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Pending Deliveries */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Pending Deliveries
            </h2>
            <p className="text-slate-600 mt-1">
              {inTransitDeliveries.length} order
              {inTransitDeliveries.length !== 1 ? "s" : ""} waiting for delivery
            </p>
          </div>

          {inTransitDeliveries.length > 0 ? (
            <div className="space-y-4 mb-12">
              {inTransitDeliveries.map((delivery, index) => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-6">
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

                    <div className="mb-4 space-y-2">
                      {delivery.items.map((item) => (
                        <div key={item.id} className="text-sm text-slate-600">
                          • {item.name} × {item.quantity}
                        </div>
                      ))}
                    </div>

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
                              <p className="text-xs text-slate-600">Address</p>
                              <p className="text-sm font-medium text-slate-900">
                                {delivery.deliveryDetails.receiverAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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

                    {delivery.paymentModes?.includes("cod") && (
                      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                            <div>
                              <p className="text-xs font-medium text-amber-700">
                                Cash to Collect
                              </p>
                              <p className="text-lg font-bold text-amber-900">
                                ₹{getCODAmount(delivery).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                          {delivery.paymentStatus !== "paid" && (
                            <button
                              onClick={() => handleMarkCashReceived(delivery.id)}
                              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                              Mark Received
                            </button>
                          )}
                          {delivery.paymentStatus === "paid" && (
                            <span className="px-3 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
                              ✓ Received
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {delivery.paymentModes?.includes("cod") ? (
                        <button
                          onClick={() => handleMarkDelivered(delivery.id)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark Delivery Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkDelivered(delivery.id)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-200 mb-12">
              <Truck className="w-12 h-12 text-blue-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">
                No pending deliveries
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Completed Today */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Completed Today
            </h2>
            <p className="text-slate-600 mt-1">
              {completedCount} order{completedCount !== 1 ? "s" : ""} delivered
            </p>
          </div>

          {completedCount > 0 ? (
            <div className="space-y-4 mb-12">
              {myDeliveries
                .filter((s) => s.status === "delivered")
                .map((delivery, index) => (
                  <div
                    key={delivery.id}
                    className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
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
                          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Delivered
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 space-y-2">
                        {delivery.items.map((item) => (
                          <div key={item.id} className="text-sm text-slate-600">
                            • {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>

                      {delivery.deliveryDetails && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-slate-900 mb-3">
                            Delivery Details
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                              <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                              <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200 mb-12">
              <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">
                No deliveries completed yet
              </p>
            </div>
          )}
        </div>

        {/* Section 3: All Orders Link */}
        <div>
          <button
            onClick={() => navigate("/delivery-boy/all-orders")}
            className="w-full bg-white hover:bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <Truck className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">
                      All Orders
                    </h3>
                    <p className="text-sm text-slate-600">
                      {myDeliveries.length} total order
                      {myDeliveries.length !== 1 ? "s" : ""} assigned • View
                      with filters & search
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
