"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Truck,
  Building2,
  AlertCircle,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { donationService } from "@/services/donationService";
import type { DonationNeed, Donation } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DonateInKindPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EnrichedEvent | null>(null);
  const [selectedNeedId, setSelectedNeedId] = useState<string>("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [donorPhone, setDonorPhone] = useState("");
  const [shippingMethod, setShippingMethod] = useState("DIRECT");
  const [shippingCode, setShippingCode] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    eventService.getById(eventId).then((res) => {
      if (!isMounted) return;
      setEvent(res);
      if (res && res.donationNeeds.length > 0) {
        setSelectedNeedId(res.donationNeeds[0].id);
      }
      if (user?.phone) {
        setDonorPhone(user.phone);
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [eventId, user]);

  const selectedNeed = event?.donationNeeds.find((n) => n.id === selectedNeedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNeed || !quantity || Number(quantity) <= 0 || !user || !event) return;

    if (!donorPhone.trim()) {
      showToast("Vui lòng cung cấp số điện thoại liên lạc để thủ kho tiếp nhận", "warning");
      return;
    }

    const shippingLabels: Record<string, string> = {
      DIRECT: "Gửi trực tiếp tại kho tập kết",
      COURIER: "Gửi qua chuyển phát bưu điện/chuyển phát nhanh",
      BUS: "Gửi qua chành xe / xe khách liên tỉnh",
    };

    const formattedNote = [
      `[SĐT người gửi: ${donorPhone.trim()}]`,
      `[Phương thức: ${shippingLabels[shippingMethod] || shippingMethod}]`,
      shippingCode.trim() ? `[Mã gửi hàng/Biển số xe: ${shippingCode.trim()}]` : "",
      note.trim() ? `[Ghi chú: ${note.trim()}]` : "",
    ]
      .filter(Boolean)
      .join(" - ");

    setSubmitting(true);
    try {
      const don = await donationService.create(
        {
          eventId,
          donationNeedId: selectedNeed.id,
          quantity: Number(quantity),
          note: formattedNote,
        },
        user
      );
      setCreatedDonation(don);
      showToast("Cam kết quyên góp thành công! Mã vận đơn đã được cấp.", "success");
    } catch (err: any) {
      showToast(err.message || "Đã xảy ra lỗi khi tạo cam kết quyên góp", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!createdDonation) return;
    navigator.clipboard.writeText(createdDonation.trackingId);
    setCopied(true);
    showToast(`Đã sao chép mã vận đơn: ${createdDonation.trackingId}`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col justify-center items-center text-slate-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F4D36]" />
        <span className="text-xs font-semibold text-slate-600">
          Đang tải danh mục nhu yếu phẩm cần tiếp nhận...
        </span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Không tìm thấy thông tin chiến dịch</h2>
        <p className="text-xs text-slate-500">
          Chiến dịch có thể đã đóng hoặc đường dẫn không còn tồn tại.
        </p>
        <Button href="/events" variant="primary" className="w-full">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Warning when quantity exceeds target
  const numQty = Number(quantity || 0);
  const exceedsTarget =
    selectedNeed &&
    numQty > 0 &&
    selectedNeed.pledgedQuantity + numQty > selectedNeed.targetQuantity;

  return (
    <RoleGuard allowedRoles={["user"]}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn pb-16">
        {/* Back link */}
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1F4D36] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại chi tiết chiến dịch</span>
        </Link>

        {createdDonation ? (
          /* Màn Hình Cam Kết Thành Công & Cấp Mã Tracking */
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center mx-auto border border-emerald-200/60 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                TRẠNG THÁI: CHỜ TIẾP NHẬN TẠI KHO
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Cảm ơn bạn đã chung tay quyên góp hiện vật!
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Phần đóng góp{" "}
                <span className="font-bold text-slate-900">
                  {createdDonation.quantity} {createdDonation.unit} {createdDonation.itemType}
                </span>{" "}
                của bạn đã được ghi nhận vào sổ theo dõi minh bạch.
              </p>
            </div>

            {/* Tracking ID Box */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-left">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
                Mã tra cứu hành trình công khai (Tracking ID)
              </span>
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-mono text-base sm:text-lg font-black text-[#1F4D36] tracking-wider">
                  {createdDonation.trackingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
              </div>
            </div>

            {/* Warehouse Drop-off Instructions */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-left text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#1F4D36]">
                <Building2 className="w-4 h-4" />
                <span>Địa điểm tập kết tiếp nhận hàng hóa</span>
              </div>
              <div className="text-slate-700 text-[11px] space-y-1">
                <div><strong>Đơn vị tiếp nhận:</strong> {event.organization?.name || "Ban Điều Phối Cứu Trợ"}</div>
                <div><strong>Địa chỉ kho:</strong> {event.organization?.address || event.location}</div>
                <div><strong>Hotline tiếp nhận:</strong> {event.organization?.contactPhone || "Chưa có"}</div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 italic">
                * Vui lòng ghi rõ mã Tracking ID <strong>{createdDonation.trackingId}</strong> lên mặt ngoài thùng hàng để thủ kho quét nhận ngay khi kiện hàng đến nơi.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Button href={`/track/${createdDonation.trackingId}`} variant="primary" className="text-xs">
                Xem hành trình vận đơn
              </Button>
              <Button href="/my/donations" variant="outline" className="text-xs">
                Xem đóng góp của tôi
              </Button>
            </div>
          </div>
        ) : (
          /* Form Cam Kết Quyên Góp Hiện Vật */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36]">
                  Quyên Góp Hiện Vật Cứu Trợ
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Chiến dịch: {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.organization?.name || "Tổ chức từ thiện"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kho: {event.organization?.address || event.location}</span>
                </div>
              </div>
            </div>

            {/* 1. Thông Tin Người Quyên Góp */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#1F4D36]" />
                <h3 className="text-sm font-bold text-slate-900">
                  1. Thông tin nhà hảo tâm
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">Họ và tên người gửi</span>
                  <div className="text-xs font-bold text-slate-900">{user?.name || "Nhà hảo tâm"}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">Email nhận thông báo</span>
                  <div className="text-xs font-bold text-slate-900 truncate">{user?.email || "Chưa có"}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Số điện thoại người gửi hàng (để thủ kho xác nhận) <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-400">Dùng để đối chiếu khi kiện hàng tới</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1F4D36]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Chọn Nhu Cầu & Số Lượng */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#1F4D36]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Chọn loại nhu yếu phẩm & Số lượng <span className="text-rose-500">*</span>
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">{event.donationNeeds.length} danh mục cần</span>
              </div>

              {/* Danh sách nhu cầu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.donationNeeds.map((need) => {
                  const isSelected = selectedNeedId === need.id;
                  const pct = Math.min(100, Math.round((need.pledgedQuantity / need.targetQuantity) * 100));
                  return (
                    <label
                      key={need.id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                        isSelected
                          ? "bg-[#E6EFE3]/50 border-[#1F4D36] shadow-xs"
                          : "bg-white border-slate-200/80 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="donationNeed"
                        value={need.id}
                        checked={isSelected}
                        onChange={() => setSelectedNeedId(need.id)}
                        className="mt-1 text-[#1F4D36] focus:ring-[#1F4D36]"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 truncate">{need.itemType}</span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {pct}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Mục tiêu: {need.targetQuantity} {need.unit} • Đã cam kết: {need.pledgedQuantity}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Ô Nhập Số Lượng */}
              {selectedNeed && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-900">
                    Số lượng gửi ({selectedNeed.unit}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="VD: 50"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1F4D36]"
                    />
                    <span className="font-bold text-xs text-slate-700 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200">
                      {selectedNeed.unit}
                    </span>
                  </div>

                  {exceedsTarget && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Lưu ý: Số lượng này vượt chỉ tiêu kêu gọi ban đầu. Lượng dôi dư sẽ được bảo lưu an toàn trong kho để hỗ trợ các đợt phát sinh tiếp theo.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Phương Thức Vận Chuyển Đến Kho */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Truck className="w-4 h-4 text-[#1F4D36]" />
                <h3 className="text-sm font-bold text-slate-900">
                  3. Phương thức gửi hàng đến điểm tập kết
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "DIRECT", label: "Tự mang đến kho", desc: "Trực tiếp gửi tại điểm tập kết" },
                  { id: "COURIER", label: "Chuyển phát bưu điện", desc: "ViettelPost / GHTK / EMS" },
                  { id: "BUS", label: "Gửi chành xe / Xe khách", desc: "Giao nhận tại bến xe" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setShippingMethod(item.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      shippingMethod === item.id
                        ? "bg-[#E6EFE3]/50 border-[#1F4D36] text-[#1F4D36]"
                        : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {shippingMethod !== "DIRECT" && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-900">
                    Mã vận đơn bưu cục hoặc Tên nhà xe / Biển số xe (nếu có)
                  </label>
                  <input
                    type="text"
                    value={shippingCode}
                    onChange={(e) => setShippingCode(e.target.value)}
                    placeholder="VD: VTP-98234123 hoặc Nhà xe Phương Trang (Bến xe Miền Trung)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1F4D36]"
                  />
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-900">
                  Ghi chú đóng gói & quy cách bảo quản (nếu có)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đóng gói 5 thùng carton, đã dán băng keo chống thấm nước, HSD tới tháng 12/2026..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1F4D36]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !quantity || Number(quantity) <= 0}
                className="w-full py-3 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo mã vận đơn...</span>
                  </>
                ) : (
                  <>
                    <span>Nhận Mã Tracking ID & Xác Nhận Gửi Hàng</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </RoleGuard>
  );
}
