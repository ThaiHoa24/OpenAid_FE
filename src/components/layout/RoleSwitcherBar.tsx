"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Users,
  Heart,
  User,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Check,
  Home,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";

export function RoleSwitcherBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isOrganizer, isAdmin, loginAsDemo, logout, resetDemoData } = useAuth();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Identify current role and primary hub URL
  let currentRoleId = "guest";
  let currentRoleLabel = "Khách vãng lai (Chưa đăng nhập)";
  let currentRoleBadgeColor = "bg-slate-700 text-slate-200 border-slate-600";
  let mainHubUrl = "/";
  let mainHubLabel = "Trang Chủ";

  if (isAdmin) {
    currentRoleId = "admin";
    currentRoleLabel = "Quản trị viên (Platform Admin)";
    currentRoleBadgeColor = "bg-purple-900/80 text-purple-200 border-purple-500/50";
    mainHubUrl = "/admin/dashboard";
    mainHubLabel = "Bàn Quản Trị Hệ Thống";
  } else if (isOrganizer) {
    currentRoleId = "organizer";
    currentRoleLabel = "Ban tổ chức (Organizer)";
    currentRoleBadgeColor = "bg-emerald-900/80 text-emerald-200 border-emerald-500/50";
    mainHubUrl = "/organizer/dashboard";
    mainHubLabel = "Bàn Điều Phối Organizer";
  } else if (user) {
    currentRoleId = "user";
    currentRoleLabel = "Người dùng (User)";
    currentRoleBadgeColor = "bg-teal-900/80 text-teal-200 border-teal-500/50";
    mainHubUrl = "/my/activities";
    mainHubLabel = "Khu Vực Cá Nhân";
  }

  // Check if currently on the role's primary hub
  const isOnMainHub =
    currentRoleId === "guest"
      ? pathname === "/"
      : currentRoleId === "organizer"
      ? pathname.startsWith("/organizer")
      : currentRoleId === "admin"
      ? pathname.startsWith("/admin")
      : currentRoleId === "user"
      ? pathname.startsWith("/my") || pathname.startsWith("/profile")
      : pathname === mainHubUrl;

  const handleSwitchToGuest = () => {
    setSwitching("guest");
    logout();
    showToast("Đã chuyển về Khách vãng lai (Đăng xuất)", "info");
    router.push("/");
    setSwitching(null);
  };

  const handleSwitchRole = async (email: string, roleName: string, targetRedirect: string) => {
    // If already logged in as this user, simply navigate to their hub
    if (user?.email === email) {
      router.push(targetRedirect);
      return;
    }

    setSwitching(email);
    const ok = await loginAsDemo(email);
    setSwitching(null);
    if (ok) {
      showToast(`Đã chuyển sang vai trò: ${roleName}`, "success");
      router.push(targetRedirect);
    } else {
      showToast("Chuyển đổi vai trò thất bại", "error");
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "Khôi phục toàn bộ dữ liệu mẫu (sự kiện, kho bãi, lô hàng, đóng góp) về mặc định ban đầu?"
      )
    ) {
      resetDemoData();
      showToast("Đã khôi phục dữ liệu mẫu ban đầu", "success");
      router.refresh();
    }
  };

  return (
    <div className="relative z-50 bg-[#132d20] text-white border-b border-[#234e38] text-xs transition-all shadow-md">
      {/* Top micro strip: Status & Quick Return Button */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        {/* Left: Active Role Overview */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F4D36] border border-[#2e6949] text-[11px] font-bold text-[#F28C1B] shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chuyển Vai Trò Demo:</span>
            <span className="sm:hidden">Demo:</span>
          </span>

          <div className="flex items-center gap-2 truncate">
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${currentRoleBadgeColor} truncate`}
            >
              {currentRoleLabel}
            </span>
            {user && (
              <span className="hidden lg:inline text-[11px] text-emerald-200/70 truncate">
                ({user.name})
              </span>
            )}
          </div>
        </div>

        {/* Right: Universal "Về Bàn Làm Việc" + Quick actions & Collapse */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Universal Return Button: Always accessible if user is not on their main hub */}
          {!isOnMainHub && (
            <Link
              href={mainHubUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F28C1B] hover:bg-[#e07d10] text-white font-extrabold text-[11px] shadow-sm transition animate-pulse"
              title={`Quay về ${mainHubLabel}`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Về {mainHubLabel}</span>
              <span className="sm:hidden">Về Bàn Chính</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={handleResetData}
            title="Khôi phục lại dữ liệu mẫu của hệ thống"
            className="p-1.5 rounded-md text-emerald-200/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Expand/Collapse */}
          <button
            type="button"
            onClick={() => setIsCollapsed((c) => !c)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-emerald-200/80 hover:text-white hover:bg-white/10 font-semibold text-[11px] transition cursor-pointer"
          >
            <span>{isCollapsed ? "Đổi role" : "Thu gọn"}</span>
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Role Selection Buttons Row */}
      {!isCollapsed && (
        <div className="border-t border-[#1c402e] bg-[#0d2217] py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1240px] mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-emerald-200/80 whitespace-nowrap mr-1 shrink-0">
              Chọn vai trò:
            </span>

            {/* 1. Khách vãng lai */}
            <button
              type="button"
              onClick={handleSwitchToGuest}
              disabled={switching !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                currentRoleId === "guest"
                  ? "bg-white text-[#132d20] shadow-xs font-bold"
                  : "bg-white/10 hover:bg-white/20 text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Khách vãng lai</span>
              {currentRoleId === "guest" && <Check className="w-3 h-3 text-[#1F4D36]" />}
            </button>

            {/* 2. Ban tổ chức */}
            <button
              type="button"
              onClick={() =>
                handleSwitchRole(
                  "organizer@openaid.demo",
                  "Ban tổ chức (Trần Thị Mai - Quỹ Đà Nẵng)",
                  "/organizer/dashboard"
                )
              }
              disabled={switching !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                currentRoleId === "organizer"
                  ? "bg-[#1F4D36] border border-emerald-400 text-white shadow-xs font-bold ring-2 ring-emerald-400/50"
                  : "bg-white/10 hover:bg-white/20 text-emerald-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Ban tổ chức (Organizer)</span>
              {currentRoleId === "organizer" && <Check className="w-3 h-3 text-emerald-300" />}
            </button>

            {/* 3. Quản trị viên */}
            <button
              type="button"
              onClick={() =>
                handleSwitchRole(
                  "admin@openaid.demo",
                  "Quản trị viên (Admin OpenAid)",
                  "/admin/dashboard"
                )
              }
              disabled={switching !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                currentRoleId === "admin"
                  ? "bg-purple-700 text-white shadow-xs font-bold ring-2 ring-purple-400/50"
                  : "bg-white/10 hover:bg-white/20 text-purple-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản trị viên (Admin)</span>
              {currentRoleId === "admin" && <Check className="w-3 h-3 text-purple-200" />}
            </button>

            {/* 4. Người dùng (User) */}
            <button
              type="button"
              onClick={() =>
                handleSwitchRole(
                  "user@openaid.demo",
                  "Người dùng (Nguyễn Minh Anh)",
                  "/my/activities"
                )
              }
              disabled={switching !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                currentRoleId === "user"
                  ? "bg-[#257551] text-white shadow-xs font-bold ring-2 ring-teal-400/50"
                  : "bg-white/10 hover:bg-white/20 text-teal-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Người dùng (User)</span>
              {currentRoleId === "user" && <Check className="w-3 h-3 text-white" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
