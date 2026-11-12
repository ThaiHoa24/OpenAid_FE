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

  /**
   * REP-01: Xuất báo cáo tổng kết nghiệm thu chiến dịch (GET /api/reports/events/:id/export)
   * Hỗ trợ tự động tải xuống file CSV / Excel hoặc mở cửa sổ in PDF
   */
  async exportEventReport(
    eventId: string,
    format: "csv" | "excel" | "pdf" = "csv"
  ): Promise<any> {
    const res = await apiClient.get<any, any>(
      `/reports/events/${eventId}/export`,
      { params: { format } }
    );

    if (typeof window !== "undefined" && res?.content) {
      if (format === "pdf") {
        const printWin = window.open("", "_blank");
        if (printWin) {
          printWin.document.open();
          printWin.document.write(res.content);
          printWin.document.close();
          printWin.focus();
          setTimeout(() => printWin.print(), 350);
          return res;
        }
      }

      const blob = new Blob([res.content], {
        type: res.mimeType || "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        res.fileName || `OpenAid_Report_${eventId.slice(0, 8)}.${format === "excel" ? "xls" : "csv"}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return res;
  },
};
