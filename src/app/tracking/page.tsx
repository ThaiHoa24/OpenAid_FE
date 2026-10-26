"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { transparencyService } from "@/services/transparencyService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTranslation } from "@/hooks/useTranslation";
import type { PublicTrackingResult } from "@/types";
import { 
  Search, ShieldCheck, Package, Truck, MapPin, 
  CheckCircle2, Clock, Image as ImageIcon, AlertCircle, ArrowRight,
  Building2, Calendar, Loader2
} from "lucide-react";
import Link from "next/link";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const { t, formatDate } = useTranslation();

  const [trackingIdInput, setTrackingIdInput] = useState(initialId);
  const [activeTrackingId, setActiveTrackingId] = useState(initialId);
  const [data, setData] = useState<PublicTrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  useEffect(() => {
    async function fetchTracking() {
      if (!activeTrackingId.trim()) {
        setData(null);
        return;
      }
      setIsLoading(true);
      try {
        const result = await transparencyService.trackByTrackingId(activeTrackingId.trim().toUpperCase());
        setData(result);
      } catch (err) {
        console.error("Error fetching tracking:", err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTracking();
  }, [activeTrackingId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingIdInput.trim()) {
      setActiveTrackingId(trackingIdInput.trim().toUpperCase());
    }
  };

  const sampleIds = [
    { id: "DON-2026-948201", label: t("tracking.samples.rice") },
    { id: "DON-2026-104928", label: t("tracking.samples.noodles") },
    { id: "DON-2026-592810", label: t("tracking.samples.water") },
    { id: "DON-2026-391048", label: t("tracking.samples.milk") },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/60 border border-emerald-400/30 text-emerald-100 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            {t("tracking.bannerBadge")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("tracking.bannerTitle")}
          </h1>
          <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
            {t("tracking.bannerSubtitle")}
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={trackingIdInput}
                onChange={(e) => setTrackingIdInput(e.target.value)}
                placeholder={t("tracking.inputPlaceholder")}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300 shadow-md font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {t("tracking.searchBtn")}
            </button>
          </form>

          {/* Quick Demo Pickers */}
          <div className="mt-4 pt-4 border-t border-emerald-600/50 flex flex-wrap items-center gap-2">
            <span className="text-xs text-emerald-200 font-medium">{t("tracking.trySample")}</span>
            {sampleIds.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTrackingIdInput(item.id);
                  setActiveTrackingId(item.id);
                }}
                className="px-2.5 py-1 text-xs rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 cursor-pointer"
                title={item.label}
              >
                <span className="font-mono font-bold">{item.id}</span>
                <span className="opacity-75 hidden sm:inline ml-1.5">({item.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result View */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">{t("tracking.searching")}</p>
        </div>
      ) : data ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Status Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold font-mono text-slate-900">
                    {data.donation.trackingId}
                  </h2>
                  <StatusBadge status={data.donation.status} />
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {t("tracking.pledgedBy")} <span className="font-semibold text-slate-900">{data.donation.quantity} {data.donation.unit} {data.donation.itemType}</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:pl-6 border-slate-100">
              <div className="text-xs text-slate-500">{t("tracking.recipientCampaign")}</div>
              <Link 
                href={`/events/${data.donation.eventId}`}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 justify-end mt-0.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                {data.donation.eventTitle}
              </Link>
              <div className="text-xs text-slate-500 mt-1">
                {t("tracking.organizationLabel")} <span className="font-medium text-slate-700">{data.donation.organizationName}</span>
              </div>
            </div>
          </div>

          {/* Timeline Process */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              {t("tracking.timelineTitle")}
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-200 space-y-8">
              {data.timeline && data.timeline.length > 0 ? (
                data.timeline.map((item: any) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900">{item.action}</span>
                        <span className="text-xs text-slate-500">{formatDate(item.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">{t("eventDetail.noLogsYet")}</div>
              )}
            </div>
          </div>

          {/* Logistics Linkage Details (Batch & Trip) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-slate-900 text-sm">{t("tracking.batchTitle")}</h4>
                </div>
                {data.batch && <StatusBadge status={data.batch.status} />}
              </div>

              {data.batch ? (
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.batchCode")}</span>
                    <span className="font-mono font-bold text-slate-900">{data.batch.batchCode}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.batchName")}</span>
                    <span className="font-semibold text-slate-800">{data.batch.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.itemType")}</span>
                    <span className="font-semibold text-slate-800">{data.batch.itemType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.totalPack")}</span>
                    <span className="font-semibold text-slate-900">{data.batch.totalQuantity} {data.batch.unit}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.deliveredSoFar")}</span>
                    <span className="font-semibold text-emerald-700">{data.batch.distributedQuantity} {data.batch.unit}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>{t("tracking.packedDate")}</span>
                    <span>{formatDate(data.batch.createdAt)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  {t("tracking.batchInWarehouseNote")}
                </div>
              )}
            </div>

            {/* Trip Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-sky-600" />
                  <h4 className="font-bold text-slate-900 text-sm">{t("tracking.tripTitle")}</h4>
                </div>
                {data.trip && <StatusBadge status={data.trip.status} />}
              </div>

              {data.trip ? (
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.tripCode")}</span>
                    <span className="font-mono font-bold text-slate-900">{data.trip.tripCode}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.tripName")}</span>
                    <span className="font-semibold text-slate-800">{data.trip.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.departurePoint")}</span>
                    <span className="font-semibold text-slate-900">{data.trip.departurePoint}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>{t("tracking.scheduleDate")}</span>
                    <span>{formatDate(data.trip.scheduledDate)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>{t("tracking.destinationsCount")}</span>
                    <span className="font-semibold text-emerald-700">{data.distributionPoints.length}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  {t("tracking.tripPendingNote")}
                </div>
              )}
            </div>
          </div>

          {/* Distribution Points Reached */}
          {data.distributionPoints && data.distributionPoints.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                {t("tracking.pointsTitle")}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.distributionPoints.map((pt) => {
                  const totalDelivered = pt.records.reduce((acc, r) => acc + r.distributedQuantity, 0);
                  return (
                    <div key={pt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">{pt.name}</div>
                        <StatusBadge status={pt.status} />
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {pt.address}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{t("tracking.recordsCount", { count: pt.records.length })}</span>
                        <span className="text-emerald-700 font-bold">{t("tracking.totalDelivered", { qty: totalDelivered })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Approved Public Evidence */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  {t("tracking.evidenceTitle")}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("tracking.evidenceSubtitle")}
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                {t("tracking.publicCountBadge", { count: data.publicEvidences?.length || 0 })}
              </span>
            </div>

            {data.publicEvidences && data.publicEvidences.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.publicEvidences.map((photo) => (
                  <div 
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                      <p className="text-[11px] font-medium line-clamp-2">{photo.caption}</p>
                      <span className="text-[9px] text-slate-300">{formatDate(photo.uploadedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                {t("tracking.evidencePendingNote")}
              </div>
            )}
          </div>
        </div>
      ) : activeTrackingId ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t("tracking.notFoundTitle")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("tracking.notFoundDesc", { id: activeTrackingId })}
          </p>
          <button
            onClick={() => {
              setTrackingIdInput("DON-2026-948201");
              setActiveTrackingId("DON-2026-948201");
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            {t("tracking.tryExistingCode")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 max-w-lg mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">{t("tracking.emptyPromptTitle")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("tracking.emptyPromptDesc")}
          </p>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-scaleUp">
            <div className="relative aspect-video bg-black">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 sm:p-6 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedPhoto.caption}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("tracking.photoTakenAt", { point: selectedPhoto.distributionPointName, time: formatDate(selectedPhoto.uploadedAt) })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">{t("common.loading")}</div>}>
      <TrackingContent />
    </Suspense>
  );
}
