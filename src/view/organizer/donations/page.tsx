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
  CheckCircle2, XCircle, Clock, Filter, AlertCircle, Loader2, ArrowRight 
} from "lucide-react";

export default function OrganizerDonationsPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [donations, setDonations] = useState<EnrichedDonation[]>([]);
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Confirm Received Modal
  const [confirmingDonation, setConfirmingDonation] = useState<EnrichedDonation | null>(null);
  const [actualQty, setActualQty] = useState<number>(0);
  const [receiptNote, setReceiptNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [list, evs] = await Promise.all([
        donationService.getByOrganization(activeOrganization.id),
        eventService.getAll({ organizationId: activeOrganization.id, includeDrafts: true }),
      ]);
      setDonations(list);
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

  const handleCopy = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(trackingId);
    showToast(`${t("common.copied")}: ${trackingId}`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openConfirmModal = (d: EnrichedDonation) => {
    setConfirmingDonation(d);
    setActualQty(d.quantity);
    setReceiptNote(t("organizer.donations.receiptNoteLabel"));
  };

  const handleConfirmReceivedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !confirmingDonation) return;
    if (actualQty <= 0) {
      showToast(t("auth.fillRequired"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await donationService.confirmReceived(
        confirmingDonation.id,
        user
      );
      showToast(t("common.success"), "success");
      setConfirmingDonation(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (donationId: string) => {
    if (!user) return;
    const reason = prompt(t("organizer.donations.promptRejectReason"), t("organizer.donations.defaultRejectReason"));
    if (reason === null) return;
    try {
      await donationService.rejectDonation(donationId, user, reason);
      showToast(t("common.info"), "info");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    }
  };

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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

  const filteredDonations = donations.filter((d) => {
    if (selectedEventId !== "ALL" && d.eventId !== selectedEventId) return false;
    if (filterStatus !== "ALL" && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600" />
            {t("organizer.donations.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("organizer.donations.subtitle", { org: activeOrganization?.name || "Da Nang Fund" })}
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
            <option value="ALL">{t("organizer.donations.filterAllEvents")} ({events.length})</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("organizer.donations.tabs.all")} (${donations.length})` },
          { key: "PENDING", label: `${t("organizer.donations.tabs.pending")} (${donations.filter(d => d.status === "PENDING").length})` },
          { key: "RECEIVED", label: `${t("organizer.donations.tabs.received")} (${donations.filter(d => d.status === "RECEIVED").length})` },
          { key: "IN_BATCH", label: `${t("organizer.donations.tabs.inBatch")} (${donations.filter(d => d.status === "IN_BATCH").length})` },
          { key: "DISTRIBUTED", label: `${t("organizer.donations.tabs.distributed")} (${donations.filter(d => d.status === "DISTRIBUTED").length})` },
          { key: "REJECTED", label: `${t("organizer.donations.tabs.rejected")} (${donations.filter(d => d.status === "REJECTED").length})` },
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
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                    {t("organizer.donations.donorLabel")} <strong className="text-slate-800">{d.donor?.name || "Donor"}</strong> ({d.donor?.phone || d.donor?.email})
                  </div>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-5 text-xs text-slate-500">
                  <span>
                    {t("organizer.donations.campaignLabel")}{" "}
                    <Link href={`/events/${d.eventId}`} className="font-semibold text-emerald-600 hover:underline">
                      {d.event?.title || "Campaign"}
                    </Link>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {t("organizer.donations.registeredAt")} {formatDate(d.createdAt)}
                  </span>
                </div>

                {d.note && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                    <strong className="text-slate-700">{t("organizer.donations.donorNotes")}</strong> {d.note}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="md:border-l md:pl-6 border-slate-100 flex flex-wrap md:flex-col items-center md:items-end justify-center gap-2 shrink-0">
                <Link
                  href={`/track/${d.trackingId}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("organizer.donations.publicTrackingBtn")}
                </Link>

                {d.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => openConfirmModal(d)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t("organizer.donations.confirmReceivedBtn")}
                    </button>
                    <button
                      onClick={() => handleReject(d.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      {t("organizer.donations.rejectNotReceivedBtn")}
                    </button>
                  </>
                )}

                {d.status === "RECEIVED" && (
                  <Link
                    href="/organizer/batches"
                    className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t("organizer.donations.bundleBatchBtn")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("organizer.donations.noDonations")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("organizer.donations.noDonationsDesc")}
          </p>
        </div>
      )}

      {/* Confirm Received Modal */}
      {confirmingDonation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t("organizer.donations.modalTitle")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{confirmingDonation.trackingId}</p>
              </div>
              <button
                onClick={() => setConfirmingDonation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceivedSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                <div className="text-slate-700">{t("organizer.donations.modalItem")} <strong className="text-slate-900">{confirmingDonation.itemType}</strong></div>
                <div className="text-slate-700">{t("organizer.donations.modalPledged")} <strong className="text-emerald-700">{confirmingDonation.quantity} {confirmingDonation.unit}</strong></div>
                <div className="text-slate-700">{t("organizer.donations.modalDonor")} <strong>{confirmingDonation.donor?.name}</strong></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t("organizer.donations.actualQtyLabel", { unit: confirmingDonation.unit })}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={actualQty}
                  onChange={(e) => setActualQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {t("organizer.donations.actualQtyHint")}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t("organizer.donations.receiptNoteLabel")}
                </label>
                <textarea
                  rows={3}
                  required
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingDonation(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {t("organizer.donations.saveAndStockBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
