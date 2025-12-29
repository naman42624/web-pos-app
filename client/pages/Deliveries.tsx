import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import {
  Truck,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  Printer,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Deliveries() {
  const {
    sales,
    items: inventoryItems,
    updateSaleStatus,
    deliveryBoys,
    assignDeliveryBoy,
  } = usePOSContext();
  const [searchParams] = useSearchParams();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showDeliveryBoyModal, setShowDeliveryBoyModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    saleId: string;
    newStatus: string;
  } | null>(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const statusFromUrl = searchParams.get("status");
    if (statusFromUrl) {
      setSelectedStatus(statusFromUrl);
    }
  }, [searchParams]);

  const deliveryOrders = useMemo(() => {
    const allDeliveries = sales.filter((sale) => sale.orderType === "delivery");

    if (!selectedDate) return allDeliveries;

    return allDeliveries.filter((sale) => {
      const saleDate = new Date(sale.date).toISOString().split("T")[0];
      return saleDate === selectedDate;
    });
  }, [sales, selectedDate]);

  const getItemName = (itemId?: string, customName?: string) => {
    if (customName) return customName;
    return itemId
      ? inventoryItems.find((item) => item.id === itemId)?.name || "Unknown"
      : "Unknown";
  };

  const getItemPrice = (itemId?: string, customPrice?: number): number => {
    if (customPrice !== undefined && customPrice !== null) return customPrice;
    if (!itemId) return 0;
    const item = inventoryItems.find((item) => item.id === itemId);
    return item?.price || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "Not specified";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const getOrderNumber = (orderId: string, index: number) => {
    return `DL-${(index + 1).toString().padStart(3, "0")}`;
  };

  const handlePrintDeliverySlip = (
    order: (typeof deliveryOrders)[0],
    orderNumber: string,
  ) => {
    const customerItemsHTML = order.items
      .map(
        (item) => `
      <div style="margin-bottom: 12px; padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 600;">${item.name} × ${item.quantity}</div>
      </div>
    `,
      )
      .join("");

    const dispatchItemsHTML = order.items
      .map(
        (item) => `
      <div style="margin-bottom: 12px; padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 600; margin-bottom: 4px;">${item.name} × ${item.quantity}</div>
        ${
          item.composition && item.composition.length > 0
            ? `
          <div style="margin-top: 8px; font-size: 12px; color: #666; border-left: 2px solid #ddd; padding-left: 8px;">
            ${item.composition
              .map((comp) => {
                const isCustom = (comp as any).customName !== undefined;
                const itemName = isCustom
                  ? (comp as any).customName
                  : getItemName(comp.itemId);
                return `• ${itemName} × ${comp.quantity}`;
              })
              .join("<br>")}
          </div>
        `
            : ""
        }
      </div>
    `,
      )
      .join("");

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Delivery Slip - ${orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 400px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
          .subtitle { font-size: 12px; color: #666; }
          .order-number { font-size: 14px; font-weight: bold; margin-top: 8px; }
          .section { margin-bottom: 16px; }
          .section-title { font-weight: bold; font-size: 12px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .detail-row { margin-bottom: 6px; font-size: 13px; }
          .label { font-weight: 600; margin-right: 4px; }
          .items { margin-bottom: 16px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
          .page-break { page-break-after: always; margin-bottom: 20px; }
          @media print { body { padding: 0; } .page-break { margin-bottom: 0; } }
        </style>
      </head>
      <body>
        <!-- CUSTOMER COPY -->
        <div class="container">
          <div class="header">
            <div class="title">DELIVERY SLIP</div>
            <div class="subtitle">CUSTOMER COPY</div>
            <div class="order-number">Order: ${orderNumber}</div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">${formatDate(order.date)}</div>
          </div>

          ${
            order.pickupDate
              ? `
            <div class="section">
              <div class="section-title">DELIVERY SCHEDULE</div>
              <div class="detail-row"><span class="label">Date:</span> ${formatDate(order.pickupDate)}</div>
            </div>
          `
              : ""
          }

          <div class="section items">
            <div class="section-title">ITEMS</div>
            ${customerItemsHTML}
          </div>

          ${
            order.deliveryDetails
              ? `
            <div class="section">
              <div class="section-title">DELIVERY TO</div>
              <div class="detail-row"><span class="label">Name:</span> ${order.deliveryDetails.receiverName}</div>
              <div class="detail-row"><span class="label">Phone:</span> ${order.deliveryDetails.receiverPhone}</div>
              <div class="detail-row"><span class="label">Address:</span> ${order.deliveryDetails.receiverAddress}</div>
            </div>
          `
              : ""
          }

          ${
            order.deliveryDetails?.senderName
              ? `
            <div class="section">
              <div class="section-title">FROM</div>
              <div class="detail-row">${order.deliveryDetails.senderName}</div>
            </div>
          `
              : ""
          }

          ${
            order.deliveryDetails?.message
              ? `
            <div class="section">
              <div class="section-title">MESSAGE</div>
              <div class="detail-row" style="font-style: italic;">"${order.deliveryDetails.message}"</div>
            </div>
          `
              : ""
          }

          <div class="footer">
            <div>Thank you for your order!</div>
          </div>
        </div>

        <!-- PAGE BREAK -->
        <div class="page-break"></div>

        <!-- DISPATCH COPY -->
        <div class="container">
          <div class="header">
            <div class="title">DISPATCH SLIP</div>
            <div class="subtitle">INTERNAL USE - DELIVERY TEAM</div>
            <div class="order-number">Order: ${orderNumber}</div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">${formatDate(order.date)}</div>
          </div>

          ${
            order.pickupDate || order.pickupTime
              ? `
            <div class="section">
              <div class="section-title">DELIVERY SCHEDULE</div>
              ${order.pickupDate ? `<div class="detail-row"><span class="label">Date:</span> ${formatDate(order.pickupDate)}</div>` : ""}
              ${order.pickupTime ? `<div class="detail-row"><span class="label">Time:</span> ${formatTime(order.pickupTime)}</div>` : ""}
            </div>
          `
              : ""
          }

          <div class="section items">
            <div class="section-title">ITEMS TO DELIVER</div>
            ${dispatchItemsHTML}
          </div>

          ${
            order.deliveryDetails
              ? `
            <div class="section">
              <div class="section-title">DELIVERY DETAILS</div>
              <div><strong>Receiver:</strong></div>
              <div class="detail-row"><span class="label">Name:</span> ${order.deliveryDetails.receiverName}</div>
              <div class="detail-row"><span class="label">Phone:</span> ${order.deliveryDetails.receiverPhone}</div>
              <div class="detail-row"><span class="label">Address:</span> ${order.deliveryDetails.receiverAddress}</div>
              <div style="margin-top: 10px;"><strong>From:</strong></div>
              <div class="detail-row"><span class="label">Name:</span> ${order.deliveryDetails.senderName}</div>
              <div class="detail-row"><span class="label">Phone:</span> ${order.deliveryDetails.senderPhone}</div>
              ${order.deliveryDetails.message ? `<div class="detail-row"><span class="label">Message:</span> "${order.deliveryDetails.message}"</div>` : ""}
            </div>
          `
              : ""
          }

          <div class="footer">
            <div>Please verify items and delivery details before leaving.</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleStatusChange = async (
    saleId: string,
    newStatus:
      | "pending"
      | "pick_up_ready"
      | "in_transit"
      | "delivered"
      | "cancelled"
      | "delivery_attempted_once"
      | "delivery_attempted_twice",
  ) => {
    try {
      if (newStatus === "in_transit") {
        setPendingStatusChange({ saleId, newStatus });
        setShowDeliveryBoyModal(true);
        setSelectedDeliveryBoy(null);
        return;
      }
      await updateSaleStatus(saleId, newStatus);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Failed to update status:", errorMsg);
    }
  };

  const handleAssignAndUpdateStatus = async () => {
    if (!pendingStatusChange || !selectedDeliveryBoy) {
      alert("Please select a delivery boy");
      return;
    }

    try {
      await assignDeliveryBoy(pendingStatusChange.saleId, selectedDeliveryBoy);
      await updateSaleStatus(
        pendingStatusChange.saleId,
        pendingStatusChange.newStatus as
          | "pending"
          | "pick_up_ready"
          | "in_transit"
          | "delivered"
          | "cancelled"
          | "delivery_attempted_once"
          | "delivery_attempted_twice",
      );
      setShowDeliveryBoyModal(false);
      setPendingStatusChange(null);
      setSelectedDeliveryBoy(null);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Failed to assign and update status:", errorMsg);
      alert("Failed to assign delivery boy and update status");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pick_up_ready":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in_transit":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "delivery_attempted_once":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "delivery_attempted_twice":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "pick_up_ready":
        return "Ready for Pickup";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "delivery_attempted_once":
        return "Delivery Attempted Once";
      case "delivery_attempted_twice":
        return "Delivery Attempted Twice";
      default:
        return "Pending";
    }
  };

  const STATUS_ORDER = [
    "pending",
    "pick_up_ready",
    "in_transit",
    "delivery_attempted_once",
    "delivery_attempted_twice",
    "delivered",
    "cancelled",
  ];

  const MENU_BAR_STATUSES = [
    "pending",
    "pick_up_ready",
    "in_transit",
    "delivered",
  ];

  const groupedByStatus = deliveryOrders.reduce(
    (groups, order) => {
      const status = order.status || "pending";
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(order);
      return groups;
    },
    {} as Record<string, typeof deliveryOrders>,
  );

  const sortedStatusKeys = STATUS_ORDER.filter((status) =>
    groupedByStatus.hasOwnProperty(status),
  );

  const menuBarStatuses = MENU_BAR_STATUSES;

  const filteredOrders = selectedStatus
    ? groupedByStatus[selectedStatus] || []
    : deliveryOrders;

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Deliveries
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Manage and track all scheduled deliveries
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Label
              htmlFor="delivery-date"
              className="text-sm font-medium text-slate-700 block mb-2"
            >
              Filter by Date
            </Label>
            <Input
              id="delivery-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Status Menu Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
            {menuBarStatuses.map((status) => (
              <button
                key={status}
                onClick={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStatus === status
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {getStatusLabel(status)} ({groupedByStatus[status]?.length || 0}
                )
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Label
              htmlFor="status-filter"
              className="text-sm font-medium text-slate-700"
            >
              Select Status:
            </Label>
            <select
              id="status-filter"
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">View All Statuses</option>
              <optgroup label="Main Statuses">
                {menuBarStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)} (
                    {groupedByStatus[status]?.length || 0})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Statuses">
                {sortedStatusKeys
                  .filter((s) => !menuBarStatuses.includes(s))
                  .map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)} (
                      {groupedByStatus[status]?.length || 0})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6 sm:space-y-8">
          {filteredOrders.length > 0 ? (
            selectedStatus ? (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                  {getStatusLabel(selectedStatus)} ({filteredOrders.length})
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {filteredOrders.map((order) => {
                    const orderNumber = getOrderNumber(
                      order.id,
                      deliveryOrders.findIndex((o) => o.id === order.id),
                    );
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                      >
                        <div className="p-4 sm:p-6">
                          {/* Delivery Boy Info Container */}
                          {/* Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                  <h3 className="text-sm sm:text-lg font-semibold text-slate-900 truncate">
                                    Order {orderNumber}
                                  </h3>
                                  <select
                                    value={order.status || "pending"}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        order.id,
                                        e.target.value as
                                          | "pending"
                                          | "pick_up_ready"
                                          | "in_transit"
                                          | "delivered"
                                          | "cancelled"
                                          | "delivery_attempted_once"
                                          | "delivery_attempted_twice",
                                      )
                                    }
                                    className={cn(
                                      "px-2 py-1 rounded-lg text-xs sm:text-sm font-medium border outline-none transition-colors cursor-pointer",
                                      getStatusColor(order.status),
                                    )}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="pick_up_ready">
                                      Ready for Pickup
                                    </option>
                                    <option value="in_transit">
                                      In Transit
                                    </option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="delivery_attempted_once">
                                      Delivery Attempted Once
                                    </option>
                                    <option value="delivery_attempted_twice">
                                      Delivery Attempted Twice
                                    </option>
                                  </select>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500">
                                  Created: {formatDate(order.date)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Items Summary */}
                          <div className="mb-4 space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                              >
                                <p className="text-sm font-semibold text-slate-900 mb-2">
                                  {item.name} × {item.quantity} @ ₹
                                  {item.price.toFixed(2)} each
                                </p>

                                {/* Product Composition */}
                                {item.composition &&
                                  item.composition.length > 0 && (
                                    <div className="ml-4 mt-2 pt-2 border-t border-slate-300">
                                      <p className="text-xs font-semibold text-slate-700 mb-2">
                                        Composition:
                                      </p>
                                      <div className="space-y-1">
                                        {item.composition.map((comp, idx) => {
                                          const isCustom =
                                            (comp as any).customName !==
                                            undefined;
                                          const itemName = isCustom
                                            ? (comp as any).customName
                                            : getItemName(comp.itemId);
                                          const itemPrice = isCustom
                                            ? (comp as any).customPrice || 0
                                            : getItemPrice(
                                                comp.itemId,
                                                undefined,
                                              );
                                          return (
                                            <p
                                              key={idx}
                                              className="text-xs text-slate-600 ml-2"
                                            >
                                              • {itemName} × {comp.quantity} @ ₹
                                              {(itemPrice || 0).toFixed(2)} each
                                            </p>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>

                          {/* Schedule Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                              <div>
                                <p className="text-sm text-slate-600">
                                  Delivery Date
                                </p>
                                <p className="font-semibold text-slate-900">
                                  {order.pickupDate
                                    ? formatDate(order.pickupDate)
                                    : "Not scheduled"}
                                </p>
                              </div>
                            </div>

                            {order.pickupTime && (
                              <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                  <p className="text-sm text-slate-600">
                                    Delivery Time
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {formatTime(order.pickupTime)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Delivery Boy Info - Show when In Transit */}
                          {order.status === "in_transit" &&
                            order.assignedDeliveryBoyId && (
                              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                                  Delivery Agent
                                </p>
                                {deliveryBoys.find(
                                  (b) => b.id === order.assignedDeliveryBoyId,
                                ) ? (
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <User className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm text-slate-600">
                                          Name
                                        </p>
                                        <p className="font-medium text-slate-900">
                                          {
                                            deliveryBoys.find(
                                              (b) =>
                                                b.id ===
                                                order.assignedDeliveryBoyId,
                                            )?.name
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Phone className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm text-slate-600">
                                          Phone
                                        </p>
                                        <p className="font-medium text-slate-900">
                                          {
                                            deliveryBoys.find(
                                              (b) =>
                                                b.id ===
                                                order.assignedDeliveryBoyId,
                                            )?.phone
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    No delivery agent assigned
                                  </p>
                                )}
                              </div>
                            )}

                          {/* Delivery Details */}
                          {order.deliveryDetails && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                  Receiver
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <User className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm text-slate-600">
                                        Name
                                      </p>
                                      <p className="font-medium text-slate-900">
                                        {order.deliveryDetails.receiverName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm text-slate-600">
                                        Phone
                                      </p>
                                      <p className="font-medium text-slate-900">
                                        {order.deliveryDetails.receiverPhone}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm text-slate-600">
                                        Address
                                      </p>
                                      <p className="font-medium text-slate-900 text-sm">
                                        {order.deliveryDetails.receiverAddress}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                  Sender
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <User className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm text-slate-600">
                                        Name
                                      </p>
                                      <p className="font-medium text-slate-900">
                                        {order.deliveryDetails.senderName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm text-slate-600">
                                        Phone
                                      </p>
                                      <p className="font-medium text-slate-900">
                                        {order.deliveryDetails.senderPhone}
                                      </p>
                                    </div>
                                  </div>
                                  {order.deliveryDetails.message && (
                                    <div className="flex items-start gap-2">
                                      <div>
                                        <p className="text-sm text-slate-600">
                                          Message
                                        </p>
                                        <p className="font-medium text-slate-900 text-sm">
                                          {order.deliveryDetails.message}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Footer - Total and Payment */}
                          <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-600">
                                  Total Amount
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                  ₹{order.total.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-600 capitalize mb-1">
                                  Payment: {order.paymentMode}
                                </p>
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                  Pending Delivery
                                </div>
                              </div>
                            </div>

                            {/* Print Button */}
                            <button
                              onClick={() =>
                                handlePrintDeliverySlip(order, orderNumber)
                              }
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors text-sm"
                              title="Print delivery slip with both customer and dispatch copies"
                            >
                              <Printer className="w-4 h-4" />
                              Print Delivery Slip
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                {sortedStatusKeys.map((status) => (
                  <div key={status} className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                      {getStatusLabel(status)} (
                      {groupedByStatus[status]?.length || 0})
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      {groupedByStatus[status].map((order) => {
                        const orderNumber = getOrderNumber(
                          order.id,
                          deliveryOrders.findIndex((o) => o.id === order.id),
                        );
                        return (
                          <div
                            key={order.id}
                            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                          >
                            <div className="p-4 sm:p-6">
                              {/* Header Row */}
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-900 truncate">
                                        Order {orderNumber}
                                      </h3>
                                      <select
                                        value={order.status || "pending"}
                                        onChange={(e) =>
                                          handleStatusChange(
                                            order.id,
                                            e.target.value as
                                              | "pending"
                                              | "pick_up_ready"
                                              | "in_transit"
                                              | "delivered"
                                              | "cancelled"
                                              | "delivery_attempted_once"
                                              | "delivery_attempted_twice",
                                          )
                                        }
                                        className={cn(
                                          "px-2 py-1 rounded-lg text-xs sm:text-sm font-medium border outline-none transition-colors cursor-pointer",
                                          getStatusColor(order.status),
                                        )}
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="pick_up_ready">
                                          Ready for Pickup
                                        </option>
                                        <option value="in_transit">
                                          In Transit
                                        </option>
                                        <option value="delivered">
                                          Delivered
                                        </option>
                                        <option value="cancelled">
                                          Cancelled
                                        </option>
                                        <option value="delivery_attempted_once">
                                          Delivery Attempted Once
                                        </option>
                                        <option value="delivery_attempted_twice">
                                          Delivery Attempted Twice
                                        </option>
                                      </select>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500">
                                      Created: {formatDate(order.date)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Items Summary */}
                              <div className="mb-4 space-y-3">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                                  >
                                    <p className="text-sm font-semibold text-slate-900 mb-2">
                                      {item.name} × {item.quantity} @ ₹
                                      {item.price.toFixed(2)} each
                                    </p>

                                    {/* Product Composition */}
                                    {item.composition &&
                                      item.composition.length > 0 && (
                                        <div className="ml-4 mt-2 pt-2 border-t border-slate-300">
                                          <p className="text-xs font-semibold text-slate-700 mb-2">
                                            Composition:
                                          </p>
                                          <div className="space-y-1">
                                            {item.composition.map(
                                              (comp, idx) => {
                                                const isCustom =
                                                  (comp as any).customName !==
                                                  undefined;
                                                const itemName = isCustom
                                                  ? (comp as any).customName
                                                  : getItemName(comp.itemId);
                                                const itemPrice = isCustom
                                                  ? (comp as any).customPrice ||
                                                    0
                                                  : getItemPrice(
                                                      comp.itemId,
                                                      undefined,
                                                    );
                                                return (
                                                  <p
                                                    key={idx}
                                                    className="text-xs text-slate-600 ml-2"
                                                  >
                                                    • {itemName} ×{" "}
                                                    {comp.quantity} @ ₹
                                                    {(itemPrice || 0).toFixed(
                                                      2,
                                                    )}{" "}
                                                    each
                                                  </p>
                                                );
                                              },
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>

                              {/* Schedule Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-slate-600">
                                      Delivery Date
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                      {order.pickupDate
                                        ? formatDate(order.pickupDate)
                                        : "Not scheduled"}
                                    </p>
                                  </div>
                                </div>

                                {order.pickupTime && (
                                  <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                                    <div>
                                      <p className="text-sm text-slate-600">
                                        Delivery Time
                                      </p>
                                      <p className="font-semibold text-slate-900">
                                        {formatTime(order.pickupTime)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Delivery Boy Info - Show when In Transit */}
                              {order.status === "in_transit" &&
                                order.assignedDeliveryBoyId && (
                                  <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                                      Delivery Agent
                                    </p>
                                    {deliveryBoys.find(
                                      (b) =>
                                        b.id === order.assignedDeliveryBoyId,
                                    ) ? (
                                      <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                          <User className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-sm text-slate-600">
                                              Name
                                            </p>
                                            <p className="font-medium text-slate-900">
                                              {
                                                deliveryBoys.find(
                                                  (b) =>
                                                    b.id ===
                                                    order.assignedDeliveryBoyId,
                                                )?.name
                                              }
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                          <Phone className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-sm text-slate-600">
                                              Phone
                                            </p>
                                            <p className="font-medium text-slate-900">
                                              {
                                                deliveryBoys.find(
                                                  (b) =>
                                                    b.id ===
                                                    order.assignedDeliveryBoyId,
                                                )?.phone
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-slate-500">
                                        No delivery agent assigned
                                      </p>
                                    )}
                                  </div>
                                )}

                              {/* Delivery Details */}
                              {order.deliveryDetails && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                      Receiver
                                    </p>
                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2">
                                        <User className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm text-slate-600">
                                            Name
                                          </p>
                                          <p className="font-medium text-slate-900">
                                            {order.deliveryDetails.receiverName}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm text-slate-600">
                                            Phone
                                          </p>
                                          <p className="font-medium text-slate-900">
                                            {
                                              order.deliveryDetails
                                                .receiverPhone
                                            }
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm text-slate-600">
                                            Address
                                          </p>
                                          <p className="font-medium text-slate-900 text-sm">
                                            {
                                              order.deliveryDetails
                                                .receiverAddress
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                      Sender
                                    </p>
                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2">
                                        <User className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm text-slate-600">
                                            Name
                                          </p>
                                          <p className="font-medium text-slate-900">
                                            {order.deliveryDetails.senderName}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm text-slate-600">
                                            Phone
                                          </p>
                                          <p className="font-medium text-slate-900">
                                            {order.deliveryDetails.senderPhone}
                                          </p>
                                        </div>
                                      </div>
                                      {order.deliveryDetails.message && (
                                        <div className="flex items-start gap-2">
                                          <div>
                                            <p className="text-sm text-slate-600">
                                              Message
                                            </p>
                                            <p className="font-medium text-slate-900 text-sm">
                                              {order.deliveryDetails.message}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Footer - Total and Payment */}
                              <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-slate-600">
                                      Total Amount
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                      ₹{order.total.toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-slate-600 capitalize mb-1">
                                      Payment: {order.paymentMode}
                                    </p>
                                    <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                      Pending Delivery
                                    </div>
                                  </div>
                                </div>

                                {/* Print Button */}
                                <button
                                  onClick={() =>
                                    handlePrintDeliverySlip(order, orderNumber)
                                  }
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors text-sm"
                                  title="Print delivery slip with both customer and dispatch copies"
                                >
                                  <Printer className="w-4 h-4" />
                                  Print Delivery Slip
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">
                No deliveries scheduled
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Delivery orders will appear here once created
              </p>
            </div>
          )}
        </div>

        {/* Delivery Boy Selection Modal */}
        {showDeliveryBoyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Select Delivery Boy
                </h2>
                <button
                  onClick={() => {
                    setShowDeliveryBoyModal(false);
                    setPendingStatusChange(null);
                    setSelectedDeliveryBoy(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {deliveryBoys.length > 0 ? (
                  <div className="space-y-3">
                    {deliveryBoys.map((boy) => (
                      <button
                        key={boy.id}
                        onClick={() => setSelectedDeliveryBoy(boy.id)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border-2 transition-all",
                          selectedDeliveryBoy === boy.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900">
                              {boy.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {boy.phone}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-1 rounded-full",
                                  boy.status === "available"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700",
                                )}
                              >
                                {boy.status === "available"
                                  ? "Available"
                                  : "Busy"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No delivery boys available</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 space-y-3">
                <button
                  onClick={handleAssignAndUpdateStatus}
                  disabled={!selectedDeliveryBoy}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg font-medium transition-colors",
                    selectedDeliveryBoy
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed",
                  )}
                >
                  Assign & Mark In Transit
                </button>
                <button
                  onClick={() => {
                    setShowDeliveryBoyModal(false);
                    setPendingStatusChange(null);
                    setSelectedDeliveryBoy(null);
                  }}
                  className="w-full px-4 py-2 rounded-lg font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
}
