import { storageService } from "./storageService";
import { batchService } from "./batchService";
import apiClient from "@/lib/api/axiosClient";
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
import { delay, generateId } from "@/utils";

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
        return {
          id: b.id || tb.batchId,
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
          totalQuantity: Number(b.totalQuantity ?? 0),
          distributedQuantity: Number(b.distributedQuantity ?? 0),
          returnedQuantity: Number(b.returnedQuantity ?? 0),
          remainingQuantity: Number(b.remainingQuantity ?? 0),
          lostQuantity: Number(b.lostQuantity ?? 0),
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
                ...u,
                name: u.fullName || u.name,
                phone: u.phoneNumber || u.phone,
              }
            : undefined,
          roleName,
        };
      })
    : [];

  const allRecords: DistributionRecord[] = [];
  const points: EnrichedDistributionPoint[] = Array.isArray(t.points)
    ? t.points.map((p: any) => {
        const ptRecords: DistributionRecord[] = Array.isArray(p.records)
          ? p.records.map((r: any) => {
              const rec: DistributionRecord = {
                id: r.id,
                tripId: r.tripId || t.id,
                distributionPointId: p.id,
                batchId: r.tripBatch?.batchId || r.batchId || "",
                batchCode:
                  r.tripBatch?.batch?.batchCode || r.batchCode || "",
                itemType:
                  r.tripBatch?.batch?.itemType?.name || r.itemType || "",
                unit: r.tripBatch?.batch?.unit?.name || r.unit || "",
                distributedQuantity: Number(r.distributedQuantity ?? 0),
                note: r.notes || r.note,
                recordedBy: r.recordedById || r.recordedBy || "",
                recordedAt: r.distributedAt || r.recordedAt || r.createdAt,
              };
              allRecords.push(rec);
              return rec;
            })
          : [];

        const ptEvidences: Evidence[] = Array.isArray(p.evidence)
          ? p.evidence.map((e: any) => ({
              id: e.id,
              eventId: t.eventId,
              tripId: t.id,
              distributionPointId: p.id,
              imageUrl: e.imageUrl || e.url || "",
              caption: e.caption || "",
              status:
                e.reviewStatus === "APPROVED"
                  ? "APPROVED_PUBLIC"
                  : e.status || "PENDING_REVIEW",
              uploadedBy: e.uploadedById || e.uploadedBy || "",
              uploadedAt: e.createdAt || e.uploadedAt,
            }))
          : [];

        return {
          id: p.id,
          tripId: t.id,
          order: p.position ?? p.order ?? 1,
          name: p.name,
          address: p.location || p.address || "",
          contactPerson: p.contactPerson,
          plannedHouseholds: p.plannedHouseholds,
          status: p.status,
          arrivedAt: p.arrivedAt,
          distributedAt: p.distributedAt,
          note: p.skippedReason || p.note,
          records: ptRecords,
          evidences: ptEvidences,
        };
      })
    : [];

  const rawEvidences = Array.isArray(t.evidence) ? t.evidence : [];
  const evidences: Evidence[] = rawEvidences.map((e: any) => ({
    id: e.id,
    eventId: t.eventId,
    tripId: t.id,
    distributionPointId: e.distributionPointId,
    batchId: e.batchId,
    imageUrl: e.imageUrl || e.url || "",
    caption: e.caption || "",
    status:
      e.reviewStatus === "APPROVED"
        ? "APPROVED_PUBLIC"
        : e.status || "PENDING_REVIEW",
    uploadedBy: e.uploadedById || e.uploadedBy || "",
    uploadedAt: e.createdAt || e.uploadedAt,
  }));

  return {
    id: t.id,
    tripCode: t.tripCode,
    name: t.name || `Chuyến đi ${t.tripCode}`,
    eventId: t.eventId,
    organizationId:
      t.organizationId || t.event?.organizationId || "",
    departurePoint: t.departurePoint,
    departureDate: t.departureDate,
    scheduledDate: t.departureDate
      ? new Date(t.departureDate).toISOString()
      : t.scheduledDate || "",
    vehicle: t.vehicle,
    status: t.status,
    notes: t.notes,
    cancelReason: t.cancelReason,
    completedAt: t.completedAt,
    cancelledAt: t.cancelledAt,
    batchIds,
    batches,
    leaderId,
    leader: leaderUser,
    volunteers: enrichedVolunteers.map((ev) => ({
      id: ev.id,
      tripId: ev.tripId,
      userId: ev.userId,
      applicationId: ev.applicationId,
      role: ev.role,
    })),
    enrichedVolunteers,
    points,
    records: allRecords,
    evidences,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    event: t.event,
  };
}

function canModifyTrip(
  trip: DistributionTrip,
  actor: User
): { allowed: boolean; actorRoleLabel: string } {
  if (actor.systemRole === "ADMIN") {
    return { allowed: true, actorRoleLabel: "ADMIN" };
  }
  const db = storageService.getDb();
  const isOrgOrganizer = db.organizationMembers.some(
    (m) =>
      m.organizationId === trip.organizationId &&
      m.userId === actor.id &&
      m.role === "ORGANIZER"
  );
  if (isOrgOrganizer) {
    return { allowed: true, actorRoleLabel: "ORGANIZER" };
  }
  if (trip.leaderId === actor.id) {
    return { allowed: true, actorRoleLabel: "TRIP_LEADER" };
  }
  return { allowed: false, actorRoleLabel: "MEMBER" };
}

function enrichTrip(trip: DistributionTrip): EnrichedTrip {
  const db = storageService.getDb();
  const event = db.events.find((e) => e.id === trip.eventId);
  const organization = db.organizations.find((o) => o.id === trip.organizationId);
  const batches = db.batches.filter((b) => trip.batchIds.includes(b.id));
  const leader = db.users.find((u) => u.id === trip.leaderId);

  const enrichedVolunteers: EnrichedTripVolunteer[] = trip.volunteers.map(
    (tv) => {
      const user = db.users.find((u) => u.id === tv.userId);
      const app = db.volunteerApplications.find((a) => a.id === tv.applicationId);
      const roleObj = app
        ? db.volunteerRoles.find((r) => r.id === app.volunteerRoleId)
        : undefined;
      return {
        ...tv,
        user,
        roleName: roleObj?.name,
      };
    }
  );

  const records = db.distributionRecords.filter((r) => r.tripId === trip.id);
  const evidences = db.evidences.filter((e) => e.tripId === trip.id);

  const points: EnrichedDistributionPoint[] = db.distributionPoints
    .filter((p) => p.tripId === trip.id)
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      ...p,
      records: records.filter((r) => r.distributionPointId === p.id),
      evidences: evidences.filter((e) => e.distributionPointId === p.id),
    }));

  return {
    ...trip,
    event,
    organization,
    batches,
    enrichedVolunteers,
    leader,
    points,
    records,
    evidences,
  };
}

export const tripService = {
  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedTrip[]> {
    if (eventId && eventId !== "ALL") {
      try {
        const res = await apiClient.get<any, any>(`/trips/event/${eventId}`);
        const items = Array.isArray(res) ? res : res?.items;
        if (Array.isArray(items)) {
          return items.map(mapBeTripToEnriched);
        }
      } catch {
        // Fallback
      }
    }

    await delay(220);
    const db = storageService.getDb();
    let list = db.trips;

    if (organizationId && organizationId !== "ALL") {
      list = list.filter((t) => t.organizationId === organizationId);
    }
    if (eventId && eventId !== "ALL") {
      list = list.filter((t) => t.eventId === eventId);
    }

    return list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichTrip);
  },

  async getByVolunteer(userId: string): Promise<EnrichedTrip[]> {
    await delay(180);
    const db = storageService.getDb();
    return db.trips
      .filter((t) => t.volunteers.some((v) => v.userId === userId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichTrip);
  },

  async getById(tripId: string): Promise<EnrichedTrip | null> {
    try {
      const res = await apiClient.get<any, any>(`/trips/${tripId}`);
      if (res && res.id) {
        return mapBeTripToEnriched(res);
      }
    } catch {
      // Fallback
    }

    await delay(160);
    const db = storageService.getDb();
    const trip = db.trips.find((t) => t.id === tripId);
    return trip ? enrichTrip(trip) : null;
  },

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
    try {
      const db = storageService.getDb();
      const volunteers = payload.volunteerApplicationIds.map((appId) => {
        const app = db.volunteerApplications.find((a) => a.id === appId);
        const isLeader =
          (app && app.userId === payload.leaderUserId) ||
          appId === payload.leaderUserId;
        return {
          applicationId: appId,
          role: isLeader ? "LEADER" : "MEMBER",
        };
      });

      const points = payload.distributionPoints.map((p, idx) => ({
        position: idx + 1,
        name: p.name,
        location: p.address,
      }));

      const res = await apiClient.post<any, any>("/trips", {
        eventId: payload.eventId,
        departurePoint: payload.departurePoint,
        departureDate: new Date(payload.scheduledDate).toISOString(),
        vehicle: payload.name || "Xe cứu trợ",
        batchIds: payload.batchIds,
        volunteers,
        points,
      });

      if (res && res.id) {
        return mapBeTripToEnriched(res);
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // Fallback
    }

    await delay(300);
    const db = storageService.getDb();
    const event = db.events.find((e) => e.id === payload.eventId);
    if (!event) throw new Error("Event not found.");

    if (payload.batchIds.length === 0) {
      throw new Error("Please select at least one READY Donation Batch for this Trip.");
    }
    if (payload.volunteerApplicationIds.length === 0) {
      throw new Error("Please assign at least one APPROVED Volunteer to this Trip.");
    }
    if (payload.distributionPoints.length === 0) {
      throw new Error("Please add at least one Distribution Point (destination).");
    }

    // Validate batches
    for (const bId of payload.batchIds) {
      const batch = db.batches.find((b) => b.id === bId);
      if (!batch) throw new Error(`Batch ${bId} not found.`);
      if (batch.eventId !== payload.eventId) {
        throw new Error(
          `Rule violation: Batch ${batch.batchCode} does not belong to the selected Event.`
        );
      }
      if (batch.status !== "READY") {
        throw new Error(
          `Rule violation: Batch ${batch.batchCode} has status ${batch.status}. Only READY batches can be assigned to a Trip.`
        );
      }
      // Check not in another non-cancelled trip
      const activeTrip = db.trips.find(
        (t) =>
          t.status !== "CANCELLED" &&
          t.batchIds.includes(batch.id) &&
          batch.status === "ASSIGNED"
      );
      if (activeTrip) {
        throw new Error(
          `Rule violation: Batch ${batch.batchCode} is already assigned to active Trip ${activeTrip.tripCode}.`
        );
      }
    }

    // Validate volunteers
    const tripId = generateId("trip");
    const tripVolunteers: TripVolunteer[] = [];
    let leaderFound = false;

    for (const appId of payload.volunteerApplicationIds) {
      const app = db.volunteerApplications.find((a) => a.id === appId);
      if (!app) throw new Error("Selected volunteer application not found.");
      if (app.eventId !== payload.eventId) {
        throw new Error(
          "Rule violation: Assigned volunteer application belongs to a different Event."
        );
      }
      if (app.status !== "APPROVED") {
        throw new Error(
          "Rule violation: Only volunteers with APPROVED status for this Event can be assigned to a Trip."
        );
      }
      const isLeader = app.userId === payload.leaderUserId;
      if (isLeader) leaderFound = true;
      tripVolunteers.push({
        id: generateId("tv"),
        tripId,
        userId: app.userId,
        applicationId: app.id,
        role: isLeader ? "LEADER" : "MEMBER",
      });
    }

    if (!leaderFound) {
      throw new Error(
        "Please designate one of the selected approved volunteers as the Trip Leader."
      );
    }

    const autoCode = `TRIP-2026-${String(db.trips.length + 1).padStart(
      3,
      "0"
    )}`;
    const tripCode = payload.tripCode?.trim().toUpperCase() || autoCode;
    const now = new Date().toISOString();

    const newTrip: DistributionTrip = {
      id: tripId,
      tripCode,
      name: payload.name.trim(),
      eventId: payload.eventId,
      organizationId: event.organizationId,
      departurePoint: payload.departurePoint.trim(),
      scheduledDate: payload.scheduledDate,
      status: "SCHEDULED",
      batchIds: payload.batchIds,
      leaderId: payload.leaderUserId,
      volunteers: tripVolunteers,
      notes: payload.notes?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    db.trips.unshift(newTrip);

    // Update Batches: READY -> ASSIGNED
    const assignedBatchCodes: string[] = [];
    for (const bId of payload.batchIds) {
      const bIdx = db.batches.findIndex((b) => b.id === bId);
      if (bIdx !== -1) {
        db.batches[bIdx].status = "ASSIGNED";
        db.batches[bIdx].currentTripId = tripId;
        db.batches[bIdx].updatedAt = now;
        assignedBatchCodes.push(db.batches[bIdx].batchCode);
      }
    }

    // Create Distribution Points
    payload.distributionPoints.forEach((pt, index) => {
      db.distributionPoints.push({
        id: generateId("dp"),
        tripId,
        name: pt.name.trim(),
        address: pt.address.trim(),
        order: index + 1,
        contactPerson: pt.contactPerson?.trim(),
        plannedHouseholds: pt.plannedHouseholds
          ? Number(pt.plannedHouseholds)
          : undefined,
        status: "PENDING",
      });
    });

    const leaderUser = db.users.find((u) => u.id === payload.leaderUserId);
    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: "TRIP_CREATED",
      description: `Created distribution trip ${tripCode} ('${newTrip.name}') with ${
        payload.distributionPoints.length
      } distribution point(s), Trip Leader: ${
        leaderUser?.name || "Leader"
      }, and batch(es): ${assignedBatchCodes.join(", ")}.`,
      oldStatus: "READY",
      newStatus: "SCHEDULED",
      entityType: "TRIP",
      entityId: tripId,
      eventId: payload.eventId,
      tripId,
      batchId: payload.batchIds[0],
    });

    storageService.saveDb(db);
    return enrichTrip(newTrip);
  },

  async updateTripStatus(
    tripId: string,
    nextStatus: TripStatus,
    actor: User,
    options?: {
      cancelReason?: string;
      batchReconciliations?: Record<
        string,
        { returnedQuantity: number; lostQuantity: number; note?: string }
      >;
    }
  ): Promise<EnrichedTrip> {
    try {
      const res = await apiClient.patch<any, any>(`/trips/${tripId}/status`, {
        status: nextStatus,
      });
      if (res && res.id) {
        return mapBeTripToEnriched(res);
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // Fallback
    }

    await delay(260);
    const db = storageService.getDb();
    const idx = db.trips.findIndex((t) => t.id === tripId);
    if (idx === -1) throw new Error("Distribution Trip not found.");

    const trip = db.trips[idx];
    const perm = canModifyTrip(trip, actor);
    if (!perm.allowed) {
      throw new Error(
        "Authorization denied: Only the Organizer or the designated Trip Leader can change Trip status. Trip Members have view & evidence upload access only."
      );
    }

    const oldStatus = trip.status;
    if (oldStatus === nextStatus) return enrichTrip(trip);

    const points = db.distributionPoints.filter((p) => p.tripId === tripId);
    const now = new Date().toISOString();

    if (nextStatus === "PREPARING") {
      if (oldStatus !== "SCHEDULED") {
        throw new Error(
          `Invalid status transition: Trip must be SCHEDULED to move to PREPARING (Current: ${oldStatus}).`
        );
      }
      db.trips[idx].status = "PREPARING";
      db.trips[idx].updatedAt = now;
    } else if (nextStatus === "IN_TRANSIT") {
      if (oldStatus !== "PREPARING") {
        throw new Error(
          `Invalid status transition: Trip must be PREPARING before moving to IN_TRANSIT (Current: ${oldStatus}).`
        );
      }
      db.trips[idx].status = "IN_TRANSIT";
      db.trips[idx].startedAt = now;
      db.trips[idx].updatedAt = now;
    } else if (nextStatus === "COMPLETED") {
      if (oldStatus !== "IN_TRANSIT") {
        throw new Error(
          `Invalid status transition: Trip must be IN_TRANSIT before completing (Current: ${oldStatus}).`
        );
      }
      const unfinishedPoints = points.filter(
        (p) => p.status !== "DISTRIBUTED" && p.status !== "SKIPPED"
      );
      if (unfinishedPoints.length > 0) {
        throw new Error(
          `Cannot complete Trip: All Distribution Points must be DISTRIBUTED or SKIPPED first. Remaining pending/arrived points: ${unfinishedPoints
            .map((p) => p.name)
            .join(", ")}.`
        );
      }

      // Check and reconcile all assigned batches
      for (const bId of trip.batchIds) {
        const b = db.batches.find((x) => x.id === bId);
        if (!b || b.status === "DISTRIBUTED") continue;

        const remaining = b.totalQuantity - b.distributedQuantity;
        const customRec = options?.batchReconciliations?.[b.id];
        const returnedQty =
          customRec !== undefined ? Number(customRec.returnedQuantity) : remaining;
        const lostQty =
          customRec !== undefined ? Number(customRec.lostQuantity) : 0;
        const recNote =
          customRec?.note ||
          (remaining > 0
            ? `Auto-returned ${remaining} ${b.unit} unused balance to warehouse Available stock upon trip completion.`
            : `All ${b.totalQuantity} ${b.unit} distributed across trip points.`);

        await batchService.reconcileBatch(
          b.id,
          {
            returnedQuantity: returnedQty,
            lostQuantity: lostQty,
            note: recNote,
          },
          actor
        );
      }

      // Re-read db after batchService updated it
      const freshDb = storageService.getDb();
      const freshIdx = freshDb.trips.findIndex((t) => t.id === tripId);
      freshDb.trips[freshIdx].status = "COMPLETED";
      freshDb.trips[freshIdx].completedAt = now;
      freshDb.trips[freshIdx].updatedAt = now;

      storageService.addLog(freshDb, {
        actorId: actor.id,
        actorName: actor.name,
        actorRole: perm.actorRoleLabel,
        action: "TRIP_COMPLETED",
        description: `Completed trip ${trip.tripCode} ('${trip.name}'). All distribution points finalized and batch inventory reconciled.`,
        oldStatus,
        newStatus: "COMPLETED",
        entityType: "TRIP",
        entityId: tripId,
        eventId: trip.eventId,
        tripId,
        batchId: trip.batchIds[0],
      });

      storageService.saveDb(freshDb);
      return enrichTrip(freshDb.trips[freshIdx]);
    } else if (nextStatus === "CANCELLED") {
      if (oldStatus === "COMPLETED" || oldStatus === "CANCELLED") {
        throw new Error(`Cannot cancel a trip that is already ${oldStatus}.`);
      }
      const distributedPoints = points.filter((p) => p.status === "DISTRIBUTED");
      if (distributedPoints.length > 0) {
        throw new Error(
          `Rule violation: Cannot cancel Trip ${trip.tripCode} because distribution has already occurred at ${distributedPoints
            .map((p) => p.name)
            .join(", ")}.`
        );
      }

      db.trips[idx].status = "CANCELLED";
      db.trips[idx].cancelledAt = now;
      db.trips[idx].cancelReason =
        options?.cancelReason?.trim() || "Cancelled prior to distribution.";
      db.trips[idx].updatedAt = now;

      // Unassign Batches: ASSIGNED -> READY, quantities stay Reserved
      for (const bId of trip.batchIds) {
        const bIdx = db.batches.findIndex((b) => b.id === bId);
        if (bIdx !== -1 && db.batches[bIdx].status === "ASSIGNED") {
          db.batches[bIdx].status = "READY";
          db.batches[bIdx].currentTripId = undefined;
          db.batches[bIdx].updatedAt = now;

          storageService.addLog(db, {
            actorId: actor.id,
            actorName: actor.name,
            actorRole: perm.actorRoleLabel,
            action: "BATCH_UNASSIGNED_FROM_CANCELLED_TRIP",
            description: `Trip ${trip.tripCode} was cancelled prior to distribution. Batch ${db.batches[bIdx].batchCode} returned from ASSIGNED to READY (Inventory remains Reserved) and can be assigned to a new Trip.`,
            oldStatus: "ASSIGNED",
            newStatus: "READY",
            entityType: "BATCH",
            entityId: bId,
            eventId: trip.eventId,
            batchId: bId,
            tripId,
          });
        }
      }
    } else {
      throw new Error(`Invalid trip status transition: ${oldStatus} → ${nextStatus}`);
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: perm.actorRoleLabel,
      action: `TRIP_${nextStatus}`,
      description: `Trip ${trip.tripCode} ('${trip.name}') status updated from ${oldStatus} to ${nextStatus}.${
        options?.cancelReason ? ` Reason: ${options.cancelReason}` : ""
      }`,
      oldStatus,
      newStatus: nextStatus,
      entityType: "TRIP",
      entityId: tripId,
      eventId: trip.eventId,
      tripId,
      batchId: trip.batchIds[0],
    });

    storageService.saveDb(db);
    return enrichTrip(db.trips[idx]);
  },

  async updatePointStatus(
    pointId: string,
    nextStatus: DistributionPointStatus,
    actor: User,
    note?: string
  ): Promise<EnrichedTrip> {
    try {
      const res = await apiClient.patch<any, any>(
        `/distribution/points/${pointId}/status`,
        {
          status: nextStatus,
          skippedReason: note,
        }
      );
      if (res && res.tripId) {
        const trip = await this.getById(res.tripId);
        if (trip) return trip;
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // Fallback
    }

    await delay(220);
    const db = storageService.getDb();
    const pIdx = db.distributionPoints.findIndex((p) => p.id === pointId);
    if (pIdx === -1) throw new Error("Distribution Point not found.");

    const point = db.distributionPoints[pIdx];
    const trip = db.trips.find((t) => t.id === point.tripId);
    if (!trip) throw new Error("Associated Trip not found.");

    const perm = canModifyTrip(trip, actor);
    if (!perm.allowed) {
      throw new Error(
        "Authorization denied: Only the Organizer or Trip Leader can update Distribution Point status."
      );
    }

    if (trip.status !== "IN_TRANSIT" && trip.status !== "PREPARING") {
      throw new Error(
        `Trip must be IN_TRANSIT (or PREPARING) to update Distribution Points (Current Trip status: ${trip.status}).`
      );
    }

    const oldStatus = point.status;
    if (oldStatus === nextStatus) return enrichTrip(trip);

    const now = new Date().toISOString();

    if (nextStatus === "ARRIVED") {
      if (oldStatus !== "PENDING") {
        throw new Error(
          `Invalid transition: Point must be PENDING to mark as ARRIVED (Current: ${oldStatus}).`
        );
      }
      db.distributionPoints[pIdx].status = "ARRIVED";
      db.distributionPoints[pIdx].arrivedAt = now;
    } else if (nextStatus === "SKIPPED") {
      if (oldStatus !== "PENDING" && oldStatus !== "ARRIVED") {
        throw new Error(
          `Cannot skip a point that is already ${oldStatus}.`
        );
      }
      const existingRecs = db.distributionRecords.filter(
        (r) => r.distributionPointId === pointId
      );
      if (existingRecs.length > 0) {
        throw new Error(
          "Cannot mark point as SKIPPED because distribution records have already been logged at this point."
        );
      }
      db.distributionPoints[pIdx].status = "SKIPPED";
    } else if (nextStatus === "DISTRIBUTED") {
      if (oldStatus !== "ARRIVED") {
        throw new Error(
          `Point must be marked ARRIVED before moving to DISTRIBUTED.`
        );
      }
      const existingRecs = db.distributionRecords.filter(
        (r) => r.distributionPointId === pointId
      );
      if (existingRecs.length === 0) {
        throw new Error(
          "Please record the distributed quantity for at least one Batch at this point before marking it DISTRIBUTED."
        );
      }
      db.distributionPoints[pIdx].status = "DISTRIBUTED";
      db.distributionPoints[pIdx].distributedAt = now;
    } else {
      throw new Error(`Invalid point transition: ${oldStatus} → ${nextStatus}`);
    }

    if (note && note.trim()) {
      db.distributionPoints[pIdx].note = note.trim();
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: perm.actorRoleLabel,
      action: `POINT_${nextStatus}`,
      description: `Distribution point '${point.name}' on ${trip.tripCode} updated from ${oldStatus} to ${nextStatus}.`,
      oldStatus,
      newStatus: nextStatus,
      entityType: "DISTRIBUTION_POINT",
      entityId: point.id,
      eventId: trip.eventId,
      tripId: trip.id,
      distributionPointId: point.id,
      batchId: trip.batchIds[0],
    });

    storageService.saveDb(db);
    return enrichTrip(trip);
  },

  /**
   * Records distributed quantity for ONE Batch at ONE Distribution Point (Section 22).
   * Enforces: total distributed for a Batch across all points <= batch.totalQuantity.
   */
  async recordDistribution(
    payload: {
      tripId: string;
      distributionPointId: string;
      batchId: string;
      distributedQuantity: number;
      note?: string;
      markPointDistributed?: boolean;
    },
    actor: User
  ): Promise<EnrichedTrip> {
    try {
      // Find tripBatchId if possible from trip
      const trip = await this.getById(payload.tripId);
      const tripBatchId =
        (trip as any)?.batches?.find((b: any) => b.id === payload.batchId || (b as any).batchId === payload.batchId)
          ?.id || payload.batchId;

      await apiClient.post<any, any>("/distribution/records", {
        tripBatchId,
        distributionPointId: payload.distributionPointId,
        distributedQuantity: Number(payload.distributedQuantity),
        notes: payload.note,
      });

      const updated = await this.getById(payload.tripId);
      if (updated) return updated;
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // Fallback
    }

    await delay(260);
    const db = storageService.getDb();
    const trip = db.trips.find((t) => t.id === payload.tripId);
    if (!trip) throw new Error("Trip not found.");

    const perm = canModifyTrip(trip, actor);
    if (!perm.allowed) {
      throw new Error(
        "Authorization denied: Only the Organizer or Trip Leader can record distributed quantities."
      );
    }

    if (trip.status !== "IN_TRANSIT") {
      throw new Error(
        `Trip must be in IN_TRANSIT status to record distribution (Current: ${trip.status}).`
      );
    }

    const pIdx = db.distributionPoints.findIndex(
      (p) => p.id === payload.distributionPointId && p.tripId === trip.id
    );
    if (pIdx === -1) throw new Error("Distribution Point not found on this Trip.");

    const point = db.distributionPoints[pIdx];
    if (point.status === "SKIPPED") {
      throw new Error("Cannot record distribution at a SKIPPED point.");
    }

    const bIdx = db.batches.findIndex(
      (b) => b.id === payload.batchId && trip.batchIds.includes(b.id)
    );
    if (bIdx === -1) {
      throw new Error("Selected Batch is not assigned to this Trip.");
    }

    const batch = db.batches[bIdx];
    const qty = Number(payload.distributedQuantity);
    if (!qty || qty <= 0) {
      throw new Error("Distributed quantity must be greater than 0.");
    }

    // Calculate total already distributed for this batch across all points
    const currentDistributed = db.distributionRecords
      .filter((r) => r.batchId === batch.id)
      .reduce((sum, r) => sum + r.distributedQuantity, 0);

    const remainingAvailableInBatch = batch.totalQuantity - currentDistributed;
    if (qty > remainingAvailableInBatch) {
      throw new Error(
        `Validation error: Cannot distribute ${qty} ${batch.unit} from ${batch.batchCode}. Batch total is ${batch.totalQuantity} ${batch.unit} and ${currentDistributed} ${batch.unit} has already been distributed (Remaining in batch: ${remainingAvailableInBatch} ${batch.unit}).`
      );
    }

    const now = new Date().toISOString();

    // If point was PENDING, auto-mark ARRIVED first
    if (point.status === "PENDING") {
      db.distributionPoints[pIdx].status = "ARRIVED";
      db.distributionPoints[pIdx].arrivedAt = now;
    }

    const newRecord: DistributionRecord = {
      id: generateId("rec"),
      tripId: trip.id,
      distributionPointId: point.id,
      batchId: batch.id,
      batchCode: batch.batchCode,
      itemType: batch.itemType,
      unit: batch.unit,
      distributedQuantity: qty,
      note: payload.note?.trim(),
      recordedBy: actor.id,
      recordedAt: now,
    };

    db.distributionRecords.push(newRecord);

    // Update batch distributed & remaining counters
    const newTotalDistributed = currentDistributed + qty;
    db.batches[bIdx].distributedQuantity = newTotalDistributed;
    db.batches[bIdx].remainingQuantity = Math.max(
      0,
      batch.totalQuantity -
        newTotalDistributed -
        batch.returnedQuantity -
        batch.lostQuantity
    );
    db.batches[bIdx].updatedAt = now;

    const oldPointStatus = db.distributionPoints[pIdx].status;
    if (payload.markPointDistributed !== false) {
      db.distributionPoints[pIdx].status = "DISTRIBUTED";
      db.distributionPoints[pIdx].distributedAt = now;
      if (payload.note?.trim()) {
        db.distributionPoints[pIdx].note = payload.note.trim();
      }
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: perm.actorRoleLabel,
      action: "DISTRIBUTION_RECORDED",
      description: `Recorded distribution of ${qty} ${batch.unit} ${batch.itemType} from ${batch.batchCode} at '${point.name}' (${newTotalDistributed}/${batch.totalQuantity} ${batch.unit} distributed).`,
      oldStatus: oldPointStatus,
      newStatus: db.distributionPoints[pIdx].status,
      entityType: "DISTRIBUTION_POINT",
      entityId: point.id,
      eventId: trip.eventId,
      tripId: trip.id,
      batchId: batch.id,
      distributionPointId: point.id,
    });

    storageService.saveDb(db);
    return enrichTrip(trip);
  },
};
