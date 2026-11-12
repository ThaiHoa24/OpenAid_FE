import { STATUS_BADGE_STYLES } from "@/constants";
import type { InventoryItem } from "@/types";

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatQuantity(qty: number, unit: string): string {
  return `${Number(qty || 0).toLocaleString("en-US")} ${unit}`;
}

export function getStatusBadgeClass(status: string): string {
  return (
    STATUS_BADGE_STYLES[status] ||
    "bg-slate-100 text-slate-700 border-slate-200"
  );
}

export function calculatePercentage(value: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.round((value / target) * 100);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Verifies NFR05 Inventory Equation:
 * Received = Available + Reserved + Distributed + Lost/Written-off
 */
export function verifyInventoryEquation(item: InventoryItem): boolean {
  const sum =
    item.available + item.reserved + item.distributed + item.lostWrittenOff;
  const isValid = Math.abs(item.received - sum) < 0.001;
  if (!isValid && typeof window !== "undefined") {
    console.warn(
      `[OpenAid Data Integrity Warning] Inventory equation mismatch for ${item.itemType} (Event ${item.eventId}): Received (${item.received}) !== Available (${item.available}) + Reserved (${item.reserved}) + Distributed (${item.distributed}) + Lost (${item.lostWrittenOff}) = ${sum}`
    );
  }
  return isValid;
}
