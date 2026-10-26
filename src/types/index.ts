// ============================================================
// OpenAid — Complete TypeScript Models & Interfaces
// ============================================================

export type SystemRole = "USER" | "ADMIN";
export type OrganizationRole = "MEMBER" | "ORGANIZER";
export type UserStatus = "ACTIVE" | "DISABLED";

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  systemRole: SystemRole;
  status: UserStatus;
  createdAt: string;
}

export type OrganizationStatus = "PENDING" | "APPROVED" | "DISABLED";

export interface Organization {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
  status: OrganizationStatus;
  verifiedAt?: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  joinedAt: string;
}

export type EventStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";

export type SupportCategory =
  | "Disaster Relief"
  | "Food & Water"
  | "Medical Aid"
  | "Education"
  | "Community Support"
  | "Emergency Shelter";

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  area: string;
  startDate: string;
  endDate: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  imageUrl: string;
  category: SupportCategory;
  status: EventStatus;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerRole {
  id: string;
  eventId: string;
  name: string;
  description: string;
  requiredQuantity: number;
  approvedQuantity: number;
}

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VolunteerApplication {
  id: string;
  eventId: string;
  userId: string;
  volunteerRoleId: string;
  note: string;
  status: ApplicationStatus;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type DonationStatus =
  | "PENDING"
  | "RECEIVED"
  | "REJECTED"
  | "IN_BATCH"
  | "DISTRIBUTED"
  | "CANCELLED";

export interface DonationNeed {
  id: string;
  eventId: string;
  itemType: string;
  unit: string;
  targetQuantity: number;
  pledgedQuantity: number;
  receivedQuantity: number;
  distributedQuantity: number;
}

export interface Donation {
  id: string;
  trackingId: string;
  eventId: string;
  userId: string;
  donationNeedId: string;
  itemType: string;
  unit: string;
  quantity: number;
  note?: string;
  photoUrl?: string;
  status: DonationStatus;
  batchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  eventId: string;
  organizationId: string;
  itemType: string;
  unit: string;
  received: number;
  available: number;
  reserved: number;
  distributed: number;
  lostWrittenOff: number;
  notes?: string;
  updatedAt: string;
}

export type BatchStatus = "DRAFT" | "READY" | "ASSIGNED" | "DISTRIBUTED";

export interface DonationBatch {
  id: string;
  batchCode: string;
  name: string;
  eventId: string;
  organizationId: string;
  itemType: string;
  unit: string;
  totalQuantity: number;
  distributedQuantity: number;
  returnedQuantity: number;
  remainingQuantity: number;
  lostQuantity: number;
  reconciliationNote?: string;
  status: BatchStatus;
  donationIds: string[];
  currentTripId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TripStatus =
  | "SCHEDULED"
  | "PREPARING"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

export type DistributionPointStatus =
  | "PENDING"
  | "ARRIVED"
  | "DISTRIBUTED"
  | "SKIPPED";

export type TripVolunteerRole = "LEADER" | "MEMBER";

export interface TripVolunteer {
  id: string;
  tripId: string;
  userId: string;
  applicationId: string;
  role: TripVolunteerRole;
}

export interface DistributionPoint {
  id: string;
  tripId: string;
  name: string;
  address: string;
  order: number;
  contactPerson?: string;
  plannedHouseholds?: number;
  status: DistributionPointStatus;
  arrivedAt?: string;
  distributedAt?: string;
  note?: string;
}

export interface DistributionRecord {
  id: string;
  tripId: string;
  distributionPointId: string;
  batchId: string;
  batchCode: string;
  itemType: string;
  unit: string;
  distributedQuantity: number;
  note?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface DistributionTrip {
  id: string;
  tripCode: string;
  name: string;
  eventId: string;
  organizationId: string;
  departurePoint: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  status: TripStatus;
  batchIds: string[];
  leaderId: string;
  volunteers: TripVolunteer[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EvidenceStatus =
  | "PENDING_REVIEW"
  | "APPROVED_PUBLIC"
  | "REJECTED_PUBLIC";

export interface Evidence {
  id: string;
  eventId: string;
  tripId: string;
  distributionPointId: string;
  batchId?: string;
  imageUrl: string;
  caption: string;
  privacyConfirmed: boolean;
  status: EvidenceStatus;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type TransparencyEntityType =
  | "EVENT"
  | "DONATION"
  | "INVENTORY"
  | "BATCH"
  | "TRIP"
  | "DISTRIBUTION_POINT"
  | "EVIDENCE"
  | "ORGANIZATION";

export interface TransparencyLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  description: string;
  oldStatus?: string;
  newStatus?: string;
  entityType: TransparencyEntityType;
  entityId: string;
  eventId?: string;
  donationId?: string;
  batchId?: string;
  tripId?: string;
  distributionPointId?: string;
  evidenceId?: string;
}

export interface PublicTrackingResult {
  donation: {
    trackingId: string;
    itemType: string;
    unit: string;
    quantity: number;
    status: DonationStatus;
    createdAt: string;
    eventTitle: string;
    organizationName: string;
    eventId: string;
  };
  batch?: {
    id: string;
    batchCode: string;
    name: string;
    itemType: string;
    unit: string;
    totalQuantity: number;
    distributedQuantity: number;
    returnedQuantity: number;
    remainingQuantity: number;
    lostQuantity: number;
    status: BatchStatus;
    createdAt: string;
  };
  trip?: {
    id: string;
    tripCode: string;
    name: string;
    departurePoint: string;
    scheduledDate: string;
    status: TripStatus;
    startedAt?: string;
    completedAt?: string;
  };
  distributionPoints: {
    id: string;
    name: string;
    address: string;
    order: number;
    status: DistributionPointStatus;
    arrivedAt?: string;
    distributedAt?: string;
    records: {
      id: string;
      batchCode: string;
      itemType: string;
      unit: string;
      distributedQuantity: number;
      recordedAt: string;
    }[];
  }[];
  publicEvidences: {
    id: string;
    imageUrl: string;
    caption: string;
    distributionPointName: string;
    uploadedAt: string;
  }[];
  timeline: TransparencyLog[];
}

export interface MockDatabase {
  users: User[];
  organizations: Organization[];
  organizationMembers: OrganizationMember[];
  events: Event[];
  volunteerRoles: VolunteerRole[];
  volunteerApplications: VolunteerApplication[];
  donationNeeds: DonationNeed[];
  donations: Donation[];
  inventory: InventoryItem[];
  batches: DonationBatch[];
  trips: DistributionTrip[];
  distributionPoints: DistributionPoint[];
  distributionRecords: DistributionRecord[];
  evidences: Evidence[];
  transparencyLogs: TransparencyLog[];
}
