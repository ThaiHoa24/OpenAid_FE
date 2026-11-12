import apiClient from "@/lib/api/axiosClient";
import { mapBeEventToEnriched, type EnrichedEvent } from "./eventService";
import type {
  Organization,
  OrganizationStatus,
  User,
  UserStatus,
} from "@/types";

export interface EnrichedUser extends User {
  organizations: {
    id: string;
    name: string;
    role: string;
    status: string;
  }[];
  volunteerApplicationsCount: number;
  donationsCount: number;
}

export interface EnrichedOrganization extends Organization {
  membersCount: number;
  organizers: User[];
  eventsCount: number;
}

export const adminService = {
  async getPlatformStats() {
    try {
      const [usersRes, orgsRes, eventsRes, logsRes] = await Promise.all([
        apiClient.get<any, any>("/admin/users"),
        apiClient.get<any, any>("/organizations"),
        apiClient.get<any, any>("/admin/events").catch(() => apiClient.get<any, any>("/events")),
        apiClient.get<any, any>("/transparency/logs"),
      ]);
      const users = Array.isArray(usersRes) ? usersRes : usersRes?.items || [];
      const orgs = Array.isArray(orgsRes) ? orgsRes : orgsRes?.items || [];
      const events = Array.isArray(eventsRes) ? eventsRes : eventsRes?.items || [];
      const logs = Array.isArray(logsRes) ? logsRes : logsRes?.items || [];
      return {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.isActive !== false).length,
        totalOrganizations: orgs.length,
        verifiedOrganizations: orgs.filter((o: any) => o.status === "APPROVED").length,
        pendingOrganizations: orgs.filter((o: any) => o.status === "PENDING").length,
        totalEvents: events.length,
        publishedEvents: events.filter((e: any) => e.status === "PUBLISHED").length,
        totalLogs: logs.length,
      };
    } catch {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalOrganizations: 0,
        verifiedOrganizations: 0,
        pendingOrganizations: 0,
        totalEvents: 0,
        publishedEvents: 0,
        totalLogs: 0,
      };
    }
  },

  /**
   * Lấy danh sách toàn bộ người dùng từ BE (GET /api/admin/users)
   */
  async getAllUsers(search?: string, statusFilter?: string): Promise<EnrichedUser[]> {
    const res = await apiClient.get<any, any>("/admin/users");
    const items = Array.isArray(res) ? res : res?.items || [];

    let list: EnrichedUser[] = items.map((u: any) => ({
      id: u.id,
      name: u.fullName || u.name || "",
      fullName: u.fullName || u.name || "",
      email: u.email,
      phone: u.phoneNumber || u.phone || "",
      phoneNumber: u.phoneNumber || u.phone || "",
      systemRole: u.systemRole,
      status: (u.isActive !== false && u.status !== "DISABLED" ? "ACTIVE" : "DISABLED") as UserStatus,
      isActive: u.isActive !== false,
      createdAt: u.createdAt || new Date().toISOString(),
      organizations: Array.isArray(u.memberships)
        ? u.memberships.map((m: any) => ({
            id: m.organization?.id || m.organizationId,
            name: m.organization?.name || "",
            role: m.role,
            status: m.organization?.status || "APPROVED",
          }))
        : [],
      volunteerApplicationsCount: u.volunteerApplications?.length ?? 0,
      donationsCount: u.donations?.length ?? 0,
    }));

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter((u) => u.status === statusFilter);
    }

    return list;
  },

  /**
   * Khóa hoặc mở khóa người dùng qua BE (PATCH /api/admin/users/:id/active)
   */
  async updateUserStatus(
    userId: string,
    nextStatus: UserStatus,
    actor: User
  ): Promise<User> {
    const res = await apiClient.patch<any, any>(`/admin/users/${userId}/active`, {
      isActive: nextStatus === "ACTIVE",
    });

    return {
      id: res.id,
      name: res.fullName || res.name || "",
      fullName: res.fullName || res.name || "",
      email: res.email,
      phone: res.phoneNumber || res.phone || "",
      phoneNumber: res.phoneNumber || res.phone || "",
      systemRole: res.systemRole,
      status: (res.isActive ? "ACTIVE" : "DISABLED") as UserStatus,
      isActive: res.isActive,
      createdAt: res.createdAt,
    };
  },

  /**
   * Lấy danh sách tổ chức từ BE (GET /api/organizations)
   */
  async getAllOrganizations(
    statusFilter?: string,
    search?: string
  ): Promise<EnrichedOrganization[]> {
    const res = await apiClient.get<any, any>("/organizations");
    const items = Array.isArray(res) ? res : res?.items || [];

    let list: EnrichedOrganization[] = items.map((o: any) => ({
      id: o.id,
      code: o.code,
      name: o.name,
      description: o.description || "",
      email: o.email || "",
      contactEmail: o.email || "",
      phoneNumber: o.phoneNumber || "",
      contactPhone: o.phoneNumber || "",
      address: o.address || "",
      status: o.status,
      createdAt: o.createdAt,
      membersCount: o._count?.members ?? o.membersCount ?? 1,
      organizers: o.organizers || [],
      eventsCount: o._count?.events ?? o.eventsCount ?? 0,
    }));

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.contactEmail.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Xét duyệt tổ chức từ thiện qua BE (PATCH /api/admin/organizations/:id/review)
   */
  async updateOrganizationStatus(
    orgId: string,
    nextStatus: OrganizationStatus,
    actor: User
  ): Promise<Organization> {
    const res = await apiClient.patch<any, any>(
      `/admin/organizations/${orgId}/review`,
      {
        status: nextStatus,
      }
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }
    return res;
  },

  /**
   * Admin lấy danh sách toàn bộ chiến dịch (mọi trạng thái) từ BE (GET /api/admin/events)
   */
  async getAllEvents(filters?: {
    search?: string;
    status?: string;
    skip?: number;
    take?: number;
  }): Promise<EnrichedEvent[]> {
    const params: Record<string, any> = {};
    if (filters?.skip !== undefined) params.skip = filters.skip;
    if (filters?.take !== undefined) params.take = filters.take;

    const res = await apiClient.get<any, any>("/admin/events", { params });
    const items = Array.isArray(res) ? res : res?.items || res?.data || [];
    let list: EnrichedEvent[] = items.map(mapBeEventToEnriched);

    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((e) => e.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.organization?.name || "").toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getOrganizerDashboardSummary(
    organizationId?: string,
    eventId?: string
  ) {
    try {
      if (eventId && eventId !== "ALL") {
        const res = await apiClient.get<any, any>(`/dashboard/events/${eventId}`);
        return {
          activeVolunteers:
            Number(res?.stats?.totalVolunteerApproved ?? res?.stats?.applicationsCount ?? 0),
          totalDonationsReceived: Number(res?.stats?.donationsCount ?? 0),
          activeTrips: Number(res?.stats?.tripsCount ?? 0),
          inventoryCount: Array.isArray(res?.inventorySummary) ? res.inventorySummary.length : 0,
        };
      }

      if (organizationId && organizationId !== "ALL") {
        const invRes = await apiClient
          .get<any, any>(`/inventory/organization/${organizationId}`)
          .catch(() => []);
        const inv = Array.isArray(invRes) ? invRes : invRes?.items || [];
        return {
          activeVolunteers: 0,
          totalDonationsReceived: inv.reduce(
            (sum: number, item: any) => sum + Number(item.receivedTotal ?? item.received ?? 0),
            0
          ),
          activeTrips: 0,
          inventoryCount: inv.length,
        };
      }
    } catch {
      // Fallback to zeros if network error
    }

    return {
      activeVolunteers: 0,
      totalDonationsReceived: 0,
      activeTrips: 0,
      inventoryCount: 0,
    };
  },
};
