"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { transparencyService, type EnrichedEvidence } from "@/services/transparencyService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { TransparencyLog } from "@/types";
import { 
  ShieldCheck, Image as ImageIcon, CheckCircle2, 
  XCircle, Clock, Eye, AlertCircle, Loader2, Filter, History 
} from "lucide-react";

export default function OrganizerTransparencyPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate, formatDateTime } = useTranslation();

  const [activeTab, setActiveTab] = useState<"EVIDENCE" | "LOGS">("EVIDENCE");
  const [evidences, setEvidences] = useState<EnrichedEvidence[]>([]);
  const [logs, setLogs] = useState<TransparencyLog[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<EnrichedEvidence | null>(null);

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [evList, logList] = await Promise.all([
        transparencyService.getEvidences({ organizationId: activeOrganization.id }),
        transparencyService.getLogs({ organizationId: activeOrganization.id }),
      ]);
      setEvidences(evList);
      setLogs(logList);
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

  const handleReviewEvidence = async (evidenceId: string, approvePublic: boolean) => {
    if (!user) return;
    try {
      await transparencyService.reviewEvidence(
        evidenceId,
        approvePublic,
        user
      );
      showToast(
        approvePublic ? t("common.saveSuccess") : t("common.updateSuccess"),
        approvePublic ? "success" : "info"
      );
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    }
  };

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("common.accessDenied")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("common.organizerOnly")}
        </p>
        <button
          onClick={() => loginAsDemo("organizer@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          {t("auth.demoOrganizer")}
        </button>
      </div>
    );
  }

  const filteredEvidences = evidences.filter((ev) => {
    if (filterStatus === "ALL") return true;
    return ev.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            {t("organizer.transparency.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("organizer.transparency.subtitle", { org: activeOrganization?.name || "" })}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("EVIDENCE")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "EVIDENCE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            {t("organizer.transparency.tabEvidence", { count: evidences.length })}
          </button>
          <button
            onClick={() => setActiveTab("LOGS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "LOGS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            {t("organizer.transparency.tabLogs", { count: logs.length })}
          </button>
        </div>
      </div>

      {activeTab === "EVIDENCE" ? (
        <div className="space-y-6">
          {/* Status filter tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
            {[
              { key: "ALL", label: `${t("organizer.transparency.tabs.all")} (${evidences.length})` },
              { key: "PENDING_REVIEW", label: `${t("organizer.transparency.tabs.pending")} (${evidences.filter(e => e.status === "PENDING_REVIEW").length})` },
              { key: "APPROVED_PUBLIC", label: `${t("organizer.transparency.tabs.approved")} (${evidences.filter(e => e.status === "APPROVED_PUBLIC").length})` },
              { key: "REJECTED_PUBLIC", label: `${t("organizer.transparency.tabs.rejected")} (${evidences.filter(e => e.status === "REJECTED_PUBLIC").length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterStatus === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Evidence Grid */}
          {isLoading ? (
            <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs">{t("common.loading")}</span>
            </div>
          ) : filteredEvidences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvidences.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div 
                      onClick={() => setPreviewPhoto(ev)}
                      className="relative aspect-video bg-slate-100 cursor-pointer overflow-hidden group"
                    >
                      <img
                        src={ev.imageUrl}
                        alt={ev.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <Eye className="w-4 h-4" />
                        {t("organizer.transparency.viewFullPhoto")}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={ev.status} />
                        <span className="text-[11px] text-slate-400">{formatDate(ev.uploadedAt)}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{ev.caption}</h4>

                      <div className="space-y-1 text-xs text-slate-500">
                        <div>{t("organizer.transparency.pointLabel")} <strong className="text-slate-700">{ev.distributionPoint?.name || "Điểm phát"}</strong></div>
                        <div>{t("organizer.transparency.tripLabel")} <strong className="text-sky-700 font-mono">{ev.trip?.tripCode}</strong></div>
                        <div>{t("organizer.transparency.uploadedByLabel")} <span className="text-slate-800 font-medium">{ev.uploadedByName}</span></div>
                      </div>

                      {ev.privacyConfirmed && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {t("organizer.transparency.privacyCommittedBadge")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    {ev.status === "PENDING_REVIEW" ? (
                      <>
                        <button
                          onClick={() => handleReviewEvidence(ev.id, true)}
                          className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("organizer.transparency.approvePublicBtn")}
                        </button>
                        <button
                          onClick={() => handleReviewEvidence(ev.id, false)}
                          className="py-1.5 px-3 bg-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                        >
                          {t("organizer.transparency.rejectPublicBtn")}
                        </button>
                      </>
                    ) : ev.status === "APPROVED_PUBLIC" ? (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("organizer.transparency.shownOnTrackingBadge")}
                        </span>
                        <button
                          onClick={() => handleReviewEvidence(ev.id, false)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 hover:underline"
                        >
                          {t("organizer.transparency.revokeApprovalBtn")}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs text-slate-400">{t("organizer.transparency.rejectedStatusLabel")}</span>
                        <button
                          onClick={() => handleReviewEvidence(ev.id, true)}
                          className="text-[11px] text-indigo-600 hover:underline font-semibold"
                        >
                          {t("organizer.transparency.reApproveBtn")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">{t("organizer.transparency.noEvidences")}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t("organizer.transparency.noEvidencesDesc")}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Logs Tab */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t("organizer.transparency.tableTime")}</th>
                  <th className="py-3.5 px-4">{t("organizer.transparency.tableActor")}</th>
                  <th className="py-3.5 px-4">{t("organizer.transparency.tableAction")}</th>
                  <th className="py-3.5 px-4">{t("organizer.transparency.tableEntity")}</th>
                  <th className="py-3.5 px-4">{t("organizer.transparency.tableDetails")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {formatDateTime(l.timestamp)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{l.actorName}</div>
                      <div className="text-[10px] text-slate-400">{l.actorRole}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {l.entityType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      {l.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-scaleUp">
            <div className="relative aspect-video bg-black">
              <img
                src={previewPhoto.imageUrl}
                alt={previewPhoto.caption}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 sm:p-6 bg-white flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{previewPhoto.caption}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDateTime(previewPhoto.uploadedAt)} • {previewPhoto.uploadedByName}
                </p>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
