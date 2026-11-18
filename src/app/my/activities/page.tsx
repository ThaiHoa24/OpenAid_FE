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
  Clock, Phone, Mail, Calendar, AlertCircle, Loader2, Filter,
  RotateCcw, ArrowLeft
} from "lucide-react";

export default function MyActivitiesPage() {
  const { user, isLoading: authLoading, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate, formatDateTime } = useTranslation();

  const [applications, setApplications] = useState<EnrichedVolunteerApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const apps = await volunteerService.getByUser(user.id);
      setApplications(apps);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tải danh sách hoạt động", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm space-y-4">
        <HandHeart className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Yêu Cầu Đăng Nhập</h2>
        <p className="text-xs text-slate-500">
          Vui lòng đăng nhập để xem danh sách hoạt động tình nguyện của bạn.
        </p>
        <button
          onClick={() => loginAsDemo("user@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          Đăng nhập nhanh (Demo User)
        </button>
      </div>
    );
  }

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "ALL") return true;
    return app.status === filterStatus;
  });

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === "PENDING").length,
    APPROVED: applications.filter(a => a.status === "APPROVED").length,
    REJECTED: applications.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("myActivities.findMoreEvents")}
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: t("myActivities.tabs.all") },
          { key: "PENDING", label: t("myActivities.tabs.pending") },
          { key: "APPROVED", label: t("myActivities.tabs.approved") },
          { key: "REJECTED", label: t("myActivities.tabs.rejected") },
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
            {tab.label} <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white/80">
              {statusCounts[tab.key as keyof typeof statusCounts]}
            </span>
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
                      {t("myActivities.roleLabel")} <strong>{app.role?.name || "TNV"}</strong>
                    </span>
                    {role && (
                      <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {t("myActivities.quotaLabel", {
                          approved: role.approvedQuantity,
                          required: role.requiredQuantity,
                          remaining,
                        })}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {app.event?.title || "Chiến dịch"}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t("myActivities.campaignLabel")}{" "}
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
                      {t("myActivities.appliedAt")} {formatDate(app.createdAt)}
                    </span>
                  </div>

                  {app.note && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                      <strong className="text-slate-700">{t("myActivities.skillsAndNotes")}</strong> {app.note}
                    </div>
                  )}

                  {/* Attendance timestamps if checked in */}
                  {app.checkedInAt && (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t("myActivities.checkedInTime", { time: formatDateTime(app.checkedInAt) })}</span>
                      {app.checkedOutAt && (
                        <span>• {t("myActivities.checkedOutTime", { time: formatDateTime(app.checkedOutAt) })}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Info */}
                <div className="md:border-l md:pl-6 border-slate-100 flex flex-wrap md:flex-col items-center md:items-end justify-center gap-2 shrink-0">
                  {app.status === "PENDING" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      {t("myActivities.pendingReviewNotice")}
                    </span>
                  ) : app.status === "APPROVED" ? (
                    <div className="space-y-1.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("myActivities.officiallyApprovedBadge")}
                      </span>
                      <Link
                        href={`/events/${app.eventId}`}
                        className="text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer"
                      >
                        {t("myActivities.viewEventDetails")}
                      </Link>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                      {t("myActivities.rejectedBadge")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">
            {filterStatus === "ALL"
              ? t("myActivities.noActivitiesTitle")
              : t("myActivities.noActivitiesFiltered")}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filterStatus === "ALL"
              ? t("myActivities.noActivitiesDesc")
              : t("myActivities.noActivitiesFilteredDesc")}
          </p>
          {filterStatus !== "ALL" && (
            <button
              onClick={() => setFilterStatus("ALL")}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              {t("myActivities.showAllTabs")}
            </button>
          )}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold mt-4"
          >
            {t("myActivities.exploreBtn")}
          </Link>
        </div>
      )}
    </div>
  );
}