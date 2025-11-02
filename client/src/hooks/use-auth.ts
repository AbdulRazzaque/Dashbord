import { Roles, RoleType } from "@/constants";
import { useAuthStore } from "@/store";
import { UserData } from "@/types";

interface User {
  role: RoleType;
  // ... other user properties
}

interface AuthStore {
  user: User | null;
  UserData: UserData | null;
  isAuthenticated: boolean;
  logoutSession: () => void;
}

export function useAuth() {
  const { user, isAuthenticated, logoutSession, UserData } =
    useAuthStore() as AuthStore;

  const hasRole = (requiredRoles: RoleType[]) => {
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  };

  const isAdmin = user?.role === Roles.ADMIN;
  const isSuperAdmin = user?.role === Roles.SUPER_ADMIN;
  const isUser = user?.role === Roles.USER;
  const isVendor = user?.role === Roles.VENDOR;
  const isRetailer = user?.role === Roles.RETAILER;

  return {
    user,
    UserData,
    isAuthenticated,
    hasRole,
    isAdmin,
    isVendor,
    isSuperAdmin,
    isUser,
    isRetailer,
    logoutSession,
  };
}
