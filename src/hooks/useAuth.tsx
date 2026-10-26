"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService, storageService, type SessionContext } from "@/services";
import type { Organization, User } from "@/types";

interface AuthContextValue {
  session: SessionContext | null;
  user: User | null;
  currentUser: User | null; // Alias for convenience
  isOrganizer: boolean;
  isAdmin: boolean;
  activeOrganization: Organization | null;
  setActiveOrganizationId: (orgId: string) => void;
  isLoading: boolean;
  dbVersion: number;
  refreshSession: () => void;
  logout: () => void;
  resetDemoData: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginAsDemo: (email: string) => Promise<boolean>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    isOrganization?: boolean;
    organizationName?: string;
    organizationDescription?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: {
    fullName: string;
    phone: string;
    bio?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  currentUser: null,
  isOrganizer: false,
  isAdmin: false,
  activeOrganization: null,
  setActiveOrganizationId: () => {},
  isLoading: true,
  dbVersion: 0,
  refreshSession: () => {},
  logout: () => {},
  resetDemoData: () => {},
  login: async () => ({ success: false, error: "Not initialized" }),
  loginAsDemo: async () => false,
  register: async () => ({ success: false, error: "Not initialized" }),
  updateProfile: async () => ({ success: false, error: "Not initialized" }),
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionContext | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [dbVersion, setDbVersion] = useState(0);

  const loadSession = useCallback(() => {
    storageService.getDb(); // Ensure DB is initialized
    const ctx = authService.getSessionContext();
    setSession(ctx);
    if (ctx?.primaryOrganization && !activeOrgId) {
      setActiveOrgId(ctx.primaryOrganization.id);
    }
    setIsLoading(false);
  }, [activeOrgId]);

  useEffect(() => {
    loadSession();

    const handleAuthChange = () => {
      const ctx = authService.getSessionContext();
      setSession(ctx);
      if (ctx?.primaryOrganization) {
        setActiveOrgId(ctx.primaryOrganization.id);
      } else {
        setActiveOrgId("");
      }
    };

    const handleDbChange = () => {
      setDbVersion((v) => v + 1);
      const ctx = authService.getSessionContext();
      setSession(ctx);
    };

    window.addEventListener("openaid-auth-changed", handleAuthChange);
    window.addEventListener("openaid-db-changed", handleDbChange);
    window.addEventListener("storage", handleDbChange);

    return () => {
      window.removeEventListener("openaid-auth-changed", handleAuthChange);
      window.removeEventListener("openaid-db-changed", handleDbChange);
      window.removeEventListener("storage", handleDbChange);
    };
  }, [loadSession]);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
    setActiveOrgId("");
  }, []);

  const resetDemoData = useCallback(() => {
    storageService.resetDb();
    setDbVersion((v) => v + 1);
    const ctx = authService.getSessionContext();
    setSession(ctx);
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    try {
      const ctx = await authService.login(email, password);
      setSession(ctx);
      if (ctx.primaryOrganization) {
        setActiveOrgId(ctx.primaryOrganization.id);
      }
      return { success: true, user: ctx.user };
    } catch (err: any) {
      return { success: false, error: err?.message || "Đăng nhập thất bại" };
    }
  }, []);

  const loginAsDemo = useCallback(async (email: string) => {
    try {
      const res = await login(email, "123456");
      return res.success;
    } catch {
      return false;
    }
  }, [login]);

  const register = useCallback(async (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    isOrganization?: boolean;
    organizationName?: string;
    organizationDescription?: string;
  }) => {
    try {
      const ctx = await authService.register({
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        createOrgName: payload.isOrganization ? payload.organizationName : undefined,
        createOrgDescription: payload.isOrganization ? payload.organizationDescription : undefined,
      });
      setSession(ctx);
      if (ctx.primaryOrganization) {
        setActiveOrgId(ctx.primaryOrganization.id);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Đăng ký thất bại" };
    }
  }, []);

  const updateProfile = useCallback(async (updates: {
    fullName: string;
    phone: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    if (!session?.user) return { success: false, error: "Chưa đăng nhập" };
    try {
      const updated = await authService.updateProfile(session.user.id, {
        name: updates.fullName,
        phone: updates.phone,
        bio: updates.bio,
        avatarUrl: updates.avatarUrl,
      });
      setSession((prev) => prev ? { ...prev, user: updated } : null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Cập nhật thất bại" };
    }
  }, [session]);

  const activeOrganization =
    session?.memberships.find((m) => m.organization.id === activeOrgId)
      ?.organization ||
    session?.primaryOrganization ||
    null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        currentUser: session?.user || null,
        isOrganizer: Boolean(session?.isOrganizer),
        isAdmin: session?.user.systemRole === "ADMIN",
        activeOrganization,
        setActiveOrganizationId: setActiveOrgId,
        isLoading,
        dbVersion,
        refreshSession: loadSession,
        logout,
        resetDemoData,
        login,
        loginAsDemo,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
