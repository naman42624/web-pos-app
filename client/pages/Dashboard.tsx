import { Link } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  CreditCard,
  ArrowRight,
  Loader,
} from "lucide-react";

export default function Dashboard() {
  const {
    sales,
    customers,
    creditRecords,
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
  const totalCredit = creditRecords.reduce((sum, c) => sum + c.amount, 0);

  const recentSales = sales.slice(-5).reverse();

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Welcome back! Here's your sales overview.
            </p>
          </div>
          <Link
            to="/add-sale"
            className="inline-flex items-center justify-center sm:justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg w-full sm:w-auto"
          >
            <ShoppingCart className="w-5 h-5" />
            New Sale
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Today's Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Today's Sales
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  ₹{todayTotal.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Today's Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Transactions
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {todayCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Customers</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalCustomers}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Credit */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Credit Issued
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  ₹{totalCredit.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Sales</h2>
            <Link
              to="/add-sale"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentSales.length > 0 ? (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {sale.items.length} item
                      {sale.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(sale.date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ₹{sale.total.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-slate-500 mt-1 capitalize">
                      {sale.paymentMode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No sales yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Start by creating your first sale
              </p>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
