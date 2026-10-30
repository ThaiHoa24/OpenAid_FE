"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const err: { email?: string; password?: string } = {};
    if (!email.trim()) {
      err.email = "Vui lòng nhập địa chỉ email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      err.email = "Email không đúng định dạng";
    }
    if (!password) {
      err.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      err.password = "Mật khẩu tối thiểu 6 ký tự";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      showToast(`Chào mừng quay trở lại, ${result.user.name}`, "success");
      if (result.user.systemRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/events");
      }
    } else {
      showToast(result.error || "Đăng nhập thất bại", "error");
    }
  };

  const fillDemoAccount = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("123456");
    setErrors({});
    setIsLoading(true);
    const result = await login(demoEmail, "123456");
    setIsLoading(false);
    if (result.success && result.user) {
      showToast(`Đã đăng nhập: ${result.user.name}`, "success");
      if (result.user.systemRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (demoEmail.includes("organizer")) {
        router.push("/organizer/dashboard");
      } else {
        router.push("/events");
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#141822] text-white flex items-center justify-center pt-16 pb-6 px-4 sm:px-6 lg:px-8">
      {/* Fixed Full-screen Background: Bound strictly to Viewport so it NEVER stretches or distorts */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none select-none overflow-hidden z-0 bg-[#141822]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1800&auto=format&fit=crop&q=85"
          alt="Cứu trợ thực địa"
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
              <span>Nền Tảng Minh Bạch</span>
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
              Điều phối thực địa, <br />
              <span className="text-[#F28C1B]">minh bạch</span> từng kiện hàng, trao trọn niềm tin.
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg">
              Hệ thống kiểm toán khép kín từ kho tập kết hàng hóa đến tận tay người thụ hưởng. Cấp mã truy vết Tracking ID công khai cho từng phần quà.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/events"
                className="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold text-white transition cursor-pointer"
              >
                Khám phá chiến dịch
              </Link>
              <Link
                href="/tracking"
                className="px-5 py-2.5 rounded-full bg-[#1F4D36] hover:bg-[#286446] text-xs font-bold text-white transition shadow-lg shadow-emerald-950/60 cursor-pointer"
              >
                Tra cứu vận đơn
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-200/80 pt-3 border-t border-white/10 max-w-md">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F28C1B] shrink-0" />
              <span>Xác thực hai lớp & kiểm toán minh bạch thực địa</span>
            </div>
          </div>

          {/* Right Column: Floating Form on Dark Canvas */}
          <div className="lg:col-span-6 lg:pl-4">
            <div className="max-w-[460px] w-full ml-auto space-y-4">
              {/* Header */}
              <div className="space-y-0.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Welcome <br />
                  <span>
                    back<span className="text-[#F28C1B]">.</span>
                  </span>
                </h2>
                <p className="text-[11px] text-gray-400">
                  Nhập tài khoản để truy cập bàn điều phối hoặc tham gia hoạt động cứu trợ.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-3">
                {/* Email Input */}
                <div className="space-y-0.5">
                  <div
                    className={`bg-[#222836] border rounded-xl px-3.5 py-1.5 relative flex flex-col justify-center transition-all ${
                      errors.email
                        ? "border-rose-500/80 ring-2 ring-rose-500/20"
                        : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                    }`}
                  >
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Địa chỉ Email
                    </label>
                    <div className="flex items-center">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="user@openaid.demo"
                        className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                      />
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-0.5">
                  <div
                    className={`bg-[#222836] border rounded-xl px-3.5 py-1.5 relative flex flex-col justify-center transition-all ${
                      errors.password
                        ? "border-rose-500/80 ring-2 ring-rose-500/20"
                        : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                    }`}
                  >
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    <div className="flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        placeholder="••••••••"
                        className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.password}</p>
                  )}
                </div>

                {/* Switch link */}
                <div className="text-right text-xs text-gray-400 pt-0.5">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="font-bold text-[#F28C1B] hover:underline ml-1">
                    Đăng ký ngay
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-[#1F4D36] to-[#286446] hover:from-[#173b29] hover:to-[#21533a] shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? "Đang đăng nhập..." : "Đăng Nhập Vào OpenAid"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* 1-Click Demo Accounts */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Đăng nhập nhanh 1-Click (Tài khoản mẫu)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("organizer@openaid.demo")}
                    className="p-2 rounded-xl bg-[#222836] hover:bg-[#2b3345] border border-white/5 text-left transition cursor-pointer group"
                  >
                    <p className="text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">Ban Tổ Chức</p>
                    <p className="text-[9px] text-gray-400 truncate">organizer@demo</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("user@openaid.demo")}
                    className="p-2 rounded-xl bg-[#222836] hover:bg-[#2b3345] border border-white/5 text-left transition cursor-pointer group"
                  >
                    <p className="text-[11px] font-bold text-white group-hover:text-gray-200">Tình Nguyện</p>
                    <p className="text-[9px] text-gray-400 truncate">user@demo</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("admin@openaid.demo")}
                    className="p-2 rounded-xl bg-[#222836] hover:bg-[#2b3345] border border-white/5 text-left transition cursor-pointer group"
                  >
                    <p className="text-[11px] font-bold text-purple-400 group-hover:text-purple-300">Quản Trị</p>
                    <p className="text-[9px] text-gray-400 truncate">admin@demo</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
