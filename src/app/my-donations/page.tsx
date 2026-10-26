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
  Package, Copy, Check, ExternalLink, Ban, 
  MapPin, Calendar, Clock, AlertCircle, ArrowUpRight, Loader2 
} from "lucide-react";

export default function MyDonationsPage() {
  const { currentUser, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [donations, setDonations] = useState<EnrichedDonation[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, EnrichedEvent>>({});
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await donationService.getByUser(currentUser.id);
      setDonations(list);

      const evMap: Record<string, EnrichedEvent> = {};
      await Promise.all(
        list.map(async (d) => {
          if (!evMap[d.eventId]) {
            const ev = await eventService.getById(d.eventId);
            if (ev) evMap[d.eventId] = ev;
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

  const handleCopy = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(trackingId);
    showToast(`${t("common.copied")}: ${trackingId}`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancel = async (donationId: string) => {
    if (!currentUser) return;
    if (confirm(t("myDonations.confirmCancelAlert"))) {
      try {
        await donationService.cancelMyDonation(donationId, currentUser);
        showToast(t("myDonations.cancelSuccess"), "info");
        loadData();
      } catch (err: any) {
        showToast(err.message || t("common.error"), "error");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("auth.loginTitle")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("myDonations.mustLoginPrompt")}
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

  const filteredDonations = donations.filter((d) => {
    if (filterStatus === "ALL") return true;
    return d.status === filterStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          {t("myDonations.donateMore")}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("myDonations.tabs.all")} (${donations.length})` },
          { key: "PENDING", label: `${t("myDonations.tabs.pledged")} (${donations.filter(d => d.status === "PENDING").length})` },
          { key: "RECEIVED", label: `${t("myDonations.tabs.received")} (${donations.filter(d => d.status === "RECEIVED").length})` },
          { key: "IN_BATCH", label: `${t("myDonations.tabs.inBatch")} (${donations.filter(d => d.status === "IN_BATCH").length})` },
          { key: "DISTRIBUTED", label: `${t("myDonations.tabs.distributed")} (${donations.filter(d => d.status === "DISTRIBUTED").length})` },
          { key: "CANCELLED", label: `${t("myDonations.tabs.cancelled")} (${donations.filter(d => d.status === "CANCELLED").length})` },
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
      ) : filteredDonations.length > 0 ? (
        <div className="space-y-4">
          {filteredDonations.map((item) => {
            const ev = eventsMap[item.eventId];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Top Row: Tracking ID + Status */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold">
                        <span>{item.trackingId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.trackingId)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          title={t("myDonations.copyTrackingCode")}
                        >
                          {copiedId === item.trackingId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    {/* Item Details */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {item.quantity} {item.unit} {item.itemType}
                      </h3>
                      {ev && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {t("myDonations.campaignLabel")}{" "}
                          <Link href={`/events/${ev.id}`} className="font-semibold text-emerald-600 hover:underline">
                            {ev.title}
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {t("myDonations.registeredAt")} {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {item.note && (
                      <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                        <strong className="text-slate-700">{t("myDonations.donorNote")}</strong> {item.note}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="sm:border-l sm:pl-5 border-slate-100 flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                    <Link
                      href={`/tracking?id=${item.trackingId}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t("myDonations.trackJourneyBtn")}
                    </Link>

                    {item.status === "PENDING" && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline cursor-pointer"
                      >
                        <Ban className="w-3 h-3" />
                        {t("myDonations.cancelPledgeBtn")}
                      </button>
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
          <h3 className="text-sm font-semibold text-slate-700">{t("myDonations.noDonationsTitle")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("myDonations.noDonationsDesc")}
          </p>
          <Link
            href="/events"
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {t("myDonations.viewCampaigns")}
          </Link>
        </div>
      )}
    </div>
  );
}
