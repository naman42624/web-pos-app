import { useParams, Link, useNavigate } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { ArrowLeft, Phone, Mail, CreditCard, AlertCircle, Check, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, getCreditRecordsByCustomer, recordPayment, sales } = usePOSContext();
  const [recordingPayment, setRecordingPayment] = useState<string | null>(null);

  const customer = customers.find((c) => c.id === id);
  const creditRecords = customer ? getCreditRecordsByCustomer(customer.id) : [];

  const handleRecordPayment = async (saleId: string, amount: number) => {
    try {
      setRecordingPayment(saleId);
      await recordPayment(saleId);
      toast.success(`Payment of ₹${amount.toLocaleString("en-IN")} recorded`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to record payment";
      toast.error(errorMsg);
      console.error("Error recording payment:", error);
    } finally {
      setRecordingPayment(null);
    }
  };

  const getPaymentStatus = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    return sale?.paymentStatus || "pending";
  };

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
                {creditRecords.map((record) => {
                  const paymentStatus = getPaymentStatus(record.saleId);
                  const isPaid = paymentStatus === "paid";

                  return (
                    <div
                      key={record.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        isPaid
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-slate-900">
                            Sale {record.saleId}
                          </p>
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <Check className="w-3 h-3" />
                              Paid
                            </span>
                          )}
                        </div>
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
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-slate-900">
                          ₹{record.amount.toLocaleString("en-IN")}
                        </p>
                        {!isPaid && (
                          <button
                            onClick={() =>
                              handleRecordPayment(record.saleId, record.amount)
                            }
                            disabled={recordingPayment === record.saleId}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                          >
                            {recordingPayment === record.saleId ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Recording...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Record Payment
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
