"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { volunteerService } from "@/services/volunteerService";
import { donationService } from "@/services/donationService";
import { 
  User, ShieldCheck, HandHeart, 
  Package, CheckCircle2, Save, Loader2 
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    avatarUrl: "",
  });

  const [stats, setStats] = useState({
    totalVolunteered: 0,
    totalDonations: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const loadProfileStats = useCallback(async () => {
    if (!user) return;
    setIsLoadingStats(true);
    try {
      const [apps, donates] = await Promise.all([
        volunteerService.getByUser(user.id),
        donationService.getByUser(user.id),
      ]);
      setStats({
        totalVolunteered: apps.length,
        totalDonations: donates.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
      loadProfileStats();
    }
  }, [user, loadProfileStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast(t("auth.fillRequired"), "error");
      return;
    }

    setIsSaving(true);
    const res = await updateProfile(formData);
    setIsSaving(false);

    if (res.success) {
      showToast(t("common.success"), "success");
    } else {
      showToast(res.error || t("common.error"), "error");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("auth.loginTitle")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("myActivities.mustLoginPrompt")}
        </p>
        <button
          onClick={() => loginAsDemo("user@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          {t("myActivities.loginDemoBtn")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Avatar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <img
            src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
            alt={user.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-600 text-white rounded-xl shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              {t(`roles.${user.systemRole}`) !== `roles.${user.systemRole}` ? t(`roles.${user.systemRole}`) : user.systemRole}
            </span>
          </div>
          <p className="text-xs text-slate-500">{user.email}</p>
          {user.bio && (
            <p className="text-xs text-slate-600 max-w-lg italic">&quot;{user.bio}&quot;</p>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <HandHeart className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">{t("profile.appliedCountLabel")}</span>
              <strong className="text-slate-900">
                {isLoadingStats ? "..." : `${stats.totalVolunteered} ${t("profile.totalVolunteered")}`}
              </strong>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Package className="w-4 h-4 text-teal-600" />
              <span className="text-slate-600">{t("profile.donatedCountLabel")}</span>
              <strong className="text-slate-900">
                {isLoadingStats ? "..." : `${stats.totalDonations} ${t("profile.totalDonations")}`}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Edit Form */}
        <div className="md:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            {t("profile.updateTitle")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("profile.fullName")}
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("profile.emailReadOnly")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("profile.phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912 345 678"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("profile.avatarUrl")}
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("profile.bio")}
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t("profile.bioPlaceholder")}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? t("common.loading") : t("profile.saveChangesBtn")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
