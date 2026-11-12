"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { organizationService, type DetailedOrganization, type OrganizationMemberDetail } from "@/services/organizationService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Building2,
  Users,
  UserPlus,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  X,
  Save,
  Check,
  ArrowRight,
} from "lucide-react";

export default function OrganizerOrganizationPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [orgDetails, setOrgDetails] = useState<DetailedOrganization | null>(null);
  const [members, setMembers] = useState<OrganizationMemberDetail[]>([]);
  const [searchMember, setSearchMember] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Edit Org Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  // Add Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"MEMBER" | "ORGANIZER">("MEMBER");

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const details = await organizationService.getById(activeOrganization.id);
      setOrgDetails(details);
      setMembers(details.members || []);
      setEditForm({
        name: details.name || "",
        description: details.description || "",
        email: details.contactEmail || details.email || "",
        phoneNumber: details.contactPhone || details.phoneNumber || "",
        address: details.address || "",
      });
    } catch (err: any) {
      console.error(err);
      showToast("Không thể tải thông tin tổ chức", "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Edit Organization
  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !editForm.name.trim()) return;

    setIsUpdatingOrg(true);
    try {
      await organizationService.update(activeOrganization.id, editForm);
      showToast("Cập nhật thông tin tổ chức thành công!", "success");
      setShowEditModal(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Cập nhật thông tin thất bại", "error");
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  // Handle Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !newMemberEmail.trim()) return;

    setIsAddingMember(true);
    try {
      await organizationService.addMember(activeOrganization.id, {
        email: newMemberEmail.trim(),
        role: newMemberRole,
      });
      showToast(`Đã thêm thành công thành viên: ${newMemberEmail.trim()}`, "success");
      setNewMemberEmail("");
      setShowAddMemberModal(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Không thể thêm thành viên vào tổ chức", "error");
    } finally {
      setIsAddingMember(false);
    }
  };

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">
          {t("organizer.dashboard.accessDenied")}
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("organizer.dashboard.accessDeniedDesc")}
        </p>
        <button
          onClick={() => loginAsDemo("organizer@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          {t("organizer.dashboard.loginAsOrganizerBtn")}
        </button>
      </div>
    );
  }

  const filteredMembers = members.filter((m) => {
    if (roleFilter !== "ALL" && m.role !== roleFilter) return false;
    if (searchMember.trim()) {
      const q = searchMember.toLowerCase().trim();
      const name = (m.user?.fullName || m.user?.name || "").toLowerCase();
      const email = (m.user?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-emerald-600" />
              <span>Hồ Sơ Tổ Chức & Thành Viên</span>
            </h1>
            {orgDetails && <StatusBadge status={orgDetails.status} />}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Quản lý thông tin pháp nhân, giấy phép và phân quyền ban điều phối của tổ chức thiện nguyện.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Edit className="w-4 h-4 text-slate-500" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Mời thành viên</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs">Đang tải hồ sơ tổ chức...</span>
        </div>
      ) : orgDetails ? (
        <>
          {/* Organization Details Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    MÃ: {orgDetails.code}
                  </span>
                  <span className="text-xs text-slate-500">
                    Thành lập: {formatDate(orgDetails.createdAt)}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {orgDetails.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {orgDetails.description || "Chưa có mô tả chi tiết cho tổ chức này."}
                </p>
              </div>

              {/* Status Warning if PENDING */}
              {orgDetails.status === "PENDING" && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 max-w-sm">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Hồ sơ đang chờ Quản trị viên duyệt</span>
                  </div>
                  <p className="text-amber-800/90 text-[11px] leading-relaxed">
                    Tổ chức mới đăng ký đang được kiểm tra tính hợp lệ. Sau khi Admin phê duyệt (APPROVED), bạn sẽ có thể công bố các chiến dịch ra cộng đồng.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Contact & Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[11px]">Email liên hệ:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {orgDetails.contactEmail || orgDetails.email || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                  <span className="font-semibold text-slate-800 block">
                    {orgDetails.contactPhone || orgDetails.phoneNumber || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[11px]">Trụ sở / Địa chỉ:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {orgDetails.address || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Members Management Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Danh Sách Thành Viên & Phân Quyền ({members.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý các tài khoản có quyền truy cập vào bàn quản lý của tổ chức ({orgDetails.name}).
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder="Tìm theo tên hoặc email..."
                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="ORGANIZER">Ban điều phối (ORGANIZER)</option>
                  <option value="MEMBER">Thành viên (MEMBER)</option>
                </select>
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Thành viên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Số điện thoại</th>
                    <th className="py-3 px-4">Vai trò trong tổ chức</th>
                    <th className="py-3 px-4">Ngày gia nhập</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m) => (
                      <tr key={m.userId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <img
                            src={
                              m.user?.avatarUrl ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <div>{m.user?.fullName || m.user?.name || "Người dùng"}</div>
                            {m.userId === user?.id && (
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                (Tài khoản của bạn)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {m.user?.email || "Chưa rõ email"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {m.user?.phoneNumber || m.user?.phone || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          {m.role === "ORGANIZER" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Ban điều phối (ORGANIZER)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              <Users className="w-3 h-3" />
                              <span>Thành viên (MEMBER)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDate(m.joinedAt || m.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                          <span className="text-[11px] font-semibold text-emerald-700">Đang hoạt động</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        Không tìm thấy thành viên nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-slate-500">
          Chưa chọn tổ chức hoặc không tìm thấy dữ liệu tổ chức.
        </div>
      )}

      {/* MODAL 1: CHỈNH SỬA HỒ SƠ TỔ CHỨC */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-600" />
                <span>Cập nhật Hồ sơ Tổ chức</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên tổ chức từ thiện *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả mục tiêu & hoạt động
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Giới thiệu sứ mệnh, kinh nghiệm cứu trợ..."
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
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên lạc *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ văn phòng / Điểm tập kết
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingOrg}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isUpdatingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isUpdatingOrg ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MỜI / THÊM THÀNH VIÊN VÀO TỔ CHỨC */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Thêm Thành Viên Vào Tổ Chức</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Email tài khoản OpenAid *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nhan_su@openaid.demo"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Người dùng phải đã có tài khoản trên OpenAid để được thêm vào ban tổ chức.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phân công vai trò *
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setNewMemberRole("MEMBER")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      newMemberRole === "MEMBER"
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Thành viên (MEMBER)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Hỗ trợ vận hành, ghi nhận ca trực và điều phối thực địa.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewMemberRole("ORGANIZER")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      newMemberRole === "ORGANIZER"
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Đồng điều phối (ORGANIZER)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Toàn quyền quản lý chiến dịch, duyệt TNV, gom lô và chuyến xe.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isAddingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isAddingMember ? "Đang thêm..." : "Xác nhận thêm"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
