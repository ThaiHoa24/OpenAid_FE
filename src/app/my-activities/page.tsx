"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { volunteerService, type EnrichedVolunteerApplication } from "@/services/volunteerService";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  HandHeart, Calendar, MapPin, Clock, CheckCircle2, 
  UserCheck, AlertCircle, ArrowUpRight, Loader2 
} from "lucide-react";

export default function MyActivitiesPage() {
  const { currentUser, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate, formatDateTime } = useTranslation();

  const [applications, setApplications] = useState<EnrichedVolunteerApplication[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, EnrichedEvent>>({});
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const userApps = await volunteerService.getByUser(currentUser.id);
      setApplications(userApps);

      const evMap: Record<string, EnrichedEvent> = {};
      await Promise.all(
        userApps.map(async (app) => {
          if (!evMap[app.eventId]) {
            const ev = await eventService.getById(app.eventId);
            if (ev) evMap[app.eventId] = ev;
          }
        })
      );
      setEventsMap(evMap);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  const handleCheckIn = async (appId: string) => {
    if (!currentUser) return;
    try {
      await volunteerService.checkIn(appId, currentUser);
      showToast(t("common.success"), "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    }
  };

  const handleCheckOut = async (appId: string) => {
    if (!currentUser) return;
    try {
      await volunteerService.checkOut(appId, currentUser);
      showToast(t("common.success"), "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <HandHeart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("auth.loginTitle")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("myActivities.mustLoginPrompt")}
        </p>
        <button
          onClick={() => loginAsDemo("user@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          {t("myActivities.loginDemoBtn")}
        </button>
      </div>
    );
  }

  const filteredApps = applications.filter((app) => {
    if (filterStatus === "ALL") return true;
    return app.status === filterStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <HandHeart className="w-7 h-7 text-emerald-600" />
            {t("myActivities.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("myActivities.subtitle")}
          </p>
        </div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          {t("myActivities.findMoreEvents")}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("myActivities.tabs.all")} (${applications.length})` },
          { key: "PENDING", label: `${t("myActivities.tabs.pending")} (${applications.filter(a => a.status === "PENDING").length})` },
          { key: "APPROVED", label: `${t("myActivities.tabs.approved")} (${applications.filter(a => a.status === "APPROVED").length})` },
          { key: "REJECTED", label: `${t("myActivities.tabs.rejected")} (${applications.filter(a => a.status === "REJECTED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filterStatus === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const ev = eventsMap[app.eventId];
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={app.status} />
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t("myActivities.roleLabel")} {app.role?.name || "TNV"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                      {ev ? (
                        <Link href={`/events/${ev.id}`}>
                          {ev.title}
                        </Link>
                      ) : (
                        "Event"
                      )}
                    </h3>

                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500">
                      {ev && (
                        <>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {ev.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(ev.startDate)}
                          </span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {t("myActivities.appliedAt")} {formatDate(app.createdAt)}
                      </span>
                    </div>

                    {app.note && (
                      <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                        <strong className="text-slate-700">{t("myActivities.myNotes")}</strong> {app.note}
                      </div>
                    )}
                  </div>

                  {/* Actions / Check-in */}
                  <div className="sm:border-l sm:pl-5 border-slate-100 flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                    {app.status === "APPROVED" && (
                      <div className="space-y-2 w-full sm:w-auto">
                        {!app.checkedInAt ? (
                          <button
                            onClick={() => handleCheckIn(app.id)}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" />
                            {t("myActivities.checkInBtn")}
                          </button>
                        ) : !app.checkedOutAt ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t("myActivities.checkedInAt", { time: formatDateTime(app.checkedInAt) })}
                            </span>
                            <button
                              onClick={() => handleCheckOut(app.id)}
                              className="w-full block px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors text-center cursor-pointer"
                            >
                              {t("myActivities.checkOutBtn")}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-right text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t("myActivities.completedShift")}
                            </span>
                            <div>{t("myActivities.checkInTime", { time: formatDateTime(app.checkedInAt) })}</div>
                            <div>{t("myActivities.checkOutTime", { time: formatDateTime(app.checkedOutAt) })}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {app.status === "PENDING" && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {t("myActivities.pendingReviewNotice")}
                      </span>
                    )}

                    {app.status === "REJECTED" && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {t("myActivities.rejectedNotice")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("myActivities.noActivitiesTitle")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("myActivities.noActivitiesDesc")}
          </p>
          <Link
            href="/events"
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {t("myActivities.exploreBtn")}
          </Link>
        </div>
      )}
    </div>
  );
}
