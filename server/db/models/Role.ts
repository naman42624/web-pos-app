import mongoose, { Schema, Document } from "mongoose";

export type PermissionEntity =
  | "sales"
  | "items"
  | "products"
  | "customers"
  | "deliveryBoys"
  | "creditRecords"
  | "settings"
  | "users"
  | "roles";

export type PermissionAction = "view" | "add" | "edit" | "delete";

export interface IPermission {
  [entity in PermissionEntity]?: {
    view?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: IPermission;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Role =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
