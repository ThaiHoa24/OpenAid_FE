"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { eventService, type EnrichedEvent, type CreateEventInput } from "@/services/eventService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SUPPORT_CATEGORIES } from "@/constants";
import { 
  Calendar, Plus, Trash2, Globe, 
  Ban, CheckCircle, MapPin, Users, Package, 
  X, Loader2, ArrowUpRight 
} from "lucide-react";

export default function OrganizerEventsPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newForm, setNewForm] = useState<CreateEventInput>({
    title: "",
    description: "",
    location: "UBND Xã Hòa Phong, Huyện Hòa Vang, TP. Đà Nẵng",
    area: "Hòa Vang",
    startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    contactPerson: user?.name || "Ban Tổ Chức",
    contactPhone: user?.phone || "0905123456",
    contactEmail: user?.email || "contact@openaid.demo",
    imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80",
    category: "Disaster Relief",
    organizationId: activeOrganization?.id || "",
    publishImmediately: true,
    volunteerRoles: [
      { name: "Phân phát quà cứu trợ", description: "Hỗ trợ trao quà tận tay bà con vùng ngập", requiredQuantity: 10 },
      { name: "Bốc xếp & Điều phối kho", description: "Bốc dỡ gạo, mì từ xe tải vào điểm tập kết", requiredQuantity: 5 },
    ],
    donationNeeds: [
      { itemType: "Gạo tẻ", unit: "kg", targetQuantity: 500 },
      { itemType: "Nước khoáng", unit: "thùng", targetQuantity: 200 },
      { itemType: "Mì ăn liền", unit: "thùng", targetQuantity: 300 },
    ],
  });

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await eventService.getAll({
        organizationId: activeOrganization.id,
        includeDrafts: true,
      });
      setEvents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  // Handle status changes
  const handleStatusChange = async (eventId: string, newStatus: any) => {
    if (!user) return;
    try {
      await eventService.changeStatus(eventId, newStatus, user);
      showToast(`${t("common.status")}: ${newStatus}`, "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    }
  };

  // Handle delete draft
  const handleDeleteDraft = async (eventId: string) => {
    if (!user) return;
    if (confirm(t("organizer.events.confirmDeleteDraft"))) {
      try {
        await eventService.delete(eventId, user);
        showToast(t("common.success"), "info");
        loadData();
      } catch (err: any) {
        showToast(err.message || t("common.error"), "error");
      }
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeOrganization) return;
    if (!newForm.title.trim() || !newForm.location.trim()) {
      showToast(t("auth.fillRequired"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await eventService.create({
        ...newForm,
        organizationId: activeOrganization.id,
      }, user);
      showToast(t("common.success"), "success");
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || t("common.error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("organizer.dashboard.accessDenied")}</h2>
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

  const filteredEvents = events.filter((ev) => {
    if (filterStatus === "ALL") return true;
    return ev.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-600" />
            {t("organizer.events.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("organizer.events.subtitle", { org: activeOrganization?.name || "Da Nang Fund" })}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("organizer.events.createBtn")}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: "ALL", label: `${t("organizer.events.tabs.all")} (${events.length})` },
          { key: "PUBLISHED", label: `${t("organizer.events.tabs.published")} (${events.filter(e => e.status === "PUBLISHED").length})` },
          { key: "DRAFT", label: `${t("organizer.events.tabs.draft")} (${events.filter(e => e.status === "DRAFT").length})` },
          { key: "CLOSED", label: `${t("organizer.events.tabs.closed")} (${events.filter(e => e.status === "CLOSED").length})` },
          { key: "CANCELLED", label: `${t("organizer.events.tabs.cancelled")} (${events.filter(e => e.status === "CANCELLED").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filterStatus === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Table / Cards */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge status={ev.status} />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {t(`categories.${ev.category}`) !== `categories.${ev.category}` ? t(`categories.${ev.category}`) : ev.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    {t("organizer.events.areaLabel")} <strong>{ev.area}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                    <Link href={`/organizer/events/${ev.id}`}>
                      {ev.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {ev.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {ev.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(ev.startDate)} - {formatDate(ev.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {t("organizer.events.volunteersCount", { approved: ev.totalApprovedVolunteers, required: ev.totalRequiredVolunteers })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    {t("organizer.events.donationsCount", { count: ev.donationsCount })}
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="lg:border-l lg:pl-6 border-slate-100 flex flex-wrap lg:flex-col items-center lg:items-end justify-center gap-2 shrink-0">
                <Link
                  href={`/organizer/events/${ev.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Quản lý & Duyệt đơn</span>
                </Link>

                <Link
                  href={`/events/${ev.id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {t("common.viewPublic")}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                {ev.status === "DRAFT" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(ev.id, "PUBLISHED")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {t("organizer.events.publishNowBtn")}
                    </button>
                    {ev.canPhysicalDelete && (
                      <button
                        onClick={() => handleDeleteDraft(ev.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t("organizer.events.deleteDraftBtn")}
                      </button>
                    )}
                  </>
                )}

                {ev.status === "PUBLISHED" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(ev.id, "CLOSED")}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t("organizer.events.closeReceptionBtn")}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t("organizer.events.confirmCancelEvent"))) {
                          handleStatusChange(ev.id, "CANCELLED");
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      {t("organizer.events.cancelCampaignBtn")}
                    </button>
                  </>
                )}

                {ev.status === "CLOSED" && (
                  <button
                    onClick={() => handleStatusChange(ev.id, "PUBLISHED")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {t("organizer.events.reopenCampaignBtn")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("organizer.events.noEvents")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("organizer.events.noEventsPrompt")}
          </p>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("organizer.events.modalCreateTitle")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t("common.organization")}: {activeOrganization?.name}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.events.campaignNameLabel")}</label>
                  <input
                    type="text"
                    required
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    placeholder={t("organizer.events.campaignNamePlaceholder")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.events.campaignDescLabel")}</label>
                  <textarea
                    rows={3}
                    required
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder={t("organizer.events.campaignDescPlaceholder")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t("organizer.events.campaignCategoryLabel")}</label>
                    <select
                      value={newForm.category}
                      onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      {SUPPORT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {t(`categories.${c}`) !== `categories.${c}` ? t(`categories.${c}`) : c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t("organizer.events.campaignAreaLabel")}</label>
                    <input
                      type="text"
                      required
                      value={newForm.area}
                      onChange={(e) => setNewForm({ ...newForm, area: e.target.value })}
                      placeholder="Hòa Vang, Sơn Trà, v.v."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("organizer.events.campaignLocationLabel")}</label>
                  <input
                    type="text"
                    required
                    value={newForm.location}
                    onChange={(e) => setNewForm({ ...newForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t("organizer.events.startDateLabel")}</label>
                    <input
                      type="date"
                      required
                      value={newForm.startDate}
                      onChange={(e) => setNewForm({ ...newForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t("organizer.events.endDateLabel")}</label>
                    <input
                      type="date"
                      required
                      value={newForm.endDate}
                      onChange={(e) => setNewForm({ ...newForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Donation Needs Definition */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-600" />
                    {t("organizer.events.goodsTargetsTitle")}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setNewForm({
                      ...newForm,
                      donationNeeds: [...newForm.donationNeeds, { itemType: "Áo phao", unit: "chiếc", targetQuantity: 100 }]
                    })}
                    className="text-emerald-600 font-semibold text-xs hover:underline cursor-pointer"
                  >
                    {t("organizer.events.addGoodsBtn")}
                  </button>
                </div>

                <div className="space-y-2">
                  {newForm.donationNeeds.map((need, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={need.itemType}
                        onChange={(e) => {
                          const updated = [...newForm.donationNeeds];
                          updated[idx].itemType = e.target.value;
                          setNewForm({ ...newForm, donationNeeds: updated });
                        }}
                        placeholder={t("common.items")}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                      <input
                        type="number"
                        min="1"
                        value={need.targetQuantity}
                        onChange={(e) => {
                          const updated = [...newForm.donationNeeds];
                          updated[idx].targetQuantity = Number(e.target.value);
                          setNewForm({ ...newForm, donationNeeds: updated });
                        }}
                        placeholder={t("common.quantity")}
                        className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        value={need.unit}
                        onChange={(e) => {
                          const updated = [...newForm.donationNeeds];
                          updated[idx].unit = e.target.value;
                          setNewForm({ ...newForm, donationNeeds: updated });
                        }}
                        placeholder={t("common.unit")}
                        className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                      {newForm.donationNeeds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewForm({
                              ...newForm,
                              donationNeeds: newForm.donationNeeds.filter((_, i) => i !== idx)
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Volunteer Roles Definition */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-600" />
                    {t("organizer.events.volunteerTargetsTitle")}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setNewForm({
                      ...newForm,
                      volunteerRoles: [...newForm.volunteerRoles, { name: "Hậu cần y tế", description: "Hỗ trợ sơ cứu cơ bản", requiredQuantity: 4 }]
                    })}
                    className="text-teal-600 font-semibold text-xs hover:underline cursor-pointer"
                  >
                    {t("organizer.events.addRoleBtn")}
                  </button>
                </div>

                <div className="space-y-2">
                  {newForm.volunteerRoles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={role.name}
                        onChange={(e) => {
                          const updated = [...newForm.volunteerRoles];
                          updated[idx].name = e.target.value;
                          setNewForm({ ...newForm, volunteerRoles: updated });
                        }}
                        placeholder={t("common.role")}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                      <input
                        type="number"
                        min="1"
                        value={role.requiredQuantity}
                        onChange={(e) => {
                          const updated = [...newForm.volunteerRoles];
                          updated[idx].requiredQuantity = Number(e.target.value);
                          setNewForm({ ...newForm, volunteerRoles: updated });
                        }}
                        placeholder={t("common.quantity")}
                        className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                      {newForm.volunteerRoles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewForm({
                              ...newForm,
                              volunteerRoles: newForm.volunteerRoles.filter((_, i) => i !== idx)
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newForm.publishImmediately}
                    onChange={(e) => setNewForm({ ...newForm, publishImmediately: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800">{t("organizer.events.publishImmediately")}</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t("organizer.events.submitCreateBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
