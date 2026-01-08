import mongoose, { Schema, Document } from "mongoose";

export interface IDeliveryBoy extends Document {
  name: string;
  phone: string;
  pin: string;
  idProofUrl?: string;
  status: "available" | "busy";
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryBoySchema = new Schema<IDeliveryBoy>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    pin: {
      type: String,
      required: true,
    },
    idProofUrl: String,
    status: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

export const DeliveryBoy =
  mongoose.models.DeliveryBoy ||
  mongoose.model<IDeliveryBoy>("DeliveryBoy", DeliveryBoySchema);
