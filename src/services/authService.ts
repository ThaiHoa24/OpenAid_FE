import { STORAGE_KEYS } from "@/constants";
import type { Organization, OrganizationMember, OrganizationRole, User } from "@/types";
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
      if (!rawUser) return null;

      let user: User | null = JSON.parse(rawUser);
      if (!user || user.status === "DISABLED" || user.isActive === false) {
        return null;
      }

      user = mapBeUserToFe(user);

      // Load stored memberships
      let memberships: UserMembershipDetail[] = [];
      const rawMemberships = window.localStorage.getItem("currentMemberships");
      if (rawMemberships) {
        try {
          memberships = JSON.parse(rawMemberships);
        } catch {
          memberships = [];
        }
      }

      const organizerMemberships = memberships.filter((m) => m.role === "ORGANIZER");
      return {
        user,
        memberships,
        isOrganizer: organizerMemberships.length > 0 || user.systemRole === "ADMIN",
        primaryOrganization: organizerMemberships[0]?.organization || memberships[0]?.organization,
      };
    } catch {
      return null;
    }
  },

  assertOrganizerAccess(actor: User, organizationId: string): void {
    if (actor.systemRole === "ADMIN") return;
    const ctx = this.getSessionContext();
    const hasOrgAccess = ctx?.memberships.some(
      (m) => m.organization.id === organizationId && m.role === "ORGANIZER"
    );
    if (!hasOrgAccess) {
      throw new Error(
        "Forbidden (403): Bạn không có quyền quản lý tài nguyên của tổ chức này. Mỗi tài khoản Ban tổ chức chỉ được quản lý chiến dịch thuộc tổ chức của mình."
      );
    }
  },

  isOrganizerOf(userId: string, organizationId: string): boolean {
    const ctx = this.getSessionContext();
    if (ctx?.user.id === userId && ctx.user.systemRole === "ADMIN") return true;
    return Boolean(
      ctx?.memberships.some(
        (m) => m.organization.id === organizationId && m.role === "ORGANIZER"
      )
    );
  },

  async login(email: string, password?: string): Promise<SessionContext> {
    const normalized = email.trim().toLowerCase();

    // Call BE API directly
    const response = await apiClient.post<any, any>("/auth/login", {
      email: normalized,
      password: password || "123456",
    });

    if (!response || !response.accessToken || !response.user) {
      throw new Error("Phản hồi đăng nhập từ máy chủ không hợp lệ.");
    }

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
    } catch (memErr) {
      console.warn("Could not load user memberships:", memErr);
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.SESSION, mappedUser.id);
      window.localStorage.setItem("currentUser", JSON.stringify(mappedUser));
      window.localStorage.setItem("currentMemberships", JSON.stringify(memberships));
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }

    const isOrganizer = memberships.some((m) => m.role === "ORGANIZER") || mappedUser.systemRole === "ADMIN";
    return {
      user: mappedUser,
      memberships,
      isOrganizer,
      primaryOrganization: memberships.find((m) => m.role === "ORGANIZER")?.organization || memberships[0]?.organization,
    };
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

    // Call BE API directly
    const response = await apiClient.post<any, any>("/auth/register", {
      email: normalized,
      fullName,
      password: payload.password,
      phoneNumber,
    });

    if (!response || !response.accessToken || !response.user) {
      throw new Error("Phản hồi đăng ký từ máy chủ không hợp lệ.");
    }

    tokenStorage.set(response.accessToken);
    const mappedUser = mapBeUserToFe(response.user);

    // If user requested organization registration, call POST /organizations
    let createdOrg: Organization | undefined;
    let memberships: UserMembershipDetail[] = [];
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

        if (createdOrg) {
          memberships.push({
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
          });
        }
      } catch (orgErr: any) {
        console.warn("Failed to create organization profile during registration:", orgErr);
      }
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.SESSION, mappedUser.id);
      window.localStorage.setItem("currentUser", JSON.stringify(mappedUser));
      window.localStorage.setItem("currentMemberships", JSON.stringify(memberships));
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }

    const isOrganizer = Boolean(createdOrg) || mappedUser.systemRole === "ADMIN";
    return {
      user: mappedUser,
      memberships,
      isOrganizer,
      primaryOrganization: createdOrg,
    };
  },

  async sendRegisterOtp(email: string): Promise<{ success: boolean; message: string }> {
    const normalized = email.trim().toLowerCase();
    const response = await apiClient.post<any, any>("/auth/send-register-otp", {
      email: normalized,
    });
    return {
      success: true,
      message: response?.message || "Mã xác thực đã được gửi tới email của bạn.",
    };
  },

  async verifyAndRegister(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
    createOrgName?: string;
    createOrgDescription?: string;
    createOrgAddress?: string;
  }): Promise<SessionContext> {
    const normalized = payload.email.trim().toLowerCase();
    const fullName = payload.name.trim();
    const phoneNumber = payload.phone.trim() || "0905000111";

    const response = await apiClient.post<any, any>("/auth/verify-register", {
      email: normalized,
      fullName,
      password: payload.password,
      phoneNumber,
      otp: payload.otp.trim(),
    });

    if (!response || !response.accessToken || !response.user) {
      throw new Error("Phản hồi xác thực từ máy chủ không hợp lệ.");
    }

    tokenStorage.set(response.accessToken);
    const mappedUser = mapBeUserToFe(response.user);

    let createdOrg: Organization | undefined;
    let memberships: UserMembershipDetail[] = [];
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

        if (createdOrg) {
          memberships.push({
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
          });
        }
      } catch (orgErr: any) {
        console.warn("Failed to create organization profile during registration:", orgErr);
      }
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.SESSION, mappedUser.id);
      window.localStorage.setItem("currentUser", JSON.stringify(mappedUser));
      window.localStorage.setItem("currentMemberships", JSON.stringify(memberships));
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }

    const isOrganizer = Boolean(createdOrg) || mappedUser.systemRole === "ADMIN";
    return {
      user: mappedUser,
      memberships,
      isOrganizer,
      primaryOrganization: createdOrg,
    };
  },

  async sendForgotPasswordOtp(email: string): Promise<{ success: boolean; message: string }> {
    const normalized = email.trim().toLowerCase();
    const response = await apiClient.post<any, any>("/auth/forgot-password", {
      email: normalized,
    });
    return {
      success: true,
      message: response?.message || "Mã xác thực đã được gửi tới email của bạn.",
    };
  },

  async resetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const normalized = payload.email.trim().toLowerCase();
    const response = await apiClient.post<any, any>("/auth/reset-password", {
      email: normalized,
      otp: payload.otp.trim(),
      newPassword: payload.newPassword,
    });
    return {
      success: true,
      message: response?.message || "Đặt lại mật khẩu thành công.",
    };
  },

  logout(): void {
    // 1. Gửi request báo backend vô hiệu hóa token (nếu backend có hỗ trợ)
    try {
      apiClient.post("/auth/logout").catch(() => {
        // Bỏ qua nếu backend chưa triển khai endpoint này
      });
    } catch {
      // Bỏ qua lỗi
    }

    // 2. Xóa sạch token đã phát ra ở tất cả các nơi lưu trữ (localStorage, sessionStorage, Cookies)
    tokenStorage.clear();

    // 3. Xóa dữ liệu phiên đăng nhập của người dùng trên Application Storage
    if (typeof window !== "undefined") {
      try {
        // Xóa các key liên quan đến tài khoản & quyền hạn
        window.localStorage.removeItem(STORAGE_KEYS.SESSION);
        window.localStorage.removeItem("currentUser");
        window.localStorage.removeItem("currentMemberships");

        // Dọn dẹp cả sessionStorage nếu có
        window.sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        window.sessionStorage.removeItem("currentUser");
        window.sessionStorage.removeItem("currentMemberships");

        // LƯU Ý: Giữ nguyên ngôn ngữ ứng dụng người dùng đã chọn ("openaid-language")

        // 4. Phát sự kiện đồng bộ trạng thái đăng xuất trên toàn bộ giao diện
        window.dispatchEvent(new Event("openaid-auth-changed"));
      } catch (err) {
        console.error("Lỗi khi dọn dẹp dữ liệu đăng xuất:", err);
      }
    }
  },

  async updateProfile(
    userId: string,
    updates: { name: string; phone: string; avatarUrl?: string }
  ): Promise<User> {
    const updatedBe = await apiClient.patch<any, any>("/users/profile", {
      fullName: updates.name.trim(),
      phoneNumber: updates.phone.trim(),
      avatarUrl: updates.avatarUrl?.trim(),
    });

    if (!updatedBe) {
      throw new Error("Không thể cập nhật thông tin cá nhân.");
    }

    const mapped = mapBeUserToFe(updatedBe);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("currentUser", JSON.stringify(mapped));
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }
    return mapped;
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

    const org = await apiClient.post<any, Organization>("/organizations", {
      name: payload.name.trim(),
      code: orgCode,
      description: payload.description.trim(),
      email: payload.contactEmail.trim(),
      phoneNumber: payload.contactPhone.trim(),
      address: payload.address.trim(),
    });

    if (!org) {
      throw new Error("Không thể tạo tổ chức cứu trợ.");
    }

    // Refresh session memberships
    const ctx = this.getSessionContext();
    if (ctx) {
      const newMembership: UserMembershipDetail = {
        membership: {
          id: org.id,
          userId,
          organizationId: org.id,
          role: "ORGANIZER",
          createdAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
        },
        organization: org,
        role: "ORGANIZER",
      };
      const updatedMemberships = [...ctx.memberships, newMembership];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("currentMemberships", JSON.stringify(updatedMemberships));
        window.dispatchEvent(new Event("openaid-auth-changed"));
      }
    }

    return org;
  },
};
