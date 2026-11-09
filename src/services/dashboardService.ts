import apiClient from "@/lib/api/axiosClient";

export interface EventDashboardStats {
  donationsCount: number;
  batchesCount: number;
  tripsCount: number;
  applicationsCount: number;
}

export interface EventDonationNeedMetric {
  id: string;
  itemType: string;
  unit: string;
  targetQuantity: number;
}

export interface EventVolunteerRoleMetric {
  id: string;
  name: string;
  quantity: number;
}

export interface EventInventorySummary {
  itemType: string;
  unit: string;
  received: number;
  available: number;
  reserved: number;
  distributed: number;
  lost: number;
}

export interface EventDashboardResponse {
  eventId: string;
  eventTitle: string;
  eventStatus: string;
  organizationName: string;
  stats: EventDashboardStats;
  donationNeeds: EventDonationNeedMetric[];
  volunteerRoles: EventVolunteerRoleMetric[];
  inventorySummary: EventInventorySummary[];
}

export const dashboardService = {
  /**
   * Lấy báo cáo thống kê tiến độ của sự kiện từ BE (GET /api/dashboard/events/:eventId)
   * Phù hợp đặc tả FR23 trong Project Proposal.
   */
  async getEventDashboard(eventId: string): Promise<EventDashboardResponse> {
    return apiClient.get<any, EventDashboardResponse>(
      `/dashboard/events/${eventId}`
    );
  },
};
