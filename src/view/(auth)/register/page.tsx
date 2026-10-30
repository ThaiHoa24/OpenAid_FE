"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [isOrganization, setIsOrganization] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    organizationDescription: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      err.fullName = "Vui lòng nhập họ và tên";
    }

    if (!formData.email.trim()) {
      err.email = "Vui lòng nhập địa chỉ email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      err.email = "Email không đúng định dạng";
    }

    if (!formData.password) {
      err.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      err.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (isOrganization && !formData.organizationName.trim()) {
      err.organizationName = "Vui lòng nhập tên tổ chức từ thiện";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const result = await register({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      isOrganization,
      organizationName: formData.organizationName.trim(),
      organizationDescription: formData.organizationDescription.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      showToast("Tạo tài khoản thành công! Chào mừng bạn đến với OpenAid.", "success");
      if (isOrganization) {
        router.push("/organizer/dashboard");
      } else {
        router.push("/events");
      }
    } else {
      showToast(result.error || "Đăng ký thất bại", "error");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#141822] text-white flex items-center justify-center pt-16 pb-6 px-4 sm:px-6 lg:px-8">
      {/* Fixed Full-screen Background: Bound strictly to Viewport so it NEVER stretches or distorts */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none select-none overflow-hidden z-0 bg-[#141822]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1800&auto=format&fit=crop&q=85"
          alt="Tình nguyện viên tập kết hàng cứu trợ"
          className="absolute inset-y-0 left-0 w-full lg:w-[62%] h-full object-cover object-left opacity-35 lg:opacity-45"
        />
        {/* Horizontal Gradient Fade to Solid #141822 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#141822]/60 to-[#141822] hidden lg:block" />
        {/* Top/Bottom Edge Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#141822]/70 via-transparent to-[#141822]/90" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1240px] w-full mx-auto my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#F28C1B] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gia Nhập Cộng Đồng</span>
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
              Cùng chung tay, <br />
              <span className="text-[#F28C1B]">kết nối</span> sức mạnh sẻ chia đến đồng bào.
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg">
              Đăng ký để trở thành tình nguyện viên hỗ trợ tuyến đầu hoặc mở bàn điều phối cho tổ chức từ thiện của bạn với quy chuẩn minh bạch tuyệt đối.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-[#F28C1B] shrink-0" />
                <span>Không nhận tiền mặt — 100% hiện vật thiết thực</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-[#F28C1B] shrink-0" />
                <span>Mã vận đơn truy vết Tracking ID công khai</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-[#F28C1B] shrink-0" />
                <span>Sổ cái kho bãi minh bạch theo định mức kiểm toán</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-200/80 pt-3 border-t border-white/10 max-w-md">
              <ShieldCheck className="w-4 h-4 text-[#F28C1B] shrink-0" />
              <span>Đồng hành cùng 12,000+ tình nguyện viên toàn quốc</span>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Spacious, No Overlap, Adapts Naturally) */}
          <div className="lg:col-span-6 lg:pl-4">
            <div className="max-w-[480px] w-full ml-auto space-y-3.5">
              {/* Header */}
              <div className="space-y-0.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Create <br />
                  <span>
                    new account<span className="text-[#F28C1B]">.</span>
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Chọn vai trò và điền thông tin để bắt đầu hành trình cùng OpenAid.
                </p>
              </div>

              {/* Account Type Selector Pill with Elastic Rubber Segment */}
              <div className="relative grid grid-cols-2 p-1 bg-[#222836] border border-white/10 rounded-2xl select-none overflow-hidden">
                {/* Elastic Rubber Sliding Indicator */}
                <div
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-[#1F4D36] shadow-md shadow-emerald-950/60 pointer-events-none transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
                  style={{
                    transform: isOrganization ? "translateX(100%)" : "translateX(0%)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setIsOrganization(false)}
                  className={`relative z-10 py-2 px-3 rounded-xl text-xs font-bold transition-colors duration-250 flex items-center justify-center gap-2 cursor-pointer ${
                    !isOrganization ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Tình Nguyện Viên / Hảo Tâm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrganization(true)}
                  className={`relative z-10 py-2 px-3 rounded-xl text-xs font-bold transition-colors duration-250 flex items-center justify-center gap-2 cursor-pointer ${
                    isOrganization ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Tổ Chức Từ Thiện</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <div
                    className={`bg-[#222836] border rounded-2xl px-4 py-2 relative flex flex-col justify-center transition-all ${
                      errors.fullName
                        ? "border-rose-500/80 ring-2 ring-rose-500/20"
                        : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                    }`}
                  >
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {isOrganization ? "Họ và tên người đại diện" : "Họ và tên"} *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                        }}
                        placeholder="Nguyễn Văn A"
                        className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                    </div>
                  </div>
                  {errors.fullName && (
                    <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.fullName}</p>
                  )}
                </div>

                {/* Organization Fields (Full spacious height when active) */}
                {isOrganization ? (
                  <div className="space-y-2.5 p-3 rounded-2xl bg-[#1C2333]/90 border border-emerald-500/25">
                    {/* Organization Name */}
                    <div className="space-y-1">
                      <div
                        className={`bg-[#222836] border rounded-xl px-3.5 py-1.5 relative flex flex-col justify-center transition-all ${
                          errors.organizationName
                            ? "border-rose-500/80 ring-2 ring-rose-500/20"
                            : "border-white/10 focus-within:border-[#F28C1B]"
                        }`}
                      >
                        <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                          Tên tổ chức / Quỹ từ thiện *
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={formData.organizationName}
                            onChange={(e) => {
                              setFormData({ ...formData, organizationName: e.target.value });
                              if (errors.organizationName) setErrors((prev) => ({ ...prev, organizationName: "" }));
                            }}
                            placeholder="Hội Chữ Thập Đỏ / Quỹ Cứu Trợ..."
                            className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                          />
                          <Building2 className="w-3.5 h-3.5 text-emerald-400 absolute right-3.5 pointer-events-none" />
                        </div>
                      </div>
                      {errors.organizationName && (
                        <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.organizationName}</p>
                      )}
                    </div>

                    {/* Mission / Description */}
                    <div className="bg-[#222836] border border-white/10 rounded-xl px-3.5 py-1.5 focus-within:border-[#F28C1B] transition-all">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Sứ mệnh hoạt động
                      </label>
                      <input
                        type="text"
                        value={formData.organizationDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, organizationDescription: e.target.value })
                        }
                        placeholder="Mô tả tôn chỉ hoạt động cứu trợ..."
                        className="bg-transparent text-white text-xs sm:text-sm outline-none w-full placeholder:text-gray-500 font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#1C2333]/60 border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-300">Tình nguyện viên & Hảo tâm</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Tham gia cứu trợ tuyến đầu, đóng góp hiện vật và theo dõi hành trình minh bạch qua mã định danh.
                      </p>
                    </div>
                  </div>
                )}

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <div
                      className={`bg-[#222836] border rounded-2xl px-4 py-2 relative flex flex-col justify-center transition-all ${
                        errors.email
                          ? "border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                      }`}
                    >
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Địa chỉ Email *
                      </label>
                      <div className="flex items-center">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                          }}
                          placeholder="contact@domain.com"
                          className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="bg-[#222836] border border-white/10 rounded-2xl px-4 py-2 relative flex flex-col justify-center focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20 transition-all">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Số điện thoại
                      </label>
                      <div className="flex items-center">
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0912 345 678"
                          className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                        />
                        <Phone className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <div
                      className={`bg-[#222836] border rounded-2xl px-4 py-2 relative flex flex-col justify-center transition-all ${
                        errors.password
                          ? "border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                      }`}
                    >
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Mật khẩu *
                      </label>
                      <div className="flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                          }}
                          placeholder="••••••••"
                          className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`bg-[#222836] border rounded-2xl px-4 py-2 relative flex flex-col justify-center transition-all ${
                        errors.confirmPassword
                          ? "border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                      }`}
                    >
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Xác nhận *
                      </label>
                      <div className="flex items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                          }}
                          placeholder="••••••••"
                          className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Switch Link */}
                <div className="text-right text-xs text-gray-400 pt-0.5">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="font-bold text-[#F28C1B] hover:underline ml-1">
                    Đăng nhập ngay
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-2xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-[#1F4D36] to-[#286446] hover:from-[#173b29] hover:to-[#21533a] shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? "Đang tạo tài khoản..." : "Hoàn Tất Đăng Ký"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
