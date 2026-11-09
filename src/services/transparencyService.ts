import apiClient from "@/lib/api/axiosClient";
import type {
  BatchStatus,
  DistributionPointStatus,
  DonationStatus,
  Evidence,
  EvidenceStatus,
  PublicTrackingResult,
  TransparencyLog,
  TripStatus,
  User,
} from "@/types";

export interface EnrichedEvidence extends Evidence {
  trip?: any;
  distributionPoint?: any;
  batch?: any;
}

function mapBeEvidence(e: any): EnrichedEvidence {
  return {
    id: e.id,
    eventId: e.eventId || e.trip?.eventId || "",
    tripId: e.tripId,
    distributionPointId: e.distributionPointId,
    batchId: e.distributionRecord?.tripBatch?.batchId || e.batchId || "",
    imageUrl: e.imageUrl,
    caption: e.caption || "",
    privacyConfirmed: e.privacyConfirmed ?? true,
    status: (e.reviewStatus === "APPROVED" ? "APPROVED_PUBLIC" : e.reviewStatus === "REJECTED" ? "REJECTED_PUBLIC" : "PENDING_REVIEW") as EvidenceStatus,
    uploadedBy: e.uploadedById || e.uploadedBy || "",
    uploadedByName: e.uploadedBy?.fullName || e.uploadedByName || "Tình nguyện viên",
    uploadedAt: e.createdAt || e.uploadedAt || new Date().toISOString(),
    reviewedBy: e.reviewedById || e.reviewedBy,
    reviewedAt: e.reviewedAt,
  };
}

export const transparencyService = {
  /**
   * Lấy danh sách ảnh minh chứng (lọc theo tripId từ BE GET /api/evidence/trip/:tripId)
   */
  async getEvidences(filters?: {
    organizationId?: string;
    eventId?: string;
    tripId?: string;
    onlyPublicApproved?: boolean;
  }): Promise<EnrichedEvidence[]> {
    if (filters?.tripId) {
      const res = await apiClient.get<any, any[]>(`/evidence/trip/${filters.tripId}`);
      if (Array.isArray(res)) {
        return res.map(mapBeEvidence);
      }
    }
    return [];
  },

  /**
   * Tải lên hình ảnh minh chứng trao quà qua BE (POST /api/evidence)
   */
  async uploadEvidence(
    payload: {
      tripId: string;
      distributionPointId: string;
      distributionRecordId?: string;
      batchId?: string;
      imageUrl: string;
      caption: string;
      privacyConfirmed: boolean;
      mimeType?: string;
      sizeBytes?: number;
    },
    actor: User
  ): Promise<EnrichedEvidence> {
    if (!payload.privacyConfirmed) {
      throw new Error(
        "Bắt buộc xác nhận bảo mật quyền riêng tư: Cần làm mờ khuôn mặt người nhận trước khi tải lên công khai."
      );
    }
    if (!payload.caption?.trim()) {
      throw new Error("Vui lòng nhập chú thích cho ảnh minh chứng thực địa.");
    }

    const res = await apiClient.post<any, any>("/evidence", {
      tripId: payload.tripId,
      distributionPointId: payload.distributionPointId,
      distributionRecordId: payload.distributionRecordId,
      imageUrl: payload.imageUrl.trim(),
      caption: payload.caption.trim(),
      privacyConfirmed: true,
      mimeType: payload.mimeType || "image/jpeg",
      sizeBytes: payload.sizeBytes || 204800,
    });

    return mapBeEvidence(res);
  },

  /**
   * Ban tổ chức xét duyệt ảnh minh chứng qua BE (PATCH /api/evidence/:id/review)
   */
  async reviewEvidence(
    evidenceId: string,
    approvePublic: boolean,
    actor: User
  ): Promise<EnrichedEvidence> {
    const res = await apiClient.patch<any, any>(`/evidence/${evidenceId}/review`, {
      status: approvePublic ? "APPROVED" : "REJECTED",
    });

    return mapBeEvidence(res);
  },

  /**
   * Tra cứu công khai hành trình hiện vật theo trackingId qua BE (GET /api/transparency/track/:trackingId)
   */
  async trackByTrackingId(
    trackingIdInput: string
  ): Promise<PublicTrackingResult | null> {
    const code = trackingIdInput.trim().toUpperCase();
    if (!code) return null;

    try {
      const res = await apiClient.get<any, any>(`/transparency/track/${code}`);
      if (!res || !res.donation) {
        return null;
      }

      return {
        donation: {
          trackingId: res.donation.trackingId,
          itemType: res.donation.itemType?.name || res.donation.itemType || "Hàng cứu trợ",
          unit: res.donation.unit?.name || res.donation.unit || "phần",
          quantity: Number(res.donation.quantity ?? 0),
          status: res.donation.status as DonationStatus,
          createdAt: res.donation.createdAt,
          eventTitle: res.donation.event?.title || res.donation.eventTitle || "",
          organizationName: res.donation.event?.organization?.name || res.donation.organizationName || "",
          eventId: res.donation.eventId || "",
        },
        batch: res.batch
          ? {
              id: res.batch.id,
              batchCode: res.batch.batchCode,
              name: res.batch.name || `Lô ${res.batch.batchCode}`,
              itemType: res.batch.itemType?.name || res.batch.itemType || "Hàng cứu trợ",
              unit: res.batch.unit?.name || res.batch.unit || "phần",
              totalQuantity: Number(res.batch.totalQuantity ?? 0),
              distributedQuantity: Number(res.batch.distributedQuantity ?? 0),
              returnedQuantity: Number(res.batch.returnedQuantity ?? 0),
              remainingQuantity: Number(res.batch.remainingQuantity ?? 0),
              lostQuantity: Number(res.batch.lostQuantity ?? 0),
              status: res.batch.status as BatchStatus,
              createdAt: res.batch.createdAt,
            }
          : undefined,
        trip: res.trip
          ? {
              id: res.trip.id,
              tripCode: res.trip.tripCode,
              name: res.trip.vehicle ? `Chuyến ${res.trip.tripCode} - ${res.trip.vehicle}` : `Chuyến ${res.trip.tripCode}`,
              departurePoint: res.trip.departurePoint,
              scheduledDate: res.trip.departureDate || res.trip.scheduledDate,
              status: res.trip.status as TripStatus,
              startedAt: res.trip.startedAt,
              completedAt: res.trip.completedAt,
            }
          : undefined,
        distributionPoints: Array.isArray(res.distributionPoints)
          ? res.distributionPoints.map((p: any) => ({
              id: p.id,
              name: p.name,
              address: p.location || p.address || "",
              order: p.order ?? p.position ?? 1,
              status: p.status as DistributionPointStatus,
              arrivedAt: p.arrivedAt,
              distributedAt: p.distributedAt,
              records: Array.isArray(p.records)
                ? p.records.map((r: any) => ({
                    id: r.id,
                    batchCode: r.batchCode || "",
                    itemType: r.itemType || "",
                    unit: r.unit || "",
                    distributedQuantity: Number(r.distributedQuantity ?? 0),
                    recordedAt: r.createdAt || r.recordedAt || "",
                  }))
                : [],
            }))
          : [],
        publicEvidences: Array.isArray(res.publicEvidences)
          ? res.publicEvidences.map((e: any) => ({
              id: e.id,
              imageUrl: e.imageUrl,
              caption: e.caption,
              distributionPointName: e.distributionPointName || "",
              uploadedAt: e.createdAt || e.uploadedAt,
            }))
          : [],
        timeline: Array.isArray(res.timeline)
          ? res.timeline.map((t: any) => ({
              id: t.id,
              timestamp: t.createdAt || t.timestamp,
              action: t.action,
              title: t.title || t.action,
              description: t.description || t.details?.note || "",
              newStatus: t.newStatus || t.status,
            }))
          : [],
      };
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        return null;
      }
      throw err;
    }
  },

  async getLogs(filters?: {
    organizationId?: string;
    eventId?: string;
    batchId?: string;
    tripId?: string;
    donationId?: string;
  }): Promise<TransparencyLog[]> {
    try {
      const res = await apiClient.get<any, any>("/transparency/logs");
      const items = Array.isArray(res) ? res : res?.items || [];
      return items.map((l: any) => ({
        id: l.id,
        actorId: l.actorId,
        actorName: l.actor?.fullName || l.actorName || "Hệ thống",
        actorRole: l.actor?.systemRole || "USER",
        action: l.action,
        description: l.details ? JSON.stringify(l.details) : l.description || "",
        newStatus: l.newStatus,
        entityType: l.entityType,
        entityId: l.entityId,
        eventId: l.eventId,
        timestamp: l.createdAt || l.timestamp,
      }));
    } catch {
      return [];
    }
  },
};
