"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { 
  ShieldCheck, Users, Building2, Calendar, 
  Package, Truck, History, ArrowRight, Loader2, AlertCircle 
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isAdmin, loginAsDemo } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPlatformStats();
      setStats(data);
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

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("admin.dashboard.accessDenied")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("admin.dashboard.accessDeniedDesc")}
        </p>
        <button
          onClick={() => loginAsDemo("admin@openaid.demo")}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          {t("admin.dashboard.loginAsAdminBtn")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-700/60 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            {t("admin.dashboard.badge")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.dashboard.title")}</h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/organizations"
            className="px-4 py-2 bg-white text-purple-950 hover:bg-purple-50 rounded-xl text-xs font-bold shadow transition-colors"
          >
            {t("admin.dashboard.approveOrgsBtn")}
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-purple-700/80 hover:bg-purple-700 text-white border border-purple-400/30 rounded-xl text-xs font-semibold transition-colors"
          >
            {t("admin.dashboard.manageUsersBtn")}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-sm">{t("common.loading")}</span>
        </div>
      ) : stats ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Platform Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Organizations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("admin.dashboard.statOrganizations")}</span>
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalOrganizations}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("admin.dashboard.statOrgsPending", { pending: stats.pendingOrganizations, approved: stats.approvedOrganizations })}
              </div>
            </div>

            {/* Users */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("admin.dashboard.statUsers")}</span>
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("admin.dashboard.statUsersActive", { count: stats.activeUsers })}
              </div>
            </div>

            {/* Campaigns */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("admin.dashboard.statCampaigns")}</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalEvents}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("admin.dashboard.statCampaignsPublished", { count: stats.publishedEvents })}
              </div>
            </div>

            {/* In-Kind Donations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>{t("admin.dashboard.statGoodsTrips")}</span>
                <Package className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalDonations}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {t("admin.dashboard.statBatchesTripsCount", { batches: stats.totalBatches, trips: stats.totalTrips })}
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/organizations"
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {t("admin.dashboard.cardOrgsTitle")}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t("admin.dashboard.cardOrgsDesc")}
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                {t("admin.dashboard.manageNow")} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/admin/users"
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-sky-300 hover:shadow-md transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {t("admin.dashboard.cardUsersTitle")}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t("admin.dashboard.cardUsersDesc")}
                </p>
              </div>
              <span className="text-xs font-semibold text-sky-700 flex items-center gap-1">
                {t("admin.dashboard.manageNow")} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/admin/events"
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t("admin.dashboard.cardEventsTitle")}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t("admin.dashboard.cardEventsDesc")}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                {t("admin.dashboard.manageNow")} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
