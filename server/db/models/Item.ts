import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
  name: string;
  price: number;
  stock: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Item =
  mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);
