import apiClient from "@/lib/api/axiosClient";
import { eventService } from "./eventService";
import type {
  BatchStatus,
  DistributionTrip,
  Donation,
  DonationBatch,
  Event,
  Organization,
  User,
} from "@/types";
import { donationService } from "./donationService";

export interface EnrichedBatch extends DonationBatch {
  event?: Event;
  organization?: Organization;
  donations: Donation[];
  currentTrip?: DistributionTrip;
}

function mapBeBatchToEnriched(b: any): EnrichedBatch {
  const donationIds = Array.isArray(b.donations)
    ? b.donations.map((d: any) => d.id)
    : Array.isArray(b.donationIds)
    ? b.donationIds
    : [];

  const itemTypeName =
    b.itemType?.name ||
    (typeof b.itemType === "string" ? b.itemType : "") ||
    "Hàng cứu trợ";
  const unitName =
    b.unit?.name || (typeof b.unit === "string" ? b.unit : "") || "Phần";
  const trip = b.assignments?.[0]?.trip || b.currentTrip;

  const totalQuantity =
    typeof b.totalQuantity === "object"
      ? b.totalQuantity?.toNumber?.() ?? Number(b.totalQuantity)
      : Number(b.totalQuantity ?? 0);
  const distributedQuantity =
    typeof b.distributedQuantity === "object"
      ? b.distributedQuantity?.toNumber?.() ?? Number(b.distributedQuantity)
      : Number(b.distributedQuantity ?? 0);
  const returnedQuantity =
    typeof b.returnedQuantity === "object"
      ? b.returnedQuantity?.toNumber?.() ?? Number(b.returnedQuantity)
      : Number(b.returnedQuantity ?? 0);
  const lostQuantity =
    typeof b.lostQuantity === "object"
      ? b.lostQuantity?.toNumber?.() ?? Number(b.lostQuantity)
      : Number(b.lostQuantity ?? 0);
  const remainingQuantity = Math.max(
    0,
    totalQuantity - distributedQuantity - returnedQuantity - lostQuantity
  );

  return {
    id: b.id,
    batchCode: b.batchCode,
    name: b.name || `Lô ${b.batchCode} - ${itemTypeName}`,
    eventId: b.eventId,
    organizationId: b.organizationId || b.event?.organizationId || "",
    itemType: itemTypeName,
    itemTypeId: b.itemTypeId,
    unit: unitName,
    unitId: b.unitId,
    totalQuantity,
    distributedQuantity,
    returnedQuantity,
    remainingQuantity,
    lostQuantity,
    status: b.status as BatchStatus,
    donationIds,
    donations: Array.isArray(b.donations) ? b.donations : [],
    currentTripId: trip?.id || b.currentTripId,
    currentTrip: trip,
    reconciliationNote: b.reconciliationNote,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString(),
    event: b.event,
  };
}

export const batchService = {
  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedBatch[]> {
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
   * Lấy danh sách lô hàng theo sự kiện từ BE
   */
  async getByEvent(eventId: string): Promise<EnrichedBatch[]> {
    const res = await apiClient.get<any, any[]>(`/batches/event/${eventId}`);
    if (Array.isArray(res)) {
      return res.map(mapBeBatchToEnriched);
    }
    return [];
  },

  /**
   * Lấy danh sách các lô hàng READY sẵn sàng để gán chuyến xe
   */
  async getReadyBatchesForEvent(eventId: string): Promise<EnrichedBatch[]> {
    const all = await this.getByEvent(eventId);
    return all.filter((b) => b.status === "READY");
  },

  /**
   * Lấy danh sách hiện vật RECEIVED đủ điều kiện để đóng gói lô hàng
   */
  async getEligibleDonations(
    eventId: string,
    itemType?: string,
    unit?: string
  ): Promise<Donation[]> {
    const donations = await donationService.getByEvent(eventId);
    let list = donations.filter((d) => d.status === "RECEIVED");

    if (itemType) {
      list = list.filter(
        (d) =>
          d.itemType.toLowerCase() === itemType.toLowerCase() ||
          (d as any).itemTypeId === itemType
      );
    }
    if (unit) {
      list = list.filter(
        (d) =>
          d.unit.toLowerCase() === unit.toLowerCase() ||
          (d as any).unitId === unit
      );
    }

    return list;
  },

  /**
   * Gom các khoản quyên góp thành lô hàng mới qua BE (POST /api/batches)
   */
  async create(
    payload: {
      eventId: string;
      name?: string;
      batchCode?: string;
      itemType: string;
      unit: string;
      donationIds: string[];
      initialStatus?: BatchStatus;
    },
    actor: User
  ): Promise<EnrichedBatch> {
    if (!payload.donationIds || payload.donationIds.length === 0) {
      throw new Error("Cần chọn ít nhất một khoản quyên góp để tạo lô hàng.");
    }

    const res = await apiClient.post<any, any>("/batches", {
      eventId: payload.eventId,
      donationIds: payload.donationIds,
    });

    return mapBeBatchToEnriched(res);
  },

  /**
   * Đánh dấu lô hàng sẵn sàng vận chuyển qua BE (PATCH /api/batches/:id/status)
   */
  async markBatchReady(batchId: string, actor: User): Promise<EnrichedBatch> {
    const res = await apiClient.patch<any, any>(`/batches/${batchId}/status`, {
      status: "READY",
    });

    return mapBeBatchToEnriched(res);
  },

  /**
   * Đối soát kết quả phân phối lô hàng qua BE (POST /api/batches/:id/reconcile)
   */
  async reconcileBatch(
    batchId: string,
    payload: {
      returnedQuantity: number;
      lostQuantity: number;
      note?: string;
    },
    actor: User
  ): Promise<EnrichedBatch> {
    const note = payload.note?.trim() || "Đối soát hoàn tất";
    const res = await apiClient.post<any, any>(`/batches/${batchId}/reconcile`, {
      returnedQuantity: Number(payload.returnedQuantity || 0),
      lostQuantity: Number(payload.lostQuantity || 0),
      note,
    });

    return mapBeBatchToEnriched(res);
  },
};
