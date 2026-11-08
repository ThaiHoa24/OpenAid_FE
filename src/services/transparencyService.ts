import { storageService } from "./storageService";
import apiClient from "@/lib/api/axiosClient";
import type {
  DistributionPoint,
  DistributionTrip,
  DonationBatch,
  Event,
  Evidence,
  PublicTrackingResult,
  TransparencyLog,
  User,
} from "@/types";
import { delay, generateId } from "@/utils";

export interface EnrichedEvidence extends Evidence {
  event?: Event;
  trip?: DistributionTrip;
  distributionPoint?: DistributionPoint;
  batch?: DonationBatch;
}

function enrichEvidence(ev: Evidence): EnrichedEvidence {
  const db = storageService.getDb();
  const event = db.events.find((e) => e.id === ev.eventId);
  const trip = db.trips.find((t) => t.id === ev.tripId);
  const distributionPoint = db.distributionPoints.find(
    (p) => p.id === ev.distributionPointId
  );
  const batch = ev.batchId
    ? db.batches.find((b) => b.id === ev.batchId)
    : undefined;

  return {
    ...ev,
    event,
    trip,
    distributionPoint,
    batch,
  };
}

export const transparencyService = {
  async getLogs(filters?: {
    organizationId?: string;
    eventId?: string;
    batchId?: string;
    tripId?: string;
    donationId?: string;
    entityType?: string;
  }): Promise<TransparencyLog[]> {
    await delay(180);
    const db = storageService.getDb();
    let logs = db.transparencyLogs.slice();

    if (filters?.organizationId && filters.organizationId !== "ALL") {
      const orgEventIds = db.events
        .filter((e) => e.organizationId === filters.organizationId)
        .map((e) => e.id);
      logs = logs.filter(
        (l) =>
          (l.eventId && orgEventIds.includes(l.eventId)) ||
          (l.entityType === "ORGANIZATION" &&
            l.entityId === filters.organizationId)
      );
    }

    if (filters?.eventId && filters.eventId !== "ALL") {
      logs = logs.filter((l) => l.eventId === filters.eventId);
    }
    if (filters?.batchId) {
      logs = logs.filter((l) => l.batchId === filters.batchId);
    }
    if (filters?.tripId) {
      logs = logs.filter((l) => l.tripId === filters.tripId);
    }
    if (filters?.donationId) {
      logs = logs.filter((l) => l.donationId === filters.donationId);
    }
    if (filters?.entityType && filters.entityType !== "ALL") {
      logs = logs.filter((l) => l.entityType === filters.entityType);
    }

    return logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  async getEvidences(filters?: {
    organizationId?: string;
    eventId?: string;
    tripId?: string;
    onlyPublicApproved?: boolean;
  }): Promise<EnrichedEvidence[]> {
    await delay(180);
    const db = storageService.getDb();
    let list = db.evidences.slice();

    if (filters?.organizationId && filters.organizationId !== "ALL") {
      const orgEventIds = db.events
        .filter((e) => e.organizationId === filters.organizationId)
        .map((e) => e.id);
      list = list.filter((e) => orgEventIds.includes(e.eventId));
    }

    if (filters?.eventId && filters.eventId !== "ALL") {
      list = list.filter((e) => e.eventId === filters.eventId);
    }
    if (filters?.tripId) {
      list = list.filter((e) => e.tripId === filters.tripId);
    }
    if (filters?.onlyPublicApproved) {
      list = list.filter((e) => e.status === "APPROVED_PUBLIC");
    }

    return list
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
      .map(enrichEvidence);
  },

  async uploadEvidence(
    payload: {
      tripId: string;
      distributionPointId: string;
      batchId?: string;
      imageUrl: string;
      caption: string;
      privacyConfirmed: boolean;
    },
    actor: User
  ): Promise<EnrichedEvidence> {
    await delay(260);
    if (!payload.privacyConfirmed) {
      throw new Error(
        "Privacy confirmation required: You must confirm that identifiable beneficiaries are blurred/cropped, or consent has been obtained before uploading."
      );
    }
    if (!payload.caption.trim()) {
      throw new Error("Please enter a caption describing the evidence photo.");
    }

    const db = storageService.getDb();
    const trip = db.trips.find((t) => t.id === payload.tripId);
    if (!trip) throw new Error("Distribution Trip not found.");

    const point = db.distributionPoints.find(
      (p) => p.id === payload.distributionPointId && p.tripId === trip.id
    );
    if (!point) throw new Error("Distribution Point not found on this Trip.");

    // Check authorization: Organizer, Admin, or assigned Trip Volunteer (Leader/Member)
    const isAssignedVolunteer = trip.volunteers.some(
      (v) => v.userId === actor.id
    );
    const isOrganizer = db.organizationMembers.some(
      (m) =>
        m.organizationId === trip.organizationId &&
        m.userId === actor.id &&
        m.role === "ORGANIZER"
    );
    if (!isAssignedVolunteer && !isOrganizer && actor.systemRole !== "ADMIN") {
      throw new Error(
        "Only Volunteers assigned to this Trip or the Event Organizer can upload distribution evidence."
      );
    }

    const now = new Date().toISOString();
    const newEvidence: Evidence = {
      id: generateId("evd"),
      eventId: trip.eventId,
      tripId: trip.id,
      distributionPointId: point.id,
      batchId: payload.batchId || trip.batchIds[0],
      imageUrl:
        payload.imageUrl.trim() ||
        "https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&auto=format&fit=crop&q=80",
      caption: payload.caption.trim(),
      privacyConfirmed: true,
      status: "PENDING_REVIEW",
      uploadedBy: actor.id,
      uploadedByName: actor.name,
      uploadedAt: now,
    };

    db.evidences.unshift(newEvidence);

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: isOrganizer
        ? "ORGANIZER"
        : trip.leaderId === actor.id
        ? "TRIP_LEADER"
        : "VOLUNTEER",
      action: "EVIDENCE_UPLOADED",
      description: `Uploaded evidence photo at '${point.name}' (${trip.tripCode}): "${newEvidence.caption}". Status: PENDING_REVIEW.`,
      oldStatus: "NONE",
      newStatus: "PENDING_REVIEW",
      entityType: "EVIDENCE",
      entityId: newEvidence.id,
      eventId: trip.eventId,
      tripId: trip.id,
      batchId: newEvidence.batchId,
      distributionPointId: point.id,
      evidenceId: newEvidence.id,
    });

    storageService.saveDb(db);
    return enrichEvidence(newEvidence);
  },

  async reviewEvidence(
    evidenceId: string,
    approvePublic: boolean,
    actor: User
  ): Promise<EnrichedEvidence> {
    try {
      const res = await apiClient.patch<any, any>(`/evidence/${evidenceId}/review`, {
        status: approvePublic ? "APPROVED" : "REJECTED",
      });
      if (res && res.id) {
        return {
          ...res,
          status: approvePublic ? "APPROVED_PUBLIC" : "REJECTED_PUBLIC",
        };
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // Fallback
    }

    await delay(230);
    const db = storageService.getDb();
    const idx = db.evidences.findIndex((e) => e.id === evidenceId);
    if (idx === -1) throw new Error("Evidence not found.");

    const ev = db.evidences[idx];
    const oldStatus = ev.status;
    const nextStatus = approvePublic ? "APPROVED_PUBLIC" : "REJECTED_PUBLIC";
    const now = new Date().toISOString();

    db.evidences[idx].status = nextStatus;
    db.evidences[idx].reviewedBy = actor.id;
    db.evidences[idx].reviewedAt = now;

    const point = db.distributionPoints.find(
      (p) => p.id === ev.distributionPointId
    );

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: approvePublic ? "EVIDENCE_APPROVED" : "EVIDENCE_REJECTED",
      description: `${
        approvePublic ? "Approved" : "Rejected"
      } evidence photo at '${point?.name || "Distribution Point"}' for public display.`,
      oldStatus,
      newStatus: nextStatus,
      entityType: "EVIDENCE",
      entityId: ev.id,
      eventId: ev.eventId,
      tripId: ev.tripId,
      batchId: ev.batchId,
      distributionPointId: ev.distributionPointId,
      evidenceId: ev.id,
    });

    storageService.saveDb(db);
    return enrichEvidence(db.evidences[idx]);
  },

  async trackByTrackingId(
    trackingIdInput: string
  ): Promise<PublicTrackingResult | null> {
    const code = trackingIdInput.trim().toUpperCase();
    if (!code) return null;

    try {
      const res = await apiClient.get<any, any>(`/transparency/track/${code}`);
      if (res && res.donation) {
        return {
          donation: {
            trackingId: res.donation.trackingId,
            itemType: res.donation.itemType,
            unit: res.donation.unit,
            quantity: Number(res.donation.quantity),
            status: res.donation.status,
            createdAt: res.donation.createdAt,
            eventTitle: res.donation.eventTitle,
            organizationName: res.donation.organizationName,
            eventId: res.donation.eventId,
          },
          batch: res.batch
            ? {
                id: res.batch.id,
                batchCode: res.batch.batchCode,
                name: res.batch.name || `Lô ${res.batch.batchCode}`,
                itemType: res.batch.itemType,
                unit: res.batch.unit,
                totalQuantity: Number(res.batch.totalQuantity ?? 0),
                distributedQuantity: Number(res.batch.distributedQuantity ?? 0),
                returnedQuantity: Number(res.batch.returnedQuantity ?? 0),
                remainingQuantity: Number(res.batch.remainingQuantity ?? 0),
                lostQuantity: Number(res.batch.lostQuantity ?? 0),
                status: res.batch.status,
                createdAt: res.batch.createdAt,
              }
            : undefined,
          trip: res.trip
            ? {
                id: res.trip.id,
                tripCode: res.trip.tripCode,
                name: res.trip.name || `Chuyến ${res.trip.tripCode}`,
                departurePoint: res.trip.departurePoint,
                scheduledDate: res.trip.departureDate || res.trip.scheduledDate,
                status: res.trip.status,
                startedAt: res.trip.startedAt,
                completedAt: res.trip.completedAt,
              }
            : undefined,
          distributionPoints: Array.isArray(res.distributionPoints)
            ? res.distributionPoints.map((p: any) => ({
                id: p.id,
                name: p.name,
                address: p.address || p.location || "",
                order: p.order ?? p.position ?? 1,
                status: p.status,
                arrivedAt: p.arrivedAt,
                distributedAt: p.distributedAt,
                records: Array.isArray(p.records)
                  ? p.records.map((r: any) => ({
                      id: r.id,
                      batchCode: r.batchCode || "",
                      itemType: r.itemType || "",
                      unit: r.unit || "",
                      distributedQuantity: Number(r.distributedQuantity ?? 0),
                      recordedAt: r.recordedAt || r.confirmedAt || "",
                    }))
                  : [],
              }))
            : [],
          publicEvidences: Array.isArray(res.publicEvidences)
            ? res.publicEvidences.map((e: any) => ({
                id: e.id,
                imageUrl: e.imageUrl,
                caption: e.caption,
                distributionPointName: e.distributionPointName,
                uploadedAt: e.uploadedAt,
              }))
            : [],
          timeline: Array.isArray(res.timeline)
            ? res.timeline.map((t: any) => ({
                id: t.id,
                timestamp: t.createdAt || t.timestamp,
                action: t.action,
                description:
                  t.details?.description ||
                  t.details?.notes ||
                  t.description ||
                  t.action,
                actorRole: t.actor?.systemRole || t.actorRole || "SYSTEM",
                entityType: t.entityType,
                entityId: t.entityId,
                oldStatus: t.oldStatus,
                newStatus: t.newStatus,
              }))
            : [],
        };
      }
    } catch {
      // Fallback
    }

    await delay(280);
    const db = storageService.getDb();
    const donation = db.donations.find(
      (d) => d.trackingId.toUpperCase() === code
    );
    if (!donation) return null;

    const event = db.events.find((e) => e.id === donation.eventId);
    const organization = event
      ? db.organizations.find((o) => o.id === event.organizationId)
      : undefined;

    const batch = donation.batchId
      ? db.batches.find((b) => b.id === donation.batchId)
      : undefined;

    const trip = batch?.currentTripId
      ? db.trips.find((t) => t.id === batch.currentTripId)
      : batch
      ? db.trips.find((t) => t.batchIds.includes(batch.id))
      : undefined;

    const points = trip
      ? db.distributionPoints
          .filter((p) => p.tripId === trip.id)
          .sort((a, b) => a.order - b.order)
          .map((p) => {
            const recs = db.distributionRecords
              .filter(
                (r) =>
                  r.distributionPointId === p.id &&
                  (!batch || r.batchId === batch.id)
              )
              .map((r) => ({
                id: r.id,
                batchCode: r.batchCode,
                itemType: r.itemType,
                unit: r.unit,
                distributedQuantity: r.distributedQuantity,
                recordedAt: r.recordedAt,
              }));
            return {
              id: p.id,
              name: p.name,
              address: p.address,
              order: p.order,
              status: p.status,
              arrivedAt: p.arrivedAt,
              distributedAt: p.distributedAt,
              records: recs,
            };
          })
      : [];

    // Privacy Rule (NFR03 & Section 25/29): ONLY APPROVED_PUBLIC evidence is returned
    const publicEvidences = trip
      ? db.evidences
          .filter(
            (ev) =>
              ev.tripId === trip.id &&
              ev.status === "APPROVED_PUBLIC" &&
              (!batch || !ev.batchId || ev.batchId === batch.id)
          )
          .map((ev) => {
            const pt = db.distributionPoints.find(
              (p) => p.id === ev.distributionPointId
            );
            return {
              id: ev.id,
              imageUrl: ev.imageUrl,
              caption: ev.caption,
              distributionPointName: pt?.name || "Distribution Point",
              uploadedAt: ev.uploadedAt,
            };
          })
      : [];

    // Build chronological timeline from TransparencyLog for this Donation, its Batch, or its Trip
    // Anonymize personal donor/volunteer names in public view per NFR03
    const timelineLogs = db.transparencyLogs
      .filter(
        (l) =>
          l.donationId === donation.id ||
          (batch && l.batchId === batch.id) ||
          (trip && l.tripId === trip.id && !l.donationId)
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((l) => ({
        ...l,
        actorName:
          l.actorRole === "ORGANIZER"
            ? `${organization?.name || "Organization"} Coordinator`
            : l.actorRole === "TRIP_LEADER"
            ? "Verified Trip Leader"
            : l.actorRole === "DONOR"
            ? "Verified Donor (Anonymized)"
            : "Verified Volunteer",
      }));

    return {
      donation: {
        trackingId: donation.trackingId,
        itemType: donation.itemType,
        unit: donation.unit,
        quantity: donation.quantity,
        status: donation.status,
        createdAt: donation.createdAt,
        eventTitle: event?.title || "Charity Event",
        organizationName: organization?.name || "Verified Organization",
        eventId: donation.eventId,
      },
      batch: batch
        ? {
            id: batch.id,
            batchCode: batch.batchCode,
            name: batch.name,
            itemType: batch.itemType,
            unit: batch.unit,
            totalQuantity: batch.totalQuantity,
            distributedQuantity: batch.distributedQuantity,
            returnedQuantity: batch.returnedQuantity,
            remainingQuantity: batch.remainingQuantity,
            lostQuantity: batch.lostQuantity,
            status: batch.status,
            createdAt: batch.createdAt,
          }
        : undefined,
      trip: trip
        ? {
            id: trip.id,
            tripCode: trip.tripCode,
            name: trip.name,
            departurePoint: trip.departurePoint,
            scheduledDate: trip.scheduledDate,
            status: trip.status,
            startedAt: trip.startedAt,
            completedAt: trip.completedAt,
          }
        : undefined,
      distributionPoints: points,
      publicEvidences,
      timeline: timelineLogs,
    };
  },
};
