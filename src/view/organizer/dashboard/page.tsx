"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { batchService, type EnrichedBatch } from "@/services/batchService";
import { tripService, type EnrichedTrip } from "@/services/tripService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Building2,
  Calendar,
  Package,
  Truck,
  Layers,
  Users,
  AlertCircle,
  CheckCircle2,
  Plus,
  Loader2,
  ArrowRight,
  Search,
  FileCheck2,
  ArrowUpRight,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function OrganizerDashboardPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { t } = useTranslation();

  const [summary, setSummary] = useState<any>(null);
  const [readyBatches, setReadyBatches] = useState<EnrichedBatch[]>([]);
  const [activeTrips, setActiveTrips] = useState<EnrichedTrip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [summaryData, batchesData, tripsData] = await Promise.all([
        adminService.getOrganizerDashboardSummary(activeOrganization.id),
        batchService.getByOrganization(activeOrganization.id),
        tripService.getByOrganization(activeOrganization.id),
      ]);

      setSummary(summaryData);
      setReadyBatches(
        batchesData
          .filter((b) => b.status === "READY" || b.status === "ASSIGNED")
          .slice(0, 4)
      );
      setActiveTrips(
        tripsData
          .filter(
            (t) =>
              t.status === "IN_TRANSIT" ||
              t.status === "PREPARING" ||
              t.status === "SCHEDULED"
          )
          .slice(0, 4)
      );
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

  const filteredMetrics = useMemo(() => {
    if (!summary?.itemMetrics) return [];
    if (!searchQuery.trim()) return summary.itemMetrics;
    const q = searchQuery.toLowerCase().trim();
    return summary.itemMetrics.filter((m: any) =>
      m.itemType.toLowerCase().includes(q)
    );
  }, [summary, searchQuery]);

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">
          {t("organizer.dashboard.accessDenied")}
        </h2>
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

  // Count total pending actionable items
  const pendingEvidences = summary?.evidencesPendingReview || 0;
  const pendingDonations = summary?.donationsPending || 0;
  const pendingVolunteers = summary?.volunteersPending || 0;
  const readyBatchCount = summary?.batchesReady || 0;
  const totalPendingActions =
    pendingEvidences + pendingDonations + pendingVolunteers + readyBatchCount;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner Tinh Gọn */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center shrink-0 border border-emerald-200/60">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {activeOrganization?.name || "Tổ Chức Từ Thiện"}
              </h1>
              {activeOrganization && (
                <StatusBadge status={activeOrganization.status} />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl line-clamp-1">
              {activeOrganization?.description ||
                "Trung tâm quản lý chuỗi cung ứng & điều phối hoạt động thiện nguyện"}
            </p>
          </div>
        </div>

        {/* 3 Quick Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/organizer/events"
            className="px-3.5 py-2 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("organizer.dashboard.createEventBtn")}
          </Link>
          <Link
            href="/organizer/batches"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            {t("organizer.dashboard.createBatchBtn")}
          </Link>
          <Link
            href="/organizer/trips"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            {t("organizer.dashboard.scheduleTripBtn")}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-[#1F4D36]" />
          <span className="text-xs font-medium text-slate-600">
            {t("common.loading")}
          </span>
        </div>
      ) : summary ? (
        <>
          {/* 2. Key Metrics Grid (4 thẻ tương tác cốt lõi theo dòng chảy điều phối) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Chiến dịch */}
            <Link
              href="/organizer/events"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>{t("organizer.dashboard.statEvents")}</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {summary.eventsCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>
                    {t("organizer.dashboard.statEventsActive", {
                      count: summary.publishedEventsCount,
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 2: Hiện vật tiếp nhận */}
            <Link
              href="/organizer/donations"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>Tiếp nhận hiện vật</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {summary.donationsReceived}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span
                    className={
                      pendingDonations > 0 ? "text-amber-600 font-semibold" : ""
                    }
                  >
                    {pendingDonations > 0
                      ? `${pendingDonations} khoản chờ nhập kho`
                      : "Kho đã cập nhật đầy đủ"}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 3: Lô hàng đóng gói */}
            <Link
              href="/organizer/batches"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>{t("organizer.dashboard.statBatches")}</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {summary.batchesTotal}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span
                    className={
                      readyBatchCount > 0 ? "text-emerald-700 font-semibold" : ""
                    }
                  >
                    {t("organizer.dashboard.statBatchesReady", {
                      count: readyBatchCount,
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 4: Chuyến xe phân phối */}
            <Link
              href="/organizer/trips"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>{t("organizer.dashboard.statTrips")}</span>
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {summary.tripsTotal}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span
                    className={
                      summary.tripsInTransit > 0
                        ? "text-sky-700 font-semibold"
                        : ""
                    }
                  >
                    {t("organizer.dashboard.statTripsMoving", {
                      count: summary.tripsInTransit,
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-700 transition-colors" />
                </div>
              </div>
            </Link>
          </div>

          {/* 3. Trung Tâm Tác Vụ Cần Xử Lý Ngay (Action Center) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    totalPendingActions > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {totalPendingActions > 0 ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t("organizer.dashboard.actionCenterTitle")}
                </h3>
                {totalPendingActions > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {totalPendingActions} việc chờ
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {t("organizer.dashboard.actionCenterSubtitle")}
              </span>
            </div>

            {totalPendingActions > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1: Bằng chứng ảnh */}
                {pendingEvidences > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck2 className="w-4 h-4 text-amber-700 shrink-0" />
                      <div className="text-xs text-amber-950 font-medium truncate">
                        {pendingEvidences} ảnh chứng từ chờ duyệt
                      </div>
                    </div>
                    <Link
                      href="/organizer/transparency"
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Duyệt ngay
                    </Link>
                  </div>
                )}

                {/* 2: Hiện vật mới gửi */}
                {pendingDonations > 0 && (
                  <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Package className="w-4 h-4 text-teal-700 shrink-0" />
                      <div className="text-xs text-teal-950 font-medium truncate">
                        {pendingDonations} hiện vật mới gửi tới
                      </div>
                    </div>
                    <Link
                      href="/organizer/donations"
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Nhận kho
                    </Link>
                  </div>
                )}

                {/* 3: Đơn tình nguyện viên */}
                {pendingVolunteers > 0 && (
                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Users className="w-4 h-4 text-sky-700 shrink-0" />
                      <div className="text-xs text-sky-950 font-medium truncate">
                        {pendingVolunteers} đơn TNV chờ duyệt
                      </div>
                    </div>
                    <Link
                      href="/organizer/volunteers"
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Xét duyệt
                    </Link>
                  </div>
                )}

                {/* 4: Lô hàng sẵn sàng bốc xếp */}
                {readyBatchCount > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Layers className="w-4 h-4 text-[#1F4D36] shrink-0" />
                      <div className="text-xs text-emerald-950 font-medium truncate">
                        {readyBatchCount} lô sẵn sàng lên xe
                      </div>
                    </div>
                    <Link
                      href="/organizer/trips"
                      className="px-2.5 py-1 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Xếp xe
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-3 px-4 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t("organizer.dashboard.allClear")}</span>
              </div>
            )}
          </div>

          {/* 4. Supply Chain Fulfillment Pipeline (Tiến độ tiếp nhận & phân phối trực quan) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#1F4D36]" />
                  {t("organizer.dashboard.fulfillmentTitle")}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("organizer.dashboard.fulfillmentSubtitle")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Item Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("organizer.dashboard.searchPlaceholder")}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition w-44 sm:w-56"
                  />
                </div>

                <Link
                  href="/organizer/inventory"
                  className="text-xs font-semibold text-[#1F4D36] hover:text-[#153826] flex items-center gap-1 shrink-0"
                >
                  <span className="hidden sm:inline">
                    {t("organizer.dashboard.viewInventoryBtn")}
                  </span>
                  <span className="sm:hidden">Sổ kho</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {filteredMetrics && filteredMetrics.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">{t("organizer.dashboard.tableItem")}</th>
                      <th className="py-3 px-4 text-right">{t("organizer.dashboard.tableTarget")}</th>
                      <th className="py-3 px-4 text-right">Đã nhập kho</th>
                      <th className="py-3 px-4 text-right">Kho khả dụng / Đã gán lô</th>
                      <th className="py-3 px-4 text-right">Đã trao tận tay</th>
                      <th className="py-3 px-4 min-w-[180px]">Tiến độ phân phối</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredMetrics.map((m: any, idx: number) => {
                      const distPct =
                        m.needed > 0
                          ? Math.min(100, Math.round((m.distributed / m.needed) * 100))
                          : 100;
                      const recvPct =
                        m.needed > 0
                          ? Math.min(100, Math.round((m.received / m.needed) * 100))
                          : 100;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {m.itemType}{" "}
                            <span className="text-[11px] font-normal text-slate-500">
                              ({m.unit})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-800 tabular-nums">
                            {m.needed.toLocaleString("vi-VN")}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            <span className="font-semibold text-teal-700">
                              {m.received.toLocaleString("vi-VN")}
                            </span>
                            {m.pledged > m.received && (
                              <div className="text-[10px] text-amber-600">
                                ({m.pledged.toLocaleString("vi-VN")} cam kết)
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-700 tabular-nums">
                            <span className="text-emerald-700 font-medium">
                              {m.available.toLocaleString("vi-VN")}
                            </span>{" "}
                            /{" "}
                            <span className="text-purple-700 font-medium">
                              {m.reserved.toLocaleString("vi-VN")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#1F4D36] tabular-nums">
                            {m.distributed.toLocaleString("vi-VN")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                                <span>{distPct}% hoàn thành</span>
                                <span>{recvPct}% đã về kho</span>
                              </div>
                              {/* 2-tier visual progress bar: light teal for received, dark emerald for distributed */}
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
                                <div
                                  className="h-full bg-teal-200 rounded-full absolute left-0 top-0 transition-all duration-300"
                                  style={{ width: `${recvPct}%` }}
                                />
                                <div
                                  className="h-full bg-[#1F4D36] rounded-full absolute left-0 top-0 transition-all duration-300"
                                  style={{ width: `${distPct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {distPct >= 100 ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Hoàn tất
                              </span>
                            ) : recvPct >= 100 ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                Đủ hàng
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Thiếu {(m.needed - m.received).toLocaleString("vi-VN")}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                {t("organizer.dashboard.noGoodsData")}
              </div>
            )}
          </div>

          {/* 5. Khối Hoạt Động Điều Phối Thực Chiến (Thay thế 6 card trùng lặp thừa ở đáy) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Cột 1: Lô Hàng Sẵn Sàng Bốc Xếp */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {t("organizer.dashboard.readyBatchesTitle")}
                    </h3>
                  </div>
                  <Link
                    href="/organizer/batches"
                    className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    {t("organizer.dashboard.viewAllBatches")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="mt-3 space-y-2">
                  {readyBatches.length > 0 ? (
                    readyBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {batch.name || batch.batchCode}
                            </span>
                            <StatusBadge status={batch.status} />
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {batch.event?.title || "Chiến dịch"} •{" "}
                            <span className="font-semibold text-slate-700">
                              {batch.totalQuantity} {batch.unit}
                            </span>
                          </div>
                        </div>
                        <Link
                          href="/organizer/trips"
                          className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0"
                        >
                          Xếp xe
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      {t("organizer.dashboard.noReadyBatches")}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Tổng số: {summary.batchesTotal} lô hàng</span>
                <Link
                  href="/organizer/batches"
                  className="font-semibold text-purple-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Đóng lô mới
                </Link>
              </div>
            </div>

            {/* Cột 2: Chuyến Xe Đang Vận Chuyển */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {t("organizer.dashboard.activeTripsTitle")}
                    </h3>
                  </div>
                  <Link
                    href="/organizer/trips"
                    className="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-1"
                  >
                    {t("organizer.dashboard.viewAllTrips")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="mt-3 space-y-2">
                  {activeTrips.length > 0 ? (
                    activeTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {trip.tripCode}: {trip.name}
                            </span>
                            <StatusBadge status={trip.status} />
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-2">
                            <span>{trip.event?.title || "Chiến dịch"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {trip.points?.length || 0} điểm phát
                            </span>
                          </div>
                        </div>
                        <Link
                          href="/organizer/trips"
                          className="px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0"
                        >
                          Theo dõi
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      {t("organizer.dashboard.noActiveTrips")}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Tổng số: {summary.tripsTotal} chuyến xe</span>
                <Link
                  href="/organizer/trips"
                  className="font-semibold text-sky-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Lên chuyến mới
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
