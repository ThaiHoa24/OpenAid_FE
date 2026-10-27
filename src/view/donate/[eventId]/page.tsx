"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Upload,
  AlertCircle,
} from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { donationService } from "@/services/donationService";
import type { DonationNeed, Donation } from "@/types";
import { useAuth } from "@/hooks/useAuth";
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

  const [event, setEvent] = useState<EnrichedEvent | null>(null);
  const [selectedNeedId, setSelectedNeedId] = useState<string>("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    eventService.getById(eventId).then((res) => {
      setEvent(res);
      if (res && res.donationNeeds.length > 0) {
        setSelectedNeedId(res.donationNeeds[0].id);
      }
      setLoading(false);
    });
  }, [eventId]);

  const selectedNeed = event?.donationNeeds.find((n) => n.id === selectedNeedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNeed || !quantity || Number(quantity) <= 0 || !user) return;
    setSubmitting(true);
    try {
      const don = await donationService.create(
        {
          eventId,
          donationNeedId: selectedNeed.id,
          quantity: Number(quantity),
          note,
        },
        user
      );
      setCreatedDonation(don);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!createdDonation) return;
    navigator.clipboard.writeText(createdDonation.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center text-sm font-semibold text-[#5F6F66]">
        Đang tải danh mục nhu yếu phẩm cần tiếp nhận...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-bold text-rose-600">Không tìm thấy thông tin chiến dịch.</p>
        <Button href="/events" variant="primary">
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
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href={`/events/${event.id}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#1C2B24] hover:text-[#1F4D36] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại chi tiết chiến dịch</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E7E0] shadow-sm space-y-6">
        {createdDonation ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36]">
                Đã ghi nhận cam kết
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24]">
                Cảm ơn bạn đã chung tay quyên góp hiện vật!
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6F66] max-w-md mx-auto">
                Phần đóng góp <span className="font-bold text-[#1C2B24]">{createdDonation.quantity} {createdDonation.unit} {createdDonation.itemType}</span> của bạn đã được ghi nhận ở trạng thái <span className="font-bold text-amber-700">CHỜ TIẾP NHẬN</span>.
              </p>
            </div>

            {/* Tracking ID Box */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-[#5F6F66] uppercase tracking-wider">
                Mã tra cứu vận đơn công khai (Tracking ID)
              </span>
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-mono text-base sm:text-lg font-black text-[#1F4D36] tracking-wider">
                  {createdDonation.trackingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1C2B24] transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button href={`/track/${createdDonation.trackingId}`} variant="primary">
                Xem dòng thời gian công khai
              </Button>
              <Button href="/my/donations" variant="outline">
                Đóng góp của tôi
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36]">
                Cam kết gửi hiện vật
              </span>
              <h1 className="text-2xl font-extrabold text-[#1C2B24]">
                Quyên góp cho chiến dịch: {event.title}
              </h1>
              <p className="text-xs text-[#5F6F66]">
                Hiện vật sau khi gửi tới kho sẽ được thủ kho kiểm tra, cân đối và gom vào lô hàng (Batch).
              </p>
            </div>

            {/* Need Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C2B24]">
                Chọn loại nhu yếu phẩm cần gửi <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.donationNeeds.map((need) => (
                  <label
                    key={need.id}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      selectedNeedId === need.id
                        ? "bg-[#E6EFE3]/50 border-[#1F4D36]"
                        : "bg-white border-[#E5E7E0] hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="donationNeed"
                      value={need.id}
                      checked={selectedNeedId === need.id}
                      onChange={() => setSelectedNeedId(need.id)}
                      className="mt-1 text-[#1F4D36] focus:ring-[#1F4D36]"
                    />
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-[#1C2B24]">{need.itemType}</div>
                      <div className="text-[11px] text-[#5F6F66]">
                        Chỉ tiêu: {need.targetQuantity} {need.unit} • Đã cam kết: {need.pledgedQuantity}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity */}
            {selectedNeed && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C2B24]">
                  Số lượng gửi ({selectedNeed.unit}) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="VD: 50"
                    required
                    className="flex-1 p-3.5 rounded-2xl border border-[#E5E7E0] bg-[#FAF9F6] text-sm font-bold text-[#1C2B24] focus:outline-none focus:border-[#1F4D36]"
                  />
                  <span className="font-bold text-sm text-[#5F6F66] px-4 py-3.5 rounded-2xl bg-slate-100 border border-slate-200">
                    {selectedNeed.unit}
                  </span>
                </div>

                {/* Overpledge notice */}
                {exceedsTarget && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Lưu ý: Số lượng cam kết vượt chỉ tiêu ban đầu. Phần vượt sẽ được bảo lưu điều phối cho các đợt phát tiếp theo.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C2B24]">
                Ghi chú đóng gói & phương thức giao hàng
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Đã đóng thùng carton 10kg, hạn sử dụng đến tháng 12/2026, sẽ gửi xe khách đến kho ngày mai..."
                rows={3}
                className="w-full p-3.5 rounded-2xl border border-[#E5E7E0] bg-[#FAF9F6] text-xs text-[#1C2B24] focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            {/* Photo Attachment (Mock file upload) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C2B24]">
                Hình ảnh đính kèm hiện vật (Không bắt buộc)
              </label>
              <div className="border-2 border-dashed border-[#E5E7E0] hover:border-[#1F4D36] p-6 rounded-2xl text-center space-y-2 cursor-pointer bg-[#FAF9F6]">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-[#5F6F66]">
                  Tải lên ảnh chụp thùng hàng hoặc nhãn mác (PNG, JPG dưới 5MB)
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting || !quantity || Number(quantity) <= 0}
              className="w-full"
            >
              {submitting ? "Đang xử lý..." : "Nhận Mã Tracking ID & Xác Nhận"}
            </Button>
          </form>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}
