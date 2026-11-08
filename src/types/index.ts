// ============================================================
// OpenAid — Standardized TypeScript Models & Interfaces
// Synchronized with OpenAid_BE PostgreSQL & Prisma Schema
// ============================================================

export type SystemRole = "USER" | "ADMIN";
export type OrganizationRole = "MEMBER" | "ORGANIZER";
export type UserStatus = "ACTIVE" | "DISABLED";

export interface User {
  id: string; // UUID v4
  email: string;
  password?: string;
  fullName?: string;
  name: string; // Synced alias to fullName
  phoneNumber?: string;
  phone: string; // Synced alias to phoneNumber
  avatarUrl?: string;
  bio?: string;
  systemRole: SystemRole;
  isActive?: boolean;
  status: UserStatus; // Synced alias: isActive ? 'ACTIVE' : 'DISABLED'
  createdAt: string;
  updatedAt?: string;
}

export type OrgStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type OrganizationStatus = OrgStatus | "DISABLED";

export interface Organization {
  id: string; // UUID v4
  code?: string; // Unique short code e.g. "OPENAID-DEMO"
  name: string;
  description: string;
  email?: string;
  contactEmail: string; // Synced alias
  phoneNumber?: string;
  contactPhone: string; // Synced alias
  address: string;
  status: OrganizationStatus;
  createdById?: string;
  reviewedById?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  logoUrl?: string;
  website?: string;
  verifiedAt?: string;
}

export interface OrganizationMember {
  id: string; // UUID v4
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  createdAt?: string;
  joinedAt: string; // Synced alias to createdAt
  user?: User;
  organization?: Organization;
}

export type EventStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";

export type SupportCategory =
  | "Disaster Relief"
  | "Food & Water"
  | "Medical Aid"
  | "Education"
  | "Community Support"
  | "Emergency Shelter";

export interface ItemType {
  id: string; // UUID v4
  code: string;
  name: string;
  category: string;
  isActive: boolean;
}

export interface Unit {
  id: string; // UUID v4
  code: string;
  name: string;
  isActive: boolean;
}

export interface VolunteerRole {
  id: string; // UUID v4
  eventId: string;
  name: string;
  description: string;
  quantity?: number;
  requiredQuantity: number; // Synced alias to quantity
  approvedQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export type VolunteerApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ApplicationStatus = VolunteerApplicationStatus;

export interface VolunteerApplication {
  id: string; // UUID v4
  eventId: string;
  userId: string;
  volunteerRoleId: string;
  status: ApplicationStatus;
  notes?: string;
  note: string; // Synced alias to notes
  reviewedById?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;

  // Attendance
  checkedInAt?: string;
  checkedOutAt?: string;

  // Relations
  user?: User;
  role?: VolunteerRole;
}

export interface DonationNeed {
  id: string; // UUID v4
  eventId: string;
  itemTypeId?: string;
  unitId?: string;
  itemType: string; // Synced string name for UI
  unit: string; // Synced string name for UI
  targetQuantity: number;
  pledgedQuantity: number;
  receivedQuantity: number;
  distributedQuantity: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DonationStatus =
  | "PENDING"
  | "RECEIVED"
  | "REJECTED"
  | "IN_BATCH"
  | "DISTRIBUTED"
  | "CANCELLED";

export interface Donation {
  id: string; // UUID v4
  trackingId: string;
  eventId: string;
  donationNeedId: string;
  itemTypeId?: string;
  unitId?: string;
  donorId?: string;
  userId: string; // Synced alias to donorId
  batchId?: string;
  itemType: string;
  unit: string;
  quantity: number;
  receivedQuantity?: number;
  photoUrl?: string;
  status: DonationStatus;
  receivedById?: string;
  receivedAt?: string;
  rejectionReason?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string; // UUID v4
  organizationId: string;
  createdById?: string;
  title: string;
  description: string;
  location: string;
  contactName?: string;
  contactPerson: string; // Synced alias to contactName
  contactPhone: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;

  // UI extensions
  area: string;
  imageUrl: string;
  category: SupportCategory;
  contactEmail: string;
  organization?: Organization;
  volunteerRoles?: VolunteerRole[];
  donationNeeds?: DonationNeed[];
}

export interface InventoryItem {
  id: string; // UUID v4
  eventId: string;
  organizationId: string;
  itemTypeId?: string;
  unitId?: string;
  itemType: string;
  unit: string;
  received: number;
  receivedTotal?: number;
  available: number;
  reserved: number;
  distributed: number;
  lostWrittenOff: number;
  receivedQuantity?: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  distributedQuantity?: number;
  lostQuantity?: number;
  notes?: string;
  updatedAt: string;
}

export type BatchStatus = "DRAFT" | "READY" | "ASSIGNED" | "DISTRIBUTED";

export interface DonationBatch {
  id: string; // UUID v4
  batchCode: string;
  name: string;
  eventId: string;
  organizationId: string;
  createdById?: string;
  inventoryId?: string;
  itemTypeId?: string;
  unitId?: string;
  itemType: string;
  unit: string;
  quantity?: number;
  totalQuantity: number; // Synced alias to quantity
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
  id: string; // UUID v4
  tripId: string;
  eventId?: string;
  applicationId: string;
  role: TripVolunteerRole;
  assignedAt?: string;
  userId: string;
  user?: User;
}

export interface DistributionPoint {
  id: string; // UUID v4
  tripId: string;
  position?: number;
  order: number; // Synced alias to position
  name: string;
  location?: string;
  address: string; // Synced alias to location
  mapUrl?: string;
  status: DistributionPointStatus;
  arrivedAt?: string;
  distributedAt?: string;
  skippedReason?: string;
  contactPerson?: string;
  plannedHouseholds?: number;
  note?: string;
}

export interface DistributionRecord {
  id: string; // UUID v4
  tripId: string;
  tripBatchId?: string;
  distributionPointId: string;
  batchId: string;
  batchCode: string;
  itemType: string;
  unit: string;
  distributedQuantity: number;
  beneficiaryCount?: number;
  note?: string;
  notes?: string; // Synced alias
  recordedBy: string;
  recordedAt: string;
  confirmedById?: string;
  confirmedAt?: string;
}

export interface DistributionTrip {
  id: string; // UUID v4
  tripCode: string;
  name: string;
  eventId: string;
  organizationId: string;
  createdById?: string;
  departurePoint: string;
  departureDate?: string;
  scheduledDate: string; // Synced alias to departureDate
  vehicle?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  status: TripStatus;
  batchIds: string[];
  leaderId: string;
  volunteers: TripVolunteer[];
  points?: DistributionPoint[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EvidenceReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type EvidenceStatus =
  | EvidenceReviewStatus
  | "PENDING_REVIEW"
  | "APPROVED_PUBLIC"
  | "REJECTED_PUBLIC";

export interface Evidence {
  id: string; // UUID v4
  tripId: string;
  eventId: string;
  distributionPointId: string;
  distributionRecordId?: string;
  batchId?: string;
  uploadedById?: string;
  imageUrl: string;
  mimeType?: string;
  sizeBytes?: number;
  caption: string;
  privacyConfirmed: boolean;
  reviewStatus?: EvidenceReviewStatus;
  status: EvidenceStatus; // Synced alias
  reviewedById?: string;
  reviewedAt?: string;
  reviewNote?: string;
  uploadedBy: string;
  uploadedByName: string;
  reviewedBy?: string;
  uploadedAt: string;
}

export type TransparencyEntityType =
  | "USER"
  | "ORGANIZATION"
  | "EVENT"
  | "VOLUNTEER_APPLICATION"
  | "DONATION"
  | "INVENTORY"
  | "BATCH"
  | "TRIP"
  | "DISTRIBUTION_POINT"
  | "DISTRIBUTION_RECORD"
  | "EVIDENCE";

export interface TransparencyLog {
  id: string; // UUID v4
  eventId?: string;
  action: string;
  entityType: TransparencyEntityType;
  entityId: string;
  actorId: string;
  oldStatus?: string;
  newStatus?: string;
  evidenceId?: string;
  details?: Record<string, unknown>;
  isPublic?: boolean;
  createdAt?: string;

  // Synced aliases
  timestamp: string; // Synced alias to createdAt
  actorName: string;
  actorRole: string;
  description: string;
  donationId?: string;
  batchId?: string;
  tripId?: string;
  distributionPointId?: string;
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
    name?: string;
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
    name?: string;
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
