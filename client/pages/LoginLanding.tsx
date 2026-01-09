import { useNavigate } from "react-router-dom";
import { ShoppingCart, Truck, Users } from "lucide-react";

export default function LoginLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">POS System</h1>
          <p className="text-lg text-slate-600">
            Who is using the Portal?
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin/Manager Card */}
          <button
            onClick={() => navigate("/login")}
            className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300 hover:border-blue-300 text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Admin / Manager
              </h2>
              <p className="text-slate-600 mb-6">
                Manage sales, inventory, deliveries, customers, and settings
              </p>
              <div className="space-y-2 text-sm text-slate-500">
                <p>• View and manage all orders</p>
                <p>• Manage products and inventory</p>
                <p>• Track deliveries and pickups</p>
                <p>• Manage users and roles</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg group-hover:bg-blue-100 transition-colors">
                Sign In As Admin
                <span className="text-lg">→</span>
              </div>
            </div>
          </button>

          {/* Delivery Boy Card */}
          <button
            onClick={() => navigate("/delivery-boy/login")}
            className="group relative bg-white rounded-xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300 hover:border-amber-300 text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Delivery Boy
              </h2>
              <p className="text-slate-600 mb-6">
                Manage your assigned deliveries and track orders
              </p>
              <div className="space-y-2 text-sm text-slate-500">
                <p>• View assigned deliveries</p>
                <p>• Update delivery status</p>
                <p>• Access customer details</p>
                <p>• Track your deliveries</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 font-semibold rounded-lg group-hover:bg-amber-100 transition-colors">
                Sign In As Delivery Boy
                <span className="text-lg">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>
            Select your role above to access the POS system with your credentials
          </p>
        </div>
      </div>
    </div>
  );
}
