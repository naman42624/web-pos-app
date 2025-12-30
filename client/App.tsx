import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { POSProvider } from "@/contexts/POSContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import DeliveryBoys from "./pages/admin/DeliveryBoys";
import DeliveryBoyLogin from "./pages/DeliveryBoyLogin";
import DeliveryBoyDashboard from "./pages/DeliveryBoyDashboard";
import DeliveryBoyAllOrders from "./pages/DeliveryBoyAllOrders";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <POSProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
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
                    <ProtectedRoute>
                      <AddSale />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/all-sales"
                  element={
                    <ProtectedRoute>
                      <AllSales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quick-sale"
                  element={
                    <ProtectedRoute>
                      <QuickSale />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/items"
                  element={
                    <ProtectedRoute>
                      <Items />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ready-products"
                  element={
                    <ProtectedRoute>
                      <ReadyProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-product"
                  element={
                    <ProtectedRoute>
                      <CreateProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/:id"
                  element={
                    <ProtectedRoute>
                      <CustomerDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/deliveries"
                  element={
                    <ProtectedRoute>
                      <Deliveries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pickups"
                  element={
                    <ProtectedRoute>
                      <Pickups />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/credit-records"
                  element={
                    <ProtectedRoute>
                      <CreditRecords />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/delivery-boys"
                  element={
                    <ProtectedRoute>
                      <DeliveryBoys />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery-boy/login"
                  element={<DeliveryBoyLogin />}
                />
                <Route
                  path="/delivery-boy/dashboard"
                  element={<DeliveryBoyDashboard />}
                />
                <Route
                  path="/delivery-boy/all-orders"
                  element={<DeliveryBoyAllOrders />}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </POSProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
