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
  AlertCircle,
  Copy,
  Check,
  Truck,
  Eye,
  Layers,
  ExternalLink,
  FileText,
  Phone,
  Mail,
  X,
  ChevronRight,
  Package,
  Camera,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { volunteerService, tripService } from "@/services";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function MyActivitiesPage() {
  const { user, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedDetailApp, setSelectedDetailApp] = useState<any | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<"route" | "batches" | "volunteers" | "guidelines">("route");

  const loadData = () => {
    if (user) {
      setLoading(true);
      Promise.all([
        volunteerService.getByUser(user.id),
        tripService.getByOrganization(),
      ])
        .then(([apps, fetchedTrips]) => {
          setApplications(apps);
          setAllTrips(fetchedTrips);
          const volunteerTrips = fetchedTrips.filter(
            (t: any) =>
              t.leaderId === user.id ||
              t.volunteers?.some((v: any) => v.userId === user.id)
          );
          setUserTrips(volunteerTrips);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCheckIn = async (app: any) => {
    if (!user) return;
    if (app.status !== "APPROVED") {
      showToast("Chỉ các đơn đã được Ban tổ chức phê duyệt mới có thể điểm danh", "warning");
      return;
    }
    if (app.checkedInAt) {
      showToast("Bạn đã điểm danh thành công cho hoạt động này rồi", "info");
      return;
    }

    try {
      await volunteerService.checkIn(app.id, user);
      showToast("Điểm danh thành công! Trạng thái đã được ghi nhận vào nhật ký thực địa.", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi điểm danh", "error");
    }
  };

  const copyQrCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast(`Đã sao chép mã xác thực: ${code}`, "success");
    setTimeout(() => setCopiedCode(false), 2000);
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

        {/* KPI Metrics Strip */}
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
            {filteredApps.map((app) => {
              const assignedTrip = userTrips.find(
                (t) =>
                  t.eventId === app.eventId &&
                  (t.leaderId === user.id ||
                    t.volunteers?.some(
                      (v: any) => v.applicationId === app.id || v.userId === user.id
                    ))
              );

              return (
              <div
                key={app.id}
                onClick={() => {
                  setSelectedDetailApp(app);
                  setDetailModalTab("route");
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      ĐƠN-{app.id.substring(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#1F4D36] transition-colors">
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
                    {app.note && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 pt-1 italic">
                        {app.note}
                      </p>
                    )}
                  </div>

                  {/* Assigned Distribution Trip Order */}
                  {assignedTrip ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDetailApp(app);
                        setDetailModalTab("route");
                      }}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 group-hover:border-sky-300 group-hover:bg-sky-50/40 transition-all space-y-2 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#1F4D36]" />
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                            Lệnh Điều Động Chuyến Xe
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          {assignedTrip.tripCode}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">
                        {assignedTrip.name}
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600 pt-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Nhiệm vụ đoàn:</span>
                          <span className="font-bold text-[#1F4D36]">
                            {assignedTrip.leaderId === user.id
                              ? "Trưởng đoàn điều phối 👑"
                              : "Thành viên đoàn xe"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Ngày xuất phát:</span>
                          <span className="font-medium text-slate-800">
                            {new Date(assignedTrip.scheduledDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Lộ trình cứu trợ:</span>
                          <span className="font-semibold text-emerald-700">
                            {assignedTrip.points?.length || 0} điểm trao quà
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-[11px] font-bold text-sky-700 group-hover:text-sky-900">
                        <span>Bấm xem chi tiết chuyến xe</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ) : app.status === "APPROVED" ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDetailApp(app);
                        setDetailModalTab("route");
                      }}
                      className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 group-hover:border-emerald-200 group-hover:bg-emerald-100/70 text-[11px] text-emerald-800 flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Hồ sơ đã duyệt. Bấm xem kế hoạch & thông tin chuẩn bị.</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    </div>
                  ) : null}
                </div>

                {/* Bottom Action Strip */}
                <div
                  className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {app.status === "PENDING" ? (
                    <>
                      <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Đang chờ duyệt
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailApp(app)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </>
                  ) : app.status === "APPROVED" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDetailApp(app);
                          setDetailModalTab("route");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                        title="Xem chi tiết chuyến xe"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1F4D36]" />
                        <span>Chi tiết</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQrModal(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#1F4D36]" />
                          <span>Mã QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCheckIn(app)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            app.checkedInAt
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-[#1F4D36] text-white hover:bg-[#153826] shadow-xs"
                          }`}
                        >
                          {app.checkedInAt ? "Đã điểm danh ✓" : "Điểm danh"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full text-right text-[11px] text-slate-400">
                      Đơn đã đóng
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Trip and Campaign Detail Modal */}
        {selectedDetailApp && (() => {
          const modalTrip =
            allTrips.find(
              (t: any) =>
                t.eventId === selectedDetailApp.eventId &&
                (t.leaderId === user?.id ||
                  t.volunteers?.some(
                    (v: any) =>
                      v.applicationId === selectedDetailApp.id || v.userId === user?.id
                  ))
            ) ||
            allTrips.find((t: any) => t.eventId === selectedDetailApp.eventId);

          const isLeader = modalTrip && modalTrip.leaderId === user?.id;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto animate-scaleUp">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Chiến dịch: {selectedDetailApp.event?.title || "Cứu trợ thực địa"}
                      </span>
                      {modalTrip && (
                        <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          {modalTrip.tripCode}
                        </span>
                      )}
                      {modalTrip && <StatusBadge status={modalTrip.status} />}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {modalTrip ? modalTrip.name : "Kế Hoạch Điều Động & Vai Trò Tình Nguyện"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Đơn vị chủ trì: <strong className="text-slate-700">{modalTrip?.organization?.name || selectedDetailApp.event?.organization?.name || "Tổ chức cứu trợ"}</strong>
                      {selectedDetailApp.event?.location && ` • Khu vực: ${selectedDetailApp.event.location}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailApp(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                    title="Đóng cửa sổ"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {modalTrip ? (
                    <>
                      {/* Trip Key Info Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            Điểm Tập Kết / Xuất Phát
                          </span>
                          <p className="text-xs font-semibold text-slate-900 line-clamp-2" title={modalTrip.departurePoint}>
                            {modalTrip.departurePoint}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-sky-600" />
                            Ngày Khởi Hành
                          </span>
                          <p className="text-xs font-bold text-slate-900">
                            {new Date(modalTrip.scheduledDate).toLocaleDateString("vi-VN")}
                          </p>
                          {modalTrip.startedAt && (
                            <span className="text-[10px] text-emerald-700 font-medium block">
                              Đã xuất phát: {new Date(modalTrip.startedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-amber-600" />
                            Trưởng Đoàn Điều Phối
                          </span>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {modalTrip.leader?.name || "TNV Trưởng đoàn"}
                          </p>
                          {modalTrip.leader?.phone && (
                            <span className="text-[11px] font-mono font-medium text-emerald-800 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {modalTrip.leader.phone}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Nhiệm Vụ Của Bạn
                          </span>
                          <p className="text-xs font-bold text-[#1F4D36]">
                            {isLeader ? "Trưởng đoàn điều phối 👑" : "Thành viên đoàn xe"}
                          </p>
                          <span className="text-[10px] text-emerald-700 block line-clamp-1">
                            Chuyên môn: {selectedDetailApp.role?.name || "Hỗ trợ thực địa"}
                          </span>
                        </div>
                      </div>

                      {/* Tabs Bar */}
                      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-bold pt-1">
                        <button
                          type="button"
                          onClick={() => setDetailModalTab("route")}
                          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            detailModalTab === "route"
                              ? "border-[#1F4D36] text-[#1F4D36]"
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>Lộ trình điểm trao quà ({modalTrip.points?.length || 0})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDetailModalTab("batches")}
                          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            detailModalTab === "batches"
                              ? "border-[#1F4D36] text-[#1F4D36]"
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Package className="w-3.5 h-3.5 text-purple-600" />
                          <span>Hàng hóa trên xe ({modalTrip.batches?.length || 0} Lô)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDetailModalTab("volunteers")}
                          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            detailModalTab === "volunteers"
                              ? "border-[#1F4D36] text-[#1F4D36]"
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          <span>Đội ngũ đoàn xe ({modalTrip.enrichedVolunteers?.length || modalTrip.volunteers?.length || 0})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDetailModalTab("guidelines")}
                          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            detailModalTab === "guidelines"
                              ? "border-[#1F4D36] text-[#1F4D36]"
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hướng dẫn & An toàn</span>
                        </button>
                      </div>

                      {/* Tab 1: Route & Distribution Points */}
                      {detailModalTab === "route" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Thứ tự các điểm cứu trợ được phê duyệt trong hành trình</span>
                            <span className="font-semibold text-slate-700">Tổng cộng {modalTrip.points?.length || 0} điểm dừng</span>
                          </div>

                          {modalTrip.points && modalTrip.points.length > 0 ? (
                            <div className="space-y-3">
                              {modalTrip.points.map((pt: any) => (
                                <div
                                  key={pt.id}
                                  className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all space-y-3 shadow-2xs"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                    <div className="flex items-start sm:items-center gap-2.5">
                                      <span className="w-6 h-6 rounded-full bg-[#1F4D36] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                                        {pt.order}
                                      </span>
                                      <div>
                                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                          {pt.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                          <span>{pt.address}</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                      <StatusBadge status={pt.status} />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400 font-medium">Hộ thụ hưởng:</span>
                                      <strong className="text-slate-800">{pt.plannedHouseholds || 50} hộ gia đình</strong>
                                    </div>
                                    {pt.contactPerson && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-medium">Liên hệ địa phương:</span>
                                        <strong className="text-slate-800">{pt.contactPerson}</strong>
                                      </div>
                                    )}
                                    {pt.arrivedAt && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-medium">Đoàn xe đến lúc:</span>
                                        <span className="font-semibold text-sky-700">
                                          {new Date(pt.arrivedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                      </div>
                                    )}
                                    {pt.distributedAt && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-medium">Hoàn thành phát quà:</span>
                                        <span className="font-semibold text-emerald-700">
                                          {new Date(pt.distributedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Distributed Records */}
                                  {pt.records && pt.records.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                                        Quà Cứu Trợ Đã Bàn Giao Tại Điểm
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {pt.records.map((rec: any) => (
                                          <div
                                            key={rec.id}
                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-semibold border border-emerald-200"
                                          >
                                            🎁 {rec.distributedQuantity} {rec.unit} {rec.itemType} (Lô: {rec.batchCode})
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Photos & Evidences */}
                                  {pt.evidences && pt.evidences.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 space-y-2">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                        <Camera className="w-3.5 h-3.5 text-purple-600" />
                                        Ảnh Xác Thực Bàn Giao Thực Địa
                                      </span>
                                      <div className="flex flex-wrap gap-3">
                                        {pt.evidences.map((ev: any, idx: number) => (
                                          <div key={idx} className="space-y-1">
                                            <img
                                              src={ev.photoUrl}
                                              alt={ev.caption || "Ảnh thực địa"}
                                              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-200 shadow-2xs"
                                            />
                                            {ev.caption && (
                                              <p className="text-[10px] text-slate-600 max-w-[110px] truncate" title={ev.caption}>
                                                {ev.caption}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {pt.note && (
                                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                      Ghi chú thực địa: {pt.note}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                              Ban tổ chức đang khảo sát các điểm dừng cứu trợ cụ thể trên tuyến đường.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 2: Batches */}
                      {detailModalTab === "batches" && (
                        <div className="space-y-4">
                          <div className="text-xs text-slate-500">
                            Danh sách các lô hàng cứu trợ được đóng gói và bàn giao lên chuyến xe này
                          </div>

                          {modalTrip.batches && modalTrip.batches.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {modalTrip.batches.map((b: any) => {
                                const distQty = b.distributedQuantity || 0;
                                const pct = Math.min(100, Math.round((distQty / b.totalQuantity) * 100));
                                return (
                                  <div
                                    key={b.id}
                                    className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/40 space-y-3"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono font-bold text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                                        {b.batchCode}
                                      </span>
                                      <StatusBadge status={b.status} />
                                    </div>

                                    <div>
                                      <h4 className="font-bold text-sm text-slate-900">{b.name || b.itemType}</h4>
                                      <p className="text-xs text-purple-800 font-semibold mt-0.5">
                                        Vật tư: {b.itemType} • Tổng khối lượng: {b.totalQuantity} {b.unit}
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                                        <span>Tiến độ trao quà:</span>
                                        <strong>{distQty} / {b.totalQuantity} {b.unit} ({pct}%)</strong>
                                      </div>
                                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-purple-600 h-full rounded-full transition-all"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                              Chưa có lô hàng nào được gán cho chuyến xe này.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 3: Volunteers Crew */}
                      {detailModalTab === "volunteers" && (
                        <div className="space-y-4">
                          <div className="text-xs text-slate-500">
                            Đội ngũ tình nguyện viên được phân công đi cùng chuyến xe
                          </div>

                          {/* Leader Card */}
                          <div className="p-4 rounded-2xl border-2 border-amber-300/80 bg-amber-50/60 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                                👑
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                                    Trưởng Đoàn Điều Phối
                                  </span>
                                  {modalTrip.leaderId === user?.id && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      (Chính là bạn)
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                                  {modalTrip.leader?.name || "TNV Trưởng đoàn"}
                                </h4>
                                <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 mt-0.5">
                                  {modalTrip.leader?.phone && <span>📞 {modalTrip.leader.phone}</span>}
                                  {modalTrip.leader?.email && <span>✉️ {modalTrip.leader.email}</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Other volunteers list */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(modalTrip.enrichedVolunteers && modalTrip.enrichedVolunteers.length > 0
                              ? modalTrip.enrichedVolunteers
                              : modalTrip.volunteers || []
                            ).map((v: any) => {
                              const isMe = v.userId === user?.id;
                              return (
                                <div
                                  key={v.id || v.userId}
                                  className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                                    isMe
                                      ? "bg-emerald-50/80 border-emerald-300 shadow-2xs"
                                      : "bg-slate-50 border-slate-200/90"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900">
                                      {v.user?.name || (isMe ? user?.name : "Tình nguyện viên")}
                                      {isMe && <span className="text-emerald-700 font-bold ml-1">(Bạn)</span>}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                      {v.role === "LEADER" ? "Trưởng đoàn" : "Thành viên"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600">
                                    Nhiệm vụ: <strong className="text-slate-800">{v.roleName || "Hỗ trợ đoàn xe"}</strong>
                                  </p>
                                  {v.user?.phone && (
                                    <p className="text-[11px] text-slate-500">
                                      Liên hệ: <span className="font-mono">{v.user.phone}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tab 4: Guidelines */}
                      {detailModalTab === "guidelines" && (
                        <div className="space-y-4">
                          {modalTrip.notes && (
                            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-sky-700" />
                                Dặn Dò Của Ban Tổ Chức
                              </span>
                              <p className="text-xs text-sky-800 leading-relaxed pt-0.5">
                                {modalTrip.notes}
                              </p>
                            </div>
                          )}

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              Quy Định An Toàn & Chuẩn Bị Thực Địa
                            </h4>
                            <ul className="text-xs text-slate-600 space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Mặc áo đồng phục hoặc xuất trình thẻ tình nguyện viên OpenAid tại điểm tập kết.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Chuẩn bị ủng cao su, áo mưa cá nhân và pin sạc dự phòng cho điện thoại.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Tuyệt đối đi theo đoàn xe, tuân thủ hiệu lệnh điều phối của Trưởng đoàn và chính quyền địa phương.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Chụp ảnh đối soát và kiểm tra danh sách người nhận quà để đảm bảo minh bạch 100%.</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
                            <Phone className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                              <p className="font-bold">Đường dây nóng hỗ trợ khẩn cấp của BTC</p>
                              <p className="text-[11px] text-amber-700">
                                {modalTrip.organization?.contactPhone || selectedDetailApp.event?.organization?.contactPhone || "0905 123 456"} • Luôn giữ liên lạc trong suốt chuyến đi
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* No Trip Yet for Campaign */
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3.5">
                        <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-amber-900">
                            Đang Lên Lịch & Sắp Xếp Chuyến Xe Cứu Trợ
                          </h4>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Hồ sơ ứng tuyển của bạn đã được Ban tổ chức phê duyệt. Hiện tại ban tổ chức đang tập kết hàng hóa hiện vật tại kho và khảo sát lộ trình an toàn đến các xã/thôn bị ảnh hưởng.
                          </p>
                          <p className="text-xs text-amber-800 font-semibold pt-1">
                            Lệnh điều động chuyến xe (gồm mã xe, trưởng đoàn, điểm xuất phát và lộ trình các điểm trao quà) sẽ được cập nhật tự động tại đây ngay khi đoàn xe chuẩn bị xuất phát.
                          </p>
                        </div>
                      </div>

                      {/* Application Details Summary */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Thông Tin Đơn Ứng Tuyển Của Bạn
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400">Mã hồ sơ:</span>
                            <p className="font-mono font-bold text-slate-800">
                              ĐƠN-{selectedDetailApp.id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Trạng thái:</span>
                            <div className="mt-0.5">
                              <StatusBadge status={selectedDetailApp.status} />
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Vị trí đảm nhiệm:</span>
                            <p className="font-semibold text-[#1F4D36]">
                              {selectedDetailApp.role?.name || "Tình nguyện viên chung"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Ngày đăng ký:</span>
                            <p className="font-medium text-slate-800">
                              {new Date(selectedDetailApp.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        {selectedDetailApp.note && (
                          <div className="pt-2 border-t border-slate-200/60 text-xs">
                            <span className="text-slate-400">Ghi chú khi nộp đơn:</span>
                            <p className="text-slate-700 italic mt-0.5">{selectedDetailApp.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Link
                    href={`/events/${selectedDetailApp.eventId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D36] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở trang chiến dịch chi tiết</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {selectedDetailApp.status === "APPROVED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setQrModal(selectedDetailApp)}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#1F4D36]" />
                          <span>Mã QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCheckIn(selectedDetailApp)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            selectedDetailApp.checkedInAt
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-[#1F4D36] text-white hover:bg-[#153826] shadow-xs"
                          }`}
                        >
                          {selectedDetailApp.checkedInAt ? "Đã điểm danh ✓" : "Điểm danh thực địa"}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedDetailApp(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* QR Modal with Text Code Fallback */}
        {qrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Mã QR Điểm Danh Tình Nguyện Viên
              </h3>
              <div className="w-44 h-44 bg-slate-50 border-2 border-dashed border-[#1F4D36] rounded-2xl mx-auto flex items-center justify-center">
                <QrCode className="w-28 h-28 text-[#1F4D36]" />
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-900">
                  {qrModal.event?.title}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800 tracking-wider">
                  <span>VOL-{qrModal.id.substring(0, 8).toUpperCase()}</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyQrCode(`VOL-${qrModal.id.substring(0, 8).toUpperCase()}`)
                    }
                    className="p-1 hover:text-[#1F4D36] cursor-pointer"
                    title="Sao chép mã"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                  Xuất trình mã này hoặc đọc mã số trên cho Trưởng đoàn tại điểm tập kết để xác thực có mặt.
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
