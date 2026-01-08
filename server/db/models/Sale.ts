import mongoose, { Schema, Document } from "mongoose";

export interface IDeliveryDetails {
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  message?: string;
  senderName: string;
  senderPhone: string;
}

export interface ISaleItemComposition {
  itemId?: string;
  customName?: string;
  customPrice?: number;
  quantity: number;
}

export interface ISaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  productId?: string;
  composition?: ISaleItemComposition[];
}

export interface ISale extends Document {
  items: ISaleItem[];
  paymentMode: "cash" | "upi" | "credit";
  paymentModes?: ("cash" | "upi" | "credit" | "cod")[];
  paymentAmounts?: Record<string, number>;
  customerId?: string;
  total: number;
  date: string;
  orderType: "pickup" | "pickup_later" | "delivery";
  pickupDate?: string;
  pickupTime?: string;
  deliveryDetails?: IDeliveryDetails;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  deliveryCharges?: number;
  status?:
    | "pending"
    | "pick_up_ready"
    | "in_transit"
    | "delivered"
    | "cancelled"
    | "delivery_attempted_once"
    | "delivery_attempted_twice";
  paymentStatus?: "pending" | "paid";
  assignedDeliveryBoyId?: string;
  isQuickSale?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryDetailsSchema = new Schema<IDeliveryDetails>(
  {
    receiverName: String,
    receiverAddress: String,
    receiverPhone: String,
    message: String,
    senderName: String,
    senderPhone: String,
  },
  { _id: false },
);

const SaleItemCompositionSchema = new Schema<ISaleItemComposition>(
  {
    itemId: String,
    customName: String,
    customPrice: Number,
    quantity: Number,
  },
  { _id: false },
);

const SaleItemSchema = new Schema<ISaleItem>(
  {
    id: String,
    name: String,
    quantity: Number,
    price: Number,
    image: String,
    productId: String,
    composition: [SaleItemCompositionSchema],
  },
  { _id: false },
);

const SaleSchema = new Schema<ISale>(
  {
    items: [SaleItemSchema],
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "credit"],
      required: true,
    },
    paymentModes: [String],
    paymentAmounts: mongoose.Schema.Types.Mixed,
    customerId: String,
    total: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["pickup", "pickup_later", "delivery"],
      required: true,
    },
    pickupDate: String,
    pickupTime: String,
    deliveryDetails: DeliveryDetailsSchema,
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
    },
    discountValue: Number,
    discountAmount: Number,
    deliveryCharges: Number,
    status: {
      type: String,
      enum: [
        "pending",
        "pick_up_ready",
        "in_transit",
        "delivered",
        "cancelled",
        "delivery_attempted_once",
        "delivery_attempted_twice",
      ],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
    },
    assignedDeliveryBoyId: String,
    isQuickSale: Boolean,
  },
  {
    timestamps: true,
  },
);

export const Sale =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
