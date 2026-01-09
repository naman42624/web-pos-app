import { useState } from "react";
import { Link } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { SaleDetailModal } from "@/components/SaleDetailModal";
import { Sale } from "@/hooks/usePOS";
import { getOrderNumber } from "@/lib/utils";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  CreditCard,
  ArrowRight,
  Loader,
  Truck,
  Package,
  MapPin,
} from "lucide-react";

export default function Dashboard() {
  const {
    sales,
    customers,
    getTodaySalesTotal,
    getTodayTransactionCount,
    loading,
  } = usePOSContext();

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetail, setShowSaleDetail] = useState(false);

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetail(true);
  };

  if (loading) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading your data...</p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const todayTotal = getTodaySalesTotal();
  const todayCount = getTodayTransactionCount();
  const totalCustomers = customers.length;
  const pendingCreditIssued = sales
    .filter(
      (sale) => sale.paymentMode === "credit" && sale.paymentStatus !== "paid",
    )
    .reduce((sum, sale) => sum + sale.total, 0);

  const today = new Date().toISOString().split("T")[0];

  const deliveryOrders = sales.filter((sale) => {
    if (sale.orderType !== "delivery") return false;
    if (!sale.pickupDate) return false;
    const deliveryDate = new Date(sale.pickupDate).toISOString().split("T")[0];
    return deliveryDate === today;
  });

  const pickupOrders = sales.filter((sale) => {
    if (sale.orderType !== "pickup_later") return false;
    if (!sale.pickupDate) return false;
    const pickupDate = new Date(sale.pickupDate).toISOString().split("T")[0];
    return pickupDate === today;
  });

  const deliveryStatusCounts = {
    pending: deliveryOrders.filter((o) => o.status === "pending").length,
    pick_up_ready: deliveryOrders.filter((o) => o.status === "pick_up_ready")
      .length,
    in_transit: deliveryOrders.filter((o) => o.status === "in_transit").length,
    delivered: deliveryOrders.filter((o) => o.status === "delivered").length,
    cancelled: deliveryOrders.filter((o) => o.status === "cancelled").length,
  };

  const pickupStatusCounts = {
    pending: pickupOrders.filter((o) => o.status === "pending").length,
    pick_up_ready: pickupOrders.filter((o) => o.status === "pick_up_ready")
      .length,
    picked_up: pickupOrders.filter((o) => o.status === "picked_up").length,
    cancelled: pickupOrders.filter((o) => o.status === "cancelled").length,
  };

  const recentSales = sales.slice(-5).reverse();

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Welcome back! Here's your sales overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/quick-sale"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-base sm:text-sm py-4 sm:py-3 px-6 sm:px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg order-2 sm:order-1"
            >
              <ShoppingCart className="w-6 h-6 sm:w-5 sm:h-5" />
              Quick Sale
            </Link>
            <Link
              to="/add-sale"
              className="inline-flex items-center justify-center sm:justify-start gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-base sm:text-sm py-4 sm:py-3 px-6 sm:px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg order-1 sm:order-2"
            >
              <ShoppingCart className="w-6 h-6 sm:w-5 sm:h-5" />
              New Sale
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Today's Sales */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Today's Sales
                </p>
                <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2 truncate">
                  ₹{todayTotal.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          {/* Today's Transactions */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Transactions
                </p>
                <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  {todayCount}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-lime-600" />
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Customers
                </p>
                <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                  {totalCustomers}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
            </div>
          </div>

          {/* Total Credit */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  Credit Issued (Pending)
                </p>
                <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2 truncate">
                  ₹{pendingCreditIssued.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Status Counts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Deliveries */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Delivery Status
              </h3>
            </div>
            <div className="space-y-6">
              {["pending", "pick_up_ready", "in_transit", "delivered", "cancelled"].map((status) => {
                const statusLabel = {
                  pending: "Pending",
                  pick_up_ready: "Ready for Pickup",
                  in_transit: "In Transit",
                  delivered: "Delivered",
                  cancelled: "Cancelled",
                }[status];

                const statusOrders = deliveryOrders.filter((o) => (o.status || "pending") === status);

                return (
                  <div key={status}>
                    <Link
                      to={`/deliveries?status=${status}`}
                      className="flex justify-between items-center mb-3 hover:text-blue-600 transition-colors"
                    >
                      <span className="text-slate-600 text-sm font-medium">{statusLabel}</span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {statusOrders.length}
                      </span>
                    </Link>
                    {statusOrders.length > 0 ? (
                      <div className="space-y-2 mb-4 pl-2 border-l-2 border-slate-200">
                        {statusOrders.map((order) => (
                          <div key={order.id} className="text-xs space-y-1 py-2">
                            <div className="font-semibold text-slate-900">
                              Order {getOrderNumber(order.id)}
                            </div>
                            {order.deliveryDetails?.receiverAddress && (
                              <div className="flex gap-2 text-slate-600">
                                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">
                                  {order.deliveryDetails.receiverAddress}
                                </span>
                              </div>
                            )}
                            {order.items.length > 0 && (
                              <div className="text-slate-600">
                                <span className="font-medium">{order.items.length} item{order.items.length !== 1 ? "s" : ""}:</span>
                                <div className="mt-1 space-y-0.5">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="text-slate-500 ml-4">
                                      • {item.name} × {item.quantity}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic mb-4">
                        No orders
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pickups */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Pickup Status
              </h3>
            </div>
            <div className="space-y-6">
              {["pending", "pick_up_ready", "picked_up", "cancelled"].map((status) => {
                const statusLabel = {
                  pending: "Pending",
                  pick_up_ready: "Ready for Pickup",
                  picked_up: "Picked Up",
                  cancelled: "Cancelled",
                }[status];

                const statusOrders = pickupOrders.filter((o) => (o.status || "pending") === status);

                return (
                  <div key={status}>
                    <Link
                      to={`/pickups?status=${status}`}
                      className="flex justify-between items-center mb-3 hover:text-blue-600 transition-colors"
                    >
                      <span className="text-slate-600 text-sm font-medium">{statusLabel}</span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {statusOrders.length}
                      </span>
                    </Link>
                    {statusOrders.length > 0 ? (
                      <div className="space-y-2 mb-4 pl-2 border-l-2 border-slate-200">
                        {statusOrders.map((order) => (
                          <div key={order.id} className="text-xs space-y-1 py-2">
                            <div className="font-semibold text-slate-900">
                              Order {getOrderNumber(order.id)}
                            </div>
                            {order.items.length > 0 && (
                              <div className="text-slate-600">
                                <span className="font-medium">{order.items.length} item{order.items.length !== 1 ? "s" : ""}:</span>
                                <div className="mt-1 space-y-0.5">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="text-slate-500 ml-4">
                                      • {item.name} × {item.quantity}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic mb-4">
                        No orders
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Recent Sales
            </h2>
            <Link
              to="/all-sales"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 w-fit"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <button
                  key={sale.id}
                  onClick={() => handleSaleClick(sale)}
                  className="w-full text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                        {sale.items.length} item
                        {sale.items.length !== 1 ? "s" : ""}
                      </p>
                      {sale.isQuickSale && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold whitespace-nowrap">
                          Quick Sale
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {new Date(sale.date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right gap-4">
                    <p className="font-bold text-slate-900 text-sm sm:text-base">
                      ₹{sale.total.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 capitalize whitespace-nowrap">
                      {sale.paymentMode}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                No sales yet
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Start by creating your first sale
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          isOpen={showSaleDetail}
          onClose={() => {
            setShowSaleDetail(false);
            setSelectedSale(null);
          }}
        />
      )}
    </SharedLayout>
  );
}
