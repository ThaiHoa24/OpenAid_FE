import { storageService } from "./storageService";
import type {
  Organization,
  OrganizationStatus,
  User,
  UserStatus,
} from "@/types";
import { delay } from "@/utils";

export interface EnrichedUser extends User {
  organizations: {
    id: string;
    name: string;
    role: string;
    status: OrganizationStatus;
  }[];
  volunteerApplicationsCount: number;
  donationsCount: number;
}

export interface EnrichedOrganization extends Organization {
  membersCount: number;
  organizers: User[];
  eventsCount: number;
}

export const adminService = {
  async getPlatformStats() {
    await delay(180);
    const db = storageService.getDb();
    return {
      totalUsers: db.users.length,
      activeUsers: db.users.filter((u) => u.status === "ACTIVE").length,
      totalOrganizations: db.organizations.length,
      pendingOrganizations: db.organizations.filter(
        (o) => o.status === "PENDING"
      ).length,
      approvedOrganizations: db.organizations.filter(
        (o) => o.status === "APPROVED"
      ).length,
      disabledOrganizations: db.organizations.filter(
        (o) => o.status === "DISABLED"
      ).length,
      totalEvents: db.events.length,
      publishedEvents: db.events.filter((e) => e.status === "PUBLISHED").length,
      totalDonations: db.donations.length,
      totalBatches: db.batches.length,
      totalTrips: db.trips.length,
      totalLogs: db.transparencyLogs.length,
    };
  },

  async getAllUsers(search?: string, statusFilter?: string): Promise<EnrichedUser[]> {
    await delay(200);
    const db = storageService.getDb();
    let list = db.users.slice();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter((u) => u.status === statusFilter);
    }

    return list.map((u) => {
      const memberships = db.organizationMembers.filter(
        (m) => m.userId === u.id
      );
      const organizations = memberships
        .map((m) => {
          const org = db.organizations.find((o) => o.id === m.organizationId);
          return org
            ? {
                id: org.id,
                name: org.name,
                role: m.role,
                status: org.status,
              }
            : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const volunteerApplicationsCount = db.volunteerApplications.filter(
        (a) => a.userId === u.id
      ).length;
      const donationsCount = db.donations.filter(
        (d) => d.userId === u.id
      ).length;

      return {
        ...u,
        organizations,
        volunteerApplicationsCount,
        donationsCount,
      };
    });
  },

  async updateUserStatus(
    userId: string,
    nextStatus: UserStatus,
    actor: User
  ): Promise<User> {
    await delay(220);
    const db = storageService.getDb();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found.");

    if (db.users[idx].id === actor.id && nextStatus === "DISABLED") {
      throw new Error("You cannot disable your own Admin account.");
    }

    const oldStatus = db.users[idx].status;
    db.users[idx].status = nextStatus;

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ADMIN",
      action: `USER_${nextStatus}`,
      description: `Admin updated user '${db.users[idx].name}' (${db.users[idx].email}) status from ${oldStatus} to ${nextStatus}.`,
      oldStatus,
      newStatus: nextStatus,
      entityType: "ORGANIZATION",
      entityId: userId,
    });

    storageService.saveDb(db);
    return db.users[idx];
  },

  async getAllOrganizations(
    statusFilter?: string,
    search?: string
  ): Promise<EnrichedOrganization[]> {
    await delay(200);
    const db = storageService.getDb();
    let list = db.organizations.slice();

    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.contactEmail.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q)
      );
    }

    return list.map((o) => {
      const members = db.organizationMembers.filter(
        (m) => m.organizationId === o.id
      );
      const organizers = members
        .filter((m) => m.role === "ORGANIZER")
        .map((m) => db.users.find((u) => u.id === m.userId))
        .filter((u): u is User => u !== undefined);
      const eventsCount = db.events.filter(
        (e) => e.organizationId === o.id
      ).length;

      return {
        ...o,
        membersCount: members.length,
        organizers,
        eventsCount,
      };
    });
  },

  async updateOrganizationStatus(
    orgId: string,
    nextStatus: OrganizationStatus,
    actor: User
  ): Promise<Organization> {
    await delay(250);
    const db = storageService.getDb();
    const idx = db.organizations.findIndex((o) => o.id === orgId);
    if (idx === -1) throw new Error("Organization not found.");

    const oldStatus = db.organizations[idx].status;
    db.organizations[idx].status = nextStatus;
    if (nextStatus === "APPROVED") {
      db.organizations[idx].verifiedAt = new Date().toISOString();
    }

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ADMIN",
      action: `ORGANIZATION_${nextStatus}`,
      description: `Platform Admin updated organization '${db.organizations[idx].name}' status from ${oldStatus} to ${nextStatus}.`,
      oldStatus,
      newStatus: nextStatus,
      entityType: "ORGANIZATION",
      entityId: orgId,
    });

    storageService.saveDb(db);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("openaid-auth-changed"));
    }
    return db.organizations[idx];
  },

  async getOrganizerDashboardSummary(
    organizationId?: string,
    eventId?: string
  ) {
    await delay(220);
    const db = storageService.getDb();
    const events = db.events.filter(
      (e) =>
        (!organizationId ||
          organizationId === "ALL" ||
          e.organizationId === organizationId) &&
        (!eventId || eventId === "ALL" || e.id === eventId)
    );
    const eventIds = events.map((e) => e.id);

    const applications = db.volunteerApplications.filter((a) =>
      eventIds.includes(a.eventId)
    );
    const donations = db.donations.filter((d) => eventIds.includes(d.eventId));
    const batches = db.batches.filter((b) => eventIds.includes(b.eventId));
    const trips = db.trips.filter((t) => eventIds.includes(t.eventId));
    const needs = db.donationNeeds.filter((n) => eventIds.includes(n.eventId));
    const inventory = db.inventory.filter((i) => eventIds.includes(i.eventId));
    const evidences = db.evidences.filter((ev) => eventIds.includes(ev.eventId));

    // Group metrics by itemType + unit
    const metricsMap = new Map<
      string,
      {
        itemType: string;
        unit: string;
        needed: number;
        pledged: number;
        received: number;
        distributed: number;
        available: number;
        reserved: number;
        lost: number;
      }
    >();

    for (const n of needs) {
      const key = `${n.itemType}|${n.unit}`;
      const existing = metricsMap.get(key) || {
        itemType: n.itemType,
        unit: n.unit,
        needed: 0,
        pledged: 0,
        received: 0,
        distributed: 0,
        available: 0,
        reserved: 0,
        lost: 0,
      };
      existing.needed += n.targetQuantity;
      existing.pledged += n.pledgedQuantity;
      existing.received += n.receivedQuantity;
      existing.distributed += n.distributedQuantity;
      metricsMap.set(key, existing);
    }

    for (const inv of inventory) {
      const key = `${inv.itemType}|${inv.unit}`;
      const existing = metricsMap.get(key) || {
        itemType: inv.itemType,
        unit: inv.unit,
        needed: 0,
        pledged: 0,
        received: inv.received,
        distributed: inv.distributed,
        available: 0,
        reserved: 0,
        lost: 0,
      };
      existing.available += inv.available;
      existing.reserved += inv.reserved;
      existing.lost += inv.lostWrittenOff;
      metricsMap.set(key, existing);
    }

    return {
      eventsCount: events.length,
      publishedEventsCount: events.filter((e) => e.status === "PUBLISHED")
        .length,
      volunteersTotal: applications.length,
      volunteersApproved: applications.filter((a) => a.status === "APPROVED")
        .length,
      volunteersPending: applications.filter((a) => a.status === "PENDING")
        .length,
      volunteersCheckedIn: applications.filter((a) => Boolean(a.checkedInAt))
        .length,
      donationsTotal: donations.length,
      donationsPending: donations.filter((d) => d.status === "PENDING").length,
      donationsReceived: donations.filter(
        (d) =>
          d.status === "RECEIVED" ||
          d.status === "IN_BATCH" ||
          d.status === "DISTRIBUTED"
      ).length,
      batchesTotal: batches.length,
      batchesReady: batches.filter((b) => b.status === "READY").length,
      batchesAssigned: batches.filter((b) => b.status === "ASSIGNED").length,
      batchesDistributed: batches.filter((b) => b.status === "DISTRIBUTED")
        .length,
      tripsTotal: trips.length,
      tripsCompleted: trips.filter((t) => t.status === "COMPLETED").length,
      tripsInTransit: trips.filter((t) => t.status === "IN_TRANSIT").length,
      evidencesPendingReview: evidences.filter(
        (ev) => ev.status === "PENDING_REVIEW"
      ).length,
      evidencesApprovedPublic: evidences.filter(
        (ev) => ev.status === "APPROVED_PUBLIC"
      ).length,
      itemMetrics: Array.from(metricsMap.values()),
    };
  },
};
