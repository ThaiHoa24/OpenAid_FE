"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { volunteerService } from "@/services/volunteerService";
import type { VolunteerRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function VolunteerApplyPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<EnrichedEvent | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    eventService.getById(eventId).then((res) => {
      setEvent(res);
      if (res && res.volunteerRoles.length > 0) {
        setSelectedRole(res.volunteerRoles[0].id);
      }
      setLoading(false);
    });
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !user) return;
    setSubmitting(true);
    try {
      await volunteerService.apply(
        {
          eventId,
          volunteerRoleId: selectedRole,
          note,
        },
        user
      );
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center text-sm font-semibold text-[#5F6F66]">
        Đang tải thông tin vị trí tình nguyện viên...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-bold text-rose-600">Không tìm thấy thông tin chiến dịch.</p>
        <Button href="/events" variant="primary">
          Quay lại danh sách chiến dịch
        </Button>
      </div>
    );
  }

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
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1C2B24]">
              Gửi Đăng Ký Thành Công!
            </h2>
            <p className="text-xs sm:text-sm text-[#5F6F66] max-w-md mx-auto leading-relaxed">
              Đơn đăng ký của bạn đang ở trạng thái <span className="font-bold text-amber-700">CHỜ DUYỆT</span>. Ban tổ chức sẽ đối soát thông tin và liên hệ với bạn trước ngày xuất phát.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Button href="/my/activities" variant="primary">
                Xem hoạt động của tôi
              </Button>
              <Button href="/events" variant="outline">
                Khám phá thêm chiến dịch
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36]">
                Đăng ký Tình nguyện viên
              </span>
              <h1 className="text-2xl font-extrabold text-[#1C2B24]">
                Ứng tuyển chiến dịch: {event.title}
              </h1>
              <p className="text-xs text-[#5F6F66] flex items-center gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#F28C1B]" />
                <span>{event.location}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 text-[#1F4D36]" />
                <span>{new Date(event.startDate).toLocaleDateString("vi-VN")}</span>
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#1C2B24]">
                Chọn vị trí thực địa <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {event.volunteerRoles.map((role) => (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      selectedRole === role.id
                        ? "bg-[#E6EFE3]/50 border-[#1F4D36]"
                        : "bg-white border-[#E5E7E0] hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="volunteerRole"
                      value={role.id}
                      checked={selectedRole === role.id}
                      onChange={() => setSelectedRole(role.id)}
                      className="mt-1 text-[#1F4D36] focus:ring-[#1F4D36]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1C2B24]">{role.name}</span>
                        <span className="text-[10px] font-semibold text-[#1F4D36] px-2 py-0.5 rounded-full bg-[#E6EFE3]">
                          Đã duyệt {role.approvedQuantity} / {role.requiredQuantity} chỉ tiêu
                        </span>
                      </div>
                      <p className="text-xs text-[#5F6F66] leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Note / Experience */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C2B24]">
                Kỹ năng, kinh nghiệm & ghi chú y tế/sức khỏe
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Đã tham gia cứu trợ bão lũ 2024, có chứng chỉ sơ cấp cứu, có xe bán tải hỗ trợ..."
                rows={4}
                className="w-full p-3.5 rounded-2xl border border-[#E5E7E0] bg-[#FAF9F6] text-xs text-[#1C2B24] placeholder:text-slate-400 focus:outline-none focus:border-[#1F4D36]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Đang gửi hồ sơ..." : "Gửi Đơn Đăng Ký"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}
