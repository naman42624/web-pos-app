import { useState } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { SaleDetailModal } from "@/components/SaleDetailModal";
import { Sale } from "@/hooks/usePOS";
import { getOrderNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Loader, Truck, Package, MapPin } from "lucide-react";

export default function Dashboard() {
  const { sales, loading } = usePOSContext();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
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

  const deliveryOrders = sales.filter((sale) => {
    if (sale.orderType !== "delivery") return false;
    if (!sale.pickupDate) return false;
    const deliveryDate = new Date(sale.pickupDate).toISOString().split("T")[0];
    return deliveryDate === selectedDate;
  });

  const pickupOrders = sales.filter((sale) => {
    if (sale.orderType !== "pickup_later") return false;
    if (!sale.pickupDate) return false;
    const pickupDate = new Date(sale.pickupDate).toISOString().split("T")[0];
    return pickupDate === selectedDate;
  });

  const deliveryStatuses = [
    "pending",
    "pick_up_ready",
    "in_transit",
    "delivered",
    "cancelled",
  ];
  const pickupStatuses = ["pending", "pick_up_ready", "picked_up", "cancelled"];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      pick_up_ready: "Ready",
      in_transit: "In Transit",
      delivered: "Delivered",
      picked_up: "Picked Up",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 border-amber-200";
      case "pick_up_ready":
        return "bg-blue-50 border-blue-200";
      case "in_transit":
        return "bg-purple-50 border-purple-200";
      case "delivered":
      case "picked_up":
        return "bg-green-50 border-green-200";
      case "cancelled":
        return "bg-red-50 border-red-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getStatusBgBorder = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 border-amber-300";
      case "pick_up_ready":
        return "bg-blue-100 border-blue-300";
      case "in_transit":
        return "bg-purple-100 border-purple-300";
      case "delivered":
      case "picked_up":
        return "bg-green-100 border-green-300";
      case "cancelled":
        return "bg-red-100 border-red-300";
      default:
        return "bg-slate-100 border-slate-300";
    }
  };

  const KanbanBoard = ({
    title,
    orders,
    statuses,
    icon: Icon,
    orderType,
    date,
  }: {
    title: string;
    orders: Sale[];
    statuses: string[];
    icon: React.ReactNode;
    orderType: string;
    date: string;
  }) => {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            {Icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">
              Scheduled for{" "}
              {new Date(date).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4 pb-4">
          {/* Large columns: Pending and Ready */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {statuses.slice(0, 2).map((status) => {
              const statusOrders = orders.filter(
                (o) => (o.status || "pending") === status,
              );
              return (
                <div key={status}>
                  <div
                    className={`${getStatusBgBorder(status)} rounded-lg p-4 border`}
                  >
                    <div className="mb-4 pb-4 border-b border-slate-300">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {getStatusLabel(status)}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {statusOrders.length}{" "}
                        {statusOrders.length === 1 ? "order" : "orders"}
                      </p>
                    </div>

                    <div className="space-y-3 min-h-[300px]">
                      {statusOrders.length > 0 ? (
                        statusOrders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => handleSaleClick(order)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${getStatusColor(status)}`}
                          >
                            <div className="space-y-2">
                              <div className="font-semibold text-slate-900 text-sm">
                                Order {getOrderNumber(order.id)}
                              </div>

                              {order.deliveryDetails?.receiverAddress && (
                                <div className="flex gap-2 text-slate-700">
                                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs line-clamp-2">
                                    {order.deliveryDetails.receiverAddress}
                                  </span>
                                </div>
                              )}

                              {order.items.length > 0 && (
                                <div className="border-t border-slate-300 pt-2">
                                  <p className="text-xs font-medium text-slate-700 mb-1">
                                    {order.items.length} item
                                    {order.items.length !== 1 ? "s" : ""}
                                  </p>
                                  <div className="space-y-0.5">
                                    {order.items
                                      .slice(0, 3)
                                      .map((item, idx) => (
                                        <p
                                          key={idx}
                                          className="text-xs text-slate-600"
                                        >
                                          • {item.name} × {item.quantity}
                                        </p>
                                      ))}
                                    {order.items.length > 3 && (
                                      <p className="text-xs text-slate-500 italic">
                                        +{order.items.length - 3} more
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="border-t border-slate-300 pt-2 mt-2">
                                <p className="text-xs font-medium text-slate-900">
                                  ₹{order.total.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-400">
                          <p className="text-xs italic">No orders</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Small columns: In Transit, Delivered, Cancelled */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statuses.slice(2).map((status) => {
              const statusOrders = orders.filter(
                (o) => (o.status || "pending") === status,
              );
              return (
                <div key={status}>
                  <div
                    className={`${getStatusBgBorder(status)} rounded-lg p-3 border`}
                  >
                    <div className="mb-3 pb-3 border-b border-slate-300">
                      <h3 className="font-semibold text-slate-900 text-xs">
                        {getStatusLabel(status)}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {statusOrders.length}{" "}
                        {statusOrders.length === 1 ? "order" : "orders"}
                      </p>
                    </div>

                    <div className="space-y-2 min-h-[200px] overflow-y-auto">
                      {statusOrders.length > 0 ? (
                        statusOrders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => handleSaleClick(order)}
                            className={`w-full text-left p-2 rounded border transition-all hover:shadow-md ${getStatusColor(status)}`}
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-900 text-xs">
                                Order {getOrderNumber(order.id)}
                              </div>

                              {order.items.length > 0 && (
                                <div className="text-xs text-slate-600">
                                  {order.items.length} item
                                  {order.items.length !== 1 ? "s" : ""}
                                </div>
                              )}

                              <div className="text-xs font-medium text-slate-900">
                                ₹{order.total.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-[200px] text-slate-400">
                          <p className="text-xs italic">No orders</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Operations Dashboard
              </h1>
              <p className="text-slate-500 mt-2">
                Manage deliveries and pickups
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                to="/quick-sale"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-sm py-3 px-6 rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Quick Sale
              </Link>
              <Link
                to="/add-sale"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-sm py-3 px-6 rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                New Sale
              </Link>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-end gap-4">
            <div className="w-full sm:w-48">
              <Label
                htmlFor="dashboard-date"
                className="text-sm font-medium text-slate-700 block mb-2"
              >
                View Orders for Date
              </Label>
              <Input
                id="dashboard-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Deliveries Kanban */}
        <KanbanBoard
          title="Deliveries"
          orders={deliveryOrders}
          statuses={deliveryStatuses}
          icon={<Truck className="w-6 h-6 text-orange-600" />}
          orderType="delivery"
          date={selectedDate}
        />

        {/* Pickups Kanban */}
        <KanbanBoard
          title="Pickups"
          orders={pickupOrders}
          statuses={pickupStatuses}
          icon={<Package className="w-6 h-6 text-purple-600" />}
          orderType="pickup_later"
          date={selectedDate}
        />

        {/* Latest Transactions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Latest Transactions
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Recent sales and transactions across all channels
            </p>
          </div>

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
                    .slice(0, 15)
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

                      const formatCurrency = (amount: number) => {
                        return `₹${amount.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}`;
                      };

                      return (
                        <tr
                          key={sale.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => handleSaleClick(sale)}
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
            Showing latest 15 transactions • Click to view details
          </p>
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
