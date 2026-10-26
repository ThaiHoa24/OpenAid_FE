"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Calendar, Search, ShieldCheck, CheckCircle2, 
  Ban, MapPin, Users, Package, ArrowUpRight, Loader2, AlertCircle 
} from "lucide-react";

export default function AdminEventsPage() {
  const { user, isAdmin, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await eventService.getAll({
        search,
        status: filterStatus === "ALL" ? undefined : filterStatus,
        includeDrafts: true,
      });
      setEvents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  const handleStatusChange = async (eventId: string, newStatus: any) => {
    if (!user) return;
    try {
      await eventService.changeStatus(eventId, newStatus, user);
      showToast(t("common.saveSuccess"), "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("admin.dashboard.accessDenied")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("admin.dashboard.accessDeniedDesc")}
        </p>
        <button
          onClick={() => loginAsDemo("admin@openaid.demo")}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          {t("admin.dashboard.loginAsAdminBtn")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-600" />
            {t("admin.events.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("admin.events.subtitle")}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.events.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("admin.events.tabs.all")} (${events.length})` },
          { key: "PUBLISHED", label: `${t("admin.events.tabs.published")} (${events.filter(e => e.status === "PUBLISHED").length})` },
          { key: "DRAFT", label: `${t("admin.events.tabs.draft")} (${events.filter(e => e.status === "DRAFT").length})` },
          { key: "CLOSED", label: `${t("admin.events.tabs.closed")} (${events.filter(e => e.status === "CLOSED").length})` },
          { key: "CANCELLED", label: `${t("admin.events.tabs.cancelled")} (${events.filter(e => e.status === "CANCELLED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterStatus === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge status={ev.status} />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {t(`categories.${ev.category}`)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {t("admin.events.areaLabel", { area: ev.area })}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{ev.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t("admin.events.organizationLabel", { name: ev.organization?.name || "Tổ chức từ thiện" })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {ev.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(ev.startDate)} - {formatDate(ev.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {t("admin.events.volunteersCount", { approved: ev.totalApprovedVolunteers, required: ev.totalRequiredVolunteers })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    {t("admin.events.donationsCount", { count: ev.donationsCount })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:border-l md:pl-6 border-slate-100 flex flex-wrap md:flex-col items-center md:items-end justify-center gap-2 shrink-0">
                <Link
                  href={`/events/${ev.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  {t("admin.events.viewPublicBtn")}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                {ev.status === "PUBLISHED" && (
                  <button
                    onClick={() => handleStatusChange(ev.id, "CLOSED")}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {t("admin.events.pauseCampaignBtn")}
                  </button>
                )}

                {ev.status === "CLOSED" && (
                  <button
                    onClick={() => handleStatusChange(ev.id, "PUBLISHED")}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("admin.events.reopenCampaignBtn")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("admin.events.noEventsFound")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("admin.events.noEventsDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
