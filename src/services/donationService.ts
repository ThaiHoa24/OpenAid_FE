import apiClient from "@/lib/api/axiosClient";
import { eventService } from "./eventService";
import type {
  Donation,
  DonationBatch,
  DonationNeed,
  Event,
  Organization,
  User,
} from "@/types";

export interface EnrichedDonation extends Donation {
  donor?: User;
  event?: Event;
  organization?: Organization;
  donationNeed?: DonationNeed;
  batch?: DonationBatch;
}

function mapBeDonationToEnriched(d: any): EnrichedDonation {
  const quantity =
    typeof d.quantity === "object"
      ? d.quantity?.toNumber?.() ?? Number(d.quantity)
      : Number(d.quantity);
  const receivedQuantity =
    typeof d.receivedQuantity === "object"
      ? d.receivedQuantity?.toNumber?.() ?? Number(d.receivedQuantity)
      : Number(d.receivedQuantity || 0);

  return {
    id: d.id,
    trackingId: d.trackingId,
    eventId: d.eventId,
    userId: d.donorId || d.userId,
    donorId: d.donorId || d.userId,
    donationNeedId: d.donationNeedId,
    itemType: d.itemType?.name || d.itemType || "Hàng cứu trợ",
    unit: d.unit?.name || d.unit || "phần",
    quantity: isNaN(quantity) ? 0 : quantity,
    receivedQuantity: isNaN(receivedQuantity) ? 0 : receivedQuantity,
    status: d.status,
    note: d.notes || d.note,
    batchId: d.batchId,
    receivedAt: d.receivedAt,
    receivedById: d.receivedById || d.receivedBy,
    rejectionReason: d.status === "REJECTED" ? d.notes : undefined,
    photoUrl: d.photoUrl,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    donor: d.donor
      ? {
          id: d.donor.id,
          name: d.donor.fullName || d.donor.name || "Nhà hảo tâm",
          fullName: d.donor.fullName || d.donor.name || "Nhà hảo tâm",
          email: d.donor.email || "",
          phone: d.donor.phoneNumber || "",
          systemRole: "USER",
          isActive: true,
          status: "ACTIVE",
          createdAt: d.createdAt,
        }
      : undefined,
    event: d.event,
    batch: d.batch,
  };
}

export const donationService = {
  /**
   * Lấy danh sách nhu cầu cứu trợ của sự kiện từ BE
   */
  async getNeedsByEvent(eventId: string): Promise<DonationNeed[]> {
    const list = await apiClient.get<any, any[]>(`/events/${eventId}/donation-needs`);
    if (!Array.isArray(list)) return [];
    return list.map((n) => {
      const target =
        typeof n.targetQuantity === "object"
          ? n.targetQuantity?.toNumber?.() ?? Number(n.targetQuantity)
          : Number(n.targetQuantity);
      return {
        id: n.id,
        eventId: n.eventId || eventId,
        itemTypeId: n.itemTypeId,
        unitId: n.unitId,
        itemType: n.itemType?.name || n.itemType || "Hàng cứu trợ",
        unit: n.unit?.name || n.unit || "phần",
        targetQuantity: isNaN(target) ? 0 : target,
        pledgedQuantity: Number(n.pledgedQuantity || 0),
        receivedQuantity: Number(n.receivedQuantity || 0),
        distributedQuantity: Number(n.distributedQuantity || 0),
        notes: n.notes,
      };
    });
  },

  /**
   * Lấy lịch sử quyên góp của bản thân từ BE
   */
  async getByUser(userId: string): Promise<EnrichedDonation[]> {
    const res = await apiClient.get<any, any>("/donations/my");
    const items = Array.isArray(res) ? res : res?.items || [];
    return items.map(mapBeDonationToEnriched);
  },

  /**
   * Ban tổ chức lấy danh sách quyên góp theo sự kiện từ BE
   */
  async getByEvent(eventId: string): Promise<EnrichedDonation[]> {
    const res = await apiClient.get<any, any>(`/donations/event/${eventId}`);
    const items = Array.isArray(res) ? res : res?.items || [];
    return items.map(mapBeDonationToEnriched);
  },

  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedDonation[]> {
    if (eventId && eventId !== "ALL") {
      return this.getByEvent(eventId);
    }
    if (organizationId) {
      const events = await eventService.getAll({ organizationId, includeDrafts: true });
      if (events.length === 0) return [];
      const results = await Promise.all(
        events.map((e) => this.getByEvent(e.id).catch(() => []))
      );
      return results.flat();
    }
    return [];
  },

  /**
   * Tạo phiếu quyên góp mới qua BE (POST /api/donations)
   */
  async create(
    payload: {
      eventId?: string;
      donationNeedId: string;
      quantity: number;
      note?: string;
      photoUrl?: string;
    },
    donor?: User
  ): Promise<EnrichedDonation> {
    const res = await apiClient.post<any, any>("/donations", {
      donationNeedId: payload.donationNeedId,
      quantity: Number(payload.quantity),
    });

    return mapBeDonationToEnriched(res);
  },

  /**
   * Xác nhận tiếp nhận hiện vật vào kho qua BE (PATCH /api/donations/:id/receipt)
   */
  async confirmReceived(
    donationId: string,
    actor: User
  ): Promise<EnrichedDonation> {
    const updated = await apiClient.patch<any, any>(`/donations/${donationId}/receipt`, {
      status: "RECEIVED",
    });

    return mapBeDonationToEnriched(updated);
  },

  /**
   * Từ chối tiếp nhận hiện vật qua BE (PATCH /api/donations/:id/receipt)
   */
  async rejectDonation(
    donationId: string,
    actor: User,
    reason?: string
  ): Promise<EnrichedDonation> {
    const updated = await apiClient.patch<any, any>(`/donations/${donationId}/receipt`, {
      status: "REJECTED",
      rejectionReason: reason?.trim() || "Không đúng tiêu chuẩn quyên góp",
    });

    return mapBeDonationToEnriched(updated);
  },

  /**
   * Người dùng hủy quyên góp khi còn PENDING qua BE (POST /api/donations/:id/cancel)
   */
  async cancelMyDonation(
    donationId: string,
    actor: User
  ): Promise<EnrichedDonation> {
    const updated = await apiClient.post<any, any>(`/donations/${donationId}/cancel`);
    return mapBeDonationToEnriched(updated);
  },
};
