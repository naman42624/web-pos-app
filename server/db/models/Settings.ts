import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  logoUrl?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessZip?: string;
  taxId?: string;
  billingEmail?: string;
  billingName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  paymentTerms?: string;
  currency: string;
  timezone: string;
  theme: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    businessName: {
      type: String,
      required: true,
    },
    businessEmail: String,
    businessPhone: String,
    logoUrl: String,
    businessAddress: String,
    businessCity: String,
    businessState: String,
    businessZip: String,
    taxId: String,
    billingEmail: String,
    billingName: String,
    billingAddress: String,
    billingCity: String,
    billingState: String,
    billingZip: String,
    paymentTerms: String,
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    theme: {
      type: String,
      required: true,
      default: "light",
    },
    language: {
      type: String,
      required: true,
      default: "en",
    },
  },
  {
    timestamps: true,
  },
);

export const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
