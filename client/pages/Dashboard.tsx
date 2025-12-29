import { Link } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  CreditCard,
  ArrowRight,
  Loader,
  Truck,
  Package,
} from "lucide-react";

export default function Dashboard() {
  const {
    sales,
    customers,
    getTodaySalesTotal,
    getTodayTransactionCount,
    loading,
  } = usePOSContext();

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
    const saleDate = new Date(sale.date).toISOString().split("T")[0];
    return saleDate === today;
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Delivery Status
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                to="/deliveries?status=pending"
                className="flex justify-between items-center py-2 border-b border-slate-200 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Pending</span>
                <span className="font-semibold text-slate-900">
                  {deliveryStatusCounts.pending}
                </span>
              </Link>
              <Link
                to="/deliveries?status=pick_up_ready"
                className="flex justify-between items-center py-2 border-b border-slate-200 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Ready for Pickup</span>
                <span className="font-semibold text-slate-900">
                  {deliveryStatusCounts.pick_up_ready}
                </span>
              </Link>
              <Link
                to="/deliveries?status=in_transit"
                className="flex justify-between items-center py-2 border-b border-slate-200 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">In Transit</span>
                <span className="font-semibold text-slate-900">
                  {deliveryStatusCounts.in_transit}
                </span>
              </Link>
              <Link
                to="/deliveries?status=delivered"
                className="flex justify-between items-center py-2 border-b border-slate-200 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Delivered</span>
                <span className="font-semibold text-slate-900">
                  {deliveryStatusCounts.delivered}
                </span>
              </Link>
              <Link
                to="/deliveries?status=cancelled"
                className="flex justify-between items-center py-2 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Cancelled</span>
                <span className="font-semibold text-slate-900">
                  {deliveryStatusCounts.cancelled}
                </span>
              </Link>
            </div>
          </div>

          {/* Pickups */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Pickup Status
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                to="/pickups?status=pending"
                className="flex justify-between items-center py-2 border-b border-slate-200 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Pending</span>
                <span className="font-semibold text-slate-900">
                  {pickupStatusCounts.pending}
                </span>
              </Link>
              <Link
                to="/pickups?status=pick_up_ready"
                className="flex justify-between items-center py-2 border-b border-slate-200 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Ready for Pickup</span>
                <span className="font-semibold text-slate-900">
                  {pickupStatusCounts.pick_up_ready}
                </span>
              </Link>
              <Link
                to="/pickups?status=picked_up"
                className="flex justify-between items-center py-2 border-b border-slate-200 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Picked Up</span>
                <span className="font-semibold text-slate-900">
                  {pickupStatusCounts.picked_up}
                </span>
              </Link>
              <Link
                to="/pickups?status=cancelled"
                className="flex justify-between items-center py-2 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
              >
                <span className="text-slate-600 text-sm">Cancelled</span>
                <span className="font-semibold text-slate-900">
                  {pickupStatusCounts.cancelled}
                </span>
              </Link>
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
              to="/add-sale"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 w-fit"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm sm:text-base">
                      {sale.items.length} item
                      {sale.items.length !== 1 ? "s" : ""}
                    </p>
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
                </div>
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
    </SharedLayout>
  );
}
