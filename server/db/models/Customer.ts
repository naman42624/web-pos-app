import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ICustomer extends Document {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  organization?: string;
  addresses: IAddress[];
  totalCredit: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const CustomerSchema = new Schema<ICustomer>(
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
    },
    altPhone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    totalCredit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Customer =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
