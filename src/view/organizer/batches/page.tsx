"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { batchService, type EnrichedBatch } from "@/services/batchService";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Donation } from "@/types";
import { 
  Layers, Plus, CheckCircle2, Truck, 
  Package, X, Loader2, ArrowRight, Filter, AlertCircle 
} from "lucide-react";

export default function OrganizerBatchesPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [batches, setBatches] = useState<EnrichedBatch[]>([]);
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Create Batch Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEventId, setCreateEventId] = useState<string>("");
  const [itemType, setItemType] = useState<string>("Gạo tẻ");
  const [unit, setUnit] = useState<string>("kg");
  const [batchName, setBatchName] = useState<string>("");
  const [eligibleDonations, setEligibleDonations] = useState<Donation[]>([]);
  const [selectedDonationIds, setSelectedDonationIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reconcile Modal
  const [reconcilingBatch, setReconcilingBatch] = useState<EnrichedBatch | null>(null);
  const [recDistributed, setRecDistributed] = useState<number>(0);
  const [recReturned, setRecReturned] = useState<number>(0);
  const [recLost, setRecLost] = useState<number>(0);
  const [recNote, setRecNote] = useState<string>("");

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [bList, evs] = await Promise.all([
        batchService.getByOrganization(activeOrganization.id),
        eventService.getAll({ organizationId: activeOrganization.id, includeDrafts: true }),
      ]);
      setBatches(bList);
      setEvents(evs);
      if (evs.length > 0 && !createEventId) {
        setCreateEventId(evs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization, createEventId]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  // Load eligible donations when creating
  const handleOpenCreateModal = async () => {
    if (events.length === 0) {
      showToast(t("organizer.batches.noEligibleDonations"), "warning");
      return;
    }
    const targetEvId = createEventId || events[0].id;
    setCreateEventId(targetEvId);
    setShowCreateModal(true);
    await fetchEligible(targetEvId, itemType, unit);
  };

  const fetchEligible = async (evId: string, item: string, u: string) => {
    try {
      const donations = await batchService.getEligibleDonations(evId, item, u);
      setEligibleDonations(donations);
      setSelectedDonationIds(donations.map((d) => d.id));
      setBatchName(`${item.toUpperCase().replace(/\s+/g, "_")}_LÔ_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "")}`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectDonation = (id: string) => {
    if (selectedDonationIds.includes(id)) {
      setSelectedDonationIds(selectedDonationIds.filter((x) => x !== id));
    } else {
      setSelectedDonationIds([...selectedDonationIds, id]);
    }
  };

  const totalCalculatedQty = eligibleDonations
    .filter((d) => selectedDonationIds.includes(d.id))
    .reduce((sum, d) => sum + d.quantity, 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeOrganization) return;
    if (selectedDonationIds.length === 0) {
      showToast(t("auth.fillRequired"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await batchService.create({
        name: batchName.trim() || `Lô hàng ${itemType}`,
        eventId: createEventId,
        itemType,
        unit,
        donationIds: selectedDonationIds,
        initialStatus: "READY",
      }, user);

      showToast(t("common.success"), "success");
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkReady = async (batchId: string) => {
    if (!user) return;
    try {
      await batchService.markBatchReady(batchId, user);
      showToast(t("common.success"), "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    }
  };

  const openReconcileModal = (b: EnrichedBatch) => {
    setReconcilingBatch(b);
    setRecDistributed(b.distributedQuantity || b.totalQuantity);
    setRecReturned(0);
    setRecLost(0);
    setRecNote(t("organizer.batches.modalReconcileTitle"));
  };

  const handleReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reconcilingBatch) return;

    if (recDistributed + recReturned + recLost !== reconcilingBatch.totalQuantity) {
      showToast(
        `Total distributed + returned + lost must equal batch total: ${reconcilingBatch.totalQuantity}`,
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await batchService.reconcileBatch(reconcilingBatch.id, {
        returnedQuantity: recReturned,
        lostQuantity: recLost,
        note: recNote,
      }, user);

      showToast(t("common.success"), "success");
      setReconcilingBatch(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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

  const filteredBatches = batches.filter((b) => {
    if (selectedEventId !== "ALL" && b.eventId !== selectedEventId) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-600" />
            {t("organizer.batches.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("organizer.batches.subtitle", { org: activeOrganization?.name || "Da Nang Fund" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t("organizer.batches.createBatchBtn")}
          </button>
        </div>
      </div>

      {/* Batches List */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : filteredBatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredBatches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono font-bold text-xs bg-purple-100 text-purple-900 px-3 py-1 rounded-lg border border-purple-200">
                    {b.batchCode}
                  </span>
                  <StatusBadge status={b.status} />
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {b.itemType}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t("organizer.donations.campaignLabel")}{" "}
                    <Link href={`/events/${b.eventId}`} className="font-semibold text-emerald-600 hover:underline">
                      {b.event?.title || "Campaign"}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-5 text-xs text-slate-600">
                  <span>
                    {t("organizer.batches.totalPacked")} <strong className="text-slate-900">{b.totalQuantity} {b.unit}</strong>
                  </span>
                  <span>
                    {t("organizer.batches.donorSourcesCount", { count: b.donationIds.length })}
                  </span>
                  <span>
                    {t("organizer.batches.actualDistributed")} <strong className="text-emerald-700">{b.distributedQuantity} {b.unit}</strong>
                  </span>
                  {b.currentTrip && (
                    <span className="text-sky-700 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      {t("organizer.batches.assignedToTrip", { code: b.currentTrip.tripCode })}
                    </span>
                  )}
                </div>

                {b.reconciliationNote && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                    <strong className="text-slate-700">{t("organizer.batches.reconcileNoteLabel")}</strong> {b.reconciliationNote}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="md:border-l md:pl-6 border-slate-100 flex flex-wrap md:flex-col items-center md:items-end justify-center gap-2 shrink-0">
                {b.status === "DRAFT" && (
                  <button
                    onClick={() => handleMarkReady(b.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t("organizer.batches.markReadyBtn")}
                  </button>
                )}

                {b.status === "READY" && (
                  <Link
                    href="/organizer/trips"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    {t("organizer.batches.loadToTripBtn")}
                  </Link>
                )}

                {b.status === "ASSIGNED" && (
                  <button
                    onClick={() => openReconcileModal(b)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t("organizer.batches.reconcileBtn")}
                  </button>
                )}

                {b.status === "DISTRIBUTED" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("organizer.batches.fullyDistributedBadge")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("organizer.batches.noBatches")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("organizer.batches.noBatchesDesc")}
          </p>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t("organizer.batches.modalCreateTitle")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t("organizer.batches.modalCreateSubtitle")}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.batches.selectCampaign")}</label>
                  <select
                    value={createEventId}
                    onChange={(e) => {
                      setCreateEventId(e.target.value);
                      fetchEligible(e.target.value, itemType, unit);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 bg-white text-xs"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.batches.itemAndUnit")}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={itemType}
                      onChange={(e) => {
                        setItemType(e.target.value);
                        fetchEligible(createEventId, e.target.value, unit);
                      }}
                      placeholder="Gạo tẻ, Nước khoáng..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs"
                    />
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => {
                        setUnit(e.target.value);
                        fetchEligible(createEventId, itemType, e.target.value);
                      }}
                      placeholder="kg"
                      className="w-20 px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t("organizer.batches.batchCodeNameLabel")}</label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="VD: RICE-BATCH-001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-xs"
                />
              </div>

              {/* Eligible Donations Picker */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {t("organizer.batches.eligibleListTitle", { count: eligibleDonations.length })}
                  </span>
                  <span className="text-purple-700 font-bold">
                    {t("organizer.batches.totalBatchCalculated")} {totalCalculatedQty} {unit}
                  </span>
                </div>

                {eligibleDonations.length > 0 ? (
                  <div className="max-h-52 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    {eligibleDonations.map((d) => {
                      const isChecked = selectedDonationIds.includes(d.id);
                      return (
                        <label
                          key={d.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            isChecked ? "bg-purple-50/80 border-purple-300" : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectDonation(d.id)}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="font-mono font-bold text-slate-800">{d.trackingId}</div>
                              <div className="text-[11px] text-slate-500">{(d as any).donor?.name || "Donor"}</div>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">
                            {d.quantity} {d.unit}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    {t("organizer.batches.noEligibleDonations")}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedDonationIds.length === 0}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  {t("organizer.batches.createBatchSubmitBtn", { qty: totalCalculatedQty, unit })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcilingBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t("organizer.batches.modalReconcileTitle")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{reconcilingBatch.batchCode}</p>
              </div>
              <button
                onClick={() => setReconcilingBatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                {t("organizer.batches.initialBatchTotal")} <strong className="text-purple-900 font-bold">{reconcilingBatch.totalQuantity} {reconcilingBatch.unit}</strong>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t("organizer.batches.distributedQtyLabel", { unit: reconcilingBatch.unit })}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={recDistributed}
                  onChange={(e) => setRecDistributed(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t("organizer.batches.returnedQtyLabel", { unit: reconcilingBatch.unit })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={recReturned}
                    onChange={(e) => setRecReturned(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {t("organizer.batches.returnedQtyHint")}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t("organizer.batches.lostQtyLabel", { unit: reconcilingBatch.unit })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={recLost}
                    onChange={(e) => setRecLost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {t("organizer.batches.lostQtyHint")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t("organizer.batches.reconcileExplanationLabel")}
                </label>
                <textarea
                  rows={3}
                  required
                  value={recNote}
                  onChange={(e) => setRecNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReconcilingBatch(null)}
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
                  {t("organizer.batches.confirmReconcileBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
