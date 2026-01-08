import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: {
    sales: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
    items: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
    products: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
    customers: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
    deliveryBoys: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
    creditRecords: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
    settings: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
  };
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
    },
    permissions: {
      type: {
        sales: {
          view: Boolean,
          add: Boolean,
          edit: Boolean,
          changeStatus: Boolean,
        },
        items: {
          view: Boolean,
          add: Boolean,
          edit: Boolean,
          changeStatus: Boolean,
        },
        products: {
          view: Boolean,
          add: Boolean,
          edit: Boolean,
          changeStatus: Boolean,
        },
        customers: {
          view: Boolean,
          add: Boolean,
          edit: Boolean,
          changeStatus: Boolean,
        },
        deliveryBoys: {
          view: Boolean,
          add: Boolean,
          edit: Boolean,
          changeStatus: Boolean,
        },
        creditRecords: {
          view: Boolean,
          add: Boolean,
          edit: Boolean,
          changeStatus: Boolean,
        },
        settings: {
          view: Boolean,
          add: Boolean,
          edit: Boolean,
          changeStatus: Boolean,
        },
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Role =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
