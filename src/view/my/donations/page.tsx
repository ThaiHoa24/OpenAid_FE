"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Gift,
  ArrowRight,
  Package,
  Layers,
  Calendar,
  Building2,
  Copy,
  Check,
  Search,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { donationService } from "@/services";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function MyDonationsPage() {
  const { user, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (user) {
      setLoading(true);
      donationService
        .getByUser(user.id)
        .then((res: any[]) => {
          setDonations(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    showToast(`Đã sao chép mã vận đơn: ${code}`, "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Metrics calculations
  const totalCount = donations.length;
  const pendingCount = donations.filter((d) => d.status === "COMMITTED" || d.status === "PENDING").length;
  const inTransitCount = donations.filter(
    (d) => d.status === "RECEIVED" || d.status === "IN_BATCH" || d.status === "ON_TRIP"
  ).length;
  const distributedCount = donations.filter((d) => d.status === "DISTRIBUTED").length;

  // Filtered list
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      // Status filter
      if (statusFilter === "PENDING" && d.status !== "COMMITTED" && d.status !== "PENDING") {
        return false;
      }
      if (
        statusFilter === "TRANSIT" &&
        d.status !== "RECEIVED" &&
        d.status !== "IN_BATCH" &&
        d.status !== "ON_TRIP"
      ) {
        return false;
      }
      if (statusFilter === "DISTRIBUTED" && d.status !== "DISTRIBUTED") {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const trackingMatch = d.trackingId?.toLowerCase().includes(query);
        const itemMatch = d.itemType?.toLowerCase().includes(query);
        const eventMatch = d.event?.title?.toLowerCase().includes(query);
        const orgMatch = d.event?.organization?.name?.toLowerCase().includes(query);
        const batchMatch = d.batch?.batchCode?.toLowerCase().includes(query);
        return trackingMatch || itemMatch || eventMatch || orgMatch || batchMatch;
      }

      return true;
    });
  }, [donations, statusFilter, searchQuery]);

  // If user is not logged in, show demo login prompt
  if (!user) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#E5E7E0] shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#1C2B24]">Đóng Góp Hiện Vật Cứu Trợ</h2>
            <p className="text-xs text-[#5F6F66] mt-2 leading-relaxed">
              Vui lòng đăng nhập để theo dõi các phần hiện vật bạn đã đóng góp
              và xem hành trình đối soát thực địa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loginAsDemo("user@openaid.demo")}
            className="w-full py-3 rounded-full bg-[#1F4D36] hover:bg-[#153a28] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#F28C1B]" />
            <span>Đăng nhập Người dùng (Demo)</span>
          </button>
          <div className="pt-2">
            <Link
              href="/"
              className="text-xs font-semibold text-[#1F4D36] hover:underline"
            >
              ← Quay về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["user"]}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Profile & Welcome Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#F28C1B] flex items-center justify-center shrink-0 shadow-xs">
            <Gift className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Lịch Sử Quyên Góp Hiện Vật
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Đồng hành minh bạch
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight">
              Chào mừng, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6F66]">
              Theo dõi chuỗi hành trình thực tế của từng phần hiện vật cứu trợ từ lúc tiếp nhận vào kho đến khi bàn giao tại thôn bản.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1F4D36] hover:bg-[#153826] text-white text-xs font-bold shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
            <span>Khám phá chiến dịch cần hiện vật</span>
          </Link>
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#1C2B24] text-xs font-bold border border-[#E5E7E0] shadow-xs transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Tra cứu mã vận đơn</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7E0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F66]">
              Tổng Đóng Góp
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24]">{totalCount}</div>
          <p className="text-[11px] text-[#5F6F66]">Phần hiện vật đã cam kết</p>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7E0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F66]">
              Chờ Nhập Kho
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24]">{pendingCount}</div>
          <p className="text-[11px] text-[#5F6F66]">Tổ chức đang tiếp nhận</p>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7E0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F66]">
              Đang Vận Chuyển
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24]">{inTransitCount}</div>
          <p className="text-[11px] text-[#5F6F66]">Đã đóng lô & trên đường</p>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7E0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F66]">
              Đã Trao Tận Tay
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {distributedCount}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Có biên bản & ảnh thực địa</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5E7E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#1F4D36] text-white shadow-xs"
                : "bg-slate-100 text-[#5F6F66] hover:bg-slate-200"
            }`}
          >
            Tất cả ({donations.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-[#1F4D36] text-white shadow-xs"
                : "bg-slate-100 text-[#5F6F66] hover:bg-slate-200"
            }`}
          >
            Chờ nhập kho ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("TRANSIT")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              statusFilter === "TRANSIT"
                ? "bg-[#1F4D36] text-white shadow-xs"
                : "bg-slate-100 text-[#5F6F66] hover:bg-slate-200"
            }`}
          >
            Đang vận chuyển ({inTransitCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("DISTRIBUTED")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              statusFilter === "DISTRIBUTED"
                ? "bg-[#1F4D36] text-white shadow-xs"
                : "bg-slate-100 text-[#5F6F66] hover:bg-slate-200"
            }`}
          >
            Đã trao tặng ({distributedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã vận đơn, tên món..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs font-semibold text-[#1C2B24] rounded-full border border-[#E5E7E0] focus:outline-none focus:border-[#1F4D36] transition"
          />
        </div>
      </div>

      {/* Donations Content Section */}
      {loading ? (
        <div className="text-center py-20 text-sm font-semibold text-[#5F6F66]">
          Đang tải dữ liệu đóng góp...
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 text-center rounded-3xl border border-[#E5E7E0] space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Gift className="w-6 h-6" />
          </div>
          <p className="text-[#5F6F66] text-sm font-medium">
            {searchQuery
              ? "Không tìm thấy đóng góp nào phù hợp với từ khóa tìm kiếm."
              : "Không có đóng góp nào trong mục này."}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs font-bold text-[#1F4D36] hover:underline cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((don) => (
            <div
              key={don.id}
              className="bg-white rounded-3xl p-6 border border-[#E5E7E0] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                {/* Header: Tracking ID & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-[#FAF9F6] px-2.5 py-1 rounded-xl border border-[#E5E7E0]">
                    <span className="font-mono text-xs font-bold text-[#1F4D36]">
                      {don.trackingId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode(don.trackingId)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title="Sao chép mã vận đơn"
                    >
                      {copiedId === don.trackingId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <Badge status={don.status} />
                </div>

                {/* Item title & quantity */}
                <div>
                  <h3 className="font-extrabold text-lg text-[#1C2B24] leading-snug">
                    {don.quantity} {don.unit} {don.itemType}
                  </h3>
                  <p className="text-xs text-[#5F6F66] mt-1 line-clamp-1">
                    Chiến dịch: <span className="font-semibold text-slate-700">{don.event?.title || "Cứu trợ đồng bào"}</span>
                  </p>
                </div>

                {/* Organization & Date */}
                <div className="space-y-1.5 text-xs text-[#5F6F66] pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {don.event?.organization?.name || "Tổ chức tiếp nhận"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Cam kết ngày {new Date(don.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>

                  {don.batch && (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Lô đóng gói: {don.batch.batchCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* View Timeline CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-[#5F6F66] font-medium">
                  {don.status === "DISTRIBUTED"
                    ? "Đã trao tận tay bà con"
                    : don.batchId
                    ? "Đang theo chuyến xe"
                    : "Chờ tổ chức gom lô"}
                </span>
                <Link
                  href={`/track/${don.trackingId}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1F4D36]/10 hover:bg-[#1F4D36] text-[#1F4D36] hover:text-white text-xs font-bold transition group"
                >
                  <span>Xem hành trình</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transparency Note Card */}
      <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-[#E5E7E0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1F4D36]/10 text-[#1F4D36] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#1C2B24] uppercase tracking-wider">
              Cam Kết Minh Bạch Cấp Lô Hàng (Batch Traceability)
            </h4>
            <p className="text-xs text-[#5F6F66] leading-relaxed max-w-2xl">
              Tất cả hiện vật đều được truy vết qua Mã Vận Đơn duy nhất. Khi đến điểm trao phát thực địa, biên bản giao nhận và hình ảnh đối soát được cập nhật trực tiếp lên dòng thời gian công khai.
            </p>
          </div>
        </div>
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D36] hover:text-[#F28C1B] whitespace-nowrap transition"
        >
          <span>Tìm hiểu quy trình</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
    </RoleGuard>
  );
}