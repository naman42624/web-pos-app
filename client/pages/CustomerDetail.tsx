import { useParams, Link, useNavigate } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { ArrowLeft, Phone, Mail, CreditCard, AlertCircle } from "lucide-react";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, getCreditRecordsByCustomer } = usePOSContext();

  const customer = customers.find((c) => c.id === id);
  const creditRecords = customer ? getCreditRecordsByCustomer(customer.id) : [];

  if (!customer) {
    return (
      <SharedLayout>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Customer Not Found
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-4">
              The customer you're looking for doesn't exist.
            </p>
            <Link
              to="/customers"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Customers
            </Link>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Customer Information
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500 font-medium">Name</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </p>
                <p className="text-lg text-slate-900 mt-1">{customer.phone}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="text-lg text-slate-900 mt-1">{customer.email}</p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Total Credit
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  ₹{customer.totalCredit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Credit Records */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Credit Records
            </h2>

            {creditRecords.length > 0 ? (
              <div className="space-y-3">
                {creditRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        Sale {record.saleId}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(record.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">
                      ₹{record.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No credit records</p>
                <p className="text-slate-400 text-sm mt-1">
                  This customer has no credit transactions yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
