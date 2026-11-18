"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/Button";
import {
  Mail, Lock, RotateCcw, AlertCircle, CheckCircle2,
  ArrowLeft, User, ShieldCheck
} from "lucide-react";

type Step = "request" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendForgotPasswordOtp, resetPassword } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast(t("auth.fillRequired"), "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendForgotPasswordOtp(email.trim());
      if (res.success) {
        showToast(res.message || "Mã xác thực đã được gửi tới email của bạn", "success");
        setStep("verify");
      } else {
        showToast(res.error || "Không thể gửi mã xác thực", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      showToast("Vui lòng nhập mã 6 chữ số", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      if (res.success) {
        showToast(res.message || "Đặt lại mật khẩu thành công", "success");
        router.push("/login");
      } else {
        showToast(res.error || "Mã OTP không đúng hoặc đã hết hạn", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const res = await sendForgotPasswordOtp(email.trim());
      if (res.success) {
        showToast(res.message || "Đã gửi lại mã xác thực", "success");
      } else {
        showToast(res.error || "Không thể gửi lại mã", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("auth.backToLogin")}</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              {step === "request" && <Mail className="w-7 h-7" />}
              {step === "verify" && <Lock className="w-7 h-7" />}
              {step === "reset" && <CheckCircle2 className="w-7 h-7" />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {step === "request" && t("forgotPassword.titleRequest")}
              {step === "verify" && t("forgotPassword.titleVerify")}
              {step === "reset" && t("forgotPassword.titleReset")}
            </h1>
            <p className="text-sm text-slate-600">
              {step === "request" && t("forgotPassword.subtitleRequest")}
              {step === "verify" && t("forgotPassword.subtitleVerify")}
              {step === "reset" && t("forgotPassword.subtitleReset")}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center gap-1.5 ${step === "request" || step === "verify" || step === "reset" ? "text-emerald-600" : "text-slate-300"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "request" || step === "verify" || step === "reset" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</div>
              <span className="text-[11px] font-medium hidden sm:block">{t("forgotPassword.step1")}</span>
            </div>
            <div className={`w-12 h-0.5 rounded ${step === "verify" || step === "reset" ? "bg-emerald-600" : "bg-slate-200"}`} />
            <div className={`flex items-center gap-1.5 ${step === "verify" || step === "reset" ? "text-emerald-600" : "text-slate-300"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "verify" || step === "reset" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</div>
              <span className="text-[11px] font-medium hidden sm:block">{t("forgotPassword.step2")}</span>
            </div>
            <div className={`w-12 h-0.5 rounded ${step === "reset" ? "bg-emerald-600" : "bg-slate-200"}`} />
            <div className={`flex items-center gap-1.5 ${step === "reset" ? "text-emerald-600" : "text-slate-300"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "reset" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>3</div>
              <span className="text-[11px] font-medium hidden sm:block">{t("forgotPassword.step3")}</span>
            </div>
          </div>

          {/* Forms */}
          {step === "request" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("auth.emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.emailPlaceholder")}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : null}
                {t("forgotPassword.sendOtpBtn")}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("forgotPassword.otpLabel")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest font-mono"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 text-center">
                  {t("forgotPassword.otpHint", { email })}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("forgotPassword.newPasswordLabel")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="w-full pl-9 pr-12 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("auth.confirmPasswordLabel")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : null}
                {t("forgotPassword.resetPasswordBtn")}
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="w-full text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                {t("forgotPassword.resendOtp")}
              </button>
            </form>
          )}

          {/* Success State */}
          {step === "reset" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {t("forgotPassword.successTitle")}
              </h3>
              <p className="text-sm text-slate-600">
                {t("forgotPassword.successDesc")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
              >
                {t("forgotPassword.loginNow")}
              </Link>
            </div>
          )}

          {/* Demo Accounts Hint */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-center text-xs text-slate-500 mb-3">
              {t("forgotPassword.demoHint")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEmail("admin@openaid.demo")}
                className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 inline mr-1" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setEmail("organizer@openaid.demo")}
                className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                <User className="w-3 h-3 inline mr-1" />
                Organizer
              </button>
              <button
                type="button"
                onClick={() => setEmail("user@openaid.demo")}
                className="px-2 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                <User className="w-3 h-3 inline mr-1" />
                User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}