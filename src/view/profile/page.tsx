"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { volunteerService } from "@/services/volunteerService";
import { donationService } from "@/services/donationService";
import { uploadService } from "@/services/uploadService";
import { authService } from "@/services/authService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  User, ShieldCheck, HandHeart, 
  Package, CheckCircle2, Save, Loader2, UploadCloud,
  Building2, Plus, X, ExternalLink, ArrowRight, AlertCircle
} from "lucide-react";

export default function ProfilePage() {
  const { user, session, refreshSession, updateProfile, loginAsDemo } = useAuth();
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // New Organization Modal State
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await uploadService.uploadFile(file);
      setFormData((prev) => ({ ...prev, avatarUrl: res.url }));
      showToast("Tải ảnh đại diện thành công!", "success");
    } catch (err: any) {
      showToast(err.message || "Không thể tải lên ảnh", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !orgForm.name.trim()) return;

    setIsCreatingOrg(true);
    try {
      await authService.createOrganizationForUser(user.id, {
        name: orgForm.name.trim(),
        description: orgForm.description.trim() || "Tổ chức từ thiện trên OpenAid",
        contactEmail: orgForm.contactEmail.trim() || user.email,
        contactPhone: orgForm.contactPhone.trim() || user.phone || "0905000111",
        address: orgForm.address.trim() || "Việt Nam",
      });
      showToast("Đăng ký thành lập tổ chức thành công! Hồ sơ đã gửi đến Admin duyệt.", "success");
      setShowOrgModal(false);
      setOrgForm({
        name: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
      });
      refreshSession();
    } catch (err: any) {
      showToast(err.message || "Không thể đăng ký tổ chức", "error");
    } finally {
      setIsCreatingOrg(false);
    }
  };

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
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://... hoặc tải ảnh từ máy tính"
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                  {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <UploadCloud className="w-4 h-4 text-emerald-600" />}
                  <span>{isUploadingAvatar ? "Đang tải..." : "Tải ảnh"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>
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

        {/* Organizations Section */}
        <div className="md:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Tổ Chức Cứu Trợ Của Bạn</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách các tổ chức từ thiện mà bạn tham gia với tư cách Ban điều phối hoặc Thành viên.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setOrgForm({
                  name: "",
                  description: "",
                  contactEmail: user.email,
                  contactPhone: user.phone || "",
                  address: "",
                });
                setShowOrgModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Đăng ký thành lập Tổ chức mới</span>
            </button>
          </div>

          {session?.memberships && session.memberships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {session.memberships.map((m) => (
                <div
                  key={m.organization.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {m.organization.code}
                    </span>
                    <StatusBadge status={m.organization.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {m.organization.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Vai trò:</span>
                      <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                        {m.role === "ORGANIZER" ? "Ban Điều Phối (ORGANIZER)" : "Thành viên (MEMBER)"}
                      </strong>
                    </div>
                  </div>

                  {m.organization.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {m.organization.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {m.organization.status === "PENDING"
                        ? "Đang chờ Admin duyệt"
                        : "Sẵn sàng hoạt động"}
                    </span>
                    <Link
                      href="/organizer/dashboard"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                    >
                      <span>Vào bàn quản lý</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-xs text-slate-600">
                Bạn chưa tham gia tổ chức từ thiện nào. Bạn có thể đăng ký thành lập tổ chức mới để chủ trì các chiến dịch cứu trợ.
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrgForm({
                    name: "",
                    description: "",
                    contactEmail: user.email,
                    contactPhone: user.phone || "",
                    address: "",
                  });
                  setShowOrgModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng ký thành lập Tổ chức ngay</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ĐĂNG KÝ THÀNH LẬP TỔ CHỨC */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Đăng Ký Thành Lập Tổ Chức Cứu Trợ</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOrgModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên tổ chức / Quỹ từ thiện *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Quỹ Cứu Trợ Miền Trung OpenAid"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mục tiêu & Tôn chỉ hoạt động *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả tôn chỉ hoạt động, địa bàn cứu trợ và cam kết minh bạch..."
                  value={orgForm.description}
                  onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email liên hệ *
                  </label>
                  <input
                    type="email"
                    required
                    value={orgForm.contactEmail}
                    onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên lạc *
                  </label>
                  <input
                    type="tel"
                    required
                    value={orgForm.contactPhone}
                    onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ văn phòng / Điểm tiếp nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Tổ chức sau khi tạo sẽ ở trạng thái <strong>PENDING</strong> để Quản trị viên duyệt hồ sơ nhằm đảm bảo an toàn cho các chiến dịch cứu trợ cộng đồng.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrg}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isCreatingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{isCreatingOrg ? "Đang gửi hồ sơ..." : "Xác nhận đăng ký"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
