import mongoose, { Schema, Document } from "mongoose";

export interface ICreditRecord extends Document {
  customerId: string;
  amount: number;
  date: string;
  saleId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CreditRecordSchema = new Schema<ICreditRecord>(
  {
    customerId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      required: true,
    },
    saleId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const CreditRecord = mongoose.model<ICreditRecord>(
  "CreditRecord",
  CreditRecordSchema,
);
