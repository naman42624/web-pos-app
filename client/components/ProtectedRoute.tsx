import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: {
    entity: string;
    action: string;
  };
  adminOnly?: boolean;
  managerOrAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  adminOnly,
  managerOrAdmin,
}: ProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (managerOrAdmin) {
    const isManager = user.role?.name === "Manager";
    if (!user.isAdmin && !isManager) {
      return <Navigate to="/" replace />;
    }
  }

  if (
    requiredPermission &&
    !hasPermission(requiredPermission.entity, requiredPermission.action)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
