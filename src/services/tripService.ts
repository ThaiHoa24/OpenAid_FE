import apiClient from "@/lib/api/axiosClient";
import { eventService } from "./eventService";
import type {
  DistributionPoint,
  DistributionPointStatus,
  DistributionRecord,
  DistributionTrip,
  DonationBatch,
  Event,
  Evidence,
  Organization,
  TripStatus,
  TripVolunteer,
  User,
} from "@/types";

export interface EnrichedTripVolunteer extends TripVolunteer {
  user?: User;
  roleName?: string;
}

export interface EnrichedDistributionPoint extends DistributionPoint {
  records: DistributionRecord[];
  evidences: Evidence[];
}

export interface EnrichedTrip extends DistributionTrip {
  event?: Event;
  organization?: Organization;
  destination?: string;
  volunteerIds?: string[];
  distributionPoints?: EnrichedDistributionPoint[];
  batches: DonationBatch[];
  enrichedVolunteers: EnrichedTripVolunteer[];
  leader?: User;
  points: EnrichedDistributionPoint[];
  records: DistributionRecord[];
  evidences: Evidence[];
}

function mapBeTripToEnriched(t: any): EnrichedTrip {
  const batches = Array.isArray(t.batches)
    ? t.batches.map((tb: any) => {
        const b = tb.batch || tb;
        const total =
          typeof b.totalQuantity === "object"
            ? b.totalQuantity?.toNumber?.() ?? Number(b.totalQuantity)
            : Number(b.totalQuantity ?? 0);
        const dist =
          typeof b.distributedQuantity === "object"
            ? b.distributedQuantity?.toNumber?.() ?? Number(b.distributedQuantity)
            : Number(b.distributedQuantity ?? 0);
        const ret =
          typeof b.returnedQuantity === "object"
            ? b.returnedQuantity?.toNumber?.() ?? Number(b.returnedQuantity)
            : Number(b.returnedQuantity ?? 0);
        const lost =
          typeof b.lostQuantity === "object"
            ? b.lostQuantity?.toNumber?.() ?? Number(b.lostQuantity)
            : Number(b.lostQuantity ?? 0);

        return {
          id: b.id || tb.batchId,
          tripBatchId: tb.id,
          batchCode: b.batchCode || "",
          name: b.name || `Lô ${b.batchCode || ""}`,
          eventId: b.eventId || t.eventId,
          organizationId:
            b.organizationId || t.organizationId || t.event?.organizationId || "",
          itemType:
            b.itemType?.name ||
            (typeof b.itemType === "string" ? b.itemType : "") ||
            "Hàng cứu trợ",
          unit:
            b.unit?.name || (typeof b.unit === "string" ? b.unit : "") || "Phần",
          totalQuantity: total,
          distributedQuantity: dist,
          returnedQuantity: ret,
          remainingQuantity: Math.max(0, total - dist - ret - lost),
          lostQuantity: lost,
          status: b.status || "READY",
          donationIds: Array.isArray(b.donations)
            ? b.donations.map((d: any) => d.id)
            : [],
          createdAt: b.createdAt || t.createdAt,
          updatedAt: b.updatedAt || t.updatedAt,
        };
      })
    : [];

  const batchIds = batches.map((b: any) => b.id);

  let leaderId = t.leaderId || "";
  let leaderUser: any = undefined;

  const enrichedVolunteers: EnrichedTripVolunteer[] = Array.isArray(t.volunteers)
    ? t.volunteers.map((tv: any) => {
        const u = tv.application?.user || tv.user;
        const roleName =
          tv.application?.volunteerRole?.name || tv.roleName || "";
        const userId = u?.id || tv.userId || "";
        if (tv.role === "LEADER") {
          leaderId = userId;
          leaderUser = u
            ? {
                ...u,
                name: u.fullName || u.name,
                phone: u.phoneNumber || u.phone,
              }
            : undefined;
        }
        return {
          id: tv.id,
          tripId: tv.tripId || t.id,
          userId,
          applicationId: tv.applicationId || "",
          role: tv.role,
          user: u
            ? {
                id: u.id,
                name: u.fullName || u.name,
                phone: u.phoneNumber || u.phone,
                email: u.email || "",
                systemRole: "USER",
                isActive: true,
                status: "ACTIVE",
                createdAt: u.createdAt || new Date().toISOString(),
              }
            : undefined,
          roleName,
        };
      })
    : [];

  const points: EnrichedDistributionPoint[] = Array.isArray(t.points)
    ? t.points.map((p: any) => {
        const pRecords: DistributionRecord[] = Array.isArray(p.records)
          ? p.records.map((r: any) => ({
              id: r.id,
              tripId: t.id,
              distributionPointId: p.id,
              batchId: r.tripBatch?.batchId || r.batchId || "",
              distributedQuantity: Number(r.distributedQuantity ?? 0),
              beneficiaryCount: Number(r.beneficiaryCount ?? 0),
              distributedAt: r.createdAt || r.distributedAt,
              confirmedBy: r.confirmedById || r.confirmedBy || "",
              note: r.notes || r.note,
            }))
          : [];

        const pEvidences: Evidence[] = Array.isArray(p.records)
          ? p.records.flatMap((r: any) => (Array.isArray(r.evidence) ? r.evidence : []))
          : [];

        return {
          id: p.id,
          tripId: t.id,
          name: p.name,
          address: p.location || p.address || "",
          contactPerson: p.contactPerson || "Trưởng thôn / Đại diện chính quyền",
          contactPhone: p.contactPhone || "",
          plannedHouseholds: Number(p.plannedHouseholds ?? 0),
          status: p.status as DistributionPointStatus,
          arrivedAt: p.arrivedAt,
          distributedAt: p.distributedAt,
          skippedReason: p.skippedReason,
          records: pRecords,
          evidences: pEvidences,
        };
      })
    : [];

  const allRecords: DistributionRecord[] = points.flatMap((p) => p.records);
  const allEvidences: Evidence[] = points.flatMap((p) => p.evidences);

  return {
    id: t.id,
    tripCode: t.tripCode,
    name: t.vehicle ? `Chuyến ${t.tripCode} - ${t.vehicle}` : `Chuyến cứu trợ ${t.tripCode}`,
    eventId: t.eventId,
    organizationId: t.organizationId || t.event?.organizationId || "",
    leaderId,
    leader: leaderUser,
    departurePoint: t.departurePoint,
    destination: t.destination || points[0]?.address || "Địa bàn cứu trợ",
    scheduledDate: t.departureDate || t.scheduledDate || new Date().toISOString(),
    status: t.status as TripStatus,
    batchIds,
    batches,
    volunteerIds: enrichedVolunteers.map((v) => v.userId),
    volunteers: enrichedVolunteers,
    enrichedVolunteers,
    distributionPoints: points,
    points,
    records: allRecords,
    evidences: allEvidences,
    notes: t.notes,
    cancelReason: t.cancelReason,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    event: t.event,
  };
}

export const tripService = {
  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedTrip[]> {
    if (eventId && eventId !== "ALL") {
      const res = await apiClient.get<any, any>(`/trips/event/${eventId}`);
      const items = Array.isArray(res) ? res : res?.items || [];
      return items.map(mapBeTripToEnriched);
    }
    if (organizationId) {
      const events = await eventService.getAll({ organizationId, includeDrafts: true });
      if (events.length === 0) return [];
      const results = await Promise.all(
        events.map((e) =>
          apiClient
            .get<any, any>(`/trips/event/${e.id}`)
            .then((res) => (Array.isArray(res) ? res : res?.items || []))
            .catch(() => [])
        )
      );
      return results.flat().map(mapBeTripToEnriched);
    }
    return [];
  },

  async getById(tripId: string): Promise<EnrichedTrip | null> {
    try {
      const res = await apiClient.get<any, any>(`/trips/${tripId}`);
      if (res && res.id) {
        return mapBeTripToEnriched(res);
      }
      return null;
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Lập chuyến xe cứu trợ qua BE (POST /api/trips)
   */
  async create(
    payload: {
      eventId: string;
      name: string;
      tripCode?: string;
      departurePoint: string;
      scheduledDate: string;
      batchIds: string[];
      volunteerApplicationIds: string[];
      leaderUserId: string;
      distributionPoints: {
        name: string;
        address: string;
        contactPerson?: string;
        plannedHouseholds?: number;
      }[];
      notes?: string;
    },
    actor: User
  ): Promise<EnrichedTrip> {
    const volunteers = payload.volunteerApplicationIds.map((appId) => {
      const isLeader = appId === payload.leaderUserId;
      return {
        applicationId: appId,
        role: isLeader ? "LEADER" : "MEMBER",
      };
    });

    const points = payload.distributionPoints.map((p, idx) => ({
      position: idx + 1,
      name: p.name.trim(),
      location: p.address.trim(),
    }));

    const res = await apiClient.post<any, any>("/trips", {
      eventId: payload.eventId,
      departurePoint: payload.departurePoint.trim(),
      departureDate: new Date(payload.scheduledDate).toISOString(),
      vehicle: payload.name.trim() || "Xe cứu trợ",
      batchIds: payload.batchIds,
      volunteers,
      points,
    });

    return mapBeTripToEnriched(res);
  },

  /**
   * Thay đổi trạng thái chuyến xe (PLANNED -> IN_PROGRESS -> COMPLETED) qua BE (PATCH /api/trips/:id/status)
   */
  async updateTripStatus(
    tripId: string,
    nextStatus: TripStatus,
    actor: User,
    options?: {
      cancelReason?: string;
    }
  ): Promise<EnrichedTrip> {
    const res = await apiClient.patch<any, any>(`/trips/${tripId}/status`, {
      status: nextStatus,
    });

    return mapBeTripToEnriched(res);
  },

  /**
   * Cập nhật trạng thái điểm phân phối qua BE (PATCH /api/distribution/points/:id/status)
   */
  async updatePointStatus(
    pointId: string,
    nextStatus: DistributionPointStatus,
    actor: User,
    note?: string
  ): Promise<EnrichedTrip> {
    const res = await apiClient.patch<any, any>(
      `/distribution/points/${pointId}/status`,
      {
        status: nextStatus,
        notes: note?.trim(),
      }
    );

    return mapBeTripToEnriched(res);
  },

  /**
   * Ghi nhận kết quả phân phối quà tại điểm cứu trợ qua BE (POST /api/distribution/records)
   */
  async recordDistribution(
    payload: {
      tripId: string;
      distributionPointId: string;
      batchId: string;
      distributedQuantity: number;
      beneficiaryCount?: number;
      note?: string;
      markPointDistributed?: boolean;
    },
    actor: User
  ): Promise<EnrichedTrip> {
    // 1. Lấy dữ liệu chuyến đi gốc từ BE (GET /trips/:id) để tìm đúng TripBatch.id
    const rawTrip = await apiClient.get<any, any>(`/trips/${payload.tripId}`);
    if (!rawTrip) {
      throw new Error("Không tìm thấy thông tin chuyến cứu trợ.");
    }

    const matchedTripBatch = Array.isArray(rawTrip.batches)
      ? rawTrip.batches.find(
          (tb: any) =>
            tb.batchId === payload.batchId ||
            tb.batch?.id === payload.batchId ||
            tb.id === payload.batchId
        )
      : null;

    if (!matchedTripBatch?.id) {
      throw new Error("Không tìm thấy lô hàng được phân công trong chuyến đi này.");
    }

    const tripBatchId = matchedTripBatch.id;

    // 2. Post record to BE
    await apiClient.post<any, any>("/distribution/records", {
      tripBatchId,
      distributionPointId: payload.distributionPointId,
      distributedQuantity: Number(payload.distributedQuantity),
      beneficiaryCount: Number(payload.beneficiaryCount || 0),
      notes: payload.note?.trim(),
    });

    // 3. Return fresh trip details
    const updatedTrip = await this.getById(payload.tripId);
    if (!updatedTrip) {
      throw new Error("Không thể tải lại dữ liệu chuyến đi sau khi phân phối.");
    }
    return updatedTrip;
  },
};
