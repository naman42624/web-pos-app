import { Sale, SaleItem } from "@/hooks/usePOS";
import { getOrderNumber } from "@/lib/utils";
import { usePOSContext } from "@/contexts/usePOSContext";
import { format } from "date-fns";

interface ReceiptProps {
  sale: Sale;
}

export function Receipt({ sale }: ReceiptProps) {
  const { customers, items: inventoryItems } = usePOSContext();

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

  return (
    <div className="w-full bg-white p-8 print:p-3 text-slate-900 text-sm print:text-xs font-mono" style={{ maxWidth: "100%" }}>
      {/* Header */}
      <div className="text-center mb-4 print:mb-2 border-b border-slate-300 pb-2 print:pb-1">
        <h1 className="text-2xl print:text-base font-bold tracking-wide">
          RECEIPT
        </h1>
        <p className="text-xs print:text-xs text-slate-600 mt-0.5 print:mt-0">
          Thank you!
        </p>
      </div>

      {/* Order Info */}
      <div className="mb-3 print:mb-2 text-xs">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Order #:</span>
          <span className="font-bold text-base print:text-sm">
            {orderNumber}
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Date:</span>
          <span>{format(saleDate, "MMM dd")}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Time:</span>
          <span>{format(saleDate, "HH:mm")}</span>
        </div>
      </div>

      {/* Customer Info */}
      {customer && (
        <div className="mb-2 print:mb-1 text-xs border-t border-slate-300 pt-1 print:pt-0.5">
          <div className="font-semibold mb-0.5">Customer</div>
          <div className="flex justify-between text-xs">
            <span>Name:</span>
            <span className="text-right truncate ml-1">{customer.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Phone:</span>
            <span className="text-right">{customer.phone}</span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mb-2 print:mb-1 border-t border-b border-slate-300 py-2 print:py-1">
        <div className="font-semibold text-xs mb-1 print:mb-0.5">Items</div>
        <div className="space-y-0.5 print:space-y-0">
          {sale.items.map((item, idx) => (
            <div key={idx}>
              {/* Item main line */}
              <div className="flex justify-between text-xs leading-tight">
                <span className="flex-1 truncate">
                  {item.name} ×{item.quantity}
                </span>
                <span className="ml-1 font-semibold text-right whitespace-nowrap">
                  ₹{(item.quantity * item.price).toFixed(2)}
                </span>
              </div>

              {/* Unit price */}
              <div className="text-xs text-slate-600 flex justify-end pr-1 leading-tight">
                @ ₹{item.price.toFixed(2)}
              </div>

              {/* Composition if present */}
              {item.composition && item.composition.length > 0 && (
                <div className="ml-2 mt-0.5 text-xs text-slate-600 border-l border-slate-300 pl-1">
                  {item.composition.map((comp, compIdx) => (
                    <div key={compIdx} className="flex justify-between text-xs leading-tight">
                      <span className="truncate">
                        {getItemName(comp.itemId, comp.customName)} ×{comp.quantity}
                      </span>
                      <span className="ml-1 text-right whitespace-nowrap">
                        ₹{((getItemPrice(comp.itemId, comp.customPrice) * comp.quantity).toFixed(2))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mb-2 print:mb-1 space-y-0.5 print:space-y-0">
        <div className="flex justify-between text-xs leading-tight">
          <span>Subtotal:</span>
          <span className="font-semibold">
            ₹
            {sale.items
              .reduce((sum, item) => sum + item.quantity * item.price, 0)
              .toFixed(2)}
          </span>
        </div>

        {sale.discountAmount && sale.discountAmount > 0 && (
          <div className="flex justify-between text-xs text-green-600 leading-tight">
            <span>
              Discount{sale.discountType === "percentage"
                ? ` (${sale.discountValue}%)`
                : ""}:
            </span>
            <span className="font-semibold">
              -₹{sale.discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {sale.deliveryCharges && sale.deliveryCharges > 0 && (
          <div className="flex justify-between text-xs leading-tight">
            <span>Delivery:</span>
            <span className="font-semibold">
              +₹{sale.deliveryCharges.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-xs font-bold border-t border-slate-300 pt-1 print:pt-0.5 mt-1 print:mt-0 leading-tight">
          <span>TOTAL:</span>
          <span className="text-sm print:text-xs">
            ₹{sale.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-6 print:mb-4 text-xs border-t border-slate-300 pt-3 print:pt-2">
        <div className="font-semibold mb-2">Payment Method</div>
        {sale.paymentModes && sale.paymentModes.length > 1 ? (
          <div className="space-y-1">
            {sale.paymentModes.map((mode) => (
              <div key={mode} className="flex justify-between">
                <span className="capitalize">{mode}:</span>
                <span className="font-semibold">
                  ₹{(sale.paymentAmounts?.[mode] || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="capitalize">{sale.paymentMode || "Cash"}:</span>
            <span className="font-semibold">₹{sale.total.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Order Type Info */}
      {sale.orderType !== "pickup" && (
        <div className="mb-6 print:mb-4 text-xs border-t border-slate-300 pt-3 print:pt-2">
          <div className="font-semibold mb-2">
            {sale.orderType === "pickup_later"
              ? "Pickup Details"
              : "Delivery Details"}
          </div>
          {sale.pickupDate && (
            <div className="flex justify-between mb-1">
              <span>
                {sale.orderType === "pickup_later"
                  ? "Pickup Date:"
                  : "Delivery Date:"}
              </span>
              <span>{sale.pickupDate}</span>
            </div>
          )}
          {sale.pickupTime && (
            <div className="flex justify-between mb-2">
              <span>
                {sale.orderType === "pickup_later"
                  ? "Pickup Time:"
                  : "Delivery Time:"}
              </span>
              <span>{sale.pickupTime}</span>
            </div>
          )}
          {sale.deliveryDetails && sale.orderType === "delivery" && (
            <div className="text-xs space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
              <div>
                <span className="font-semibold">Receiver:</span>{" "}
                {sale.deliveryDetails.receiverName}
              </div>
              <div>
                <span className="font-semibold">Phone:</span>{" "}
                {sale.deliveryDetails.receiverPhone}
              </div>
              <div>
                <span className="font-semibold">Address:</span>{" "}
                {sale.deliveryDetails.receiverAddress}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 border-t border-slate-300 pt-4 print:pt-2">
        <p className="mb-1">Thank you for your business!</p>
        <p className="text-xs">Please keep this receipt for your records</p>
      </div>
    </div>
  );
}
