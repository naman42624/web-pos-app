import mongoose, { Schema } from "mongoose";

const RoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: { type: Object, default: {} }
}, { timestamps: true });

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: Schema.Types.ObjectId, ref: 'Role' },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String
}, { timestamps: true });

const ItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String,
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  gstRate: { type: Number, default: 0 }
}, { timestamps: true });

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String,
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, required: true }
  }]
}, { timestamps: true });

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: String,
  email: String,
  organization: String,
  addresses: [String],
  totalCredit: { type: Number, default: 0 }
}, { timestamps: true });

const SaleSchema = new Schema({
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    composition: Array
  }],
  total: { type: Number, required: true },
  subtotal: Number,
  gstAmount: Number,
  discountAmount: Number,
  deliveryCharges: Number,
  paymentMode: String,
  paymentStatus: String,
  status: String,
  orderType: String,
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  pickupDate: String,
  pickupTime: String,
  deliveryDetails: Object,
  paymentAmounts: Object
}, { timestamps: true });

const DeliveryBoySchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pin: String,
  status: { type: String, default: 'available' }
}, { timestamps: true });

const CreditRecordSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: 'credit' },
  saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
  date: { type: Date, default: Date.now },
  remarks: String
});

const SettingsSchema = new Schema({
  shopName: String,
  shopAddress: String,
  shopPhone: String,
  shopEmail: String,
  taxNumber: String,
  currency: { type: String, default: 'INR' }
}, { timestamps: true });

export const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);
export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
export const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
export const DeliveryBoy = mongoose.models.DeliveryBoy || mongoose.model("DeliveryBoy", DeliveryBoySchema);
export const CreditRecord = mongoose.models.CreditRecord || mongoose.model("CreditRecord", CreditRecordSchema);
export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
