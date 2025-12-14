import { Link, useLocation } from "react-router-dom";
import { BarChart3, ShoppingCart, Users, FileText, CreditCard, Truck, Box, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface SharedLayoutProps {
  children: React.ReactNode;
}

export function SharedLayout({ children }: SharedLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/add-sale", label: "Add Sale", icon: ShoppingCart },
    { path: "/customers", label: "Customers", icon: Users },
    { path: "/deliveries", label: "Deliveries", icon: Truck },
    { path: "/pickups", label: "Pickups", icon: Box },
    { path: "/credit-records", label: "Credit Records", icon: CreditCard },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">POS System</h1>
          </div>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r border-slate-200 bg-white shadow-sm">
          <div className="p-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                    active
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
