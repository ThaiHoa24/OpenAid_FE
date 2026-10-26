"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { HeartHandshake, ShieldCheck, UserCheck, ArrowRight, Lock, Mail, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast(t("auth.fillRequired"), "error");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      showToast(`${t("common.success")}: ${result.user.name}`, "success");
      if (result.user.systemRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/events");
      }
    } else {
      showToast(result.error || t("common.error"), "error");
    }
  };

  const fillDemoAccount = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("123456");
    const result = await login(demoEmail, "123456");
    if (result.success && result.user) {
      showToast(`${t("common.success")}: ${result.user.name}`, "success");
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
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <HeartHandshake className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          {t("auth.loginTitle")}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm ring-1 ring-slate-200/80 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("auth.emailLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@openaid.demo"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  {t("auth.passwordLabel")}
                </label>
                <span className="text-xs text-slate-500">{t("auth.demoDefaultPassword")}</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              {isLoading ? t("common.loading") : t("auth.loginBtn")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              {t("auth.quickDemoHeader")}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("admin@openaid.demo")}
                className="flex items-center justify-between p-2.5 text-left rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 transition-colors text-purple-900 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <div>
                    <div className="text-xs font-bold">{t("auth.adminDemoLabel")}</div>
                    <div className="text-[11px] text-purple-600">admin@openaid.demo</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                  {t("auth.adminDemoBadge")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("organizer@openaid.demo")}
                className="flex items-center justify-between p-2.5 text-left rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors text-emerald-900 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold">{t("auth.organizerDemoLabel")}</div>
                    <div className="text-[11px] text-emerald-600">organizer@openaid.demo</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                  {t("auth.organizerDemoBadge")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("user@openaid.demo")}
                className="flex items-center justify-between p-2.5 text-left rounded-lg border border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 transition-colors text-sky-900 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-sky-700" />
                  <div>
                    <div className="text-xs font-bold">{t("auth.userDemoLabel")}</div>
                    <div className="text-[11px] text-sky-600">user@openaid.demo</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-sky-200 text-sky-800 px-2 py-0.5 rounded">
                  {t("auth.userDemoBadge")}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              {t("auth.registerNow")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
