import { storageService } from "./storageService";
import type {
  Event,
  Organization,
  User,
  VolunteerApplication,
  VolunteerRole,
} from "@/types";
import { delay, generateId } from "@/utils";

export interface EnrichedVolunteerApplication extends VolunteerApplication {
  user?: User;
  event?: Event;
  organization?: Organization;
  role?: VolunteerRole;
}

function enrichApplication(
  app: VolunteerApplication
): EnrichedVolunteerApplication {
  const db = storageService.getDb();
  const user = db.users.find((u) => u.id === app.userId);
  const event = db.events.find((e) => e.id === app.eventId);
  const organization = event
    ? db.organizations.find((o) => o.id === event.organizationId)
    : undefined;
  const role = db.volunteerRoles.find((r) => r.id === app.volunteerRoleId);

  return {
    ...app,
    user,
    event,
    organization,
    role,
  };
}

export const volunteerService = {
  async getRolesByEvent(eventId: string): Promise<VolunteerRole[]> {
    await delay(150);
    const db = storageService.getDb();
    return db.volunteerRoles.filter((r) => r.eventId === eventId);
  },

  async getByUser(userId: string): Promise<EnrichedVolunteerApplication[]> {
    await delay(200);
    const db = storageService.getDb();
    return db.volunteerApplications
      .filter((a) => a.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichApplication);
  },

  async getByEvent(eventId: string): Promise<EnrichedVolunteerApplication[]> {
    await delay(200);
    const db = storageService.getDb();
    return db.volunteerApplications
      .filter((a) => a.eventId === eventId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichApplication);
  },

  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedVolunteerApplication[]> {
    await delay(220);
    const db = storageService.getDb();
    const orgEventIds =
      organizationId && organizationId !== "ALL"
        ? db.events
            .filter((e) => e.organizationId === organizationId)
            .map((e) => e.id)
        : db.events.map((e) => e.id);

    return db.volunteerApplications
      .filter(
        (a) =>
          orgEventIds.includes(a.eventId) &&
          (!eventId || eventId === "ALL" || a.eventId === eventId)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(enrichApplication);
  },

  async getApprovedVolunteersForEvent(
    eventId: string
  ): Promise<EnrichedVolunteerApplication[]> {
    await delay(150);
    const db = storageService.getDb();
    return db.volunteerApplications
      .filter((a) => a.eventId === eventId && a.status === "APPROVED")
      .map(enrichApplication);
  },

  async apply(
    payload: {
      eventId: string;
      volunteerRoleId: string;
      note: string;
    },
    actor: User
  ): Promise<EnrichedVolunteerApplication> {
    await delay(260);
    const db = storageService.getDb();
    const event = db.events.find((e) => e.id === payload.eventId);
    if (!event) throw new Error("Event not found.");
    if (event.status !== "PUBLISHED") {
      throw new Error(
        `Cannot apply to an event with status ${event.status}. Only PUBLISHED events accept applications.`
      );
    }

    const role = db.volunteerRoles.find((r) => r.id === payload.volunteerRoleId);
    if (!role || role.eventId !== payload.eventId) {
      throw new Error("Selected volunteer role does not belong to this event.");
    }

    const existing = db.volunteerApplications.find(
      (a) =>
        a.eventId === payload.eventId &&
        a.userId === actor.id &&
        a.volunteerRoleId === payload.volunteerRoleId &&
        a.status !== "REJECTED"
    );
    if (existing) {
      throw new Error(
        `You have already applied for the '${role.name}' role in this event (Status: ${existing.status}).`
      );
    }

    const now = new Date().toISOString();
    const newApp: VolunteerApplication = {
      id: generateId("app"),
      eventId: payload.eventId,
      userId: actor.id,
      volunteerRoleId: payload.volunteerRoleId,
      note: payload.note.trim() || "Ready to support this relief event.",
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };

    db.volunteerApplications.unshift(newApp);

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "VOLUNTEER",
      action: "VOLUNTEER_APPLIED",
      description: `${actor.name} applied for role '${role.name}' in '${event.title}'.`,
      newStatus: "PENDING",
      entityType: "EVENT",
      entityId: newApp.id,
      eventId: event.id,
    });

    storageService.saveDb(db);
    return enrichApplication(newApp);
  },

  async reviewApplication(
    applicationId: string,
    decision: "APPROVED" | "REJECTED",
    actor: User
  ): Promise<EnrichedVolunteerApplication> {
    await delay(250);
    const db = storageService.getDb();
    const idx = db.volunteerApplications.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error("Volunteer application not found.");

    const app = db.volunteerApplications[idx];
    if (app.status !== "PENDING") {
      throw new Error(
        `Invalid status transition: Application is already ${app.status}. Only PENDING applications can be reviewed.`
      );
    }

    const roleIdx = db.volunteerRoles.findIndex(
      (r) => r.id === app.volunteerRoleId
    );
    const event = db.events.find((e) => e.id === app.eventId);
    const applicant = db.users.find((u) => u.id === app.userId);

    if (decision === "APPROVED" && roleIdx !== -1) {
      db.volunteerRoles[roleIdx].approvedQuantity += 1;
    }

    const oldStatus = app.status;
    db.volunteerApplications[idx].status = decision;
    db.volunteerApplications[idx].updatedAt = new Date().toISOString();

    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "ORGANIZER",
      action: `VOLUNTEER_${decision}`,
      description: `${decision === "APPROVED" ? "Approved" : "Rejected"} volunteer application from ${applicant?.name || "Volunteer"} for role '${db.volunteerRoles[roleIdx]?.name || "Role"}' in '${event?.title || "Event"}'.`,
      oldStatus,
      newStatus: decision,
      entityType: "EVENT",
      entityId: app.id,
      eventId: app.eventId,
    });

    storageService.saveDb(db);
    return enrichApplication(db.volunteerApplications[idx]);
  },

  async checkIn(
    applicationId: string,
    actor: User
  ): Promise<EnrichedVolunteerApplication> {
    await delay(220);
    const db = storageService.getDb();
    const idx = db.volunteerApplications.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error("Application not found.");

    const app = db.volunteerApplications[idx];
    if (app.status !== "APPROVED") {
      throw new Error("Only APPROVED volunteers can check in.");
    }
    if (app.checkedInAt) {
      throw new Error("Already checked in for this activity.");
    }

    const now = new Date().toISOString();
    db.volunteerApplications[idx].checkedInAt = now;
    db.volunteerApplications[idx].updatedAt = now;

    const event = db.events.find((e) => e.id === app.eventId);
    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "VOLUNTEER",
      action: "VOLUNTEER_CHECK_IN",
      description: `Volunteer checked in at '${event?.title || "Event"}'.`,
      oldStatus: "APPROVED",
      newStatus: "CHECKED_IN",
      entityType: "EVENT",
      entityId: app.id,
      eventId: app.eventId,
    });

    storageService.saveDb(db);
    return enrichApplication(db.volunteerApplications[idx]);
  },

  async checkOut(
    applicationId: string,
    actor: User
  ): Promise<EnrichedVolunteerApplication> {
    await delay(220);
    const db = storageService.getDb();
    const idx = db.volunteerApplications.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error("Application not found.");

    const app = db.volunteerApplications[idx];
    if (!app.checkedInAt) {
      throw new Error("Must check in before checking out.");
    }
    if (app.checkedOutAt) {
      throw new Error("Already checked out for this activity.");
    }

    const now = new Date().toISOString();
    db.volunteerApplications[idx].checkedOutAt = now;
    db.volunteerApplications[idx].updatedAt = now;

    const event = db.events.find((e) => e.id === app.eventId);
    storageService.addLog(db, {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: "VOLUNTEER",
      action: "VOLUNTEER_CHECK_OUT",
      description: `Volunteer completed shift and checked out at '${event?.title || "Event"}'.`,
      oldStatus: "CHECKED_IN",
      newStatus: "COMPLETED_SHIFT",
      entityType: "EVENT",
      entityId: app.id,
      eventId: app.eventId,
    });

    storageService.saveDb(db);
    return enrichApplication(db.volunteerApplications[idx]);
  },
};
