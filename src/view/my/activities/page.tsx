"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  UserCheck,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Users,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function MyActivitiesPage() {
  const { user, loginAsDemo } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      setLoading(true);
      volunteerService
        .getByUser(user.id)
        .then((res: any[]) => {
          setApplications(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCheckInToggle = (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const checkedIn = !app.checkedInAt;
          return {
            ...app,
            checkedInAt: checkedIn ? new Date().toISOString() : undefined,
          };
        }
        return app;
      })
    );
  };

  // Metrics
  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const checkedInCount = applications.filter((a) => Boolean(a.checkedInAt)).length;

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (filterStatus === "APPROVED" && app.status !== "APPROVED") return false;
      if (filterStatus === "PENDING" && app.status !== "PENDING") return false;
      if (filterStatus === "CHECKED_IN" && !app.checkedInAt) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const eventTitle = app.event?.title?.toLowerCase() || "";
        const roleName = app.role?.name?.toLowerCase() || "";
        const loc = app.event?.location?.toLowerCase() || "";
        return eventTitle.includes(q) || roleName.includes(q) || loc.includes(q);
      }
      return true;
    });
  }, [applications, filterStatus, searchQuery]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">
          Khu Vực Tình Nguyện Viên
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Vui lòng đăng nhập để xem các đơn đăng ký tình nguyện và điểm danh thực địa.
        </p>
        <button
          onClick={() => loginAsDemo("user@openaid.demo")}
          className="w-full py-2.5 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          Đăng nhập Người Dùng Demo
        </button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["user"]}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn pb-16">
        {/* Top Header Banner */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#1F4D36] flex items-center justify-center shrink-0 border border-emerald-200/60">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36]">
                  Hồ Sơ Cống Hiến
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Xác thực minh bạch
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Hoạt Động Tình Nguyện Của Tôi
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi xét duyệt vai trò, vị trí tập kết và xuất trình mã QR điểm danh thực địa
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/events"
              className="px-3.5 py-2 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Khám phá chiến dịch mới
            </Link>
            <Link
              href="/my/donations"
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Quyên góp hiện vật của tôi
            </Link>
          </div>
        </div>

        {/* KPI Metrics Strip (4 thẻ đồng bộ) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Tổng Đơn Đăng Ký</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Chiến dịch đã tham gia</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Đã Được Phê Duyệt</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{approvedCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Sẵn sàng nhận nhiệm vụ</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Đang Chờ Duyệt</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Đơn đang được BTC xét</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
              <span>Đã Điểm Danh</span>
              <CheckCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-700">{checkedInCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Buổi thực địa đã ghi nhận</p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: `Tất cả (${totalCount})` },
              { id: "APPROVED", label: `Đã duyệt (${approvedCount})` },
              { id: "PENDING", label: `Chờ duyệt (${pendingCount})` },
              { id: "CHECKED_IN", label: `Đã điểm danh (${checkedInCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filterStatus === tab.id
                    ? "bg-[#1F4D36] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo chiến dịch, vai trò, địa điểm..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition w-full sm:w-64"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        {loading ? (
          <div className="text-center py-20 text-xs font-semibold text-slate-500">
            Đang tải dữ liệu hoạt động tình nguyện...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 space-y-4">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Không tìm thấy đơn tình nguyện nào phù hợp
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hãy tham gia đăng ký hỗ trợ các chiến dịch đang cần người tiếp sức.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-xl text-xs font-semibold transition"
            >
              Khám phá chiến dịch
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      ĐƠN-{app.id.substring(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {app.event?.title || "Chiến dịch cứu trợ"}
                    </h3>
                    <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-[#1F4D36] text-[11px] font-semibold mt-1">
                      Vai trò: {app.role?.name || "Tình nguyện viên chung"}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{app.event?.location || "Địa điểm thực địa"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(app.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setQrModal(app)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#1F4D36]" />
                    <span>Mã QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckInToggle(app.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      app.checkedInAt
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-[#1F4D36] text-white hover:bg-[#153826] shadow-xs"
                    }`}
                  >
                    {app.checkedInAt ? "Đã điểm danh ✓" : "Điểm danh"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Modal */}
        {qrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Mã QR Điểm Danh Tình Nguyện Viên
              </h3>
              <div className="w-44 h-44 bg-slate-50 border-2 border-dashed border-[#1F4D36] rounded-2xl mx-auto flex items-center justify-center">
                <QrCode className="w-28 h-28 text-[#1F4D36]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {qrModal.event?.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Xuất trình mã này cho Trưởng đoàn hoặc Điều phối viên tại điểm tập kết để xác thực có mặt.
                </p>
              </div>
              <Button
                onClick={() => setQrModal(null)}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Đóng cửa sổ
              </Button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
