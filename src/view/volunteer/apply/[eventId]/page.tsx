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
  Phone,
  Mail,
  Truck,
  HeartPulse,
  Sparkles,
  Info,
  Clock,
  Loader2,
  Check,
} from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import {
  volunteerService,
  type EnrichedVolunteerApplication,
} from "@/services/volunteerService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [event, setEvent] = useState<EnrichedEvent | null>(null);
  const [existingApp, setExistingApp] =
    useState<EnrichedVolunteerApplication | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Detailed fields
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [transportMethod, setTransportMethod] = useState("BIKE");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [agreedToSafety, setAgreedToSafety] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string>("");

  const skillOptions = [
    "Sơ cấp cứu & Hỗ trợ y tế",
    "Bốc vác & Bốc dỡ hàng cứu trợ",
    "Phân loại & Đóng gói phần quà",
    "Điều phối & Phát quà thực địa",
    "Lái xe bán tải / Vận chuyển đường dài",
    "Chụp ảnh & Truyền thông tư liệu",
    "Nấu ăn & Hậu cần đoàn",
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      eventService.getById(eventId),
      user ? volunteerService.getByUser(user.id) : Promise.resolve([]),
    ])
      .then(([evt, userApps]) => {
        if (!isMounted) return;
        setEvent(evt);
        if (evt && evt.volunteerRoles.length > 0) {
          // Select first available role that is not full
          const availableRole = evt.volunteerRoles.find(
            (r) => r.approvedQuantity < r.requiredQuantity
          );
          setSelectedRole(availableRole?.id || evt.volunteerRoles[0].id);
        }

        // Check if user already applied to this event
        const match = userApps.find(
          (a) => a.eventId === eventId && a.status !== "REJECTED"
        );
        if (match) {
          setExistingApp(match);
        }

        if (user?.phone) {
          setEmergencyPhone(user.phone);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, user]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !user || !event) return;

    if (!emergencyPhone.trim()) {
      showToast("Vui lòng cung cấp số điện thoại liên lạc khẩn cấp", "warning");
      return;
    }

    if (!agreedToSafety) {
      showToast(
        "Vui lòng xác nhận cam kết tuân thủ quy tắc an toàn thực địa",
        "warning"
      );
      return;
    }

    // Format final comprehensive note
    const transportLabels: Record<string, string> = {
      BIKE: "Xe máy tự túc",
      TRUCK: "Xe bán tải / ô tô hỗ trợ chở hàng",
      CARPOOL: "Đi chung xe tập trung của đoàn",
    };

    const formattedNote = [
      `[SĐT Khẩn cấp: ${emergencyPhone.trim()}]`,
      `[Phương tiện: ${transportLabels[transportMethod] || transportMethod}]`,
      selectedSkills.length > 0
        ? `[Kỹ năng: ${selectedSkills.join(", ")}]`
        : "",
      medicalNotes.trim() ? `[Lưu ý sức khỏe: ${medicalNotes.trim()}]` : "",
    ]
      .filter(Boolean)
      .join(" - ");

    setSubmitting(true);
    try {
      const res = await volunteerService.apply(
        {
          eventId,
          volunteerRoleId: selectedRole,
          note: formattedNote,
        },
        user
      );
      setCreatedAppId(res.id);
      setSubmitted(true);
      showToast("Gửi đơn đăng ký tình nguyện viên thành công!", "success");
    } catch (err: any) {
      showToast(
        err.message || "Đã xảy ra lỗi khi gửi đơn. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col justify-center items-center text-slate-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F4D36]" />
        <span className="text-xs font-semibold text-slate-600">
          Đang tải thông tin vị trí tình nguyện viên...
        </span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">
          Không tìm thấy thông tin chiến dịch
        </h2>
        <p className="text-xs text-slate-500">
          Chiến dịch có thể đã đóng hoặc đường dẫn không còn tồn tại.
        </p>
        <Button href="/events" variant="primary" className="w-full">
          Quay lại danh sách chiến dịch
        </Button>
      </div>
    );
  }

  const selectedRoleObj = event.volunteerRoles.find(
    (r) => r.id === selectedRole
  );

  return (
    <RoleGuard allowedRoles={["user"]}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn pb-16">
        {/* Back Link */}
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1F4D36] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại chi tiết chiến dịch</span>
        </Link>

        {/* Existing Application Alert */}
        {existingApp && !submitted && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  Bạn đã có đơn đăng ký cho chiến dịch này
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Vị trí:{" "}
                  <span className="font-semibold text-slate-900">
                    {existingApp.role?.name || "Tình nguyện viên"}
                  </span>{" "}
                  • Trạng thái:{" "}
                  <span className="font-semibold text-amber-900">
                    {existingApp.status === "PENDING"
                      ? "Đang chờ duyệt"
                      : existingApp.status === "APPROVED"
                      ? "Đã được phê duyệt"
                      : existingApp.status}
                  </span>
                </p>
              </div>
            </div>
            <Link
              href="/my/activities"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 transition text-center"
            >
              Xem hoạt động của tôi
            </Link>
          </div>
        )}

        {submitted ? (
          /* Màn Hình Nộp Đơn Thành Công */
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center mx-auto border border-emerald-200/60 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                TRẠNG THÁI: CHỜ DUYỆT
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Gửi Đơn Đăng Ký Thành Công!
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hồ sơ ứng tuyển tình nguyện viên của bạn đã được chuyển tới Ban
                điều phối chiến dịch.
              </p>
            </div>

            {/* Application Summary Box */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Mã đơn đăng ký:</span>
                <span className="font-mono font-bold text-[#1F4D36]">
                  APP-{createdAppId.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Chiến dịch:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[240px]">
                  {event.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Vị trí ứng tuyển:</span>
                <span className="font-bold text-emerald-800">
                  {selectedRoleObj?.name || "Tình nguyện viên"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">SĐT liên hệ khẩn cấp:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {emergencyPhone}
                </span>
              </div>
            </div>

            {/* Next Steps Guidance */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-left text-xs space-y-1.5 max-w-lg mx-auto">
              <div className="flex items-center gap-1.5 font-bold text-[#1F4D36]">
                <Sparkles className="w-4 h-4" />
                <span>Các bước tiếp theo</span>
              </div>
              <ul className="text-slate-600 text-[11px] space-y-1 list-disc list-inside">
                <li>Ban tổ chức sẽ đối soát thông tin và liên hệ trước ngày tập kết.</li>
                <li>
                  Khi được duyệt, mã QR điểm danh thực địa sẽ tự động hiển thị tại{" "}
                  <strong className="text-slate-800">Hoạt động của tôi</strong>.
                </li>
                <li>Vui lòng chuẩn bị trang phục bảo hộ và tư trang theo yêu cầu.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Button href="/my/activities" variant="primary" className="text-xs">
                Xem hoạt động của tôi
              </Button>
              <Button href="/events" variant="outline" className="text-xs">
                Khám phá chiến dịch khác
              </Button>
            </div>
          </div>
        ) : (
          /* Form Đăng Ký Chính Thức */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Campaign Banner */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36]">
                  Chiến Dịch Tiếp Nhận Tình Nguyện Viên
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Ứng tuyển: {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1F4D36]" />
                  <span>
                    Khởi hành: {new Date(event.startDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1: Xác Nhận Danh Tính Ứng Viên */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#1F4D36]" />
                <h3 className="text-sm font-bold text-slate-900">
                  1. Thông tin người ứng tuyển
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">
                    Họ và tên
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {user?.name || "Chưa cập nhật"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">
                    Email tài khoản
                  </span>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user?.email || "Chưa có email"}
                  </div>
                </div>
              </div>

              {/* SĐT Liên Lạc Khẩn Cấp Bắt Buộc */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>
                    Số điện thoại liên lạc khẩn cấp (Zalo/Gọi trực tiếp){" "}
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Trưởng đoàn sẽ liên lạc qua số này
                  </span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1F4D36]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Chọn Vị Trí Thực Địa */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1F4D36]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Chọn vị trí thực địa <span className="text-rose-500">*</span>
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  {event.volunteerRoles.length} vai trò khả dụng
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {event.volunteerRoles.map((role) => {
                  const isFull = role.approvedQuantity >= role.requiredQuantity;
                  const isSelected = selectedRole === role.id;
                  const pct = Math.min(
                    100,
                    Math.round(
                      (role.approvedQuantity / role.requiredQuantity) * 100
                    )
                  );

                  return (
                    <label
                      key={role.id}
                      className={`relative flex items-start gap-3.5 p-4 rounded-xl border transition cursor-pointer ${
                        isFull
                          ? "bg-slate-50/70 border-slate-200/60 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-[#E6EFE3]/40 border-[#1F4D36] shadow-xs"
                          : "bg-white border-slate-200/80 hover:bg-slate-50/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="volunteerRole"
                        disabled={isFull}
                        value={role.id}
                        checked={isSelected}
                        onChange={() => setSelectedRole(role.id)}
                        className="mt-1 text-[#1F4D36] focus:ring-[#1F4D36]"
                      />

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {role.name}
                          </span>
                          {isFull ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                              Đã đủ chỉ tiêu
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Còn {role.requiredQuantity - role.approvedQuantity} suất
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {role.description}
                        </p>

                        {/* Quota Progress Bar */}
                        <div className="pt-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span>Chỉ tiêu tuyển chọn</span>
                            <span>
                              {role.approvedQuantity} / {role.requiredQuantity} người ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? "bg-slate-400" : "bg-[#1F4D36]"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Phương Tiện & Kỹ Năng Thực Địa */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Truck className="w-4 h-4 text-[#1F4D36]" />
                <h3 className="text-sm font-bold text-slate-900">
                  3. Hậu cần & Kỹ năng hỗ trợ
                </h3>
              </div>

              {/* Phương Tiện Di Chuyển */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900">
                  Phương án di chuyển đến điểm tập kết / thực địa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "BIKE", label: "Xe máy tự túc", desc: "Tự chủ linh hoạt" },
                    {
                      id: "TRUCK",
                      label: "Có xe bán tải / ô tô",
                      desc: "Hỗ trợ chở thêm hàng",
                    },
                    {
                      id: "CARPOOL",
                      label: "Đi chung xe đoàn",
                      desc: "Tập kết theo xe BTC",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTransportMethod(item.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        transportMethod === item.id
                          ? "bg-[#E6EFE3]/50 border-[#1F4D36] text-[#1F4D36]"
                          : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kỹ Năng Thế Mạnh (Multiple Selection) */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-900">
                  Kỹ năng & Kinh nghiệm bạn có thể hỗ trợ (Chọn nhiều)
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "bg-[#1F4D36] text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lưu Ý Y Tế / Sức Khỏe */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Lưu ý sức khỏe, dị ứng hoặc hạn chế thể lực (nếu có)</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Không bắt buộc
                  </span>
                </label>
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Ví dụ: Say xe, dị ứng hải sản, không bốc vác nặng quá 20kg được..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1F4D36]"
                />
              </div>

              {/* Cam Kết An Toàn Thực Địa */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToSafety}
                    onChange={(e) => setAgreedToSafety(e.target.checked)}
                    className="mt-0.5 text-[#1F4D36] focus:ring-[#1F4D36] rounded"
                  />
                  <div className="text-xs text-amber-950 leading-relaxed font-medium">
                    Tôi xác nhận có đủ điều kiện sức khỏe, cam kết có mặt đúng giờ
                    tại điểm tập kết và tuân thủ tuyệt đối sự hướng dẫn an toàn của
                    Trưởng đoàn thiện nguyện. <span className="text-rose-500">*</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#1F4D36] hover:bg-[#153826] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi Đơn Ứng Tuyển Tình Nguyện Viên</span>
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
