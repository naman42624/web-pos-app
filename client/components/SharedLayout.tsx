import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ShoppingCart,
  Users,
  FileText,
  CreditCard,
  Truck,
  Box,
  Package,
  Menu,
  X,
  Settings,
  Zap,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SharedLayoutProps {
  children: React.ReactNode;
}

export function SharedLayout({ children }: SharedLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/add-sale", label: "Add Sale", icon: ShoppingCart },
    { path: "/quick-sale", label: "Quick Sale", icon: Zap },
    { path: "/items", label: "Items", icon: Package },
    { path: "/ready-products", label: "Ready Products", icon: Box },
    { path: "/customers", label: "Customers", icon: Users },
    { path: "/deliveries", label: "Deliveries", icon: Truck },
    { path: "/pickups", label: "Pickups", icon: Box },
    { path: "/credit-records", label: "Credit Records", icon: CreditCard },
    { path: "/sales-stats", label: "Sales Stats", icon: BarChart3, managerOnly: true },
    { path: "/admin/delivery-boys", label: "Delivery Boys", icon: Users },
    { path: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    { path: "/admin/roles", label: "Roles", icon: FileText, adminOnly: true },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const isAdminOrManager = () => {
    if (user?.isAdmin) return true;
    if (user?.role?.name === "Manager") return true;
    return false;
  };

  const getRequiredPermission = (
    path: string,
  ): { entity: string; action: string } | null => {
    switch (path) {
      case "/add-sale":
      case "/quick-sale":
        return { entity: "sales", action: "view" };
      case "/items":
        return { entity: "items", action: "view" };
      case "/ready-products":
        return { entity: "products", action: "view" };
      case "/customers":
        return { entity: "customers", action: "view" };
      case "/deliveries":
      case "/pickups":
        return { entity: "deliveryBoys", action: "view" };
      case "/credit-records":
        return { entity: "creditRecords", action: "view" };
      case "/admin/delivery-boys":
        return { entity: "deliveryBoys", action: "view" };
      case "/settings":
        return { entity: "settings", action: "view" };
      case "/":
        // Dashboard is always visible
        return null;
      default:
        return null;
    }
  };

  const NavContent = () => (
    <div className="p-4 sm:p-6 space-y-2">
      {navItems
        .filter((item: any) => {
          if (item.adminOnly) {
            return user?.isAdmin;
          }
          if (item.managerOnly) {
            return isAdminOrManager();
          }
          const requiredPerm = getRequiredPermission(item.path);
          if (!requiredPerm) {
            return true;
          }
          return hasPermission(requiredPerm.entity, requiredPerm.action);
        })
        .map((item: any) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                active
                  ? "bg-cyan-50 text-cyan-700 border-l-4 border-cyan-600"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              POS System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden sm:block text-xs sm:text-sm text-slate-500 whitespace-nowrap">
              {currentTime.toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </p>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.email || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500">Account</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-200 bg-white">
            <NavContent />
          </nav>
        )}
      </header>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Desktop Sidebar Navigation */}
        <nav className="hidden md:block w-64 border-r border-slate-200 bg-white shadow-sm">
          <NavContent />
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
