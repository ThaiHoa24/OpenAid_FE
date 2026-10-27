"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import {
  HeartHandshake,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1100px] w-full bg-white rounded-3xl shadow-sm border border-[#E5E7E0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Register Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#1F4D36] flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5 text-[#F28C1B]" />
              </div>
              <span className="font-extrabold text-xl text-[#1C2B24]">
                Open<span className="text-[#1F4D36]">Aid</span>
              </span>
            </Link>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight">
                Đăng Ký Tài Khoản
              </h1>
              <p className="text-xs text-[#5F6F66]">
                Tham gia mạng lưới điều phối minh bạch để sẻ chia cùng cộng đồng hoặc điều phối cứu trợ.
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#FAF9F6] border border-[#E5E7E0] rounded-2xl">
              <button
                type="button"
                onClick={() => setIsOrganization(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  !isOrganization
                    ? "bg-white text-[#1F4D36] shadow-xs"
                    : "text-[#5F6F66] hover:text-[#1C2B24]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tình Nguyện Viên / Hảo Tâm</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOrganization(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isOrganization
                    ? "bg-[#1F4D36] text-white shadow-xs"
                    : "text-[#5F6F66] hover:text-[#1C2B24]"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Tổ Chức Từ Thiện</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C2B24]">
                  {isOrganization ? "Họ và tên người đại diện" : "Họ và tên"} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-[#1C2B24] focus:outline-none ${
                      errors.fullName
                        ? "border-rose-400 bg-rose-50/30"
                        : "border-[#E5E7E0] bg-[#FAF9F6] focus:border-[#1F4D36]"
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] font-semibold text-rose-600 pl-1">{errors.fullName}</p>
                )}
              </div>

              {/* Organization Fields if active */}
              {isOrganization && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#E6EFE3]/40 border border-[#d2e2cd]">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1F4D36]">
                      Tên tổ chức / Quỹ từ thiện *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-[#1F4D36] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => {
                          setFormData({ ...formData, organizationName: e.target.value });
                          if (errors.organizationName) setErrors((prev) => ({ ...prev, organizationName: "" }));
                        }}
                        placeholder="Hội Chữ Thập Đỏ / Quỹ Cứu Trợ Đồng Bào..."
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-[#1C2B24] bg-white focus:outline-none ${
                          errors.organizationName
                            ? "border-rose-400"
                            : "border-[#d2e2cd] focus:border-[#1F4D36]"
                        }`}
                      />
                    </div>
                    {errors.organizationName && (
                      <p className="text-[11px] font-semibold text-rose-600 pl-1">{errors.organizationName}</p>
                    )}
                  </div>

                  <div className="space-y- tôn">
                    <label className="text-xs font-bold text-[#1F4D36]">
                      Giới thiệu ngắn / Sứ mệnh hoạt động
                    </label>
                    <textarea
                      rows={2}
                      value={formData.organizationDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationDescription: e.target.value })
                      }
                      placeholder="Tổ chức phi lợi nhuận hoạt động hỗ trợ đồng bào vùng cao và cứu trợ khẩn cấp thiên tai..."
                      className="w-full p-2.5 rounded-xl border border-[#d2e2cd] bg-white text-xs text-[#1C2B24] focus:outline-none focus:border-[#1F4D36]"
                    />
                  </div>
                </div>
              )}

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C2B24]">Địa chỉ Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="contact@domain.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-[#1C2B24] focus:outline-none ${
                        errors.email
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-[#E5E7E0] bg-[#FAF9F6] focus:border-[#1F4D36]"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-semibold text-rose-600 pl-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C2B24]">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7E0] bg-[#FAF9F6] text-xs text-[#1C2B24] focus:outline-none focus:border-[#1F4D36]"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C2B24]">Mật khẩu *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="Tối thiểu 6 ký tự"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-[#1C2B24] focus:outline-none ${
                        errors.password
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-[#E5E7E0] bg-[#FAF9F6] focus:border-[#1F4D36]"
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-semibold text-rose-600 pl-1">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C2B24]">Xác nhận mật khẩu *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-[#1C2B24] focus:outline-none ${
                        errors.confirmPassword
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-[#E5E7E0] bg-[#FAF9F6] focus:border-[#1F4D36]"
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-semibold text-rose-600 pl-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isLoading}
                className="w-full mt-4"
              >
                {isLoading ? "Đang tạo tài khoản..." : "Hoàn Tất Đăng Ký"}
              </Button>
            </form>
          </div>

          <div className="pt-4 text-xs text-[#5F6F66]">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-bold text-[#1F4D36] hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Image & Quote */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#133724] text-white p-10 flex-col justify-between overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80"
            alt="Tình nguyện viên tập kết hàng"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#133724] via-[#133724]/40 to-transparent" />

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F28C1B]" />
              <span>Cam Kết Minh Bạch Hoàn Toàn</span>
            </span>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-[#F28C1B] shrink-0" />
                <span>Không nhận giữ tiền mặt — 100% hiện vật thiết thực</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-[#F28C1B] shrink-0" />
                <span>Cấp mã tra cứu vận đơn Tracking ID cho từng phần quà</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-[#F28C1B] shrink-0" />
                <span>Bảo toàn vật tư kho bãi theo định mức kiểm toán</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            <blockquote className="text-sm font-medium leading-relaxed italic text-emerald-100/90">
              &ldquo;Kết nối tấm lòng hảo tâm với những bàn tay thiện nguyện nơi tuyến đầu, trao gửi trọn vẹn yêu thương.&rdquo;
            </blockquote>
            <p className="text-xs font-bold text-[#F28C1B]">
              Hệ thống OpenAid
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
