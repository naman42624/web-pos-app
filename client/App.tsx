import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { POSProvider } from "@/contexts/POSContext";
import Dashboard from "./pages/Dashboard";
import AddSale from "./pages/AddSale";
import QuickSale from "./pages/QuickSale";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <POSProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-sale" element={<AddSale />} />
              <Route path="/quick-sale" element={<QuickSale />} />
              <Route path="/items" element={<Items />} />
              <Route path="/ready-products" element={<ReadyProducts />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customer/:id" element={<CustomerDetail />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/pickups" element={<Pickups />} />
              <Route path="/credit-records" element={<CreditRecords />} />
              <Route path="/admin/delivery-boys" element={<DeliveryBoys />} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}
