import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { POSProvider } from "@/contexts/POSContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import AddSale from "./pages/AddSale";
import AllSales from "./pages/AllSales";
import QuickSale from "./pages/QuickSale";
import Settings from "./pages/Settings";
import Items from "./pages/Items";
import ReadyProducts from "./pages/ReadyProducts";
import CreateProduct from "./pages/CreateProduct";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Deliveries from "./pages/Deliveries";
import Pickups from "./pages/Pickups";
import CreditRecords from "./pages/CreditRecords";
import SalesStats from "./pages/SalesStats";
import DeliveryBoys from "./pages/admin/DeliveryBoys";
import Users from "./pages/admin/Users";
import Roles from "./pages/admin/Roles";
import DeliveryBoyLogin from "./pages/DeliveryBoyLogin";
import DeliveryBoyDashboard from "./pages/DeliveryBoyDashboard";
import DeliveryBoyAllOrders from "./pages/DeliveryBoyAllOrders";
import Login from "./pages/Login";
import LoginLanding from "./pages/LoginLanding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <POSProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-sale"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "sales", action: "view" }}
                >
                  <AddSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-sales"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "sales", action: "view" }}
                >
                  <AllSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quick-sale"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "sales", action: "view" }}
                >
                  <QuickSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "settings", action: "view" }}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "items", action: "view" }}
                >
                  <Items />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ready-products"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "products", action: "view" }}
                >
                  <ReadyProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-product"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "products", action: "view" }}
                >
                  <CreateProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "customers", action: "view" }}
                >
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{ entity: "customers", action: "view" }}
                >
                  <CustomerDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deliveries"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    entity: "deliveryBoys",
                    action: "view",
                  }}
                >
                  <Deliveries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pickups"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    entity: "deliveryBoys",
                    action: "view",
                  }}
                >
                  <Pickups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/credit-records"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    entity: "creditRecords",
                    action: "view",
                  }}
                >
                  <CreditRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-stats"
              element={
                <ProtectedRoute managerOrAdmin>
                  <SalesStats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/delivery-boys"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    entity: "deliveryBoys",
                    action: "view",
                  }}
                >
                  <DeliveryBoys />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute adminOnly>
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </POSProvider>
      ) : (
        <Routes>
          <Route path="/" element={<LoginLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/delivery-boy/login" element={<DeliveryBoyLogin />} />
          <Route
            path="/delivery-boy/dashboard"
            element={<DeliveryBoyDashboard />}
          />
          <Route
            path="/delivery-boy/all-orders"
            element={<DeliveryBoyAllOrders />}
          />
          <Route path="*" element={<LoginLanding />} />
        </Routes>
      )}
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
