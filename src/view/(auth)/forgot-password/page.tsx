"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendForgotPasswordOtp, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Timer for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    if (!email.trim()) {
      err.email = "Vui lòng nhập địa chỉ email";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      err.email = "Email không đúng định dạng";
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsLoading(true);
    setErrors({});
    const res = await sendForgotPasswordOtp(email.trim());
    setIsLoading(false);

    if (res.success) {
      showToast(res.message || "Mã OTP đã được gửi đến email của bạn!", "success");
      setStep(2);
      setCountdown(60);
    } else {
      showToast(res.error || "Không thể gửi mã OTP. Vui lòng thử lại.", "error");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    const res = await sendForgotPasswordOtp(email.trim());
    setIsResending(false);

    if (res.success) {
      showToast("Đã gửi lại mã OTP mới tới email của bạn!", "success");
      setCountdown(60);
    } else {
      showToast(res.error || "Gửi lại OTP thất bại.", "error");
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};

    if (!otp.trim()) {
      err.otp = "Vui lòng nhập mã OTP 6 số";
    } else if (!/^\d{6}$/.test(otp.trim())) {
      err.otp = "Mã OTP phải gồm đúng 6 chữ số";
    }

    if (!newPassword) {
      err.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      err.newPassword = "Mật khẩu mới tối thiểu 6 ký tự";
    }

    if (newPassword !== confirmPassword) {
      err.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsLoading(true);
    setErrors({});
    const res = await resetPassword({
      email: email.trim(),
      otp: otp.trim(),
      newPassword,
    });
    setIsLoading(false);

    if (res.success) {
      showToast(res.message || "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
      router.push("/login");
    } else {
      showToast(res.error || "Đặt lại mật khẩu thất bại.", "error");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#141822] text-white flex items-center justify-center pt-16 pb-6 px-4 sm:px-6 lg:px-8">
      {/* Background Graphic */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none select-none overflow-hidden z-0 bg-[#141822]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1800&auto=format&fit=crop&q=85"
          alt="Cứu trợ thực địa"
          className="absolute inset-y-0 left-0 w-full lg:w-[62%] h-full object-cover object-left opacity-35 lg:opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#141822]/60 to-[#141822] hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141822]/70 via-transparent to-[#141822]/90" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1240px] w-full mx-auto my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Hero */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#F28C1B] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bảo Mật & Khôi Phục</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Khôi Phục Mật Khẩu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-emerald-300 to-[#F28C1B]">
                Tài Khoản OpenAid
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300/90 leading-relaxed max-w-lg">
              Hệ thống sẽ gửi mã xác thực OTP 6 số đến email đăng ký của bạn. Mã OTP đảm bảo an toàn tuyệt đối cho tài khoản cứu trợ của bạn.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mã hóa bảo mật cao</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#F28C1B]" />
                <span>OTP hiệu lực 5 phút</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-[#1a2030]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {step === 1 ? "Quên Mật Khẩu" : "Đặt Lại Mật Khẩu"}
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-[#F28C1B]">
                    Bước {step}/2
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {step === 1
                    ? "Nhập email của bạn để nhận mã xác thực OTP"
                    : `Nhập mã OTP vừa gửi tới ${email} và tạo mật khẩu mới`}
                </p>
              </div>

              {step === 1 ? (
                /* STEP 1: Enter Email */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-0.5">
                    <div
                      className={`bg-[#222836] border rounded-xl px-3.5 py-1.5 relative flex flex-col justify-center transition-all ${
                        errors.email
                          ? "border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                      }`}
                    >
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Địa chỉ Email tài khoản
                      </label>
                      <div className="flex items-center">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                          }}
                          placeholder="email@vidu.com"
                          className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                          autoFocus
                        />
                        <Mail className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 pointer-events-none" />
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.email}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-[#1F4D36] to-[#286446] hover:from-[#173b29] hover:to-[#21533a] shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? "Đang gửi mã OTP..." : "Nhận Mã Xác Thực"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại Đăng nhập</span>
                    </Link>
                  </div>
                </form>
              ) : (
                /* STEP 2: Enter OTP & New Password */
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  {/* OTP Input */}
                  <div className="space-y-0.5">
                    <div
                      className={`bg-[#222836] border rounded-xl px-3.5 py-1.5 relative flex flex-col justify-center transition-all ${
                        errors.otp
                          ? "border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                      }`}
                    >
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Mã Xác Thực OTP (6 số)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setOtp(val);
                          if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
                        }}
                        placeholder="123456"
                        className="bg-transparent text-white text-base tracking-widest text-center font-bold outline-none w-full placeholder:text-gray-600"
                        autoFocus
                      />
                    </div>
                    {errors.otp && (
                      <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.otp}</p>
                    )}
                  </div>

                  {/* Resend OTP button */}
                  <div className="flex justify-between items-center text-xs px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      Đổi email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isResending}
                      className="inline-flex items-center gap-1 font-semibold text-[#F28C1B] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      <RotateCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                      <span>{countdown > 0 ? `Gửi lại sau (${countdown}s)` : "Gửi lại mã"}</span>
                    </button>
                  </div>

                  {/* New Password */}
                  <div className="space-y-0.5">
                    <div
                      className={`bg-[#222836] border rounded-xl px-3.5 py-1.5 relative flex flex-col justify-center transition-all ${
                        errors.newPassword
                          ? "border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                      }`}
                    >
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Mật khẩu mới
                      </label>
                      <div className="flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
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
                    {errors.newPassword && (
                      <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-0.5">
                    <div
                      className={`bg-[#222836] border rounded-xl px-3.5 py-1.5 relative flex flex-col justify-center transition-all ${
                        errors.confirmPassword
                          ? "border-rose-500/80 ring-2 ring-rose-500/20"
                          : "border-white/10 focus-within:border-[#F28C1B] focus-within:ring-2 focus-within:ring-[#F28C1B]/20"
                      }`}
                    >
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="flex items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                          }}
                          placeholder="••••••••"
                          className="bg-transparent text-white text-xs sm:text-sm outline-none w-full pr-8 placeholder:text-gray-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[10px] font-semibold text-rose-400 pl-2">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-[#1F4D36] to-[#286446] hover:from-[#173b29] hover:to-[#21533a] shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{isLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Hủy & Quay lại Đăng nhập</span>
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
