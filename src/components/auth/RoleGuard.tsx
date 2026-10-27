"use client";

import React from "react";
import Link from "next/link";
import { ShieldX, Loader2, ArrowRight, UserCheck, Heart, Building2, ShieldCheck, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export type RoleType = "admin" | "organizer" | "user" | "guest";

interface RoleGuardProps {
  allowedRoles: RoleType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isOrganizer, isAdmin, isLoading, loginAsDemo } = useAuth();

  let currentRole: RoleType = "guest";
  if (isAdmin) {
    currentRole = "admin";
  } else if (isOrganizer) {
    currentRole = "organizer";
  } else if (user) {
    currentRole = "user";
  }

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F4D36]" />
        <span className="text-xs font-semibold text-[#5F6F66]">Đang kiểm tra phân quyền truy cập...</span>
      </div>
    );
  }

  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>;

    const roleNames: Record<RoleType, string> = {
      admin: "Quản trị viên (Platform Admin)",
      organizer: "Ban tổ chức (Organizer)",
      user: "Người dùng (User)",
      guest: "Khách vãng lai (Chưa đăng nhập)",
    };

    const allowedLabel = allowedRoles.map((r) => roleNames[r]).join(" hoặc ");
    const currentLabel = roleNames[currentRole];

    let myHubUrl = "/";
    let myHubTitle = "Trang chủ";
    if (currentRole === "organizer") {
      myHubUrl = "/organizer/dashboard";
      myHubTitle = "Bàn Điều Phối Organizer";
    } else if (currentRole === "admin") {
      myHubUrl = "/admin/dashboard";
      myHubTitle = "Bàn Quản Trị Admin";
    } else if (currentRole === "user") {
      myHubUrl = "/my/activities";
      myHubTitle = "Tài Khoản Của Tôi";
    }

    return (
      <div className="max-w-xl mx-auto my-16 px-4">
        <div className="bg-white rounded-3xl p-8 border border-[#E5E7E0] shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <ShieldX className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Phân Quyền Giới Hạn
            </span>
            <h2 className="text-xl font-extrabold text-[#1C2B24] tracking-tight">
              Khu Vực Không Thuộc Thẩm Quyền
            </h2>
            <p className="text-xs text-[#5F6F66] leading-relaxed max-w-md mx-auto">
              Trang này chỉ mở cho: <strong className="text-[#1C2B24]">{allowedLabel}</strong>.
              <br />
              Vai trò hiện tại của bạn là: <strong className="text-rose-600">{currentLabel}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E7E0] text-left text-xs text-[#5F6F66] space-y-2">
            <p className="font-bold text-[#1C2B24]">Nguyên tắc phân quyền OpenAid:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {currentRole === "organizer" && (
                <li>Ban tổ chức tập trung tạo và điều phối các chiến dịch của tổ chức mình, không tham gia đóng vai trò ứng tuyển/ủng hộ cá nhân.</li>
              )}
              {currentRole === "admin" && (
                <li>Quản trị viên thực hiện giám sát, kiểm toán toàn hệ thống và xét duyệt tổ chức.</li>
              )}
              {currentRole === "user" && (
                <li>Người dùng có thể đồng thời đăng ký làm tình nguyện viên và cam kết quyên góp hiện vật cứu trợ.</li>
              )}
              {currentRole === "guest" && (
                <li>Vui lòng đăng nhập vào tài khoản có vai trò tương ứng để tiếp tục.</li>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {myHubUrl !== "/" && (
              <Link
                href={myHubUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D36] hover:bg-[#153a28] text-white text-xs font-bold shadow-xs transition"
              >
                <span>Về {myHubTitle}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1C2B24] text-xs font-bold transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Về Trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
