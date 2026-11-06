"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/ui/ToastProvider";
import { adminService, type EnrichedOrganization } from "@/services/adminService";
import { transparencyService } from "@/services/transparencyService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { TransparencyLog } from "@/types";
import {
  ShieldCheck,
  Users,
  Building2,
  Calendar,
  Package,
  History,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  Truck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isAdmin, loginAsDemo } = useAuth();
  const { t, formatDateTime } = useTranslation();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [pendingOrgs, setPendingOrgs] = useState<EnrichedOrganization[]>([]);
  const [recentLogs, setRecentLogs] = useState<TransparencyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, allOrgs, logsData] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getAllOrganizations("ALL"),
        transparencyService.getLogs(),
      ]);

      setStats(statsData);
      setPendingOrgs(allOrgs.filter((o) => o.status === "PENDING").slice(0, 4));
      setRecentLogs(logsData.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  const handleQuickApproveOrg = async (orgId: string, orgName: string) => {
    if (!user) return;
    try {
      await adminService.updateOrganizationStatus(orgId, "APPROVED", user);
      showToast(`Đã phê duyệt tư cách pháp nhân cho: ${orgName}`, "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">
          {t("admin.dashboard.accessDenied")}
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("admin.dashboard.accessDeniedDesc")}
        </p>
        <button
          onClick={() => loginAsDemo("admin@openaid.demo")}
          className="w-full py-2.5 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          {t("admin.dashboard.loginAsAdminBtn")}
        </button>
      </div>
    );
  }

  const pendingCount = stats?.pendingOrganizations || 0;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner Tinh Gọn */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 border border-purple-200/60">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {t("admin.dashboard.title")}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Toàn Hệ Thống
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl line-clamp-1">
              {t("admin.dashboard.subtitle")}
            </p>
          </div>
        </div>

        {/* 3 Quick Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/organizations"
            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            {t("admin.dashboard.approveOrgsBtn")}
          </Link>
          <Link
            href="/admin/users"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            {t("admin.dashboard.manageUsersBtn")}
          </Link>
          <Link
            href="/admin/events"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Kiểm toán chiến dịch
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-purple-700" />
          <span className="text-xs font-medium text-slate-600">
            {t("common.loading")}
          </span>
        </div>
      ) : stats ? (
        <>
          {/* 2. Key Metrics Grid (4 thẻ tương tác cốt lõi) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổ chức */}
            <Link
              href="/admin/organizations"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>{t("admin.dashboard.statOrganizations")}</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats.totalOrganizations}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span
                    className={
                      pendingCount > 0 ? "text-amber-600 font-semibold" : ""
                    }
                  >
                    {t("admin.dashboard.statOrgsPending", {
                      pending: stats.pendingOrganizations,
                      approved: stats.approvedOrganizations,
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 2: Tài khoản người dùng */}
            <Link
              href="/admin/users"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>{t("admin.dashboard.statUsers")}</span>
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats.totalUsers}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>
                    {t("admin.dashboard.statUsersActive", {
                      count: stats.activeUsers,
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-700 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 3: Chiến dịch toàn sàn */}
            <Link
              href="/admin/events"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>{t("admin.dashboard.statCampaigns")}</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats.totalEvents}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>
                    {t("admin.dashboard.statCampaignsPublished", {
                      count: stats.publishedEvents,
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 4: Hiện vật & Vận đơn */}
            <Link
              href="/organizer/dashboard"
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <span>{t("admin.dashboard.statGoodsTrips")}</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats.totalDonations}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>
                    {t("admin.dashboard.statBatchesTripsCount", {
                      batches: stats.totalBatches,
                      trips: stats.totalTrips,
                    })}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 transition-colors" />
                </div>
              </div>
            </Link>
          </div>

          {/* 3. Action Center / Cảnh báo cần xử lý ngay */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    pendingCount > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {pendingCount > 0 ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kiểm Duyệt Tư Cách Pháp Nhân
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {pendingCount} tổ chức chờ duyệt
                  </span>
                )}
              </div>
              <Link
                href="/admin/organizations"
                className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
              >
                {t("admin.dashboard.viewAllOrgs")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-amber-700 shrink-0" />
                  <div className="text-xs text-amber-950">
                    <span className="font-bold">
                      {t("admin.dashboard.pendingOrgsAlert", {
                        count: pendingCount,
                      })}
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Cần xác minh hồ sơ thành lập và người đại diện trước khi cấp quyền phát động chiến dịch công khai.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/organizations"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 text-center"
                >
                  Xét duyệt danh sách
                </Link>
              </div>
            ) : (
              <div className="py-3 px-4 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t("admin.dashboard.allOrgsApproved")}</span>
              </div>
            )}
          </div>

          {/* 4. Hai Widget Hoạt Động Thay Thế 3 Card Thừa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Widget 1: Hàng Đợi Xét Duyệt Tổ Chức */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {t("admin.dashboard.pendingQueueTitle")}
                    </h3>
                  </div>
                  <Link
                    href="/admin/organizations"
                    className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    Quản lý tổ chức
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="mt-3 space-y-2">
                  {pendingOrgs.length > 0 ? (
                    pendingOrgs.map((org) => (
                      <div
                        key={org.id}
                        className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {org.name}
                            </span>
                            <StatusBadge status={org.status} />
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 truncate flex items-center gap-2">
                            <span>Email: {org.contactEmail}</span>
                            <span>•</span>
                            <span>SĐT: {org.contactPhone || "Chưa có"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQuickApproveOrg(org.id, org.name)}
                            className="px-2.5 py-1 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Phê duyệt
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      {t("admin.dashboard.noPendingOrgs")}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{stats.approvedOrganizations} tổ chức đang hoạt động</span>
                <Link
                  href="/admin/organizations"
                  className="font-semibold text-purple-700 hover:underline"
                >
                  Xem danh sách đầy đủ →
                </Link>
              </div>
            </div>

            {/* Widget 2: Nhật Ký Kiểm Toán Hệ Thống (Live Audit Trail) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {t("admin.dashboard.auditTrailTitle")}
                    </h3>
                  </div>
                  <Link
                    href="/organizer/transparency"
                    className="text-xs font-semibold text-slate-700 hover:underline flex items-center gap-1"
                  >
                    {t("admin.dashboard.viewAllLogs")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="mt-3 space-y-2">
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-semibold shrink-0">
                              {log.actorRole}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {log.actorName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                          {log.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      {t("admin.dashboard.noRecentLogs")}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Minh bạch cấp Lô hàng & Vận đơn</span>
                <Link
                  href="/track"
                  className="font-semibold text-slate-700 hover:underline"
                >
                  Tra cứu kiểm toán →
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
