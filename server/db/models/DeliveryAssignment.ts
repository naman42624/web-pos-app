import mongoose, { Schema, Document } from "mongoose";

export interface IDeliveryAssignment extends Document {
  saleId: string;
  deliveryBoyId: string;
  assignedAt: string;
  status: "assigned" | "in_transit" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryAssignmentSchema = new Schema<IDeliveryAssignment>(
  {
    saleId: {
      type: String,
      required: true,
    },
    deliveryBoyId: {
      type: String,
      required: true,
    },
    assignedAt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "in_transit", "delivered", "cancelled"],
      default: "assigned",
    },
  },
  {
    timestamps: true,
  },
);

export const DeliveryAssignment =
  mongoose.models.DeliveryAssignment ||
  mongoose.model<IDeliveryAssignment>(
    "DeliveryAssignment",
    DeliveryAssignmentSchema,
  );
