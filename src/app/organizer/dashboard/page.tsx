"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Building2, Calendar, HandHeart, Package, 
  Truck, ShieldCheck, ArrowRight, Layers, 
  AlertCircle, CheckCircle2, Clock, Plus, Loader2
} from "lucide-react";

export default function OrganizerDashboardPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await adminService.getOrganizerDashboardSummary(activeOrganization.id);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("organizer.dashboard.accessDenied")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("organizer.dashboard.accessDeniedDesc")}
        </p>
        <button
          onClick={() => loginAsDemo("organizer@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          {t("organizer.dashboard.loginAsOrganizerBtn")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Org Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {activeOrganization?.name || "Tổ Chức Từ Thiện"}
              </h1>
              {activeOrganization && <StatusBadge status={activeOrganization.status} />}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {activeOrganization?.description || "Hệ thống quản lý và điều phối hoạt động thiện nguyện"}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/organizer/events"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t("organizer.dashboard.createEventBtn")}
          </Link>
          <Link
            href="/organizer/batches"
            className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            {t("organizer.dashboard.createBatchBtn")}
          </Link>
          <Link
            href="/organizer/trips"
            className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            {t("organizer.dashboard.scheduleTripBtn")}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-sm">{t("common.loading")}</span>
        </div>
      ) : summary ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Campaigns */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("organizer.dashboard.statEvents")}</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{summary.eventsCount}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("organizer.dashboard.statEventsActive", { count: summary.publishedEventsCount })}
              </div>
            </div>

            {/* Volunteers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("organizer.dashboard.statVolunteers")}</span>
                <HandHeart className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{summary.volunteersApproved}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("organizer.dashboard.statVolunteersPending", { count: summary.volunteersPending })}
              </div>
            </div>

            {/* Batches & Warehouse */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("organizer.dashboard.statBatches")}</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{summary.batchesTotal}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("organizer.dashboard.statBatchesReady", { count: summary.batchesReady })}
              </div>
            </div>

            {/* Distribution Trips */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("organizer.dashboard.statTrips")}</span>
                <Truck className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{summary.tripsTotal}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("organizer.dashboard.statTripsMoving", { count: summary.tripsInTransit })}
              </div>
            </div>
          </div>

          {/* Pending Evidence Attention Banner */}
          {summary.evidencesPendingReview > 0 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-xs text-amber-900">
                  {t("organizer.dashboard.pendingEvidenceAlert", { count: summary.evidencesPendingReview })}
                </div>
              </div>
              <Link
                href="/organizer/transparency"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 text-center"
              >
                {t("organizer.dashboard.reviewNowBtn")}
              </Link>
            </div>
          )}

          {/* Supply Chain In-Kind Fulfillment Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  {t("organizer.dashboard.fulfillmentTitle")}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("organizer.dashboard.fulfillmentSubtitle")}
                </p>
              </div>
              <Link
                href="/organizer/inventory"
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                {t("organizer.dashboard.viewInventoryBtn")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {summary.itemMetrics && summary.itemMetrics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">{t("organizer.dashboard.tableItem")}</th>
                      <th className="py-3 px-4 text-right">{t("organizer.dashboard.tableTarget")}</th>
                      <th className="py-3 px-4 text-right">{t("organizer.dashboard.tablePledged")}</th>
                      <th className="py-3 px-4 text-right">{t("organizer.dashboard.tableReceived")}</th>
                      <th className="py-3 px-4 text-right">{t("organizer.dashboard.tableAvailableReserved")}</th>
                      <th className="py-3 px-4 text-right">{t("organizer.dashboard.tableDistributed")}</th>
                      <th className="py-3 px-4 text-right">{t("organizer.dashboard.tableProgress")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {summary.itemMetrics.map((m: any, idx: number) => {
                      const pct = m.needed > 0 ? Math.min(100, Math.round((m.distributed / m.needed) * 100)) : 100;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {m.itemType} ({m.unit})
                          </td>
                          <td className="py-3 px-4 text-right text-slate-700">{m.needed}</td>
                          <td className="py-3 px-4 text-right text-amber-600">{m.pledged}</td>
                          <td className="py-3 px-4 text-right text-teal-600">{m.received}</td>
                          <td className="py-3 px-4 text-right text-purple-600">
                            {m.available} / {m.reserved}
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-700 font-bold">{m.distributed}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                {t("organizer.dashboard.noGoodsData")}
              </div>
            )}
          </div>

          {/* Quick Management Nav Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/organizer/events"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t("organizer.dashboard.manageEventsCard")}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t("organizer.dashboard.manageEventsDesc")}
              </p>
            </Link>

            <Link
              href="/organizer/volunteers"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-teal-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <HandHeart className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                {t("organizer.dashboard.manageVolunteersCard")}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t("organizer.dashboard.manageVolunteersDesc")}
              </p>
            </Link>

            <Link
              href="/organizer/donations"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-cyan-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                {t("organizer.dashboard.manageDonationsCard")}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t("organizer.dashboard.manageDonationsDesc")}
              </p>
            </Link>

            <Link
              href="/organizer/inventory"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                {t("organizer.dashboard.manageInventoryCard")}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t("organizer.dashboard.manageInventoryDesc")}
              </p>
            </Link>

            <Link
              href="/organizer/batches"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                {t("organizer.dashboard.manageBatchesCard")}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t("organizer.dashboard.manageBatchesDesc")}
              </p>
            </Link>

            <Link
              href="/organizer/trips"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-sky-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                {t("organizer.dashboard.manageTripsCard")}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t("organizer.dashboard.manageTripsDesc")}
              </p>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
