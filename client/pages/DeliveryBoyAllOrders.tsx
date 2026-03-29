import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "@/lib/api";
import { Sale } from "@/hooks/usePOS";
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Search,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn, getOrderNumber } from "@/lib/utils";

interface DeliveryBoySession {
  id: string;
  name: string;
  phone: string;
  status: "available" | "busy";
}

export default function DeliveryBoyAllOrders() {
  const navigate = useNavigate();

  const [session, setSession] = useState<DeliveryBoySession | null>(null);
  const [myDeliveries, setMyDeliveries] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "pick_up_ready" | "in_transit" | "delivered" | "cancelled"
  >("all");
  const [sortBy, setSortBy] = useState<"recent" | "amount" | "status">(
    "recent",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const sessionData = localStorage.getItem("deliveryBoySession");
    if (!sessionData) {
      navigate("/delivery-boy/login");
      return;
    }

    const parsedSession = JSON.parse(sessionData) as DeliveryBoySession;
    setSession(parsedSession);

    // Load delivery boy's assigned sales from API
    const loadDeliveries = async () => {
      try {
        console.log("[DeliveryBoyAllOrders] Loading deliveries for boy ID:", parsedSession.id);
        const data = await api.fetchDeliveryBoySales(parsedSession.id);
        console.log("[DeliveryBoyAllOrders] API response received:", data);

        if (data && Array.isArray(data)) {
          console.log(`[DeliveryBoyAllOrders] Found ${data.length} deliveries`);
          const deliveries = data.map((sale: any) => ({
            id: sale.id,
            items: sale.items || [],
            paymentMode: sale.paymentMode,
            paymentModes: sale.paymentModes,
            paymentAmounts: sale.paymentAmounts,
            customerId: sale.customerId,
            total: parseFloat(sale.total),
            subtotal: sale.subtotal ? parseFloat(sale.subtotal) : undefined,
            gstAmount: sale.gstAmount ? parseFloat(sale.gstAmount) : undefined,
            date: sale.date,
            orderType: sale.orderType,
            pickupDate: sale.pickupDate,
            pickupTime: sale.pickupTime,
            discountType: sale.discountType,
            discountValue: sale.discountValue ? parseFloat(sale.discountValue) : undefined,
            discountAmount: sale.discountAmount ? parseFloat(sale.discountAmount) : undefined,
            deliveryCharges: sale.deliveryCharges ? parseFloat(sale.deliveryCharges) : undefined,
            deliveryDetails: sale.deliveryDetails,
            status: sale.status || "pending",
            paymentStatus: sale.paymentStatus || "pending",
            assignedDeliveryBoyId: sale.assignedDeliveryBoyId,
            isQuickSale: sale.isQuickSale || false,
          }));
          setMyDeliveries(deliveries);
        } else {
          console.log("[DeliveryBoyAllOrders] No data received or data is not an array. Data:", data);
          setMyDeliveries([]);
        }
      } catch (error) {
        console.error("[DeliveryBoyAllOrders] Error loading delivery boy sales:", error);
        setMyDeliveries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliveries();
  }, [navigate]);

  // Filter and search logic
  const filteredDeliveries = myDeliveries.filter((delivery) => {
    // Status filter
    if (statusFilter !== "all" && delivery.status !== statusFilter) {
      return false;
    }

    // Search by Order ID or receiver name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOrderId = delivery.id.toLowerCase().includes(query);
      const matchesReceiverName =
        delivery.deliveryDetails?.receiverName.toLowerCase().includes(query) ||
        false;

      if (!matchesOrderId && !matchesReceiverName) {
        return false;
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const deliveryDate = delivery.pickupDate
        ? new Date(delivery.pickupDate)
        : null;

      if (dateFrom && deliveryDate) {
        const fromDate = new Date(dateFrom);
        if (deliveryDate < fromDate) return false;
      }

      if (dateTo && deliveryDate) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (deliveryDate > toDate) return false;
      }
    }

    return true;
  });

  // Sort logic
  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    if (sortBy === "recent") {
      const dateA = a.pickupDate ? new Date(a.pickupDate).getTime() : 0;
      const dateB = b.pickupDate ? new Date(b.pickupDate).getTime() : 0;
      return dateB - dateA;
    } else if (sortBy === "amount") {
      return b.total - a.total;
    } else if (sortBy === "status") {
      if (a.status === "delivered" && b.status === "in_transit") return 1;
      if (a.status === "in_transit" && b.status === "delivered") return -1;
      return 0;
    }
    return 0;
  });

  const isCODOrder = (delivery: Sale) => {
    return (
      (delivery as any).paymentModes?.includes("cod") || (delivery as any).paymentMode === "cod"
    );
  };

  const getCODAmount = (delivery: Sale) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/delivery-boy/dashboard")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                All Orders
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Search & Filter
          </h2>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID or receiver name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "pending" | "pick_up_ready" | "in_transit" | "delivered" | "cancelled",
                    )
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="pick_up_ready">Ready for Pickup</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "recent" | "amount" | "status")
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="amount">Highest Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || statusFilter !== "all" || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold">{sortedDeliveries.length}</span> of{" "}
            <span className="font-semibold">{myDeliveries.length}</span> orders
          </p>
        </div>

        {/* Orders List */}
        {sortedDeliveries.length > 0 ? (
          <div className="space-y-4">
            {sortedDeliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                          delivery.status === "delivered"
                            ? "bg-green-100"
                            : "bg-blue-100",
                        )}
                      >
                        {delivery.status === "delivered" ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Truck className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Order {getOrderNumber(delivery.id)}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Order ID: {delivery.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>
                        {isCODOrder(delivery) ? (
                          <>
                            <p className="text-xs text-slate-600 mb-1">
                              Cash to Collect
                            </p>
                            <p className="text-2xl font-bold text-amber-900">
                              ₹{getCODAmount(delivery).toLocaleString("en-IN")}
                            </p>
                            {delivery.paymentStatus === "paid" && (
                              <p className="text-xs font-semibold text-green-700 mt-1">
                                ✓ Received
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-slate-900">
                            ₹{delivery.total.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full",
                          delivery.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {delivery.status === "delivered"
                          ? "Delivered"
                          : "In Transit"}
                      </span>
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
                    <div
                      className={cn(
                        "rounded-lg p-4",
                        delivery.status === "delivered"
                          ? "bg-green-50 border border-green-200"
                          : "bg-blue-50 border border-blue-200",
                      )}
                    >
                      <p className="text-sm font-semibold text-slate-900 mb-3">
                        Delivery Details
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User
                            className={cn(
                              "w-4 h-4 mt-0.5 flex-shrink-0",
                              delivery.status === "delivered"
                                ? "text-green-600"
                                : "text-blue-600",
                            )}
                          />
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
                          <Phone
                            className={cn(
                              "w-4 h-4 mt-0.5 flex-shrink-0",
                              delivery.status === "delivered"
                                ? "text-green-600"
                                : "text-blue-600",
                            )}
                          />
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
                          <MapPin
                            className={cn(
                              "w-4 h-4 mt-0.5 flex-shrink-0",
                              delivery.status === "delivered"
                                ? "text-green-600"
                                : "text-blue-600",
                            )}
                          />
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

                  {/* Date Info */}
                  {delivery.pickupDate && (
                    <div className="mt-4 text-sm text-slate-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(delivery.pickupDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">
              No orders found
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
