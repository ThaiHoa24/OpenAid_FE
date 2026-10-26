import { storageService } from "./storageService";
import type {
  Donation,
  DonationBatch,
  DonationNeed,
  Event,
  InventoryItem,
  Organization,
  User,
} from "@/types";
import {
  delay,
  generateId,
  generateTrackingId,
  verifyInventoryEquation,
} from "@/utils";

export interface EnrichedDonation extends Donation {
  donor?: User;
  event?: Event;
  organization?: Organization;
  donationNeed?: DonationNeed;
  batch?: DonationBatch;
}

function enrichDonation(d: Donation): EnrichedDonation {
  const db = storageService.getDb();
  const donor = db.users.find((u) => u.id === d.userId);
  const event = db.events.find((e) => e.id === d.eventId);
  const organization = event
    ? db.organizations.find((o) => o.id === event.organizationId)
    : undefined;
  const donationNeed = db.donationNeeds.find((n) => n.id === d.donationNeedId);
  const batch = d.batchId
    ? db.batches.find((b) => b.id === d.batchId)
    : undefined;

  return {
    ...d,
    donor,
    event,
    organization,
    donationNeed,
    batch,
  };
}

export const donationService = {
  async getNeedsByEvent(eventId: string): Promise<DonationNeed[]> {
    await delay(150);
    const db = storageService.getDb();
    return db.donationNeeds.filter((n) => n.eventId === eventId);
  },

  async getByUser(userId: string): Promise<EnrichedDonation[]> {
    await delay(200);
    const db = storageService.getDb();
    return db.donations
      .filter((d) => d.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichDonation);
  },

  async getByEvent(eventId: string): Promise<EnrichedDonation[]> {
    await delay(200);
    const db = storageService.getDb();
    return db.donations
      .filter((d) => d.eventId === eventId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichDonation);
  },

  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedDonation[]> {
    await delay(220);
    const db = storageService.getDb();
    const orgEventIds =
      organizationId && organizationId !== "ALL"
        ? db.events
            .filter((e) => e.organizationId === organizationId)
            .map((e) => e.id)
        : db.events.map((e) => e.id);

    return db.donations
      .filter(
        (d) =>
          orgEventIds.includes(d.eventId) &&
          (!eventId || eventId === "ALL" || d.eventId === eventId)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichDonation);
  },

  async create(
    payload: {
      eventId: string;
      donationNeedId: string;
      quantity: number;
      note?: string;
      photoUrl?: string;
    },
    actor: User
  ): Promise<EnrichedDonation> {
    await delay(280);
    const db = storageService.getDb();
    const event = db.events.find((e) => e.id === payload.eventId);
    if (!event) throw new Error("Event not found.");
    if (event.status !== "PUBLISHED") {
      throw new Error(
        `Cannot donate to an event with status ${event.status}. Only PUBLISHED events accept donations.`
      );
    }

    const needIdx = db.donationNeeds.findIndex(
      (n) => n.id === payload.donationNeedId && n.eventId === payload.eventId
    );
    if (needIdx === -1) {
      throw new Error("Selected donation need does not belong to this event.");
    }

    const qty = Number(payload.quantity);
    if (!qty || qty <= 0) {
      throw new Error("Donation quantity must be a positive number.");
    }

    const need = db.donationNeeds[needIdx];
    const existingTrackingIds = db.donations.map((d) => d.trackingId);
    const trackingId = generateTrackingId(existingTrackingIds);
    const now = new Date().toISOString();

    const newDonation: Donation = {
      id: generateId("don"),
      trackingId,
      eventId: payload.eventId,
      userId: actor.id,
      donationNeedId: need.id,
      itemType: need.itemType,
      unit: need.unit,
      quantity: qty,
      note: payload.note?.trim(),
      photoUrl: payload.photoUrl?.trim(),
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };

    db.donations.unshift(newDonation);
    db.donationNeeds[needIdx].pledgedQuantity += qty;

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "DONOR",
      action: "DONATION_REGISTERED",
      description: `Registered in-kind donation of ${qty} ${need.unit} ${need.itemType} (Tracking ID: ${trackingId}) for '${event.title}'.`,
      newStatus: "PENDING",
      entityType: "DONATION",
      entityId: newDonation.id,
      eventId: event.id,
      donationId: newDonation.id,
    });

    storageService.saveDb(db);
    return enrichDonation(newDonation);
  },

  async confirmReceived(
    donationId: string,
    actor: User
  ): Promise<EnrichedDonation> {
    await delay(260);
    const db = storageService.getDb();
    const idx = db.donations.findIndex((d) => d.id === donationId);
    if (idx === -1) throw new Error("Donation not found.");

    const donation = db.donations[idx];
    if (donation.status !== "PENDING") {
      throw new Error(
        `Invalid status transition: Cannot confirm receipt for a donation in ${donation.status} status.`
      );
    }

    const event = db.events.find((e) => e.id === donation.eventId);
    if (!event) throw new Error("Associated event not found.");

    const now = new Date().toISOString();
    const oldStatus = donation.status;
    db.donations[idx].status = "RECEIVED";
    db.donations[idx].updatedAt = now;

    // Update DonationNeed receivedQuantity
    const needIdx = db.donationNeeds.findIndex(
      (n) => n.id === donation.donationNeedId
    );
    if (needIdx !== -1) {
      db.donationNeeds[needIdx].receivedQuantity += donation.quantity;
    }

    // Update or create InventoryItem (Available += quantity, Received += quantity)
    const invIdx = db.inventory.findIndex(
      (inv) =>
        inv.eventId === donation.eventId &&
        inv.itemType.toLowerCase() === donation.itemType.toLowerCase() &&
        inv.unit.toLowerCase() === donation.unit.toLowerCase()
    );

    if (invIdx !== -1) {
      db.inventory[invIdx].received += donation.quantity;
      db.inventory[invIdx].available += donation.quantity;
      db.inventory[invIdx].updatedAt = now;
      verifyInventoryEquation(db.inventory[invIdx]);
    } else {
      const newInv: InventoryItem = {
        id: generateId("inv"),
        eventId: donation.eventId,
        organizationId: event.organizationId,
        itemType: donation.itemType,
        unit: donation.unit,
        received: donation.quantity,
        available: donation.quantity,
        reserved: 0,
        distributed: 0,
        lostWrittenOff: 0,
        notes: `Added from confirmed donation ${donation.trackingId}.`,
        updatedAt: now,
      };
      verifyInventoryEquation(newInv);
      db.inventory.push(newInv);
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: "DONATION_RECEIVED",
      description: `Confirmed receipt of ${donation.quantity} ${donation.unit} ${donation.itemType} (${donation.trackingId}). Added to Available warehouse inventory.`,
      oldStatus,
      newStatus: "RECEIVED",
      entityType: "DONATION",
      entityId: donation.id,
      eventId: donation.eventId,
      donationId: donation.id,
    });

    storageService.saveDb(db);
    return enrichDonation(db.donations[idx]);
  },

  async rejectDonation(
    donationId: string,
    actor: User,
    reason?: string
  ): Promise<EnrichedDonation> {
    await delay(250);
    const db = storageService.getDb();
    const idx = db.donations.findIndex((d) => d.id === donationId);
    if (idx === -1) throw new Error("Donation not found.");

    const donation = db.donations[idx];
    if (donation.status !== "PENDING") {
      throw new Error(
        `Invalid status transition: Only PENDING donations can be rejected (Current: ${donation.status}).`
      );
    }

    const oldStatus = donation.status;
    db.donations[idx].status = "REJECTED";
    db.donations[idx].updatedAt = new Date().toISOString();
    if (reason && reason.trim()) {
      db.donations[idx].note = `${donation.note ? `${donation.note} | ` : ""}Lý do từ chối: ${reason.trim()}`;
    }

    // Reduce pledgedQuantity since rejected/cancelled pledges do not count toward Pledged
    const needIdx = db.donationNeeds.findIndex(
      (n) => n.id === donation.donationNeedId
    );
    if (needIdx !== -1) {
      db.donationNeeds[needIdx].pledgedQuantity = Math.max(
        0,
        db.donationNeeds[needIdx].pledgedQuantity - donation.quantity
      );
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: "DONATION_REJECTED",
      description: `Marked donation ${donation.trackingId} (${donation.quantity} ${donation.unit} ${donation.itemType}) as REJECTED / not received.${reason ? ` Lý do: ${reason.trim()}` : ""}`,
      oldStatus,
      newStatus: "REJECTED",
      entityType: "DONATION",
      entityId: donation.id,
      eventId: donation.eventId,
      donationId: donation.id,
    });

    storageService.saveDb(db);
    return enrichDonation(db.donations[idx]);
  },

  async cancelMyDonation(
    donationId: string,
    actor: User
  ): Promise<EnrichedDonation> {
    await delay(220);
    const db = storageService.getDb();
    const idx = db.donations.findIndex((d) => d.id === donationId);
    if (idx === -1) throw new Error("Donation not found.");

    const donation = db.donations[idx];
    if (donation.userId !== actor.id) {
      throw new Error("You can only cancel your own donation.");
    }
    if (donation.status !== "PENDING") {
      throw new Error(
        `Cannot cancel a donation that is already ${donation.status}.`
      );
    }

    const oldStatus = donation.status;
    db.donations[idx].status = "CANCELLED";
    db.donations[idx].updatedAt = new Date().toISOString();

    const needIdx = db.donationNeeds.findIndex(
      (n) => n.id === donation.donationNeedId
    );
    if (needIdx !== -1) {
      db.donationNeeds[needIdx].pledgedQuantity = Math.max(
        0,
        db.donationNeeds[needIdx].pledgedQuantity - donation.quantity
      );
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "DONOR",
      action: "DONATION_CANCELLED",
      description: `Donor cancelled pending donation ${donation.trackingId} (${donation.quantity} ${donation.unit} ${donation.itemType}).`,
      oldStatus,
      newStatus: "CANCELLED",
      entityType: "DONATION",
      entityId: donation.id,
      eventId: donation.eventId,
      donationId: donation.id,
    });

    storageService.saveDb(db);
    return enrichDonation(db.donations[idx]);
  },
};
