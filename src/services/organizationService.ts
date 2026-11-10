import apiClient from "@/lib/api/axiosClient";
import type { Organization, OrganizationRole, User } from "@/types";

export interface OrganizationMemberDetail {
  userId: string;
  role: OrganizationRole;
  joinedAt?: string;
  createdAt?: string;
  user?: {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
    phoneNumber?: string;
    phone?: string;
    avatarUrl?: string;
    isActive?: boolean;
  };
}

export interface DetailedOrganization extends Organization {
  members?: OrganizationMemberDetail[];
  eventsCount?: number;
}

export const organizationService = {
  /**
   * Lấy thông tin chi tiết một tổ chức kèm danh sách thành viên (GET /api/organizations/:id)
   */
  async getById(id: string): Promise<DetailedOrganization> {
    const res = await apiClient.get<any, any>(`/organizations/${id}`);
    const members: OrganizationMemberDetail[] = Array.isArray(res.members)
      ? res.members.map((m: any) => ({
          userId: m.userId,
          role: m.role as OrganizationRole,
          joinedAt: m.joinedAt || m.createdAt,
          createdAt: m.createdAt,
          user: m.user
            ? {
                id: m.user.id,
                fullName: m.user.fullName || m.user.name || "Thành viên",
                name: m.user.fullName || m.user.name || "Thành viên",
                email: m.user.email || "",
                phoneNumber: m.user.phoneNumber || m.user.phone || "",
                phone: m.user.phoneNumber || m.user.phone || "",
                avatarUrl: m.user.avatarUrl,
                isActive: m.user.isActive !== false,
              }
            : undefined,
        }))
      : [];

    return {
      id: res.id,
      code: res.code,
      name: res.name,
      description: res.description || "",
      email: res.email || "",
      contactEmail: res.email || "",
      phoneNumber: res.phoneNumber || "",
      contactPhone: res.phoneNumber || "",
      address: res.address || "",
      status: res.status,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      members,
      eventsCount: res._count?.events ?? 0,
    };
  },

  /**
   * Ban tổ chức cập nhật thông tin hồ sơ tổ chức (PATCH /api/organizations/:id)
   */
  async update(
    id: string,
    payload: {
      name?: string;
      description?: string;
      email?: string;
      phoneNumber?: string;
      address?: string;
    }
  ): Promise<Organization> {
    const res = await apiClient.patch<any, any>(`/organizations/${id}`, {
      name: payload.name?.trim(),
      description: payload.description?.trim(),
      email: payload.email?.trim().toLowerCase(),
      phoneNumber: payload.phoneNumber?.trim(),
      address: payload.address?.trim(),
    });
    return res;
  },

  /**
   * Ban tổ chức mời / thêm thành viên vào tổ chức (POST /api/organizations/:id/members)
   */
  async addMember(
    organizationId: string,
    payload: {
      email?: string;
      userId?: string;
      role: OrganizationRole;
    }
  ): Promise<any> {
    const res = await apiClient.post<any, any>(
      `/organizations/${organizationId}/members`,
      {
        email: payload.email?.trim().toLowerCase(),
        userId: payload.userId,
        role: payload.role,
      }
    );
    return res;
  },
};
