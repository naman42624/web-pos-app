import { useState, useMemo } from "react";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Loader,
} from "lucide-react";

export default function SalesStats() {
  const { sales, loading } = usePOSContext();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const stats = useMemo(() => {
    // Filter sales by month
    const monthlySales = sales.filter((sale) => {
      const saleDate = new Date(sale.date).toISOString().slice(0, 7);
      return saleDate === selectedMonth;
    });

    // Total revenue
    const totalRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0);

    // Total transactions
    const totalTransactions = monthlySales.length;

    // Average transaction value
    const averageValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Sales by payment mode
    const salesByPaymentMode = monthlySales.reduce(
      (acc, sale) => {
        const mode = sale.paymentMode || "cash";
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Revenue by payment mode
    const revenueByPaymentMode = monthlySales.reduce(
      (acc, sale) => {
        const mode = sale.paymentMode || "cash";
        acc[mode] = (acc[mode] || 0) + sale.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Daily sales
    const dailySales = monthlySales.reduce(
      (acc, sale) => {
        const date = new Date(sale.date).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { count: 0, revenue: 0 };
        }
        acc[date].count += 1;
        acc[date].revenue += sale.total;
        return acc;
      },
      {} as Record<string, { count: number; revenue: number }>,
    );

    // Top selling items
    const itemSales = monthlySales.reduce(
      (acc, sale) => {
        sale.items.forEach((item) => {
          if (!acc[item.name]) {
            acc[item.name] = { quantity: 0, revenue: 0 };
          }
          acc[item.name].quantity += item.quantity;
          acc[item.name].revenue += item.quantity * item.price;
        });
        return acc;
      },
      {} as Record<string, { quantity: number; revenue: number }>,
    );

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Order types
    const orderTypeCounts = monthlySales.reduce(
      (acc, sale) => {
        acc[sale.orderType] = (acc[sale.orderType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Payment status
    const paymentStatus = monthlySales.reduce(
      (acc, sale) => {
        const status = sale.paymentStatus || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Sale status distribution
    const saleStatus = monthlySales.reduce(
      (acc, sale) => {
        const status = sale.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalRevenue,
      totalTransactions,
      averageValue,
      salesByPaymentMode,
      revenueByPaymentMode,
      dailySales: Object.entries(dailySales)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topItems,
      orderTypeCounts,
      paymentStatus,
      saleStatus,
    };
  }, [sales, selectedMonth]);

  if (loading) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading statistics...</p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext?: string;
  }) => (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          {Icon}
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const paymentModes = [
    { key: "cash", label: "Cash" },
    { key: "upi", label: "UPI" },
    { key: "credit", label: "Credit" },
    { key: "cod", label: "COD" },
  ];

  const orderTypes = [
    { key: "pickup", label: "Pickup" },
    { key: "pickup_later", label: "Pickup Later" },
    { key: "delivery", label: "Delivery" },
  ];

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Stats</h1>
            <p className="text-slate-500 mt-2">
              Comprehensive sales analytics and insights
            </p>
          </div>
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtext={`from ${stats.totalTransactions} transactions`}
          />
          <StatCard
            icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
            label="Total Transactions"
            value={stats.totalTransactions.toString()}
            subtext={`Avg: ${formatCurrency(stats.averageValue)}`}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            label="Average Order Value"
            value={formatCurrency(stats.averageValue)}
            subtext={`Per transaction`}
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6 text-orange-600" />}
            label="Daily Average"
            value={formatCurrency(
              stats.dailySales.length > 0
                ? stats.totalRevenue / stats.dailySales.length
                : 0,
            )}
            subtext={`${stats.dailySales.length} days with sales`}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Mode Distribution */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Payment Mode Distribution
            </h2>
            <div className="space-y-4">
              {paymentModes.map((mode) => {
                const count = stats.salesByPaymentMode[mode.key] || 0;
                const revenue = stats.revenueByPaymentMode[mode.key] || 0;
                const percentage =
                  stats.totalTransactions > 0
                    ? (count / stats.totalTransactions) * 100
                    : 0;

                return (
                  <div key={mode.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {mode.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatCurrency(revenue)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Type Distribution */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Order Type Distribution
            </h2>
            <div className="space-y-4">
              {orderTypes.map((type) => {
                const count = stats.orderTypeCounts[type.key] || 0;
                const percentage =
                  stats.totalTransactions > 0
                    ? (count / stats.totalTransactions) * 100
                    : 0;

                return (
                  <div key={type.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {type.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Status */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Payment Status
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.paymentStatus)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {status}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Sale Status */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Order Status
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.saleStatus)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Daily Transactions */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Daily Activity
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.dailySales.length > 0 ? (
                stats.dailySales.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-2 rounded hover:bg-slate-50"
                  >
                    <span className="text-xs text-slate-600">
                      {new Date(day.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-900">
                        {day.count} order{day.count !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatCurrency(day.revenue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No sales data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Top 10 Selling Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topItems.length > 0 ? (
                  stats.topItems.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">
                        {formatCurrency(item.revenue / item.quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No item sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Transactions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Latest Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Payment Mode
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Order Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Payment Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Order Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .slice(0, 20)
                    .map((sale) => {
                      const getPaymentModeColor = (mode: string) => {
                        switch (mode) {
                          case "cash":
                            return "bg-green-50 text-green-700";
                          case "upi":
                            return "bg-blue-50 text-blue-700";
                          case "credit":
                            return "bg-orange-50 text-orange-700";
                          case "cod":
                            return "bg-purple-50 text-purple-700";
                          default:
                            return "bg-slate-50 text-slate-700";
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case "paid":
                            return "bg-green-50 text-green-700";
                          case "pending":
                            return "bg-amber-50 text-amber-700";
                          default:
                            return "bg-slate-50 text-slate-700";
                        }
                      };

                      const getOrderStatusColor = (status: string) => {
                        switch (status) {
                          case "pending":
                            return "bg-amber-50 text-amber-700";
                          case "pick_up_ready":
                            return "bg-blue-50 text-blue-700";
                          case "in_transit":
                            return "bg-purple-50 text-purple-700";
                          case "delivered":
                          case "picked_up":
                            return "bg-green-50 text-green-700";
                          case "cancelled":
                            return "bg-red-50 text-red-700";
                          default:
                            return "bg-slate-50 text-slate-700";
                        }
                      };

                      return (
                        <tr
                          key={sale.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                            #{sale.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {new Date(sale.date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPaymentModeColor(
                                sale.paymentMode || "cash",
                              )}`}
                            >
                              {sale.paymentMode || "Cash"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                            {sale.orderType.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                                sale.paymentStatus || "pending",
                              )}`}
                            >
                              {sale.paymentStatus || "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getOrderStatusColor(
                                sale.status || "pending",
                              )}`}
                            >
                              {(sale.status || "pending").replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(sale.total)}
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No transactions available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Showing latest 20 transactions
          </p>
        </div>
      </div>
    </SharedLayout>
  );
}
