"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { donationService, type EnrichedDonation } from "@/services/donationService";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Package, Check, Copy, ExternalLink, X,
  CheckCircle2, XCircle, Clock, Filter, AlertCircle, Loader2, ArrowRight,
  RotateCcw, Trash2
} from "lucide-react";

export default function MyDonationsPage() {
  const { user, isLoading: authLoading, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [donations, setDonations] = useState<EnrichedDonation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await donationService.getByUser(user.id);
      setDonations(list);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tải danh sách quyên góp", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(trackingId);
    showToast(`${t("common.copied")}: ${trackingId}`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancel = async (donationId: string) => {
    if (!user) return;
    if (!confirm(t("myDonations.confirmCancelAlert"))) return;
    setCancellingId(donationId);
    try {
      await donationService.cancelMyDonation(donationId, user);
      showToast(t("myDonations.cancelSuccess"), "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{t("myDonations.mustLoginPrompt")}</h2>
        <p className="text-xs text-slate-500">
          Vui lòng đăng nhập để xem danh sách quyên góp của bạn.
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

  const filteredDonations = donations.filter((d) => {
    if (filterStatus === "ALL") return true;
    return d.status === filterStatus;
  });

  const statusCounts = {
    ALL: donations.length,
    PENDING: donations.filter(d => d.status === "PENDING").length,
    RECEIVED: donations.filter(d => d.status === "RECEIVED").length,
    IN_BATCH: donations.filter(d => d.status === "IN_BATCH").length,
    DISTRIBUTED: donations.filter(d => d.status === "DISTRIBUTED").length,
    CANCELLED: donations.filter(d => d.status === "CANCELLED").length,
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600" />
            {t("myDonations.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("myDonations.subtitle")}
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          {t("myDonations.donateMore")}
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: t("myDonations.tabs.all") },
          { key: "PENDING", label: t("myDonations.tabs.pledged") },
          { key: "RECEIVED", label: t("myDonations.tabs.received") },
          { key: "IN_BATCH", label: t("myDonations.tabs.inBatch") },
          { key: "DISTRIBUTED", label: t("myDonations.tabs.distributed") },
          { key: "CANCELLED", label: t("myDonations.tabs.cancelled") },
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

      {/* Donations List */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : filteredDonations.length > 0 ? (
        <div className="space-y-4">
          {filteredDonations.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold">
                    <span>{d.trackingId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(d.trackingId)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title={t("common.copy")}
                    >
                      {copiedId === d.trackingId ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <StatusBadge status={d.status} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {d.quantity} {d.unit} {d.itemType}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t("myDonations.campaignLabel")}{" "}
                    <Link href={`/events/${d.eventId}`} className="font-semibold text-emerald-600 hover:underline">
                      {d.event?.title || "Chiến dịch"}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {t("myDonations.registeredAt")} {formatDate(d.createdAt)}
                  </span>
                  {d.receivedAt && (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {t("myDonations.receivedAt")} {formatDate(d.receivedAt)}
                    </span>
                  )}
                </div>

                {d.note && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                    <strong className="text-slate-700">{t("myDonations.donorNote")}</strong> {d.note}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="md:border-l md:pl-6 border-slate-100 flex flex-wrap md:flex-col items-center md:items-end justify-center gap-2 shrink-0">
                <Link
                  href={`/track/${d.trackingId}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("myDonations.trackJourneyBtn")}
                </Link>

                {d.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(d.id)}
                    disabled={cancellingId === d.id}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {cancellingId === d.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {t("myDonations.cancelPledgeBtn")}
                  </button>
                )}

                {d.status === "RECEIVED" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("myDonations.receivedBadge")}
                  </span>
                )}

                {d.status === "IN_BATCH" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    <Package className="w-3.5 h-3.5" />
                    {t("myDonations.inBatchBadge")}
                  </span>
                )}

                {d.status === "DISTRIBUTED" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("myDonations.distributedBadge")}
                  </span>
                )}

                {d.status === "CANCELLED" && (
                  <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    {t("myDonations.cancelledBadge")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">
            {filterStatus === "ALL"
              ? t("myDonations.noDonationsTitle")
              : t("myDonations.noDonationsFiltered")}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filterStatus === "ALL"
              ? t("myDonations.noDonationsDesc")
              : t("myDonations.noDonationsFilteredDesc")}
          </p>
          {filterStatus !== "ALL" && (
            <button
              onClick={() => setFilterStatus("ALL")}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              {t("myDonations.showAllTabs")}
            </button>
          )}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold mt-4"
          >
            {t("myDonations.viewCampaigns")}
          </Link>
        </div>
      )}
    </div>
  );
}