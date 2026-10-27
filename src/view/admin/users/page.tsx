"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { adminService, type EnrichedUser } from "@/services/adminService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Users, Search, ShieldCheck, Ban, 
  CheckCircle2, Mail, Phone, Building2, 
  HandHeart, Package, Loader2, AlertCircle 
} from "lucide-react";

export default function AdminUsersPage() {
  const { user, isAdmin, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await adminService.getAllUsers(search, filterStatus);
      setUsers(list);
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

  const handleToggleStatus = async (targetUser: EnrichedUser) => {
    if (!user) return;
    const nextStatus = targetUser.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const actionLabel = nextStatus === "DISABLED" ? t("admin.users.actionLock") : t("admin.users.actionUnlock");

    if (confirm(t("admin.users.confirmToggle", { action: actionLabel, name: targetUser.name }))) {
      try {
        await adminService.updateUserStatus(targetUser.id, nextStatus, user);
        showToast(t("common.saveSuccess"), "success");
        loadData();
      } catch (err: any) {
        showToast(err.message || t("common.networkError"), "error");
      }
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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
            <Users className="w-7 h-7 text-sky-600" />
            {t("admin.users.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("admin.users.subtitle")}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.users.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("admin.users.tabs.all")} (${users.length})` },
          { key: "ACTIVE", label: `${t("admin.users.tabs.active")} (${users.filter(u => u.status === "ACTIVE").length})` },
          { key: "DISABLED", label: `${t("admin.users.tabs.disabled")} (${users.filter(u => u.status === "DISABLED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterStatus === tab.key
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t("admin.users.tableMember")}</th>
                  <th className="py-3.5 px-4">{t("admin.users.tableSystemRole")}</th>
                  <th className="py-3.5 px-4">{t("admin.users.tableAffiliation")}</th>
                  <th className="py-3.5 px-4 text-center">{t("admin.users.tableActivity")}</th>
                  <th className="py-3.5 px-4">{t("admin.users.tableStatus")}</th>
                  <th className="py-3.5 px-4 text-right">{t("admin.users.tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email} • {u.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.systemRole === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {u.systemRole === "ADMIN" && <ShieldCheck className="w-3 h-3 text-purple-700" />}
                        {u.systemRole}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      {u.organizations && u.organizations.length > 0 ? (
                        <div className="space-y-1">
                          {u.organizations.map((org, i) => (
                            <div key={i} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span className="font-semibold">{org.name}</span>
                              <span className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded font-mono">({org.role})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">{t("admin.users.noOrgAffiliation")}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-3 text-xs">
                        <span title="Số ca tình nguyện" className="flex items-center gap-1 text-teal-700">
                          <HandHeart className="w-3.5 h-3.5" />
                          {u.volunteerApplicationsCount}
                        </span>
                        <span title="Số lượt quyên góp" className="flex items-center gap-1 text-emerald-700">
                          <Package className="w-3.5 h-3.5" />
                          {u.donationsCount}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {u.id !== user.id ? (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.status === "ACTIVE"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {u.status === "ACTIVE" ? t("admin.users.lockAccountBtn") : t("admin.users.unlockAccountBtn")}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">{t("admin.users.currentUserNotice")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("admin.users.noUsersFound")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("admin.users.noUsersDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
