import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyDeliveryBoyPin } from "@/lib/api";
import { ShoppingCart, LogIn, AlertCircle } from "lucide-react";

export default function DeliveryBoyLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!phone.trim()) {
        setError("Please enter phone number");
        setIsLoading(false);
        return;
      }

      if (!pin.trim()) {
        setError("Please enter PIN");
        setIsLoading(false);
        return;
      }

      const deliveryBoy = await verifyDeliveryBoyPin(phone.trim(), pin.trim());

      if (!deliveryBoy) {
        setError("Invalid phone number or PIN");
        setIsLoading(false);
        return;
      }

      // Store delivery boy session in localStorage
      localStorage.setItem(
        "deliveryBoySession",
        JSON.stringify({
          id: deliveryBoy.id,
          name: deliveryBoy.name,
          phone: deliveryBoy.phone,
          status: deliveryBoy.status,
        }),
      );

      // Redirect to delivery boy dashboard
      navigate("/delivery-boy/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Delivery Portal
          </h1>
          <p className="text-slate-500">Sign in to manage your deliveries</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Phone Number Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {/* PIN Field */}
            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-600">
              Use your credentials provided by the admin to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
