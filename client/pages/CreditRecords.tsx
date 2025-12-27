import { Link } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { CreditCard, TrendingUp } from "lucide-react";

export default function CreditRecords() {
  const { customers, sales } = usePOSContext();

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || "Unknown";
  };

  const creditSales = sales.filter((sale) => sale.paymentMode === "credit");
  const pendingCreditSales = creditSales.filter(
    (sale) => sale.paymentStatus !== "paid",
  );

  const totalCredit = creditSales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingCredit = pendingCreditSales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pending Credit</h1>
          <p className="text-slate-500 mt-2">
            View pending credit payments and customer payment status
          </p>
        </div>

        {/* Total Credit Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Pending Credit
              </p>
              <p className="text-4xl font-bold text-slate-900 mt-2">
                ₹{pendingCredit.toLocaleString("en-IN")}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Across {pendingCreditSales.length} transactions
              </p>
            </div>
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Credit Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {pendingCreditSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Sale ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pendingCreditSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/customer/${sale.customerId}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {sale.customerId
                            ? getCustomerName(sale.customerId)
                            : "Walk-in"}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-mono text-sm">
                          {sale.id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          ₹{sale.total.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-sm">
                          {new Date(sale.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(sale.date).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/customer/${sale.customerId}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                No pending credit records
              </p>
              <p className="text-slate-400 text-sm mt-1">
                All credit payments have been received
              </p>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
