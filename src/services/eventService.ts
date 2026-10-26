import { storageService } from "./storageService";
import type {
  DonationNeed,
  Event,
  EventStatus,
  Organization,
  SupportCategory,
  User,
  VolunteerRole,
} from "@/types";
import { delay, generateId } from "@/utils";

export interface EnrichedEvent extends Event {
  organization?: Organization;
  volunteerRoles: VolunteerRole[];
  donationNeeds: DonationNeed[];
  totalRequiredVolunteers: number;
  totalApprovedVolunteers: number;
  applicationsCount: number;
  donationsCount: number;
  tripsCount: number;
  canPhysicalDelete: boolean;
}

export interface EventFilterOptions {
  search?: string;
  area?: string;
  category?: string;
  status?: string;
  dateFilter?: string; // "all" | "upcoming" | "this_month"
  sortBy?: "newest" | "startDate" | "volunteerSlots";
  includeDrafts?: boolean;
  organizationId?: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  area: string;
  startDate: string;
  endDate: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  imageUrl?: string;
  category: SupportCategory;
  organizationId: string;
  publishImmediately?: boolean;
  volunteerRoles: {
    name: string;
    description: string;
    requiredQuantity: number;
  }[];
  donationNeeds: {
    itemType: string;
    unit: string;
    targetQuantity: number;
  }[];
}

function enrichEvent(event: Event): EnrichedEvent {
  const db = storageService.getDb();
  const organization = db.organizations.find((o) => o.id === event.organizationId);
  const volunteerRoles = db.volunteerRoles.filter((r) => r.eventId === event.id);
  const donationNeeds = db.donationNeeds.filter((n) => n.eventId === event.id);
  const applicationsCount = db.volunteerApplications.filter(
    (a) => a.eventId === event.id
  ).length;
  const donationsCount = db.donations.filter((d) => d.eventId === event.id).length;
  const tripsCount = db.trips.filter((t) => t.eventId === event.id).length;

  const totalRequiredVolunteers = volunteerRoles.reduce(
    (sum, r) => sum + r.requiredQuantity,
    0
  );
  const totalApprovedVolunteers = volunteerRoles.reduce(
    (sum, r) => sum + r.approvedQuantity,
    0
  );

  const canPhysicalDelete =
    event.status === "DRAFT" &&
    applicationsCount === 0 &&
    donationsCount === 0 &&
    tripsCount === 0;

  return {
    ...event,
    organization,
    volunteerRoles,
    donationNeeds,
    totalRequiredVolunteers,
    totalApprovedVolunteers,
    applicationsCount,
    donationsCount,
    tripsCount,
    canPhysicalDelete,
  };
}

export const eventService = {
  async getAll(filters?: EventFilterOptions): Promise<EnrichedEvent[]> {
    await delay(220);
    const db = storageService.getDb();
    let list = db.events.map(enrichEvent);

    if (!filters?.includeDrafts) {
      list = list.filter((e) => e.status === "PUBLISHED" || e.status === "CLOSED");
    }

    if (filters?.organizationId && filters.organizationId !== "ALL") {
      list = list.filter((e) => e.organizationId === filters.organizationId);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.area.toLowerCase().includes(q) ||
          (e.organization?.name.toLowerCase().includes(q) ?? false) ||
          e.donationNeeds.some((n) => n.itemType.toLowerCase().includes(q))
      );
    }

    if (filters?.area && filters.area !== "ALL") {
      list = list.filter((e) => e.area.toLowerCase() === filters.area!.toLowerCase());
    }

    if (filters?.category && filters.category !== "ALL") {
      list = list.filter((e) => e.category === filters.category);
    }

    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((e) => e.status === filters.status);
    }

    if (filters?.dateFilter && filters.dateFilter !== "ALL") {
      if (filters.dateFilter === "ACTIVE") {
        list = list.filter((e) => e.status === "PUBLISHED");
      } else if (filters.dateFilter === "OCTOBER_2026") {
        list = list.filter((e) => e.startDate.startsWith("2026-10"));
      } else if (filters.dateFilter === "NOVEMBER_DECEMBER_2026") {
        list = list.filter(
          (e) =>
            e.startDate.startsWith("2026-11") || e.startDate.startsWith("2026-12")
        );
      }
    }

    const sortBy = filters?.sortBy || "newest";
    if (sortBy === "newest") {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "startDate") {
      list.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    } else if (sortBy === "volunteerSlots") {
      list.sort(
        (a, b) =>
          b.totalRequiredVolunteers -
          b.totalApprovedVolunteers -
          (a.totalRequiredVolunteers - a.totalApprovedVolunteers)
      );
    }

    return list;
  },

  async getById(id: string): Promise<EnrichedEvent | null> {
    await delay(180);
    const db = storageService.getDb();
    const ev = db.events.find((e) => e.id === id);
    if (!ev) return null;
    return enrichEvent(ev);
  },

  async create(input: CreateEventInput, actor: User): Promise<EnrichedEvent> {
    await delay(300);
    const db = storageService.getDb();
    const org = db.organizations.find((o) => o.id === input.organizationId);
    if (!org) throw new Error("Organization not found.");

    if (input.publishImmediately && org.status !== "APPROVED") {
      throw new Error(
        `Organization '${org.name}' is currently ${org.status}. Only an APPROVED organization can publish an Event. Save as DRAFT instead.`
      );
    }

    if (new Date(input.endDate).getTime() < new Date(input.startDate).getTime()) {
      throw new Error("End date must be after start date.");
    }

    const eventId = generateId("evt");
    const status: EventStatus = input.publishImmediately ? "PUBLISHED" : "DRAFT";
    const now = new Date().toISOString();

    const newEvent: Event = {
      id: eventId,
      title: input.title.trim(),
      description: input.description.trim(),
      location: input.location.trim(),
      area: input.area.trim() || "Da Nang",
      startDate: input.startDate,
      endDate: input.endDate,
      contactPerson: input.contactPerson.trim() || actor.name,
      contactPhone: input.contactPhone.trim() || actor.phone,
      contactEmail: input.contactEmail.trim() || actor.email,
      imageUrl:
        input.imageUrl?.trim() ||
        "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80",
      category: input.category,
      status,
      organizationId: input.organizationId,
      createdAt: now,
      updatedAt: now,
    };

    db.events.unshift(newEvent);

    for (const r of input.volunteerRoles) {
      if (!r.name.trim() || r.requiredQuantity <= 0) continue;
      db.volunteerRoles.push({
        id: generateId("role"),
        eventId,
        name: r.name.trim(),
        description: r.description.trim() || `${r.name.trim()} support role`,
        requiredQuantity: Number(r.requiredQuantity),
        approvedQuantity: 0,
      });
    }

    for (const n of input.donationNeeds) {
      if (!n.itemType.trim() || n.targetQuantity <= 0) continue;
      db.donationNeeds.push({
        id: generateId("need"),
        eventId,
        itemType: n.itemType.trim(),
        unit: n.unit.trim(),
        targetQuantity: Number(n.targetQuantity),
        pledgedQuantity: 0,
        receivedQuantity: 0,
        distributedQuantity: 0,
      });
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: status === "PUBLISHED" ? "EVENT_PUBLISHED" : "EVENT_CREATED_DRAFT",
      description: `Created event '${newEvent.title}' with status ${status}.`,
      newStatus: status,
      entityType: "EVENT",
      entityId: eventId,
      eventId,
    });

    storageService.saveDb(db);
    return enrichEvent(newEvent);
  },

  async update(
    eventId: string,
    updates: Partial<CreateEventInput>,
    actor: User
  ): Promise<EnrichedEvent> {
    await delay(260);
    const db = storageService.getDb();
    const idx = db.events.findIndex((e) => e.id === eventId);
    if (idx === -1) throw new Error("Event not found.");

    const existing = db.events[idx];
    if (existing.status === "CLOSED" || existing.status === "CANCELLED") {
      throw new Error(`Cannot edit an event that is already ${existing.status}.`);
    }

    const startDate = updates.startDate ?? existing.startDate;
    const endDate = updates.endDate ?? existing.endDate;
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      throw new Error("End date must be after start date.");
    }

    db.events[idx] = {
      ...existing,
      title: updates.title?.trim() ?? existing.title,
      description: updates.description?.trim() ?? existing.description,
      location: updates.location?.trim() ?? existing.location,
      area: updates.area?.trim() ?? existing.area,
      startDate,
      endDate,
      contactPerson: updates.contactPerson?.trim() ?? existing.contactPerson,
      contactPhone: updates.contactPhone?.trim() ?? existing.contactPhone,
      contactEmail: updates.contactEmail?.trim() ?? existing.contactEmail,
      imageUrl: updates.imageUrl?.trim() || existing.imageUrl,
      category: updates.category ?? existing.category,
      updatedAt: new Date().toISOString(),
    };

    if (updates.volunteerRoles) {
      for (const r of updates.volunteerRoles) {
        if (!r.name.trim() || r.requiredQuantity <= 0) continue;
        const foundRole = db.volunteerRoles.find(
          (vr) =>
            vr.eventId === eventId &&
            vr.name.toLowerCase() === r.name.trim().toLowerCase()
        );
        if (foundRole) {
          foundRole.requiredQuantity = Math.max(
            Number(r.requiredQuantity),
            foundRole.approvedQuantity
          );
          foundRole.description = r.description.trim() || foundRole.description;
        } else {
          db.volunteerRoles.push({
            id: generateId("role"),
            eventId,
            name: r.name.trim(),
            description: r.description.trim() || `${r.name.trim()} support role`,
            requiredQuantity: Number(r.requiredQuantity),
            approvedQuantity: 0,
          });
        }
      }
    }

    if (updates.donationNeeds) {
      for (const n of updates.donationNeeds) {
        if (!n.itemType.trim() || n.targetQuantity <= 0) continue;
        const foundNeed = db.donationNeeds.find(
          (dn) =>
            dn.eventId === eventId &&
            dn.itemType.toLowerCase() === n.itemType.trim().toLowerCase() &&
            dn.unit.toLowerCase() === n.unit.trim().toLowerCase()
        );
        if (foundNeed) {
          foundNeed.targetQuantity = Number(n.targetQuantity);
        } else {
          db.donationNeeds.push({
            id: generateId("need"),
            eventId,
            itemType: n.itemType.trim(),
            unit: n.unit.trim(),
            targetQuantity: Number(n.targetQuantity),
            pledgedQuantity: 0,
            receivedQuantity: 0,
            distributedQuantity: 0,
          });
        }
      }
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: "EVENT_UPDATED",
      description: `Updated details and targets for event '${db.events[idx].title}'.`,
      oldStatus: existing.status,
      newStatus: existing.status,
      entityType: "EVENT",
      entityId: eventId,
      eventId,
    });

    storageService.saveDb(db);
    return enrichEvent(db.events[idx]);
  },

  async changeStatus(
    eventId: string,
    targetStatus: EventStatus,
    actor: User
  ): Promise<EnrichedEvent> {
    await delay(250);
    const db = storageService.getDb();
    const idx = db.events.findIndex((e) => e.id === eventId);
    if (idx === -1) throw new Error("Event not found.");

    const event = db.events[idx];
    const oldStatus = event.status;

    if (oldStatus === targetStatus) return enrichEvent(event);

    // Validate allowed transitions:
    // DRAFT -> PUBLISHED -> CLOSED or PUBLISHED -> CANCELLED
    if (targetStatus === "PUBLISHED") {
      if (oldStatus !== "DRAFT") {
        throw new Error(`Invalid transition: Cannot publish an event from ${oldStatus}.`);
      }
      const org = db.organizations.find((o) => o.id === event.organizationId);
      if (!org || org.status !== "APPROVED") {
        throw new Error(
          `Only an Organization approved by the Platform Admin can publish an Event (Current org status: ${org?.status || "UNKNOWN"}).`
        );
      }
    } else if (targetStatus === "CLOSED") {
      if (oldStatus !== "PUBLISHED") {
        throw new Error(
          `Invalid transition: Only a PUBLISHED event can be closed (Current: ${oldStatus}).`
        );
      }
    } else if (targetStatus === "CANCELLED") {
      if (oldStatus !== "PUBLISHED") {
        throw new Error(
          `Invalid transition: Only a PUBLISHED event can be cancelled (Current: ${oldStatus}).`
        );
      }
    } else {
      throw new Error(`Invalid transition from ${oldStatus} to ${targetStatus}.`);
    }

    db.events[idx].status = targetStatus;
    db.events[idx].updatedAt = new Date().toISOString();

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.systemRole === "ADMIN" ? "ADMIN" : "ORGANIZER",
      action: `EVENT_${targetStatus}`,
      description: `Changed status of event '${event.title}' from ${oldStatus} to ${targetStatus}.`,
      oldStatus,
      newStatus: targetStatus,
      entityType: "EVENT",
      entityId: eventId,
      eventId,
    });

    storageService.saveDb(db);
    return enrichEvent(db.events[idx]);
  },

  async delete(eventId: string, _actor: User): Promise<void> {
    await delay(250);
    const db = storageService.getDb();
    const event = db.events.find((e) => e.id === eventId);
    if (!event) throw new Error("Event not found.");

    const hasApps = db.volunteerApplications.some((a) => a.eventId === eventId);
    const hasDonations = db.donations.some((d) => d.eventId === eventId);
    const hasTrips = db.trips.some((t) => t.eventId === eventId);

    if (event.status !== "DRAFT" || hasApps || hasDonations || hasTrips) {
      throw new Error(
        "Deletion blocked: Only DRAFT events with no applications, donations, or trips can be physically deleted. Use Close or Cancel instead."
      );
    }

    db.events = db.events.filter((e) => e.id !== eventId);
    db.volunteerRoles = db.volunteerRoles.filter((r) => r.eventId !== eventId);
    db.donationNeeds = db.donationNeeds.filter((n) => n.eventId !== eventId);
    storageService.saveDb(db);
  },
};
