"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { adminService, type EnrichedOrganization } from "@/services/adminService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Building2, Search, CheckCircle2, Ban, 
  Mail, Phone, MapPin, Users, Calendar, 
  Loader2, AlertCircle, ShieldCheck 
} from "lucide-react";

export default function AdminOrganizationsPage() {
  const { user, isAdmin, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [organizations, setOrganizations] = useState<EnrichedOrganization[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await adminService.getAllOrganizations(search, filterStatus);
      setOrganizations(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  const handleUpdateStatus = async (orgId: string, nextStatus: any) => {
    if (!user) return;
    try {
      await adminService.updateOrganizationStatus(orgId, nextStatus, user);
      showToast(
        nextStatus === "APPROVED" 
          ? t("common.saveSuccess")
          : t("common.updateSuccess"),
        nextStatus === "APPROVED" ? "success" : "info"
      );
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.networkError"), "error");
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-purple-600" />
            {t("admin.orgs.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("admin.orgs.subtitle")}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.orgs.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("admin.orgs.tabs.all")} (${organizations.length})` },
          { key: "PENDING", label: `${t("admin.orgs.tabs.pending")} (${organizations.filter(o => o.status === "PENDING").length})` },
          { key: "APPROVED", label: `${t("admin.orgs.tabs.approved")} (${organizations.filter(o => o.status === "APPROVED").length})` },
          { key: "DISABLED", label: `${t("admin.orgs.tabs.disabled")} (${organizations.filter(o => o.status === "DISABLED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterStatus === tab.key
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Organizations List */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : organizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge status={org.status} />
                  <span className="text-xs text-slate-400">
                    {t("admin.orgs.joinedDate")} {formatDate(org.createdAt)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{org.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{org.description}</p>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {org.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {org.contactEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {org.contactPhone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {t("admin.orgs.membersCount", { count: org.membersCount })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {t("admin.orgs.eventsCount", { count: org.eventsCount })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:border-l md:pl-6 border-slate-100 flex flex-wrap md:flex-col items-center md:items-end justify-center gap-2 shrink-0">
                {org.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(org.id, "APPROVED")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t("admin.orgs.approveOrgBtn")}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(org.id, "DISABLED")}
                      className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Ban className="w-4 h-4" />
                      {t("admin.orgs.rejectOrgBtn")}
                    </button>
                  </>
                )}

                {org.status === "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(org.id, "DISABLED")}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Ban className="w-4 h-4" />
                    {t("admin.orgs.suspendOrgBtn")}
                  </button>
                )}

                {org.status === "DISABLED" && (
                  <button
                    onClick={() => handleUpdateStatus(org.id, "APPROVED")}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t("admin.orgs.reactivateOrgBtn")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("admin.orgs.noOrgsFound")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("admin.orgs.noOrgsDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
