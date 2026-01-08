import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "manager" | "staff";
  roleIds?: string[];
  permissions?: {
    [entity: string]: {
      view: boolean;
      add: boolean;
      edit: boolean;
      changeStatus: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  hasPermission: (entity: string, action: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch full user details with roles from backend
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch("/api/data/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData._id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          roleIds: userData.roleIds || [],
          permissions: userData.permissions,
        });
      } else {
        // Token invalid, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Server returned invalid response");
      }

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const { token, user } = data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state regardless of logout success
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Server returned invalid response");
      }

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      const { token, user } = data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const hasPermission = (entity: string, action: string): boolean => {
    if (!user) return false;

    // Admin users always have all permissions
    if (user.role === "admin") {
      return true;
    }

    // For now, return false for non-admin users
    // This will be enhanced to check actual role permissions from backend
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
