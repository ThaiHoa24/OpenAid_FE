"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { adminService, type EnrichedUser } from "@/services/adminService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Users, Search, Lock, Unlock, ShieldCheck,
  Loader2, AlertCircle, Filter, RotateCcw
} from "lucide-react";

export default function AdminUsersPage() {
  const { user, isAdmin, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await adminService.getAllUsers(search, filterStatus);
      setUsers(list);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tải danh sách người dùng", "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, filterStatus, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = async (userId: string, currentStatus: string) => {
    if (!user) return;
    if (userId === user.id) {
      showToast("Bạn không thể khóa/mở khóa tài khoản của chính mình", "warning");
      return;
    }
    const nextStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    const actionText = nextStatus === "ACTIVE" ? "kích hoạt" : "khóa";
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) return;

    setTogglingId(userId);
    try {
      await adminService.updateUserStatus(userId, nextStatus as "ACTIVE" | "DISABLED", user);
      showToast(`Đã ${actionText} tài khoản thành công`, "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Thao tác thất bại", "error");
    } finally {
      setTogglingId(null);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm space-y-4">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Yêu Cầu Quyền Quản Trị</h2>
        <p className="text-xs text-slate-500">
          Chỉ quản trị viên hệ thống mới có quyền truy cập trang này.
        </p>
        <button
          onClick={() => loginAsDemo("admin@openaid.demo")}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          Đăng nhập Admin Demo
        </button>
      </div>
    );
  }

  const filteredUsers = users;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
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
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filterStatus === tab.key
                ? "bg-purple-600 text-white shadow-sm"
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
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
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
                  <th className="py-3.5 px-4">{t("admin.users.tableActivity")}</th>
                  <th className="py-3.5 px-4">{t("admin.users.tableStatus")}</th>
                  <th className="py-3.5 px-4 text-right">{t("admin.users.tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      {u.phone && <div className="text-[11px] text-slate-400">{u.phone}</div>}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.systemRole === "ADMIN"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {t(`roles.${u.systemRole}`)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {u.organizations && u.organizations.length > 0 ? (
                        <div className="space-y-1">
                          {u.organizations.map((org: any) => (
                            <div key={org.id} className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{org.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                org.role === "ORGANIZER"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {t(`roles.${org.role}`)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">{t("admin.users.noOrgAffiliation")}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      <div className="text-[11px]">TNV: {u.volunteerApplicationsCount} lần</div>
                      <div className="text-[11px]">Quyên góp: {u.donationsCount} lượt</div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id, u.status)}
                        disabled={togglingId === u.id || u.id === user?.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          u.status === "ACTIVE"
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {togglingId === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : u.status === "ACTIVE" ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {togglingId === u.id
                            ? t("common.loading")
                            : u.status === "ACTIVE"
                            ? t("admin.users.lockAccountBtn")
                            : t("admin.users.unlockAccountBtn")}
                        </span>
                      </button>
                      {u.id === user?.id && (
                        <span className="ml-2 text-[10px] text-slate-400 italic">{t("admin.users.currentUserNotice")}</span>
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
          <p className="text-xs text-slate-500 mt-1">{t("admin.users.noUsersDesc")}</p>
        </div>
      )}
    </div>
  );
}