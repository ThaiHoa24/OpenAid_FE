import { STORAGE_KEYS } from "@/constants";
import { storageService } from "./storageService";
import type { Organization, OrganizationMember, OrganizationRole, User } from "@/types";
import { delay, generateId } from "@/utils";

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

export const authService = {
  getSessionContext(): SessionContext | null {
    if (typeof window === "undefined") return null;
    try {
      const rawUserId = window.localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!rawUserId) return null;
      const db = storageService.getDb();
      const user = db.users.find((u) => u.id === rawUserId);
      if (!user || user.status === "DISABLED") return null;

      const memberships: UserMembershipDetail[] = db.organizationMembers
        .filter((m) => m.userId === user.id)
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

  async login(email: string, password?: string): Promise<SessionContext> {
    await delay(250);
    const db = storageService.getDb();
    const normalized = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normalized);
    if (!user) {
      throw new Error("Invalid email or password. Try one of the demo accounts below.");
    }
    if (user.status === "DISABLED") {
      throw new Error("This account has been disabled by the Platform Admin.");
    }
    if (password && user.password && user.password !== password) {
      throw new Error("Incorrect password. Demo accounts use password: 123456");
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.SESSION, user.id);
      window.localStorage.setItem("currentUser", JSON.stringify(user));
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
    await delay(300);
    const db = storageService.getDb();
    const normalized = payload.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new Error("An account with this email already exists.");
    }

    const newUser: User = {
      id: generateId("usr"),
      email: normalized,
      password: payload.password,
      name: payload.name.trim(),
      phone: payload.phone.trim() || "0905000111",
      bio: "Community member on OpenAid.",
      systemRole: "USER",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    if (payload.createOrgName && payload.createOrgName.trim()) {
      const newOrg: Organization = {
        id: generateId("org"),
        name: payload.createOrgName.trim(),
        description:
          payload.createOrgDescription?.trim() ||
          "Charitable organization pending platform verification.",
        contactEmail: normalized,
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
    await delay(250);
    const db = storageService.getDb();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found.");

    db.users[idx] = {
      ...db.users[idx],
      name: updates.name.trim(),
      phone: updates.phone.trim(),
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
    await delay(300);
    const db = storageService.getDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found.");

    const newOrg: Organization = {
      id: generateId("org"),
      name: payload.name.trim(),
      description: payload.description.trim(),
      contactEmail: payload.contactEmail.trim(),
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
