import apiClient from "@/lib/api/axiosClient";
import type {
  Event,
  Organization,
  User,
  VolunteerApplication,
  VolunteerRole,
} from "@/types";
import { eventService } from "./eventService";

export interface EnrichedVolunteerApplication extends VolunteerApplication {
  user?: User;
  event?: Event;
  organization?: Organization;
  role?: VolunteerRole;
  registeredAt?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
}

function mapBeVolunteerToEnriched(a: any): EnrichedVolunteerApplication {
  return {
    id: a.id,
    eventId: a.eventId,
    userId: a.userId,
    volunteerRoleId: a.volunteerRoleId,
    note: a.notes || a.note || "",
    status: a.status,
    registeredAt: a.createdAt || a.registeredAt,
    reviewedAt: a.reviewedAt,
    reviewedById: a.reviewedById || a.reviewedBy,
    rejectionReason: a.rejectionReason,
    checkedInAt: a.checkInAt || a.checkedInAt,
    checkedInBy: a.checkInById || a.checkedInBy,
    checkedOutAt: a.checkOutAt || a.checkedOutAt,
    checkedOutBy: a.checkOutById || a.checkedOutBy,
    createdAt: a.createdAt || new Date().toISOString(),
    updatedAt: a.updatedAt || new Date().toISOString(),
    user: a.user
      ? {
          id: a.user.id,
          name: a.user.fullName || a.user.name || "Tình nguyện viên",
          fullName: a.user.fullName || a.user.name || "Tình nguyện viên",
          email: a.user.email || "",
          phone: a.user.phoneNumber || "",
          systemRole: "USER",
          isActive: true,
          status: "ACTIVE",
          createdAt: a.createdAt,
        }
      : undefined,
    event: a.event,
    role: a.volunteerRole
      ? {
          id: a.volunteerRole.id,
          eventId: a.eventId,
          name: a.volunteerRole.name,
          description: a.volunteerRole.description || "",
          requiredQuantity: Number(a.volunteerRole.quantity || 0),
          approvedQuantity: 0,
        }
      : undefined,
  };
}

export const volunteerService = {
  /**
   * Lấy danh sách vị trí tình nguyện viên theo sự kiện từ BE
   */
  async getRolesByEvent(eventId: string): Promise<VolunteerRole[]> {
    const event = await eventService.getById(eventId);
    return event?.volunteerRoles || [];
  },

  /**
   * Lấy danh sách đơn ứng tuyển TNV của bản thân từ BE
   */
  async getByUser(userId: string): Promise<EnrichedVolunteerApplication[]> {
    const items = await apiClient.get<any, any[]>("/volunteers/my");
    if (!Array.isArray(items)) return [];
    return items.map(mapBeVolunteerToEnriched);
  },

  /**
   * Ban tổ chức lấy danh sách ứng tuyển TNV theo sự kiện từ BE
   */
  async getByEvent(eventId: string): Promise<EnrichedVolunteerApplication[]> {
    const items = await apiClient.get<any, any[]>(`/volunteers/event/${eventId}`);
    if (!Array.isArray(items)) return [];
    return items.map(mapBeVolunteerToEnriched);
  },

  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedVolunteerApplication[]> {
    if (eventId && eventId !== "ALL") {
      return this.getByEvent(eventId);
    }
    return [];
  },

  async getApprovedVolunteersForEvent(
    eventId: string
  ): Promise<EnrichedVolunteerApplication[]> {
    const list = await this.getByEvent(eventId);
    return list.filter((a) => a.status === "APPROVED");
  },

  /**
   * Nộp đơn ứng tuyển tình nguyện viên qua BE (POST /api/volunteers/apply)
   */
  async apply(
    payload: {
      eventId: string;
      volunteerRoleId: string;
      note: string;
    },
    actor: User
  ): Promise<EnrichedVolunteerApplication> {
    const res = await apiClient.post<any, any>("/volunteers/apply", {
      eventId: payload.eventId,
      volunteerRoleId: payload.volunteerRoleId,
      note: payload.note?.trim(),
    });

    return mapBeVolunteerToEnriched(res);
  },

  /**
   * Ban tổ chức xét duyệt đơn ứng tuyển (APPROVED/REJECTED) qua BE (PATCH /api/volunteers/:id/review)
   */
  async reviewApplication(
    applicationId: string,
    decision: "APPROVED" | "REJECTED",
    actor: User,
    rejectionReason?: string
  ): Promise<EnrichedVolunteerApplication> {
    const res = await apiClient.patch<any, any>(`/volunteers/${applicationId}/review`, {
      status: decision,
      rejectionReason: decision === "REJECTED" ? rejectionReason || "Không phù hợp tiêu chí" : undefined,
    });

    return mapBeVolunteerToEnriched(res);
  },

  /**
   * Điểm danh Check-in ca trực TNV qua BE (POST /api/volunteers/:id/check-in)
   */
  async checkIn(
    applicationId: string,
    actor: User
  ): Promise<EnrichedVolunteerApplication> {
    const res = await apiClient.post<any, any>(
      `/volunteers/${applicationId}/check-in`
    );
    return mapBeVolunteerToEnriched(res);
  },

  /**
   * Điểm danh Check-out ca trực TNV qua BE (POST /api/volunteers/:id/check-out)
   */
  async checkOut(
    applicationId: string,
    actor: User
  ): Promise<EnrichedVolunteerApplication> {
    const res = await apiClient.post<any, any>(
      `/volunteers/${applicationId}/check-out`
    );
    return mapBeVolunteerToEnriched(res);
  },
};
