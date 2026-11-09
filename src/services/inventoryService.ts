import apiClient from "@/lib/api/axiosClient";
import type { Event, InventoryItem, Organization } from "@/types";
import { verifyInventoryEquation } from "@/utils";

export interface EnrichedInventoryItem extends InventoryItem {
  event?: Event;
  organization?: Organization;
  isEquationValid: boolean;
}

function mapBeInventory(i: any): EnrichedInventoryItem {
  const item: InventoryItem = {
    id: i.id,
    eventId: i.eventId,
    organizationId: i.organizationId || i.event?.organizationId || "",
    itemType: i.itemType?.name || (typeof i.itemType === "string" ? i.itemType : "") || "Hàng cứu trợ",
    itemTypeId: i.itemTypeId,
    unit: i.unit?.name || (typeof i.unit === "string" ? i.unit : "") || "Phần",
    unitId: i.unitId,
    received: Number(i.receivedTotal ?? i.received ?? 0),
    receivedTotal: Number(i.receivedTotal ?? i.received ?? 0),
    available: Number(i.availableQuantity ?? i.available ?? 0),
    reserved: Number(i.reservedQuantity ?? i.reserved ?? 0),
    distributed: Number(i.distributedQuantity ?? i.distributed ?? 0),
    lostWrittenOff: Number(i.lostWrittenOff ?? 0),
    notes: i.notes,
    updatedAt: i.updatedAt || new Date().toISOString(),
  };

  return {
    ...item,
    event: i.event,
    isEquationValid: verifyInventoryEquation(item),
  };
}

export const inventoryService = {
  /**
   * Lấy dữ liệu tồn kho theo tổ chức từ BE (GET /api/inventory/organization/:orgId)
   */
  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedInventoryItem[]> {
    if (!organizationId || organizationId === "ALL") {
      return [];
    }

    const queryParams = eventId && eventId !== "ALL" ? `?eventId=${eventId}` : "";
    const res = await apiClient.get<any, any[]>(
      `/inventory/organization/${organizationId}${queryParams}`
    );

    if (Array.isArray(res)) {
      return res.map(mapBeInventory);
    }
    return [];
  },

  async getByEvent(eventId: string): Promise<EnrichedInventoryItem[]> {
    return [];
  },
};
