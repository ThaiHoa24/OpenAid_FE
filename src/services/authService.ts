import { STORAGE_KEYS } from "@/constants";
import { storageService } from "./storageService";
import type { Organization, OrganizationMember, OrganizationRole, User } from "@/types";
import { delay, generateId } from "@/utils";
import apiClient from "@/lib/api/axiosClient";
import { tokenStorage } from "@/lib/api/tokenStorage";

export interface UserMembershipDetail {
  membership: OrganizationMember;
  organization: Organization;
  role: OrganizationRole;
}

export interface SessionContext {
  user: User;
  memberships: UserMembershipDetail[];
  isOrganizer: boolean;
  primaryOrganization?: Organization;
}

function mapBeUserToFe(beUser: any): User {
  const fullName = beUser.fullName || beUser.name || "Người dùng OpenAid";
  const phoneNumber = beUser.phoneNumber || beUser.phone || "";
  const isActive = beUser.isActive !== undefined ? Boolean(beUser.isActive) : true;

  return {
    id: beUser.id,
    email: beUser.email,
    fullName,
    name: fullName,
    phoneNumber,
    phone: phoneNumber,
    avatarUrl: beUser.avatarUrl,
    bio: beUser.bio || "",
    systemRole: beUser.systemRole || "USER",
    isActive,
    status: isActive ? "ACTIVE" : "DISABLED",
    createdAt: beUser.createdAt || new Date().toISOString(),
    updatedAt: beUser.updatedAt,
  };
}

export const authService = {
  getSessionContext(): SessionContext | null {
    if (typeof window === "undefined") return null;
    try {
      const rawUser = window.localStorage.getItem("currentUser");
      const rawUserId = window.localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!rawUser && !rawUserId) return null;

      let user: User | null = null;
      if (rawUser) {
        user = JSON.parse(rawUser);
      } else {
        const db = storageService.getDb();
        user = db.users.find((u) => u.id === rawUserId) || null;
      }

      if (!user || user.status === "DISABLED" || user.isActive === false) return null;

      // Ensure compatibility aliases are set
      user = mapBeUserToFe(user);

      const db = storageService.getDb();
      const memberships: UserMembershipDetail[] = db.organizationMembers
        .filter((m) => m.userId === user?.id)
        .map((m) => {
          const org = db.organizations.find((o) => o.id === m.organizationId);
          return org ? { membership: m, organization: org, role: m.role } : null;
        })
        .filter((x): x is UserMembershipDetail => x !== null);

      const organizerMemberships = memberships.filter((m) => m.role === "ORGANIZER");
      return {
        user,
        memberships,
        isOrganizer: organizerMemberships.length > 0,
        primaryOrganization: organizerMemberships[0]?.organization || memberships[0]?.organization,
      };
    } catch {
      return null;
    }
  },

  assertOrganizerAccess(actor: User, organizationId: string): void {
    if (actor.systemRole === "ADMIN") return;
    const db = storageService.getDb();
    const isOrganizer = db.organizationMembers.some(
      (m) => m.userId === actor.id && m.organizationId === organizationId && m.role === "ORGANIZER"
    );
    if (!isOrganizer) {
      throw new Error(
        "Forbidden (403): Bạn không có quyền quản lý tài nguyên của tổ chức này. Mỗi tài khoản Ban tổ chức chỉ được quản lý chiến dịch thuộc tổ chức của mình."
      );
    }
  },

  isOrganizerOf(userId: string, organizationId: string): boolean {
    const db = storageService.getDb();
    return db.organizationMembers.some(
      (m) => m.userId === userId && m.organizationId === organizationId && m.role === "ORGANIZER"
    );
  },

  async login(email: string, password?: string): Promise<SessionContext> {
    const normalized = email.trim().toLowerCase();

    // 1. Try real BE API first
    try {
      const response = await apiClient.post<any, any>("/auth/login", {
        email: normalized,
        password: password || "123456",
      });

      if (response && response.accessToken && response.user) {
        tokenStorage.set(response.accessToken);
        const mappedUser = mapBeUserToFe(response.user);

        // Fetch user memberships from BE
        let memberships: UserMembershipDetail[] = [];
        try {
          const beMemberships = await apiClient.get<any, any[]>("/users/memberships");
          if (Array.isArray(beMemberships)) {
            memberships = beMemberships.map((bm) => ({
              membership: {
                id: bm.organizationId,
                userId: mappedUser.id,
                organizationId: bm.organizationId,
                role: bm.role,
                createdAt: new Date().toISOString(),
                joinedAt: new Date().toISOString(),
              },
              organization: {
                id: bm.organizationId,
                code: bm.organizationCode,
                name: bm.organizationName,
                description: "",
                email: "",
                contactEmail: "",
                phoneNumber: "",
                contactPhone: "",
                address: "",
                status: bm.organizationStatus,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              role: bm.role,
            }));
          }
        } catch {
          // Keep empty if memberships call fails
        }

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEYS.SESSION, mappedUser.id);
          window.localStorage.setItem("currentUser", JSON.stringify(mappedUser));
          window.dispatchEvent(new Event("openaid-auth-changed"));
        }

        const isOrganizer = memberships.some((m) => m.role === "ORGANIZER");
        return {
          user: mappedUser,
          memberships,
          isOrganizer,
          primaryOrganization: memberships.find((m) => m.role === "ORGANIZER")?.organization || memberships[0]?.organization,
        };
      }
    } catch (apiError: any) {
      // If server rejected with explicit invalid credentials, throw error directly
      if (apiError.message && !apiError.message.includes("Network Error") && !apiError.message.includes("ECONNREFUSED")) {
        // Fallback to local DB check if demo account is used
        const db = storageService.getDb();
        const demoUser = db.users.find((u) => u.email.toLowerCase() === normalized);
        if (!demoUser) {
          throw apiError;
        }
      }
    }

    // 2. Fallback to Local Mock Database
    await delay(250);
    const db = storageService.getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === normalized);
    if (!user) {
      throw new Error("Invalid email or password. Try one of the demo accounts below.");
    }
    if (user.status === "DISABLED" || user.isActive === false) {
      throw new Error("This account has been disabled by the Platform Admin.");
    }
    if (password && user.password && user.password !== password) {
      throw new Error("Incorrect password. Demo accounts use password: 123456");
    }

    const mappedUser = mapBeUserToFe(user);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.SESSION, mappedUser.id);
      window.localStorage.setItem("currentUser", JSON.stringify(mappedUser));
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }

    const ctx = this.getSessionContext();
    if (!ctx) throw new Error("Failed to establish session.");
    return ctx;
  },

  async register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    createOrgName?: string;
    createOrgDescription?: string;
    createOrgAddress?: string;
  }): Promise<SessionContext> {
    const normalized = payload.email.trim().toLowerCase();
    const fullName = payload.name.trim();
    const phoneNumber = payload.phone.trim() || "0905000111";

    // 1. Try real BE API
    try {
      const response = await apiClient.post<any, any>("/auth/register", {
        email: normalized,
        fullName,
        password: payload.password,
        phoneNumber,
      });

      if (response && response.accessToken && response.user) {
        tokenStorage.set(response.accessToken);
        const mappedUser = mapBeUserToFe(response.user);

        // If user requested organization registration, call POST /organizations
        let createdOrg: Organization | undefined;
        if (payload.createOrgName && payload.createOrgName.trim()) {
          try {
            const orgCode =
              payload.createOrgName
                .trim()
                .split(/\s+/)
                .map((w) => w[0])
                .join("")
                .toUpperCase() +
              "-" +
              Math.floor(100 + Math.random() * 900);

            createdOrg = await apiClient.post<any, Organization>("/organizations", {
              name: payload.createOrgName.trim(),
              code: orgCode,
              description: payload.createOrgDescription?.trim() || "Tổ chức thiện nguyện trên OpenAid",
              email: normalized,
              phoneNumber,
              address: payload.createOrgAddress?.trim() || "Việt Nam",
            });
          } catch {
            // Organization creation may be reviewed later
          }
        }

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEYS.SESSION, mappedUser.id);
          window.localStorage.setItem("currentUser", JSON.stringify(mappedUser));
          window.dispatchEvent(new Event("openaid-auth-changed"));
        }

        const isOrganizer = Boolean(createdOrg);
        return {
          user: mappedUser,
          memberships: createdOrg
            ? [
                {
                  membership: {
                    id: createdOrg.id,
                    userId: mappedUser.id,
                    organizationId: createdOrg.id,
                    role: "ORGANIZER",
                    createdAt: new Date().toISOString(),
                    joinedAt: new Date().toISOString(),
                  },
                  organization: createdOrg,
                  role: "ORGANIZER",
                },
              ]
            : [],
          isOrganizer,
          primaryOrganization: createdOrg,
        };
      }
    } catch (apiError: any) {
      if (apiError.message && !apiError.message.includes("Network Error") && !apiError.message.includes("ECONNREFUSED")) {
        throw apiError;
      }
    }

    // 2. Fallback to Local Mock Database
    await delay(300);
    const db = storageService.getDb();
    if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new Error("An account with this email already exists.");
    }

    const newUser: User = {
      id: generateId("usr"),
      email: normalized,
      password: payload.password,
      fullName,
      name: fullName,
      phoneNumber,
      phone: phoneNumber,
      bio: "Community member on OpenAid.",
      systemRole: "USER",
      isActive: true,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    if (payload.createOrgName && payload.createOrgName.trim()) {
      const orgCode =
        payload.createOrgName
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .toUpperCase() +
        "-" +
        Math.floor(100 + Math.random() * 900);

      const newOrg: Organization = {
        id: generateId("org"),
        code: orgCode,
        name: payload.createOrgName.trim(),
        description:
          payload.createOrgDescription?.trim() ||
          "Charitable organization pending platform verification.",
        email: normalized,
        contactEmail: normalized,
        phoneNumber: newUser.phone,
        contactPhone: newUser.phone,
        address: payload.createOrgAddress?.trim() || "Da Nang, Vietnam",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      db.organizations.push(newOrg);
      db.organizationMembers.push({
        id: generateId("om"),
        userId: newUser.id,
        organizationId: newOrg.id,
        role: "ORGANIZER",
        joinedAt: new Date().toISOString(),
      });

      storageService.addLog(db, {
        actorId: newUser.id,
        actorName: newUser.name,
        actorRole: "ORGANIZER",
        action: "ORGANIZATION_CREATED",
        description: `Created organization profile '${newOrg.name}' (Status: PENDING Admin approval).`,
        newStatus: "PENDING",
        entityType: "ORGANIZATION",
        entityId: newOrg.id,
      });
    }

    storageService.saveDb(db);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.SESSION, newUser.id);
      window.localStorage.setItem("currentUser", JSON.stringify(newUser));
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }

    const ctx = this.getSessionContext();
    if (!ctx) throw new Error("Registration failed.");
    return ctx;
  },

  logout(): void {
    tokenStorage.clear();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
      window.localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }
  },

  async updateProfile(
    userId: string,
    updates: { name: string; phone: string; bio?: string; avatarUrl?: string }
  ): Promise<User> {
    // Try BE first
    try {
      const updatedBe = await apiClient.patch<any, any>("/users/profile", {
        fullName: updates.name.trim(),
        phoneNumber: updates.phone.trim(),
        bio: updates.bio?.trim(),
        avatarUrl: updates.avatarUrl?.trim(),
      });
      if (updatedBe) {
        const mapped = mapBeUserToFe(updatedBe);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("currentUser", JSON.stringify(mapped));
          window.dispatchEvent(new Event("openaid-auth-changed"));
        }
        return mapped;
      }
    } catch {
      // Fallback to local DB
    }

    await delay(250);
    const db = storageService.getDb();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found.");

    db.users[idx] = {
      ...db.users[idx],
      name: updates.name.trim(),
      fullName: updates.name.trim(),
      phone: updates.phone.trim(),
      phoneNumber: updates.phone.trim(),
      bio: updates.bio?.trim() || "",
      avatarUrl: updates.avatarUrl?.trim() || db.users[idx].avatarUrl,
    };

    storageService.saveDb(db);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("currentUser", JSON.stringify(db.users[idx]));
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }
    return db.users[idx];
  },

  async createOrganizationForUser(
    userId: string,
    payload: {
      name: string;
      description: string;
      contactEmail: string;
      contactPhone: string;
      address: string;
      website?: string;
    }
  ): Promise<Organization> {
    const orgCode =
      payload.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase() +
      "-" +
      Math.floor(100 + Math.random() * 900);

    // Try BE
    try {
      const org = await apiClient.post<any, Organization>("/organizations", {
        name: payload.name.trim(),
        code: orgCode,
        description: payload.description.trim(),
        email: payload.contactEmail.trim(),
        phoneNumber: payload.contactPhone.trim(),
        address: payload.address.trim(),
      });
      if (org) return org;
    } catch {
      // Fallback
    }

    await delay(300);
    const db = storageService.getDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found.");

    const newOrg: Organization = {
      id: generateId("org"),
      code: orgCode,
      name: payload.name.trim(),
      description: payload.description.trim(),
      email: payload.contactEmail.trim(),
      contactEmail: payload.contactEmail.trim(),
      phoneNumber: payload.contactPhone.trim(),
      contactPhone: payload.contactPhone.trim(),
      address: payload.address.trim(),
      website: payload.website?.trim(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    db.organizations.push(newOrg);
    db.organizationMembers.push({
      id: generateId("om"),
      userId: user.id,
      organizationId: newOrg.id,
      role: "ORGANIZER",
      joinedAt: new Date().toISOString(),
    });

    storageService.addLog(db, {
      actorId: user.id,
      actorName: user.name,
      actorRole: "ORGANIZER",
      action: "ORGANIZATION_CREATED",
      description: `Submitted organization '${newOrg.name}' for Platform Admin approval.`,
      newStatus: "PENDING",
      entityType: "ORGANIZATION",
      entityId: newOrg.id,
    });

    storageService.saveDb(db);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }
    return newOrg;
  },
};
