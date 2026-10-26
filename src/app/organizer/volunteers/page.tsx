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
  HandHeart, UserCheck, XCircle, CheckCircle2, 
  Clock, Phone, Mail, Calendar, AlertCircle, Loader2, Filter 
} from "lucide-react";

export default function OrganizerVolunteersPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate, formatDateTime } = useTranslation();

  const [applications, setApplications] = useState<EnrichedVolunteerApplication[]>([]);
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [apps, evs] = await Promise.all([
        volunteerService.getByOrganization(activeOrganization.id),
        eventService.getAll({ organizationId: activeOrganization.id, includeDrafts: true }),
      ]);
      setApplications(apps);
      setEvents(evs);
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

  const handleReview = async (applicationId: string, status: "APPROVED" | "REJECTED") => {
    if (!user) return;
    try {
      await volunteerService.reviewApplication(applicationId, status, user);
      showToast(
        t("common.success"),
        status === "APPROVED" ? "success" : "info"
      );
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    }
  };

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <HandHeart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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

  const filteredApplications = applications.filter((app) => {
    if (selectedEventId !== "ALL" && app.eventId !== selectedEventId) return false;
    if (filterStatus !== "ALL" && app.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <HandHeart className="w-7 h-7 text-emerald-600" />
            {t("organizer.volunteers.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("organizer.volunteers.subtitle", { org: activeOrganization?.name || "Da Nang Fund" })}
          </p>
        </div>

        {/* Filter by Event dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="ALL">{t("organizer.volunteers.filterAllEvents")} ({events.length})</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("organizer.volunteers.tabs.all")} (${applications.length})` },
          { key: "PENDING", label: `${t("organizer.volunteers.tabs.pending")} (${applications.filter(a => a.status === "PENDING").length})` },
          { key: "APPROVED", label: `${t("organizer.volunteers.tabs.approved")} (${applications.filter(a => a.status === "APPROVED").length})` },
          { key: "REJECTED", label: `${t("organizer.volunteers.tabs.rejected")} (${applications.filter(a => a.status === "REJECTED").length})` },
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

      {/* Applications List */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const role = app.role;
            const remaining = role ? Math.max(0, role.requiredQuantity - role.approvedQuantity) : 0;
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={app.status} />
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {t("organizer.volunteers.roleLabel")} <strong>{app.role?.name || "TNV"}</strong>
                    </span>
                    {role && (
                      <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {t("organizer.volunteers.quotaLabel", {
                          approved: role.approvedQuantity,
                          required: role.requiredQuantity,
                          remaining,
                        })}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {app.user?.name || "TNV"}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t("organizer.volunteers.campaignLabel")}{" "}
                      <Link href={`/events/${app.eventId}`} className="font-semibold text-emerald-600 hover:underline">
                        {app.event?.title || "Event"}
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-y-1 gap-x-5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {app.user?.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {app.user?.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {t("organizer.volunteers.appliedAt")} {formatDate(app.createdAt)}
                    </span>
                  </div>

                  {app.note && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                      <strong className="text-slate-700">{t("organizer.volunteers.skillsAndNotes")}</strong> {app.note}
                    </div>
                  )}

                  {/* Attendance timestamps if checked in */}
                  {app.checkedInAt && (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t("organizer.volunteers.checkedInTime", { time: formatDateTime(app.checkedInAt) })}</span>
                      {app.checkedOutAt && (
                        <span>• {t("organizer.volunteers.checkedOutTime", { time: formatDateTime(app.checkedOutAt) })}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="md:border-l md:pl-6 border-slate-100 flex flex-wrap md:flex-col items-center md:items-end justify-center gap-2 shrink-0">
                  {app.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => handleReview(app.id, "APPROVED")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        {t("organizer.volunteers.acceptBtn")}
                      </button>
                      <button
                        onClick={() => handleReview(app.id, "REJECTED")}
                        className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        {t("organizer.volunteers.rejectBtn")}
                      </button>
                    </>
                  ) : app.status === "APPROVED" ? (
                    <div className="space-y-1.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("organizer.volunteers.officiallyApprovedBadge")}
                      </span>
                      <div>
                        <button
                          onClick={() => handleReview(app.id, "REJECTED")}
                          className="text-[11px] text-slate-400 hover:text-rose-600 hover:underline cursor-pointer"
                        >
                          {t("organizer.volunteers.revokeApprovalBtn")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                      {t("organizer.volunteers.rejectedBadge")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("organizer.volunteers.noApplications")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("organizer.volunteers.noApplicationsDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
