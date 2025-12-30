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
import DeliveryBoys from "./pages/admin/DeliveryBoys";
import DeliveryBoyLogin from "./pages/DeliveryBoyLogin";
import DeliveryBoyDashboard from "./pages/DeliveryBoyDashboard";
import DeliveryBoyAllOrders from "./pages/DeliveryBoyAllOrders";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/delivery-boy/login" element={<DeliveryBoyLogin />} />
      <Route path="/delivery-boy/dashboard" element={<DeliveryBoyDashboard />} />
      <Route path="/delivery-boy/all-orders" element={<DeliveryBoyAllOrders />} />

      {session ? (
        <>
          <Route
            path="/"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/add-sale"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <AddSale />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/all-sales"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <AllSales />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/quick-sale"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <QuickSale />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/settings"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/items"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <Items />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/ready-products"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <ReadyProducts />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/create-product"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <CreateProduct />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/customers"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/customer/:id"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <CustomerDetail />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/deliveries"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <Deliveries />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/pickups"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <Pickups />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/credit-records"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <CreditRecords />
                </ProtectedRoute>
              </POSProvider>
            }
          />
          <Route
            path="/admin/delivery-boys"
            element={
              <POSProvider>
                <ProtectedRoute>
                  <DeliveryBoys />
                </ProtectedRoute>
              </POSProvider>
            }
          />
        </>
      ) : null}

      <Route path="*" element={<NotFound />} />
    </Routes>
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
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
