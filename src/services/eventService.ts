import { authService } from "./authService";
import apiClient from "@/lib/api/axiosClient";
import type {
  DonationNeed,
  Event,
  EventStatus,
  ItemType,
  Organization,
  SupportCategory,
  Unit,
  User,
  VolunteerRole,
} from "@/types";

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

export function mapBeEventToEnriched(e: any): EnrichedEvent {
  const volunteerRoles: VolunteerRole[] = (e.volunteerRoles || []).map((r: any) => ({
    id: r.id,
    eventId: e.id,
    name: r.name,
    description: r.description || "",
    requiredQuantity: Number(r.quantity || r.requiredQuantity || 0),
    approvedQuantity: Number(r.approvedQuantity || 0),
  }));

  const donationNeeds: DonationNeed[] = (e.donationNeeds || []).map((n: any) => {
    const rawTarget = typeof n.targetQuantity === "object" ? n.targetQuantity?.toNumber?.() ?? Number(n.targetQuantity) : Number(n.targetQuantity);
    return {
      id: n.id,
      eventId: e.id,
      itemTypeId: n.itemTypeId,
      unitId: n.unitId,
      itemType: n.itemType?.name || n.itemType || "Hàng cứu trợ",
      unit: n.unit?.name || n.unit || "phần",
      targetQuantity: isNaN(rawTarget) ? 0 : rawTarget,
      pledgedQuantity: Number(n.pledgedQuantity || 0),
      receivedQuantity: Number(n.receivedQuantity || 0),
      distributedQuantity: Number(n.distributedQuantity || 0),
      notes: n.notes,
    };
  });

  const totalRequiredVolunteers = volunteerRoles.reduce(
    (sum, r) => sum + r.requiredQuantity,
    0
  );
  const totalApprovedVolunteers = volunteerRoles.reduce(
    (sum, r) => sum + r.approvedQuantity,
    0
  );

  const applicationsCount = Number(e._count?.volunteerApplications ?? e.applicationsCount ?? 0);
  const donationsCount = Number(e._count?.donations ?? e.donationsCount ?? 0);
  const tripsCount = Number(e._count?.trips ?? e.tripsCount ?? 0);

  const canPhysicalDelete =
    e.status === "DRAFT" &&
    applicationsCount === 0 &&
    donationsCount === 0 &&
    tripsCount === 0;

  return {
    id: e.id,
    organizationId: e.organizationId,
    createdById: e.createdById,
    title: e.title,
    description: e.description || "",
    location: e.location,
    area: e.location || "Miền Trung",
    startDate: e.startDate,
    endDate: e.endDate || e.startDate,
    status: e.status as EventStatus,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt || e.createdAt,
    contactName: e.contactName || "Ban điều phối",
    contactPerson: e.contactName || "Ban điều phối",
    contactPhone: e.contactPhone || "",
    contactEmail: e.contactEmail || "",
    imageUrl:
      e.imageUrl ||
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80",
    category: "Disaster Relief",
    organization: e.organization,
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
  /**
   * Lấy danh mục loại hiện vật từ BE
   */
  async getItemTypes(): Promise<ItemType[]> {
    const list = await apiClient.get<any, ItemType[]>("/events/catalogs/item-types");
    return Array.isArray(list) ? list : [];
  },

  /**
   * Lấy danh mục đơn vị tính từ BE
   */
  async getUnits(): Promise<Unit[]> {
    const list = await apiClient.get<any, Unit[]>("/events/catalogs/units");
    return Array.isArray(list) ? list : [];
  },

  /**
   * Lấy danh sách chiến dịch từ BE (hỗ trợ tìm kiếm, lọc khu vực, trạng thái)
   */
  async getAll(filters?: EventFilterOptions): Promise<EnrichedEvent[]> {
    const params: Record<string, any> = {};

    if (filters?.search?.trim()) {
      params.search = filters.search.trim();
    }
    if (filters?.area && filters.area !== "ALL") {
      params.area = filters.area;
    }
    if (filters?.status && filters.status !== "ALL") {
      params.status = filters.status;
    } else if (filters?.includeDrafts) {
      // Backend defaults to PUBLISHED if no status; if drafts needed, pass explicitly if supported
    }

    const beEvents = await apiClient.get<any, any[]>("/events", { params });

    if (!Array.isArray(beEvents)) {
      return [];
    }

    let list = beEvents.map(mapBeEventToEnriched);

    // Apply client-side filters if needed (e.g. organizationId, category, sorting)
    if (filters?.organizationId && filters.organizationId !== "ALL") {
      list = list.filter((e) => e.organizationId === filters.organizationId);
    }
    if (filters?.category && filters.category !== "ALL") {
      list = list.filter((e) => e.category === filters.category);
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

  /**
   * Lấy chi tiết chiến dịch theo ID từ BE
   */
  async getById(id: string): Promise<EnrichedEvent | null> {
    try {
      const beEvent = await apiClient.get<any, any>(`/events/${id}`);
      if (beEvent) {
        return mapBeEventToEnriched(beEvent);
      }
      return null;
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Tạo chiến dịch mới qua BE (POST /api/events)
   * và tự động publish nếu người dùng chọn publishImmediately
   */
  async create(input: CreateEventInput, actor: User): Promise<EnrichedEvent> {
    authService.assertOrganizerAccess(actor, input.organizationId);

    if (new Date(input.endDate).getTime() < new Date(input.startDate).getTime()) {
      throw new Error("Ngày kết thúc phải diễn ra sau ngày bắt đầu.");
    }

    // 1. Resolve Item Types & Units for Donation Needs
    let itemTypes: ItemType[] = [];
    let units: Unit[] = [];
    try {
      [itemTypes, units] = await Promise.all([
        this.getItemTypes(),
        this.getUnits(),
      ]);
    } catch {
      // If catalogs query fails, use empty arrays
    }

    // Map donation needs to BE DTO schema
    const seenNeedKeys = new Set<string>();
    const donationNeeds: {
      itemTypeId: string;
      unitId: string;
      targetQuantity: number;
      notes?: string;
    }[] = [];

    for (const n of input.donationNeeds || []) {
      if (!n.itemType?.trim() || Number(n.targetQuantity) <= 0) continue;

      const isItemUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(n.itemType.trim());
      const matchedItem = itemTypes.find(
        (it) =>
          it.id === n.itemType ||
          it.code.toLowerCase() === n.itemType.toLowerCase() ||
          it.name.toLowerCase().includes(n.itemType.toLowerCase()) ||
          n.itemType.toLowerCase().includes(it.name.toLowerCase())
      );
      const itemTypeId = isItemUuid
        ? n.itemType.trim()
        : matchedItem?.id || itemTypes[0]?.id || "50000000-0000-4000-8000-000000000001";

      const isUnitUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(n.unit.trim());
      const matchedUnit = units.find(
        (u) =>
          u.id === n.unit ||
          u.code.toLowerCase() === n.unit.toLowerCase() ||
          u.name.toLowerCase().includes(n.unit.toLowerCase()) ||
          n.unit.toLowerCase().includes(u.name.toLowerCase())
      );
      const unitId = isUnitUuid
        ? n.unit.trim()
        : matchedUnit?.id || units[0]?.id || "60000000-0000-4000-8000-000000000001";

      const comboKey = `${itemTypeId}:${unitId}`;
      if (seenNeedKeys.has(comboKey)) {
        // Aggregate target quantity for identical item & unit
        const existing = donationNeeds.find((dn) => `${dn.itemTypeId}:${dn.unitId}` === comboKey);
        if (existing) {
          existing.targetQuantity += Number(n.targetQuantity);
        }
      } else {
        seenNeedKeys.add(comboKey);
        donationNeeds.push({
          itemTypeId,
          unitId,
          targetQuantity: Number(n.targetQuantity),
          notes: `${n.itemType.trim()} (${n.unit.trim()})`,
        });
      }
    }

    // Map volunteer roles to BE DTO schema
    const seenRoleNames = new Set<string>();
    const volunteerRoles: {
      name: string;
      quantity: number;
      description?: string;
    }[] = [];

    for (const r of input.volunteerRoles || []) {
      const cleanName = r.name.trim();
      if (!cleanName || Number(r.requiredQuantity) <= 0) continue;
      if (seenRoleNames.has(cleanName.toLowerCase())) continue;
      seenRoleNames.add(cleanName.toLowerCase());

      volunteerRoles.push({
        name: cleanName,
        quantity: Number(r.requiredQuantity),
        description: r.description?.trim() || `${cleanName} - Vị trí hỗ trợ tình nguyện`,
      });
    }

    const payload = {
      organizationId: input.organizationId,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      location: input.location.trim(),
      contactName: input.contactPerson?.trim() || actor.name,
      contactPhone: input.contactPhone?.trim() || actor.phone || "0905123456",
      startDate: new Date(input.startDate).toISOString(),
      endDate: input.endDate ? new Date(input.endDate).toISOString() : undefined,
      volunteerRoles: volunteerRoles.length > 0 ? volunteerRoles : undefined,
      donationNeeds: donationNeeds.length > 0 ? donationNeeds : undefined,
    };

    // 2. Call BE API POST /api/events
    const createdEvent = await apiClient.post<any, any>("/events", payload);

    if (!createdEvent || !createdEvent.id) {
      throw new Error("Không thể tạo chiến dịch cứu trợ trên máy chủ.");
    }

    // 3. If publishImmediately is checked, publish right away
    if (input.publishImmediately) {
      try {
        await apiClient.patch(`/events/${createdEvent.id}/status`, {
          status: "PUBLISHED",
        });
        createdEvent.status = "PUBLISHED";
      } catch (pubErr: any) {
        console.warn("Event created as DRAFT but failed to publish immediately:", pubErr);
      }
    }

    return mapBeEventToEnriched(createdEvent);
  },

  /**
   * Cập nhật chiến dịch qua BE (PATCH /api/events/:id)
   */
  async update(
    eventId: string,
    updates: Partial<CreateEventInput>,
    actor: User
  ): Promise<EnrichedEvent> {
    const payload: Record<string, any> = {};

    if (updates.title) payload.title = updates.title.trim();
    if (updates.description !== undefined) payload.description = updates.description.trim();
    if (updates.location) payload.location = updates.location.trim();
    if (updates.contactPerson) payload.contactName = updates.contactPerson.trim();
    if (updates.contactPhone) payload.contactPhone = updates.contactPhone.trim();
    if (updates.startDate) payload.startDate = new Date(updates.startDate).toISOString();
    if (updates.endDate) payload.endDate = new Date(updates.endDate).toISOString();

    const updated = await apiClient.patch<any, any>(`/events/${eventId}`, payload);
    return mapBeEventToEnriched(updated);
  },

  /**
   * Thay đổi trạng thái chiến dịch qua BE (PATCH /api/events/:id/status)
   */
  async changeStatus(
    eventId: string,
    targetStatus: EventStatus,
    actor: User
  ): Promise<EnrichedEvent> {
    await apiClient.patch(`/events/${eventId}/status`, { status: targetStatus });
    const refreshed = await this.getById(eventId);
    if (!refreshed) {
      throw new Error("Không thể tải lại thông tin sự kiện sau khi cập nhật trạng thái.");
    }
    return refreshed;
  },

  /**
   * Xóa chiến dịch DRAFT qua BE (DELETE /api/events/:id)
   */
  async delete(eventId: string, _actor: User): Promise<void> {
    await apiClient.delete(`/events/${eventId}`);
  },

  /**
   * Thêm nhu cầu cứu trợ vào chiến dịch DRAFT (POST /api/events/:id/donation-needs)
   */
  async addDonationNeed(
    eventId: string,
    payload: {
      itemTypeId: string;
      unitId: string;
      targetQuantity: number;
      notes?: string;
    }
  ): Promise<any> {
    return apiClient.post(`/events/${eventId}/donation-needs`, {
      itemTypeId: payload.itemTypeId,
      unitId: payload.unitId,
      targetQuantity: Number(payload.targetQuantity),
      notes: payload.notes?.trim(),
    });
  },

  /**
   * Xóa nhu cầu cứu trợ khỏi chiến dịch DRAFT (DELETE /api/events/:id/donation-needs/:needId)
   */
  async removeDonationNeed(eventId: string, needId: string): Promise<any> {
    return apiClient.delete(`/events/${eventId}/donation-needs/${needId}`);
  },
};
