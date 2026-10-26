import { storageService } from "./storageService";
import type {
  BatchStatus,
  DistributionTrip,
  Donation,
  DonationBatch,
  Event,
  Organization,
  User,
} from "@/types";
import { delay, generateId, verifyInventoryEquation } from "@/utils";

export interface EnrichedBatch extends DonationBatch {
  event?: Event;
  organization?: Organization;
  donations: Donation[];
  currentTrip?: DistributionTrip;
}

function enrichBatch(batch: DonationBatch): EnrichedBatch {
  const db = storageService.getDb();
  const event = db.events.find((e) => e.id === batch.eventId);
  const organization = db.organizations.find((o) => o.id === batch.organizationId);
  const donations = db.donations.filter((d) => batch.donationIds.includes(d.id));
  const currentTrip = batch.currentTripId
    ? db.trips.find((t) => t.id === batch.currentTripId)
    : undefined;

  return {
    ...batch,
    event,
    organization,
    donations,
    currentTrip,
  };
}

export const batchService = {
  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedBatch[]> {
    await delay(200);
    const db = storageService.getDb();
    let list = db.batches;

    if (organizationId && organizationId !== "ALL") {
      list = list.filter((b) => b.organizationId === organizationId);
    }
    if (eventId && eventId !== "ALL") {
      list = list.filter((b) => b.eventId === eventId);
    }

    return list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichBatch);
  },

  async getByEvent(eventId: string): Promise<EnrichedBatch[]> {
    await delay(160);
    const db = storageService.getDb();
    return db.batches
      .filter((b) => b.eventId === eventId)
      .map(enrichBatch);
  },

  async getReadyBatchesForEvent(eventId: string): Promise<EnrichedBatch[]> {
    await delay(150);
    const db = storageService.getDb();
    return db.batches
      .filter(
        (b) =>
          b.eventId === eventId &&
          b.status === "READY" &&
          !b.currentTripId
      )
      .map(enrichBatch);
  },

  async getEligibleDonations(
    eventId: string,
    itemType?: string,
    unit?: string
  ): Promise<Donation[]> {
    await delay(150);
    const db = storageService.getDb();
    return db.donations.filter(
      (d) =>
        d.eventId === eventId &&
        d.status === "RECEIVED" &&
        !d.batchId &&
        (!itemType || d.itemType.toLowerCase() === itemType.toLowerCase()) &&
        (!unit || d.unit.toLowerCase() === unit.toLowerCase())
    );
  },

  async create(
    payload: {
      eventId: string;
      name?: string;
      batchCode?: string;
      itemType: string;
      unit: string;
      donationIds: string[];
      initialStatus?: "DRAFT" | "READY";
    },
    actor: User
  ): Promise<EnrichedBatch> {
    await delay(280);
    const db = storageService.getDb();
    const event = db.events.find((e) => e.id === payload.eventId);
    if (!event) throw new Error("Event not found.");

    const uniqueDonationIds = Array.from(new Set(payload.donationIds));
    if (uniqueDonationIds.length === 0) {
      throw new Error("Please select at least one RECEIVED donation to create a Batch.");
    }
    if (uniqueDonationIds.length !== payload.donationIds.length) {
      throw new Error("Duplicate donations detected in batch selection.");
    }

    const selectedDonations: Donation[] = [];
    for (const donId of uniqueDonationIds) {
      const d = db.donations.find((x) => x.id === donId);
      if (!d) throw new Error(`Donation ${donId} not found.`);
      if (d.eventId !== payload.eventId) {
        throw new Error(
          `Rule violation: Donation ${d.trackingId} belongs to a different Event.`
        );
      }
      if (d.status !== "RECEIVED") {
        throw new Error(
          `Rule violation: Donation ${d.trackingId} has status ${d.status}. Only RECEIVED donations can be grouped into a Batch.`
        );
      }
      if (d.batchId) {
        throw new Error(
          `Rule violation: Donation ${d.trackingId} already belongs to another Batch.`
        );
      }
      if (
        d.itemType.toLowerCase() !== payload.itemType.toLowerCase() ||
        d.unit.toLowerCase() !== payload.unit.toLowerCase()
      ) {
        throw new Error(
          `Rule violation: Donation ${d.trackingId} (${d.itemType} / ${d.unit}) does not match batch item type (${payload.itemType} / ${payload.unit}).`
        );
      }
      selectedDonations.push(d);
    }

    const totalQuantity = selectedDonations.reduce(
      (sum, d) => sum + d.quantity,
      0
    );

    // Check Inventory Available stock
    const invIdx = db.inventory.findIndex(
      (inv) =>
        inv.eventId === payload.eventId &&
        inv.itemType.toLowerCase() === payload.itemType.toLowerCase() &&
        inv.unit.toLowerCase() === payload.unit.toLowerCase()
    );
    if (invIdx === -1 || db.inventory[invIdx].available < totalQuantity) {
      throw new Error(
        `Insufficient Available inventory for ${payload.itemType} (${payload.unit}). Needed: ${totalQuantity}, Available: ${
          invIdx !== -1 ? db.inventory[invIdx].available : 0
        }.`
      );
    }

    // Generate clean batch code e.g. RICE-BATCH-001
    const prefix = payload.itemType
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8) || "ITEM";
    const existingCount = db.batches.filter((b) =>
      b.batchCode.startsWith(`${prefix}-BATCH-`)
    ).length;
    const autoCode = `${prefix}-BATCH-${String(existingCount + 1).padStart(
      3,
      "0"
    )}`;
    const batchCode = payload.batchCode?.trim().toUpperCase() || autoCode;

    if (db.batches.some((b) => b.batchCode.toUpperCase() === batchCode)) {
      throw new Error(`Batch code '${batchCode}' already exists.`);
    }

    const now = new Date().toISOString();
    const status: BatchStatus = payload.initialStatus || "READY";

    const newBatch: DonationBatch = {
      id: generateId("batch"),
      batchCode,
      name:
        payload.name?.trim() ||
        `${event.title.slice(0, 24)} – ${payload.itemType} Batch`,
      eventId: payload.eventId,
      organizationId: event.organizationId,
      itemType: payload.itemType,
      unit: payload.unit,
      totalQuantity,
      distributedQuantity: 0,
      returnedQuantity: 0,
      remainingQuantity: totalQuantity,
      lostQuantity: 0,
      status,
      donationIds: uniqueDonationIds,
      createdAt: now,
      updatedAt: now,
    };

    db.batches.unshift(newBatch);

    // Move Inventory from Available -> Reserved
    db.inventory[invIdx].available -= totalQuantity;
    db.inventory[invIdx].reserved += totalQuantity;
    db.inventory[invIdx].updatedAt = now;
    verifyInventoryEquation(db.inventory[invIdx]);

    // Update Donations to IN_BATCH
    for (const donId of uniqueDonationIds) {
      const dIdx = db.donations.findIndex((x) => x.id === donId);
      if (dIdx !== -1) {
        db.donations[dIdx].status = "IN_BATCH";
        db.donations[dIdx].batchId = newBatch.id;
        db.donations[dIdx].updatedAt = now;
      }
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: "BATCH_CREATED",
      description: `Created batch ${batchCode} (${totalQuantity} ${payload.unit} ${payload.itemType}) from ${uniqueDonationIds.length} donation(s) [${selectedDonations
        .map((d) => `${d.trackingId}: ${d.quantity}${d.unit}`)
        .join(", ")}]. Inventory moved Available → Reserved.`,
      oldStatus: "RECEIVED",
      newStatus: status,
      entityType: "BATCH",
      entityId: newBatch.id,
      eventId: payload.eventId,
      batchId: newBatch.id,
    });

    storageService.saveDb(db);
    return enrichBatch(newBatch);
  },

  async markBatchReady(batchId: string, actor: User): Promise<EnrichedBatch> {
    await delay(200);
    const db = storageService.getDb();
    const idx = db.batches.findIndex((b) => b.id === batchId);
    if (idx === -1) throw new Error("Batch not found.");

    if (db.batches[idx].status !== "DRAFT") {
      throw new Error("Only DRAFT batches can be marked as READY.");
    }

    db.batches[idx].status = "READY";
    db.batches[idx].updatedAt = new Date().toISOString();

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: "BATCH_READY",
      description: `Batch ${db.batches[idx].batchCode} marked as READY for trip assignment.`,
      oldStatus: "DRAFT",
      newStatus: "READY",
      entityType: "BATCH",
      entityId: batchId,
      eventId: db.batches[idx].eventId,
      batchId,
    });

    storageService.saveDb(db);
    return enrichBatch(db.batches[idx]);
  },

  /**
   * Reconciles a batch's Remaining / Returned / Lost quantities (Section 23)
   * and transitions the Batch & its Donations to DISTRIBUTED.
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
    await delay(260);
    const db = storageService.getDb();
    const idx = db.batches.findIndex((b) => b.id === batchId);
    if (idx === -1) throw new Error("Batch not found.");

    const batch = db.batches[idx];
    if (batch.status === "DISTRIBUTED") {
      throw new Error(`Batch ${batch.batchCode} has already been reconciled and marked DISTRIBUTED.`);
    }

    const distributed = batch.distributedQuantity;
    const returned = Number(payload.returnedQuantity || 0);
    const lost = Number(payload.lostQuantity || 0);

    if (returned < 0 || lost < 0) {
      throw new Error("Returned and Lost quantities cannot be negative.");
    }

    const sum = distributed + returned + lost;
    if (Math.abs(sum - batch.totalQuantity) > 0.001) {
      throw new Error(
        `Reconciliation mismatch for ${batch.batchCode}: Distributed (${distributed}) + Returned to Warehouse (${returned}) + Lost/Written-off (${lost}) = ${sum}, which must equal Total Batch Quantity (${batch.totalQuantity} ${batch.unit}).`
      );
    }

    if (lost > 0 && (!payload.note || !payload.note.trim())) {
      throw new Error(
        "A reconciliation note is required when recording Lost / Written-off quantity."
      );
    }

    const now = new Date().toISOString();
    const oldStatus = batch.status;

    db.batches[idx].returnedQuantity = returned;
    db.batches[idx].lostQuantity = lost;
    db.batches[idx].remainingQuantity = 0;
    db.batches[idx].reconciliationNote =
      payload.note?.trim() ||
      `Distributed: ${distributed}, Returned: ${returned}, Lost: ${lost}`;
    db.batches[idx].status = "DISTRIBUTED";
    db.batches[idx].updatedAt = now;

    // Update Inventory:
    // Reserved -= totalQuantity
    // Distributed += distributed
    // Available += returned
    // LostWrittenOff += lost
    const invIdx = db.inventory.findIndex(
      (inv) =>
        inv.eventId === batch.eventId &&
        inv.itemType.toLowerCase() === batch.itemType.toLowerCase() &&
        inv.unit.toLowerCase() === batch.unit.toLowerCase()
    );
    if (invIdx !== -1) {
      db.inventory[invIdx].reserved = Math.max(
        0,
        db.inventory[invIdx].reserved - batch.totalQuantity
      );
      db.inventory[invIdx].distributed += distributed;
      db.inventory[invIdx].available += returned;
      db.inventory[invIdx].lostWrittenOff += lost;
      db.inventory[invIdx].notes = payload.note?.trim() || db.inventory[invIdx].notes;
      db.inventory[invIdx].updatedAt = now;
      verifyInventoryEquation(db.inventory[invIdx]);
    }

    // Update DonationNeed distributedQuantity
    const needIdx = db.donationNeeds.findIndex(
      (n) =>
        n.eventId === batch.eventId &&
        n.itemType.toLowerCase() === batch.itemType.toLowerCase() &&
        n.unit.toLowerCase() === batch.unit.toLowerCase()
    );
    if (needIdx !== -1) {
      db.donationNeeds[needIdx].distributedQuantity += distributed;
    }

    // Update all Donations in this Batch to DISTRIBUTED
    for (const donId of batch.donationIds) {
      const dIdx = db.donations.findIndex((d) => d.id === donId);
      if (dIdx !== -1) {
        db.donations[dIdx].status = "DISTRIBUTED";
        db.donations[dIdx].updatedAt = now;
      }
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: "BATCH_DISTRIBUTED_RECONCILED",
      description: `Reconciled batch ${batch.batchCode} (${batch.totalQuantity} ${batch.unit}): Distributed = ${distributed}, Returned to Available = ${returned}, Lost/Written-off = ${lost}.${
        payload.note ? ` Note: ${payload.note}` : ""
      }`,
      oldStatus,
      newStatus: "DISTRIBUTED",
      entityType: "BATCH",
      entityId: batch.id,
      eventId: batch.eventId,
      batchId: batch.id,
      tripId: batch.currentTripId,
    });

    storageService.saveDb(db);
    return enrichBatch(db.batches[idx]);
  },
};
