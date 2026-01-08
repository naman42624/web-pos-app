import mongoose, { Schema, Document } from "mongoose";
import bcryptjs from "bcryptjs";

export type PermissionAction = "view" | "add" | "edit" | "changeStatus";
export type PermissionEntity = "sales" | "items" | "products" | "customers" | "deliveryBoys";

export interface IPermissions {
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
}

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: "admin" | "manager" | "staff";
  isActive: boolean;
  permissions: IPermissions;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const defaultPermissions: IPermissions = {
  sales: { view: false, add: false, edit: false, changeStatus: false },
  items: { view: false, add: false, edit: false, changeStatus: false },
  products: { view: false, add: false, edit: false, changeStatus: false },
  customers: { view: false, add: false, edit: false, changeStatus: false },
  deliveryBoys: { view: false, add: false, edit: false, changeStatus: false },
};

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
    },
    isActive: {
      type: Boolean,
      default: true,
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
      },
      default: defaultPermissions,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password);
};

// Don't return password in JSON
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
