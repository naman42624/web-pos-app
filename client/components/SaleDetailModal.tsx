import { useState } from "react";
import { Sale } from "@/hooks/usePOS";
import { X, Printer, Eye, AlertCircle } from "lucide-react";
import { ReceiptModal } from "./ReceiptModal";
import { usePOSContext } from "@/contexts/usePOSContext";
import { getOrderNumber } from "@/lib/utils";
import { format } from "date-fns";

interface SaleDetailModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
}

export function SaleDetailModal({
  sale,
  isOpen,
  onClose,
}: SaleDetailModalProps) {
  const { customers, items: inventoryItems, updateSaleStatus } =
    usePOSContext();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  if (!isOpen) return null;

  const customer = customers.find((c) => c.id === sale.customerId);
  const orderNumber = getOrderNumber(sale.id);
  const saleDate = new Date(sale.date);

  const getItemName = (itemId?: string, customName?: string): string => {
    if (customName) return customName;
    if (!itemId) return "Custom Item";
    const item = inventoryItems.find((i) => i.id === itemId);
    return item?.name || "Unknown Item";
  };

  const getItemPrice = (itemId?: string, customPrice?: number): number => {
    if (customPrice !== undefined && customPrice !== null) return customPrice;
    if (!itemId) return 0;
    const item = inventoryItems.find((i) => i.id === itemId);
    return item?.price || 0;
  };

  const getStatusOptions = () => {
    if (sale.orderType === "delivery") {
      return [
        { value: "pending", label: "Pending" },
        { value: "pick_up_ready", label: "Ready for Pickup" },
        { value: "in_transit", label: "In Transit" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
      ];
    } else if (sale.orderType === "pickup_later") {
      return [
        { value: "pending", label: "Pending" },
        { value: "pick_up_ready", label: "Ready for Pickup" },
        { value: "picked_up", label: "Picked Up" },
        { value: "cancelled", label: "Cancelled" },
      ];
    }
    return [];
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === (sale.status || "pending")) return;

    setIsUpdatingStatus(true);
    setStatusError(null);

    try {
      await updateSaleStatus(
        sale.id,
        newStatus as
          | "pending"
          | "pick_up_ready"
          | "in_transit"
          | "delivered"
          | "picked_up"
          | "cancelled",
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update status";
      setStatusError(errorMsg);
      console.error("Status update error:", errorMsg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Order {orderNumber}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {format(saleDate, "MMM dd, yyyy • HH:mm:ss")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Status</p>
                {sale.isQuickSale ? (
                  <p className="text-lg font-semibold text-slate-900">
                    Quick Sale
                  </p>
                ) : (
                  <select
                    value={sale.status || "pending"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm font-medium text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                  >
                    {getStatusOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {statusError && (
                  <div className="mt-2 flex items-start gap-2 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{statusError}</span>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                <p className="text-lg font-semibold text-blue-600">
                  ₹{sale.total.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            {customer && (
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="text-slate-900 font-medium">
                      {customer.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phone:</span>
                    <span className="text-slate-900 font-medium">
                      {customer.phone}
                    </span>
                  </div>
                  {customer.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="text-slate-900 font-medium">
                        {customer.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">
                Items ({sale.items.length})
              </h3>
              <div className="space-y-3">
                {sale.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-b border-slate-100 pb-3 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>

                    {/* Composition */}
                    {item.composition && item.composition.length > 0 && (
                      <div className="ml-4 mt-2 text-xs space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                        <p className="font-semibold text-slate-700 mb-1">
                          Contains:
                        </p>
                        {item.composition.map((comp, compIdx) => (
                          <div key={compIdx} className="flex justify-between">
                            <span className="text-slate-600">
                              {getItemName(comp.itemId, comp.customName)} ×{" "}
                              {comp.quantity}
                            </span>
                            <span className="text-slate-700 font-medium">
                              ₹
                              {(
                                getItemPrice(comp.itemId, comp.customPrice) *
                                comp.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">
                Payment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900 font-medium">
                    ₹
                    {sale.items
                      .reduce(
                        (sum, item) => sum + item.quantity * item.price,
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>

                {sale.discountAmount && sale.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount (
                      {sale.discountType === "percentage"
                        ? `${sale.discountValue}%`
                        : "Fixed"}
                      ):
                    </span>
                    <span className="font-medium">
                      -₹{sale.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {sale.deliveryCharges && sale.deliveryCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery Charges:</span>
                    <span className="text-slate-900 font-medium">
                      +₹{sale.deliveryCharges.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="font-semibold text-slate-900">Total:</span>
                  <span className="font-bold text-lg text-slate-900">
                    ₹{sale.total.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-slate-600 mb-1">Payment Method:</p>
                  {sale.paymentModes && sale.paymentModes.length > 1 ? (
                    <div className="space-y-1">
                      {sale.paymentModes.map((mode) => (
                        <div
                          key={mode}
                          className="flex justify-between text-sm"
                        >
                          <span className="capitalize text-slate-700">
                            {mode}:
                          </span>
                          <span className="font-medium text-slate-900">
                            ₹{(sale.paymentAmounts?.[mode] || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-900 font-medium capitalize">
                      {sale.paymentMode || "Cash"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Type Details */}
            {sale.orderType !== "pickup" && (
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">
                  {sale.orderType === "pickup_later"
                    ? "Pickup Details"
                    : "Delivery Details"}
                </h3>
                <div className="space-y-2 text-sm">
                  {sale.pickupDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        {sale.orderType === "pickup_later"
                          ? "Scheduled Pickup Date:"
                          : "Delivery Date:"}
                      </span>
                      <span className="text-slate-900 font-medium">
                        {sale.pickupDate}
                      </span>
                    </div>
                  )}
                  {sale.pickupTime && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        {sale.orderType === "pickup_later"
                          ? "Scheduled Time:"
                          : "Delivery Time:"}
                      </span>
                      <span className="text-slate-900 font-medium">
                        {sale.pickupTime}
                      </span>
                    </div>
                  )}

                  {sale.deliveryDetails && sale.orderType === "delivery" && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                      <p className="font-semibold text-slate-900">
                        Delivery Address:
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">To:</span>{" "}
                        {sale.deliveryDetails.receiverName}
                      </p>
                      <p className="text-slate-700">
                        {sale.deliveryDetails.receiverAddress}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">Phone:</span>{" "}
                        {sale.deliveryDetails.receiverPhone}
                      </p>
                      {sale.deliveryDetails.message && (
                        <p className="text-slate-700 italic mt-2">
                          <span className="font-medium">Note:</span>{" "}
                          {sale.deliveryDetails.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        sale={sale}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </>
  );
}
