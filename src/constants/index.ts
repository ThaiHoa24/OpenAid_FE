import type { SupportCategory } from "@/types";

export const STORAGE_KEYS = {
  SESSION: "openaid_auth_session_v1",
} as const;

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  "Disaster Relief",
  "Food & Water",
  "Medical Aid",
  "Education",
  "Community Support",
  "Emergency Shelter",
];

export const STATUS_BADGE_STYLES: Record<string, string> = {
  // Event
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  // Application / Org / Evidence
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  DISABLED: "bg-slate-100 text-slate-600 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED_PUBLIC: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED_PUBLIC: "bg-rose-50 text-rose-700 border-rose-200",
  // Donation
  RECEIVED: "bg-teal-50 text-teal-700 border-teal-200",
  IN_BATCH: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DISTRIBUTED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  // Batch
  READY: "bg-teal-50 text-teal-700 border-teal-200",
  ASSIGNED: "bg-purple-50 text-purple-700 border-purple-200",
  // Trip
  SCHEDULED: "bg-sky-50 text-sky-700 border-sky-200",
  PREPARING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_TRANSIT: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // Distribution Point
  ARRIVED: "bg-sky-50 text-sky-700 border-sky-200",
  SKIPPED: "bg-slate-100 text-slate-600 border-slate-200",
};
