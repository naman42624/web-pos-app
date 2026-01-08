import mongoose, { Schema, Document } from "mongoose";

export interface IProductItem {
  itemId: string;
  customName?: string;
  customPrice?: number;
  quantity: number;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  stock: number;
  image?: string;
  items: IProductItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductItemSchema = new Schema<IProductItem>(
  {
    itemId: {
      type: String,
      required: true,
    },
    customName: String,
    customPrice: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProduct>(
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
    items: {
      type: [ProductItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
