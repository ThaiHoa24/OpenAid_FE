"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { HeartHandshake, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1100px] w-full bg-white rounded-3xl shadow-sm border border-[#E5E7E0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Column: Form & Demo switcher */}
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
                Đăng Nhập Hệ Thống
              </h1>
              <p className="text-xs text-[#5F6F66]">
                Nhập tài khoản để truy cập bàn tình nguyện viên hoặc bàn điều phối tổ chức cứu trợ.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C2B24]">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="user@openaid.demo"
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
                <label className="text-xs font-bold text-[#1C2B24]">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••••••"
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

              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng Nhập Vào OpenAid"}
              </Button>
            </form>

            {/* 1-Click Demo Accounts */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5F6F66]">
                Đăng nhập nhanh 1-Click (Tài khoản mẫu)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("organizer@openaid.demo")}
                  className="p-2.5 rounded-xl bg-[#E6EFE3] hover:bg-[#d8e6d4] text-[#1F4D36] font-bold text-left transition cursor-pointer"
                >
                  <p className="text-[11px]">Ban Tổ Chức</p>
                  <p className="text-[10px] text-[#5F6F66] truncate font-normal">organizer@demo</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("user@openaid.demo")}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2B24] font-bold text-left transition cursor-pointer"
                >
                  <p className="text-[11px]">Tình Nguyện Viên</p>
                  <p className="text-[10px] text-[#5F6F66] truncate font-normal">user@demo</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("admin@openaid.demo")}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-left transition cursor-pointer"
                >
                  <p className="text-[11px]">Quản Trị Admin</p>
                  <p className="text-[10px] text-[#5F6F66] truncate font-normal">admin@demo</p>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 text-xs text-[#5F6F66]">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-[#1F4D36] hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Image & Quote */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#133724] text-white p-10 flex-col justify-between overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80"
            alt="Đoàn cứu trợ vùng cao"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#133724] via-[#133724]/40 to-transparent" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F28C1B]" />
              <span>Kiểm Toán Minh Bạch Thực Địa</span>
            </span>
          </div>

          <div className="relative z-10 space-y-3">
            <blockquote className="text-sm font-medium leading-relaxed italic text-emerald-100/90">
              &ldquo;Minh bạch không chỉ là lời hứa, đó là chuỗi vật lý khép kín từ kho tập kết đến tận tay bà con.&rdquo;
            </blockquote>
            <p className="text-xs font-bold text-[#F28C1B]">
              Tiêu chuẩn điều phối OpenAid
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
