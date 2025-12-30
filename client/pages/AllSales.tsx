import { useState, useMemo } from "react";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { SaleDetailModal } from "@/components/SaleDetailModal";
import { Sale } from "@/hooks/usePOS";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrderNumber } from "@/lib/utils";
import { format } from "date-fns";

export default function AllSales() {
  const { sales, customers, loadSaleDetails } = usePOSContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "quick-sale" | "regular-sale"
  >("all");
  const [filterPaymentMode, setFilterPaymentMode] = useState<
    "all" | "cash" | "upi" | "credit"
  >("all");
  const [filterOrderType, setFilterOrderType] = useState<
    "all" | "pickup" | "pickup_later" | "delivery"
  >("all");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Search filter
      const orderNumber = getOrderNumber(sale.id);
      const customer = customers.find((c) => c.id === sale.customerId);
      const customerName = customer?.name || "";
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        orderNumber.toLowerCase().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower) ||
        sale.total.toString().includes(searchTerm);

      // Sale type filter
      if (filterType === "quick-sale" && !sale.isQuickSale) return false;
      if (filterType === "regular-sale" && sale.isQuickSale) return false;

      // Payment mode filter
      if (filterPaymentMode !== "all" && sale.paymentMode !== filterPaymentMode)
        return false;

      // Order type filter
      if (filterOrderType !== "all" && sale.orderType !== filterOrderType)
        return false;

      return matchesSearch;
    });
  }, [
    sales,
    searchTerm,
    filterType,
    filterPaymentMode,
    filterOrderType,
    customers,
  ]);

  const handleSaleClick = async (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetail(true);
    if (sale.items.length === 0) {
      setLoadingDetails(true);
      try {
        await loadSaleDetails(sale.id);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const sortedSales = [...filteredSales].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            All Sales
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
            View and manage all sales with filters
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Order #, Customer, Amount..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Sale Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sale Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Sales</option>
                <option value="quick-sale">Quick Sales</option>
                <option value="regular-sale">Regular Sales</option>
              </select>
            </div>

            {/* Payment Mode Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Mode
              </label>
              <select
                value={filterPaymentMode}
                onChange={(e) => setFilterPaymentMode(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            {/* Order Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Order Type
              </label>
              <select
                value={filterOrderType}
                onChange={(e) => setFilterOrderType(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Types</option>
                <option value="pickup">Pickup</option>
                <option value="pickup_later">Pickup Later</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Sales ({sortedSales.length})
            </h2>
            <p className="text-sm text-slate-500">
              Total: ₹
              {sortedSales
                .reduce((sum, s) => sum + s.total, 0)
                .toLocaleString("en-IN")}
            </p>
          </div>

          {sortedSales.length > 0 ? (
            <div className="space-y-3">
              {sortedSales.map((sale) => {
                const customer = customers.find(
                  (c) => c.id === sale.customerId,
                );
                const orderNumber = getOrderNumber(sale.id);
                const saleDate = new Date(sale.date);

                return (
                  <button
                    key={sale.id}
                    onClick={() => handleSaleClick(sale)}
                    className="w-full text-left p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            Order {orderNumber}
                          </p>
                          {sale.isQuickSale && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              Quick Sale
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {customer ? customer.name : "Unknown Customer"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {sale.items.length} item
                          {sale.items.length !== 1 ? "s" : ""} •{" "}
                          {format(saleDate, "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right gap-4">
                        <div>
                          <p className="font-bold text-slate-900 text-base">
                            ₹{sale.total.toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs text-slate-500 capitalize mt-1">
                            {sale.paymentMode}
                          </p>
                        </div>
                        <div className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700 capitalize whitespace-nowrap">
                          {sale.orderType === "pickup_later"
                            ? "Pickup Later"
                            : sale.orderType}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No sales found</p>
              <p className="text-slate-400 text-sm mt-1">
                Try adjusting your filters
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
