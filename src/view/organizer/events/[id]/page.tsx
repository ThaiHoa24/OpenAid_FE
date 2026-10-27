"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { volunteerService, type EnrichedVolunteerApplication } from "@/services/volunteerService";
import { donationService, type EnrichedDonation } from "@/services/donationService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Calendar,
  MapPin,
  Users,
  Package,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  UserCheck,
  Globe,
  Ban,
  Layers,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Check,
  X,
  FileText,
  Building2,
  Sparkles,
} from "lucide-react";

export default function OrganizerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const router = useRouter();
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { formatDate, formatDateTime } = useTranslation();

  const [event, setEvent] = useState<EnrichedEvent | null>(null);
  const [volunteers, setVolunteers] = useState<EnrichedVolunteerApplication[]>([]);
  const [donations, setDonations] = useState<EnrichedDonation[]>([]);
  const [activeTab, setActiveTab] = useState<"volunteers" | "donations" | "info">("volunteers");
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [evt, vols, dons] = await Promise.all([
        eventService.getById(eventId),
        volunteerService.getByEvent(eventId),
        donationService.getByEvent(eventId),
      ]);
      setEvent(evt);
      setVolunteers(vols);
      setDonations(dons);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tải dữ liệu chiến dịch", "error");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, showToast]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  // Handle Volunteer Application Review (Approve / Reject)
  const handleReviewVolunteer = async (appId: string, status: "APPROVED" | "REJECTED") => {
    if (!user) return;
    setActionLoadingId(appId);
    try {
      await volunteerService.reviewApplication(appId, status, user);
      showToast(
        status === "APPROVED"
          ? "Đã phê duyệt đơn đăng ký tình nguyện viên!"
          : "Đã từ chối đơn đăng ký.",
        status === "APPROVED" ? "success" : "info"
      );
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Thao tác thất bại", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Event Status Change
  const handleStatusChange = async (newStatus: any) => {
    if (!user || !event) return;
    try {
      await eventService.changeStatus(event.id, newStatus, user);
      showToast(`Đã chuyển trạng thái chiến dịch: ${newStatus}`, "success");
      loadData();
    } catch (err: any) {
      showToast(err?.message || "Không thể đổi trạng thái", "error");
    }
  };

  // Role Gate: Only organizer or system admin
  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E5E7E0] text-center shadow-sm space-y-4">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-[#1C2B24]">Yêu Cầu Quyền Ban Tổ Chức</h2>
        <p className="text-xs text-[#5F6F66]">
          Khu vực quản lý chiến dịch chỉ dành cho tài khoản thuộc Ban tổ chức cứu trợ.
        </p>
        <button
          onClick={() => loginAsDemo("organizer@openaid.demo")}
          className="w-full py-2.5 bg-[#1F4D36] hover:bg-[#153a28] text-white rounded-full text-xs font-bold transition cursor-pointer"
        >
          Đăng nhập vai trò Ban tổ chức (Demo)
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F4D36]" />
        <span className="text-xs font-semibold text-[#5F6F66]">Đang tải dữ liệu điều phối chiến dịch...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E5E7E0] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-[#1C2B24]">Không tìm thấy chiến dịch</h2>
        <p className="text-xs text-[#5F6F66]">Chiến dịch này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link
          href="/organizer/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D36] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách chiến dịch</span>
        </Link>
      </div>
    );
  }

  // Filter volunteers by status
  const filteredVolunteers = volunteers.filter((v) => {
    if (volunteerStatusFilter === "ALL") return true;
    return v.status === volunteerStatusFilter;
  });

  const pendingVolunteersCount = volunteers.filter((v) => v.status === "PENDING").length;
  const approvedVolunteersCount = volunteers.filter((v) => v.status === "APPROVED").length;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D36] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Bàn Chiến dịch</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/events/${event.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            title="Mở giao diện người dân nhìn thấy"
          >
            <span>Trang công khai</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Campaign Management Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7E0] shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Bàn Quản Lý Chiến Dịch
              </span>
              <StatusBadge status={event.status} />
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {event.category}
              </span>
              <span className="text-xs text-[#5F6F66]">
                Khu vực: <strong className="text-[#1C2B24]">{event.area}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-y-2 gap-x-5 text-xs text-[#5F6F66]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#1F4D36] shrink-0" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1F4D36] shrink-0" />
                {formatDate(event.startDate)} — {formatDate(event.endDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#1F4D36] shrink-0" />
                {event.contactPerson} ({event.contactPhone})
              </span>
            </div>
          </div>

          {/* Organizer Quick Actions for this campaign */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end justify-center shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">
              Thao tác chiến dịch:
            </span>

            {event.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => handleStatusChange("PUBLISHED")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1F4D36] hover:bg-[#153a28] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Phát động công khai</span>
              </button>
            )}

            {event.status === "PUBLISHED" && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange("CLOSED")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Đóng tiếp nhận</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Bạn có chắc chắn muốn hủy chiến dịch này không?")) {
                      handleStatusChange("CANCELLED");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Hủy chiến dịch</span>
                </button>
              </>
            )}

            {event.status === "CLOSED" && (
              <button
                type="button"
                onClick={() => handleStatusChange("PUBLISHED")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Mở lại tiếp nhận</span>
              </button>
            )}
          </div>
        </div>

        {/* Campaign Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E7E0]">
            <span className="text-[11px] font-bold text-[#5F6F66] uppercase">Đơn TNV chờ duyệt</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingVolunteersCount}</div>
            <p className="text-[11px] text-[#5F6F66] mt-0.5">Cần bạn xem xét</p>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E7E0]">
            <span className="text-[11px] font-bold text-[#5F6F66] uppercase">TNV Đã duyệt</span>
            <div className="text-2xl font-black text-[#1F4D36] mt-1">
              {approvedVolunteersCount} / {event.totalRequiredVolunteers}
            </div>
            <p className="text-[11px] text-[#5F6F66] mt-0.5">Chỉ tiêu thực địa</p>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E7E0]">
            <span className="text-[11px] font-bold text-[#5F6F66] uppercase">Lượt gửi hiện vật</span>
            <div className="text-2xl font-black text-[#F28C1B] mt-1">{donations.length}</div>
            <p className="text-[11px] text-[#5F6F66] mt-0.5">Đã đăng ký chuyển về kho</p>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E7E0]">
            <span className="text-[11px] font-bold text-[#5F6F66] uppercase">Danh mục nhu yếu phẩm</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{event.donationNeeds.length}</div>
            <p className="text-[11px] text-[#5F6F66] mt-0.5">Mặt hàng đang vận động</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("volunteers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer whitespace-nowrap ${
            activeTab === "volunteers"
              ? "bg-[#1F4D36] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-[#E5E7E0]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Duyệt Đơn Tình Nguyện Viên ({volunteers.length})</span>
          {pendingVolunteersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
              {pendingVolunteersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("donations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer whitespace-nowrap ${
            activeTab === "donations"
              ? "bg-[#1F4D36] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-[#E5E7E0]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Hiện Vật Tiếp Nhận ({donations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition cursor-pointer whitespace-nowrap ${
            activeTab === "info"
              ? "bg-[#1F4D36] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-[#E5E7E0]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Chỉ Tiêu & Nhu Cầu</span>
        </button>
      </div>

      {/* TAB 1: DUYỆT ĐƠN TÌNH NGUYỆN VIÊN */}
      {activeTab === "volunteers" && (
        <div className="space-y-4">
          {/* Volunteer Status Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7E0]">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Lọc đơn:</span>
              {[
                { key: "ALL", label: `Tất cả (${volunteers.length})` },
                { key: "PENDING", label: `Chờ duyệt (${pendingVolunteersCount})` },
                { key: "APPROVED", label: `Đã chấp thuận (${approvedVolunteersCount})` },
                { key: "REJECTED", label: `Đã từ chối (${volunteers.filter((v) => v.status === "REJECTED").length})` },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setVolunteerStatusFilter(f.key)}
                  className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                    volunteerStatusFilter === f.key
                      ? "bg-[#1F4D36] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-[#5F6F66]">
              Ban tổ chức bấm <strong>Chấp thuận</strong> hoặc <strong>Từ chối</strong> trực tiếp trên từng đơn.
            </p>
          </div>

          {filteredVolunteers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7E0] space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#5F6F66]">
                {volunteerStatusFilter === "ALL"
                  ? "Chưa có tình nguyện viên nào nộp đơn ứng tuyển cho chiến dịch này."
                  : "Không có đơn ứng tuyển nào trong trạng thái đã chọn."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVolunteers.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-5 border border-[#E5E7E0] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1F4D36]/40 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1F4D36]/10 text-[#1F4D36] font-bold text-xs flex items-center justify-center">
                          {app.user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#1C2B24]">{app.user?.name || "Ứng viên"}</h4>
                          <span className="text-[10px] text-[#5F6F66] font-mono">{app.user?.email}</span>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#E5E7E0] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Vị trí ứng tuyển:</span>
                        <strong className="text-[#1F4D36]">{app.role?.name || "TNV thực địa"}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Số điện thoại:</span>
                        <span className="font-mono font-semibold text-slate-700">{app.user?.phone || "09xx"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Ngày nộp đơn:</span>
                        <span>{formatDateTime(app.createdAt)}</span>
                      </div>
                      {app.note && (
                        <div className="pt-1 border-t border-slate-200">
                          <span className="text-slate-500 block text-[11px]">Ghi chú / Nguyện vọng:</span>
                          <p className="text-slate-700 italic mt-0.5">&ldquo;{app.note}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Approve / Reject Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    {app.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleReviewVolunteer(app.id, "REJECTED")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleReviewVolunteer(app.id, "APPROVED")}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1F4D36] hover:bg-[#153a28] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Chấp thuận</span>
                        </button>
                      </>
                    ) : app.status === "APPROVED" ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã được duyệt tham gia
                        </span>
                        <button
                          type="button"
                          onClick={() => handleReviewVolunteer(app.id, "REJECTED")}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Hủy duyệt
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Đã từ chối
                        </span>
                        <button
                          type="button"
                          onClick={() => handleReviewVolunteer(app.id, "APPROVED")}
                          className="text-[11px] font-bold text-[#1F4D36] hover:underline cursor-pointer"
                        >
                          Duyệt lại
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HIỆN VẬT QUYÊN GÓP */}
      {activeTab === "donations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E7E0]">
            <div>
              <h3 className="font-extrabold text-sm text-[#1C2B24]">Danh sách hiện vật quyên góp</h3>
              <p className="text-xs text-[#5F6F66]">
                Theo dõi các phần hiện vật người dân đã cam kết gửi về kho của chiến dịch này.
              </p>
            </div>
            <Link
              href="/organizer/inventory"
              className="px-3.5 py-1.5 rounded-full bg-[#1F4D36] hover:bg-[#153a28] text-white text-xs font-bold transition"
            >
              Vào Sổ Kho Bãi →
            </Link>
          </div>

          {donations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7E0] space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#5F6F66]">
                Chưa có lượt cam kết hiện vật nào cho chiến dịch này.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E5E7E0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-[#FAF9F6] text-[#1C2B24] uppercase font-bold text-[11px] border-b border-[#E5E7E0]">
                    <tr>
                      <th className="py-3.5 px-4">Mã Vận Đơn</th>
                      <th className="py-3.5 px-4">Nhà Hảo Tâm</th>
                      <th className="py-3.5 px-4">Hiện Vật & Số Lượng</th>
                      <th className="py-3.5 px-4">Trạng Thái</th>
                      <th className="py-3.5 px-4">Lô Gom Hàng</th>
                      <th className="py-3.5 px-4">Ngày Đóng Góp</th>
                      <th className="py-3.5 px-4 text-right">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-[#1F4D36]">
                          {d.trackingId}
                        </td>
                        <td className="py-3 px-4 text-[#1C2B24] font-semibold">
                          {d.donor?.name || "Ẩn danh"}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1C2B24]">
                          {d.quantity} {d.unit} {d.itemType}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="py-3 px-4">
                          {d.batch ? (
                            <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-bold">
                              {d.batch.batchCode}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa đóng lô</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(d.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/track/${d.trackingId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[#1F4D36] hover:underline font-bold text-xs"
                          >
                            <span>Truy vết</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHỈ TIÊU & NHU CẦU */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volunteer Roles */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7E0] shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#1C2B24] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1F4D36]" />
              <span>Chỉ tiêu vị trí tình nguyện viên</span>
            </h3>

            <div className="space-y-3">
              {event.volunteerRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E7E0] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#1C2B24]">{role.name}</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {role.approvedQuantity} / {role.requiredQuantity} chỉ tiêu
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6F66]">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Donation Needs */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E7E0] shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#1C2B24] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F28C1B]" />
              <span>Nhu cầu hiện vật tiếp nhận</span>
            </h3>

            <div className="space-y-3">
              {event.donationNeeds.map((need) => {
                const pct =
                  need.targetQuantity > 0
                    ? Math.min(100, Math.round((need.receivedQuantity / need.targetQuantity) * 100))
                    : 100;
                return (
                  <div
                    key={need.id}
                    className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E7E0] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1C2B24]">{need.itemType}</span>
                      <span className="text-xs font-bold text-[#1F4D36]">{pct}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-[#5F6F66]">
                      <div>
                        Mục tiêu: <strong>{need.targetQuantity} {need.unit}</strong>
                      </div>
                      <div>
                        Đã cam kết: <strong className="text-blue-700">{need.pledgedQuantity}</strong>
                      </div>
                      <div>
                        Đã nhập kho: <strong className="text-emerald-700">{need.receivedQuantity}</strong>
                      </div>
                    </div>

                    <ProgressBar
                      value={pct}
                      className="h-1.5 rounded-full bg-slate-200 overflow-hidden"
                      fillClassName="h-full bg-[#1F4D36] rounded-full transition-all"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
