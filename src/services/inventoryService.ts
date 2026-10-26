import { storageService } from "./storageService";
import type { Event, InventoryItem, Organization } from "@/types";
import { delay, verifyInventoryEquation } from "@/utils";

export interface EnrichedInventoryItem extends InventoryItem {
  event?: Event;
  organization?: Organization;
  isEquationValid: boolean;
}

function enrichInventory(item: InventoryItem): EnrichedInventoryItem {
  const db = storageService.getDb();
  const event = db.events.find((e) => e.id === item.eventId);
  const organization = db.organizations.find((o) => o.id === item.organizationId);
  const isEquationValid = verifyInventoryEquation(item);

  return {
    ...item,
    event,
    organization,
    isEquationValid,
  };
}

export const inventoryService = {
  async getByOrganization(
    organizationId?: string,
    eventId?: string
  ): Promise<EnrichedInventoryItem[]> {
    await delay(200);
    const db = storageService.getDb();
    let list = db.inventory;

    if (organizationId && organizationId !== "ALL") {
      list = list.filter((i) => i.organizationId === organizationId);
    }
    if (eventId && eventId !== "ALL") {
      list = list.filter((i) => i.eventId === eventId);
    }

    return list.map(enrichInventory);
  },

  async getByEvent(eventId: string): Promise<EnrichedInventoryItem[]> {
    await delay(160);
    const db = storageService.getDb();
    return db.inventory
      .filter((i) => i.eventId === eventId)
      .map(enrichInventory);
  },
};
