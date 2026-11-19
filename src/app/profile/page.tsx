"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  User, Mail, Phone, Building2, ShieldCheck, HandHeart,
  Loader2, AlertCircle, Save, Eye, EyeOff, Calendar, Package
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, session, logout, updateProfile, refreshSession, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || "",
    phone: user?.phoneNumber || user?.phone || "",
    avatarUrl: user?.avatarUrl || "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        phone: user.phoneNumber || user.phone || "",
        avatarUrl: user.avatarUrl || "",
        bio: "",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
      });
      showToast(t("profile.saveChangesBtn"), "success");
      setIsEditing(false);
      refreshSession();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Yêu Cầu Đăng Nhập</h2>
        <p className="text-xs text-slate-500">
          Vui lòng đăng nhập để xem hồ sơ cá nhân.
        </p>
        <button
          onClick={() => loginAsDemo("user@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          Đăng nhập nhanh (Demo User)
        </button>
      </div>
    );
  }

  const isAdmin = user.systemRole === "ADMIN";
  const isOrganizer = session?.isOrganizer || false;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("profile.title")}</h1>
          <p className="text-sm text-slate-600 mt-1">{t("profile.updateTitle")}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          {t("nav.logout")}
        </button>
      </div>

      {/* Avatar & Basic Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative">
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center">
                <User className="w-10 h-10 text-emerald-600" />
              </div>
            )}
            {isEditing && (
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user.systemRole === "ADMIN"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : isOrganizer
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}>
                {t(`roles.${user.systemRole}`)}
              </span>
              <StatusBadge status={user.status} />
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium">{t("profile.emailReadOnly")}</span> {user.email}
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium">Đăng ký:</span> {formatDate(user.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            {t("profile.updateTitle")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("profile.fullName")} *
              </label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("profile.emailReadOnly")}
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 bg-slate-50 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("profile.phone")}
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("profile.avatarUrl")}
              </label>
              <input
                type="url"
                disabled={!isEditing}
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-50"
              />
            </div>
          </div>

          {formData.avatarUrl && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img
                src={formData.avatarUrl}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover mx-auto"
              />
              <p className="text-center text-xs text-slate-500 mt-1">Xem trước ảnh đại diện</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("profile.bio")}
            </label>
            <textarea
              rows={3}
              disabled={!isEditing}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={t("profile.bioPlaceholder")}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-50"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              {isEditing ? t("common.cancel") : t("common.edit")}
            </button>
            <button
              type="submit"
              disabled={!isEditing || isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? t("common.loading") : t("profile.saveChangesBtn")}
            </button>
          </div>
        </div>
      </form>

      {/* Organization Memberships */}
      {session?.memberships && session.memberships.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            {t("profile.orgMemberships")}
          </h3>
          <div className="space-y-3">
            {session.memberships.map((m) => (
              <div
                key={m.organization.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                    {m.organization.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{m.organization.name}</h4>
                    <div className="text-xs text-slate-500">
                      {t("profile.orgIdLabel", { id: m.organization.id.slice(0, 8) })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    m.role === "ORGANIZER"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {t(`profile.org${m.role === "ORGANIZER" ? "Organizer" : "Member"}Role`)}
                  </span>
                  {m.role === "ORGANIZER" && (
                    <Link
                      href="/organizer/events"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Vào Bàn Điều Hành
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!session?.memberships || session.memberships.length === 0) && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">{t("profile.noOrgPrompt")}</h3>
          <p className="text-xs text-slate-500">
            Bạn có thể đăng ký tài khoản tổ chức mới để tạo chiến dịch.
          </p>
        </div>
      )}

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center">
          <HandHeart className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-700">
            {session?.user?.volunteerApplicationsCount || 0}
          </div>
          <div className="text-xs text-slate-500">{t("profile.totalVolunteered")}</div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center">
          <Package className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-700">
            {session?.user?.donationsCount || 0}
          </div>
          <div className="text-xs text-slate-500">{t("profile.totalDonations")}</div>
        </div>
      </div>
    </div>
  );
}