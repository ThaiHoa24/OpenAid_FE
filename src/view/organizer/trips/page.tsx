"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { tripService, type EnrichedTrip } from "@/services/tripService";
import { batchService, type EnrichedBatch } from "@/services/batchService";
import { volunteerService, type EnrichedVolunteerApplication } from "@/services/volunteerService";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { transparencyService } from "@/services/transparencyService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Truck, Plus, MapPin, Users, Package, 
  CheckCircle2, Clock, AlertCircle, X, 
  Loader2, ArrowRight, Play, Camera, ShieldCheck, Ban 
} from "lucide-react";

export default function OrganizerTripsPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [trips, setTrips] = useState<EnrichedTrip[]>([]);
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Create Trip Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEventId, setCreateEventId] = useState<string>("");
  const [tripName, setTripName] = useState<string>("");
  const [departurePoint, setDeparturePoint] = useState<string>("Kho Tổng OpenAid, 254 Nguyễn Văn Linh, Đà Nẵng");
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [readyBatches, setReadyBatches] = useState<EnrichedBatch[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [approvedVolunteers, setApprovedVolunteers] = useState<EnrichedVolunteerApplication[]>([]);
  const [assignedVolunteers, setAssignedVolunteers] = useState<{ applicationId: string; userId: string; role: "LEADER" | "MEMBER" }[]>([]);
  const [leaderUserId, setLeaderUserId] = useState<string>("");
  const [distributionPoints, setDistributionPoints] = useState<{ name: string; address: string; plannedHouseholds: number }[]>([
    { name: "Thôn Thạch Bồ", address: "Xã Hòa Phong, Huyện Hòa Vang", plannedHouseholds: 80 },
    { name: "Thôn Cẩm Toại", address: "Xã Hòa Phong, Huyện Hòa Vang", plannedHouseholds: 60 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Record Distribution Modal State
  const [recordingPoint, setRecordingPoint] = useState<{ trip: EnrichedTrip; point: any } | null>(null);
  const [distQty, setDistQty] = useState<number>(50);
  const [distNote, setDistNote] = useState<string>("Bà con trật tự nhận quà theo danh sách thôn");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&auto=format&fit=crop&q=80");
  const [evidenceCaption, setEvidenceCaption] = useState<string>("Bàn giao quà cứu trợ tại nhà văn hóa thôn");
  const [privacyConfirmed, setPrivacyConfirmed] = useState<boolean>(true);
  const [selectedRecordBatchId, setSelectedRecordBatchId] = useState<string>("");

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [tList, evs] = await Promise.all([
        tripService.getByOrganization(activeOrganization.id),
        eventService.getAll({ organizationId: activeOrganization.id, includeDrafts: true }),
      ]);
      setTrips(tList);
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

  // When opening create modal, load ready batches and approved volunteers
  const handleOpenCreateModal = async () => {
    if (events.length === 0) {
      showToast(t("organizer.trips.noReadyBatchesAlert"), "warning");
      return;
    }
    const targetEvId = createEventId || events[0].id;
    setCreateEventId(targetEvId);
    setShowCreateModal(true);
    await fetchTripDependencies(targetEvId);
  };

  const fetchTripDependencies = async (evId: string) => {
    try {
      const [batches, vols] = await Promise.all([
        batchService.getReadyBatchesForEvent(evId),
        volunteerService.getApprovedVolunteersForEvent(evId),
      ]);
      setReadyBatches(batches);
      setSelectedBatchIds(batches.map((b) => b.id));
      setApprovedVolunteers(vols);

      if (vols.length > 0) {
        setLeaderUserId(vols[0].userId);
        setAssignedVolunteers(vols.map((v, i) => ({
          applicationId: v.id,
          userId: v.userId,
          role: i === 0 ? "LEADER" : "MEMBER",
        })));
      } else {
        setLeaderUserId(user?.id || "");
      }

      setTripName(`CHUYẾN_XE_CỨU_TRỢ_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "")}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeOrganization) return;
    if (selectedBatchIds.length === 0) {
      showToast(t("organizer.trips.selectReadyBatchesTitle", { count: 0 }), "error");
      return;
    }
    if (distributionPoints.length === 0) {
      showToast(t("organizer.trips.scheduleDestinationsTitle", { count: 0 }), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await tripService.create({
        name: tripName.trim() || "Chuyến xe cứu trợ",
        eventId: createEventId,
        departurePoint,
        scheduledDate,
        batchIds: selectedBatchIds,
        leaderUserId: leaderUserId || user.id,
        volunteerApplicationIds: approvedVolunteers.map((v) => v.id),
        distributionPoints: distributionPoints.map((pt) => ({
          name: pt.name,
          address: pt.address,
          plannedHouseholds: pt.plannedHouseholds,
        })),
      }, user);

      showToast(t("common.saveSuccess"), "success");
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Trip Status (e.g. PREPARING -> IN_TRANSIT -> COMPLETED)
  const handleUpdateTripStatus = async (tripId: string, nextStatus: any) => {
    if (!user) return;
    try {
      await tripService.updateTripStatus(tripId, nextStatus, user);
      showToast(t("common.saveSuccess"), "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    }
  };

  // Update Point Status
  const handleUpdatePointStatus = async (pointId: string, nextStatus: any) => {
    if (!user) return;
    try {
      await tripService.updatePointStatus(pointId, nextStatus, user);
      showToast(t("common.saveSuccess"), "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    }
  };

  // Cancel Trip
  const handleCancelTrip = async (tripId: string) => {
    if (!user) return;
    const reason = prompt(
      t("organizer.trips.promptCancelReason"),
      t("organizer.trips.defaultCancelReason")
    );
    if (reason === null) return;
    try {
      await tripService.updateTripStatus(tripId, "CANCELLED", user, { cancelReason: reason });
      showToast(t("common.deleteSuccess"), "info");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    }
  };

  // Submit Distribution Record
  const handleRecordDistributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recordingPoint) return;
    if (distQty <= 0) {
      showToast(t("organizer.trips.distQtyAtPointLabel"), "error");
      return;
    }
    if (!privacyConfirmed) {
      showToast(t("organizer.trips.privacyConsentText"), "error");
      return;
    }

    const { trip, point } = recordingPoint;
    const targetBatch =
      trip.batches.find((b) => b.id === selectedRecordBatchId) || trip.batches[0];
    if (!targetBatch) {
      showToast(t("organizer.trips.noTrips"), "error");
      return;
    }

    const remainingInBatch =
      targetBatch.remainingQuantity ??
      targetBatch.totalQuantity - (targetBatch.distributedQuantity || 0);

    if (distQty > remainingInBatch) {
      showToast(t("organizer.trips.overBatchLimitWarning"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await tripService.recordDistribution({
        tripId: trip.id,
        distributionPointId: point.id,
        batchId: targetBatch.id,
        distributedQuantity: distQty,
        note: distNote,
        markPointDistributed: true,
      }, user);

      await transparencyService.uploadEvidence({
        tripId: trip.id,
        distributionPointId: point.id,
        batchId: targetBatch.id,
        imageUrl: evidenceUrl,
        caption: evidenceCaption,
        privacyConfirmed: true,
      }, user);

      showToast(t("common.saveSuccess"), "success");
      setRecordingPoint(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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

  const filteredTrips = trips.filter((t) => {
    if (selectedEventId !== "ALL" && t.eventId !== selectedEventId) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-sky-600" />
            {t("organizer.trips.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("organizer.trips.subtitle", { org: activeOrganization?.name || "" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="ALL">{t("organizer.inventory.filterAllEvents")} ({events.length})</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t("organizer.trips.scheduleNewTripBtn")}
          </button>
        </div>
      </div>

      {/* Trips List */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="space-y-6">
          {filteredTrips.map((tItem) => (
            <div
              key={tItem.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-6"
            >
              {/* Trip Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-xs bg-sky-100 text-sky-900 px-3 py-1 rounded-lg border border-sky-200">
                      {tItem.tripCode}
                    </span>
                    <StatusBadge status={tItem.status} />
                    <span className="text-xs text-slate-500">
                      {t("organizer.trips.scheduledDate")} <strong>{formatDate(tItem.scheduledDate)}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{tItem.name}</h3>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4">
                    <span>{t("organizer.trips.departureLabel")} <strong>{tItem.departurePoint}</strong></span>
                    <span>{t("organizer.trips.leaderLabel")} <strong className="text-slate-800">{tItem.leader?.name || "TNV"}</strong></span>
                    <span>{t("organizer.trips.volunteersCountLabel", { count: tItem.volunteers.length })}</span>
                  </div>
                </div>

                {/* Main Trip Status Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {tItem.status === "SCHEDULED" && (
                    <button
                      onClick={() => handleUpdateTripStatus(tItem.id, "PREPARING")}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {t("organizer.trips.startPreparingBtn")}
                    </button>
                  )}

                  {tItem.status === "PREPARING" && (
                    <button
                      onClick={() => handleUpdateTripStatus(tItem.id, "IN_TRANSIT")}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {t("organizer.trips.startTransitBtn")}
                    </button>
                  )}

                  {tItem.status === "IN_TRANSIT" && (
                    <button
                      onClick={() => handleUpdateTripStatus(tItem.id, "COMPLETED")}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("organizer.trips.completeTripBtn")}
                    </button>
                  )}

                  {tItem.status !== "COMPLETED" && tItem.status !== "CANCELLED" && !tItem.points.some((p) => p.status === "DISTRIBUTED") && (
                    <button
                      onClick={() => handleCancelTrip(tItem.id)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      {t("organizer.trips.cancelTripBtn")}
                    </button>
                  )}
                </div>
              </div>

              {/* Batches Carried */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" />
                  {t("organizer.trips.carriedBatchesTitle")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {tItem.batches.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs flex items-center gap-3">
                      <div>
                        <div className="font-mono font-bold text-purple-900">{b.batchCode}</div>
                        <div className="text-[11px] text-purple-700">{b.itemType}: {b.totalQuantity} {b.unit}</div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribution Points Progression */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  {t("organizer.trips.pointsProgressTitle")}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tItem.points.map((pt) => (
                    <div key={pt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {pt.order}. {pt.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{pt.address}</div>
                        </div>
                        <StatusBadge status={pt.status} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                        <span>{t("organizer.trips.plannedHouseholdsLabel", { count: pt.plannedHouseholds || 50 })}</span>
                        <div className="flex items-center gap-2">
                          {pt.status === "PENDING" && (
                            <button
                              onClick={() => handleUpdatePointStatus(pt.id, "ARRIVED")}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              {t("organizer.trips.arrivedAtPointBtn")}
                            </button>
                          )}

                          {(pt.status === "ARRIVED" || pt.status === "PENDING") && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRecordBatchId(tItem.batches[0]?.id || "");
                                  setRecordingPoint({ trip: tItem, point: pt });
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                {t("organizer.trips.distributeAndPhotoBtn")}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(t("organizer.trips.confirmSkipPointPrompt", { name: pt.name }))) {
                                    handleUpdatePointStatus(pt.id, "SKIPPED");
                                  }
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                {t("organizer.trips.skipPointBtn")}
                              </button>
                            </>
                          )}

                          {pt.status === "DISTRIBUTED" && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t("organizer.trips.pointCompletedBadge")}
                            </span>
                          )}

                          {pt.status === "SKIPPED" && (
                            <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
                              {t("organizer.trips.pointSkippedBadge")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("organizer.trips.noTrips")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("organizer.trips.noTripsDesc")}
          </p>
        </div>
      )}

      {/* Record Distribution & Upload Evidence Modal */}
      {recordingPoint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t("organizer.trips.modalRecordTitle")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{recordingPoint.point.name}</p>
              </div>
              <button
                onClick={() => setRecordingPoint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordDistributionSubmit} className="space-y-4 text-xs">
              {/* Batch Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t("organizer.trips.selectBatchToDistribute")}
                </label>
                <select
                  value={selectedRecordBatchId || (recordingPoint.trip.batches[0]?.id ?? "")}
                  onChange={(e) => {
                    setSelectedRecordBatchId(e.target.value);
                    const b = recordingPoint.trip.batches.find(x => x.id === e.target.value);
                    if (b) {
                      const rem = b.remainingQuantity ?? (b.totalQuantity - (b.distributedQuantity || 0));
                      if (distQty > rem) {
                        setDistQty(rem > 0 ? rem : 1);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 bg-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {recordingPoint.trip.batches.map((b) => {
                    const rem = b.remainingQuantity ?? (b.totalQuantity - (b.distributedQuantity || 0));
                    return (
                      <option key={b.id} value={b.id}>
                        {b.batchCode} — {b.itemType} ({t("organizer.trips.remainingInBatchLabel", { rem, unit: b.unit })})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t("organizer.trips.distQtyAtPointLabel")}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={distQty}
                  onChange={(e) => setDistQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm"
                />
                {(() => {
                  const currentBatch =
                    recordingPoint.trip.batches.find((b) => b.id === selectedRecordBatchId) ||
                    recordingPoint.trip.batches[0];
                  const rem = currentBatch
                    ? currentBatch.remainingQuantity ?? (currentBatch.totalQuantity - (currentBatch.distributedQuantity || 0))
                    : 0;
                  const isOver = distQty > rem;
                  return (
                    <span className={`text-[11px] mt-1 block ${isOver ? "text-rose-600 font-bold" : "text-slate-500"}`}>
                      {t("organizer.trips.remainingInBatchLabel", { rem, unit: currentBatch?.unit || "" })}
                      {isOver && ` — ${t("organizer.trips.overBatchLimitWarning")}`}
                    </span>
                  );
                })()}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t("organizer.trips.siteNotesLabel")}
                </label>
                <input
                  type="text"
                  value={distNote}
                  onChange={(e) => setDistNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  {t("organizer.trips.evidencePhotoSection")}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.trips.photoUrlLabel")}</label>
                  <input
                    type="url"
                    required
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.trips.photoCaptionLabel")}</label>
                  <input
                    type="text"
                    required
                    value={evidenceCaption}
                    onChange={(e) => setEvidenceCaption(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                {/* Mandatory Privacy Checkbox */}
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={privacyConfirmed}
                      onChange={(e) => setPrivacyConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-[11px] text-purple-900 leading-relaxed">
                      {t("organizer.trips.privacyConsentText")}
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRecordingPoint(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  {t("common.cancel")}
                </button>
                {(() => {
                  const currentBatch =
                    recordingPoint.trip.batches.find((b) => b.id === selectedRecordBatchId) ||
                    recordingPoint.trip.batches[0];
                  const rem = currentBatch
                    ? currentBatch.remainingQuantity ?? (currentBatch.totalQuantity - (currentBatch.distributedQuantity || 0))
                    : 0;
                  const isOver = distQty > rem;
                  return (
                    <button
                      type="submit"
                      disabled={isSubmitting || isOver}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {t("organizer.trips.saveAndCompletePointBtn")}
                    </button>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t("organizer.trips.modalCreateTitle")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t("organizer.trips.modalCreateSubtitle")}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t("organizer.trips.tripNameLabel")}</label>
                <input
                  type="text"
                  required
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.trips.departurePointLabel")}</label>
                  <input
                    type="text"
                    required
                    value={departurePoint}
                    onChange={(e) => setDeparturePoint(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.trips.scheduledDateLabel")}</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Ready Batches Selection */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-semibold text-slate-800">
                  {t("organizer.trips.selectReadyBatchesTitle", { count: readyBatches.length })}
                </span>
                {readyBatches.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                    {readyBatches.map((b) => (
                      <label key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBatchIds.includes(b.id)}
                            onChange={() => {
                              if (selectedBatchIds.includes(b.id)) {
                                setSelectedBatchIds(selectedBatchIds.filter(id => id !== b.id));
                              } else {
                                setSelectedBatchIds([...selectedBatchIds, b.id]);
                              }
                            }}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <div>
                            <span className="font-mono font-bold text-slate-800">{b.batchCode}</span>
                            <span className="text-slate-500 ml-2">({b.itemType})</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">{b.totalQuantity} {b.unit}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-900 border border-amber-200 text-xs">
                    {t("organizer.trips.noReadyBatchesAlert")}
                  </div>
                )}
              </div>

              {/* Volunteer Assignment */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-semibold text-slate-800">
                  {t("organizer.trips.assignLeaderAndVolunteersTitle", { count: approvedVolunteers.length })}
                </span>
                {approvedVolunteers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {approvedVolunteers.map((v) => (
                      <div key={v.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{v.user?.name}</div>
                          <div className="text-[10px] text-slate-400">{v.role?.name}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLeaderUserId(v.userId)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            leaderUserId === v.userId ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {leaderUserId === v.userId ? t("organizer.trips.leaderBadge") : t("organizer.trips.makeLeaderBtn")}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs italic">
                    {t("organizer.trips.noVolunteersAlert")}
                  </div>
                )}
              </div>

              {/* Distribution Points */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-semibold text-slate-800">
                  {t("organizer.trips.scheduleDestinationsTitle", { count: distributionPoints.length })}
                </span>
                <div className="space-y-2">
                  {distributionPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 w-4 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={pt.name}
                        onChange={(e) => {
                          const updated = [...distributionPoints];
                          updated[idx].name = e.target.value;
                          setDistributionPoints(updated);
                        }}
                        placeholder={t("organizer.trips.pointNamePlaceholder")}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                      />
                      <input
                        type="text"
                        value={pt.address}
                        onChange={(e) => {
                          const updated = [...distributionPoints];
                          updated[idx].address = e.target.value;
                          setDistributionPoints(updated);
                        }}
                        placeholder={t("organizer.trips.pointAddressPlaceholder")}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedBatchIds.length === 0}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  {t("organizer.trips.submitCreateTripBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
