import { storageService } from "./storageService";
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
    await delay(280);
    const code = trackingIdInput.trim().toUpperCase();
    if (!code) return null;

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
