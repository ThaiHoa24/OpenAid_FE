"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Users,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Share2,
} from "lucide-react";
import {
  eventService,
  volunteerService,
  donationService,
  transparencyService,
  type EnrichedEvent,
} from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatQuantity,
  calculatePercentage,
} from "@/utils";
import type { DonationNeed, TransparencyLog, VolunteerRole } from "@/types";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const router = useRouter();
  const { user, dbVersion } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate, formatDateTime } = useTranslation();

  const [event, setEvent] = useState<EnrichedEvent | null>(null);
  const [logs, setLogs] = useState<TransparencyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "volunteer" | "donations" | "transparency">("overview");

  // Volunteer Modal State
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<VolunteerRole | null>(null);
  const [volunteerNote, setVolunteerNote] = useState("");
  const [submittingVolunteer, setSubmittingVolunteer] = useState(false);

  // Donation Modal State
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<DonationNeed | null>(null);
  const [donationQuantity, setDonationQuantity] = useState<number | "">("");
  const [donationNote, setDonationNote] = useState("");
  const [donationPhotoUrl, setDonationPhotoUrl] = useState("");
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [createdTrackingId, setCreatedTrackingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      eventService.getById(eventId),
      transparencyService.getLogs({ eventId }),
    ]).then(([evt, eventLogs]) => {
      if (isMounted) {
        setEvent(evt);
        setLogs(eventLogs);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [eventId, dbVersion]);

  // Handle Volunteer Apply
  const handleOpenVolunteerModal = (role: VolunteerRole) => {
    if (!user) {
      showToast(t("myActivities.mustLoginPrompt"), "info");
      router.push("/login");
      return;
    }
    setSelectedRole(role);
    setVolunteerNote("");
    setVolunteerModalOpen(true);
  };

  const handleSubmitVolunteerApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !user || !event) return;

    setSubmittingVolunteer(true);
    try {
      await volunteerService.apply(
        {
          eventId: event.id,
          volunteerRoleId: selectedRole.id,
          note: volunteerNote,
        },
        user
      );
      setVolunteerModalOpen(false);
      showToast(
        `${t("common.success")}: ${selectedRole.name}`,
        "success",
        t("common.info")
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("common.error"), "error");
    } finally {
      setSubmittingVolunteer(false);
    }
  };

  // Handle Donation Pledge
  const handleOpenDonationModal = (need: DonationNeed) => {
    if (!user) {
      showToast(t("myDonations.mustLoginPrompt"), "info");
      router.push("/login");
      return;
    }
    setSelectedNeed(need);
    setDonationQuantity("");
    setDonationNote("");
    setDonationPhotoUrl("");
    setCreatedTrackingId(null);
    setDonationModalOpen(true);
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNeed || !user || !event) return;

    const qty = Number(donationQuantity);
    if (!qty || qty <= 0) {
      showToast(t("auth.fillRequired"), "error");
      return;
    }

    setSubmittingDonation(true);
    try {
      const don = await donationService.create(
        {
          eventId: event.id,
          donationNeedId: selectedNeed.id,
          quantity: qty,
          note: donationNote,
          photoUrl: donationPhotoUrl,
        },
        user
      );
      setCreatedTrackingId(don.trackingId);
      showToast(
        `${t("eventDetail.donateSuccessTitle")}: ${don.trackingId}`,
        "success",
        t("common.info")
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("common.error"), "error");
    } finally {
      setSubmittingDonation(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-slate-200" />
        <div className="h-8 w-1/3 bg-slate-200 rounded-lg" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">{t("events.noEventsFound")}</h2>
        <p className="text-slate-500 text-sm">
          {t("events.noEventsDesc")}
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm"
        >
          {t("events.title")}
        </Link>
      </div>
    );
  }

  // Target warning calculation (Section 11)
  const currentQtyNum = Number(donationQuantity || 0);
  const exceedsTarget =
    selectedNeed &&
    currentQtyNum > 0 &&
    selectedNeed.pledgedQuantity + currentQtyNum > selectedNeed.targetQuantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-teal-600">
          {t("nav.home")}
        </Link>
        <span>/</span>
        <Link href="/events" className="hover:text-teal-600">
          {t("nav.events")}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800 truncate">{event.title}</span>
      </nav>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="h-72 sm:h-80 w-full relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={event.status} />
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs text-white">
              {t(`categories.${event.category}`) !== `categories.${event.category}`
                ? t(`categories.${event.category}`)
                : event.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {event.organization?.name || "Verified Organization"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-400" />
              {formatDate(event.startDate)} — {formatDate(event.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400" />
              {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-teal-400" />
              {t("eventDetail.contact")}: {event.contactPerson} ({event.contactPhone})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 flex gap-4 overflow-x-auto text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>{t("eventDetail.tabs.overview")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("volunteer")}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "volunteer"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t("eventDetail.tabs.volunteer")} ({event.volunteerRoles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("donations")}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "donations"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t("eventDetail.tabs.donations")} ({event.donationNeeds.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("transparency")}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "transparency"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t("eventDetail.tabs.transparency")} ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">{t("eventDetail.overviewTitle")}</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Quick summary cards of open volunteer & donation needs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{t("eventDetail.needsSectionTitle")}</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("donations")}
                  className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{t("eventDetail.donateBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.donationNeeds.map((need) => {
                  const pct = calculatePercentage(need.receivedQuantity, need.targetQuantity);
                  return (
                    <div
                      key={need.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 text-sm">{need.itemType}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                          {pct}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>{t("eventDetail.targetQty")}:</span>
                          <span className="font-semibold text-slate-700">
                            {formatQuantity(need.targetQuantity, need.unit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("eventDetail.receivedQty")}:</span>
                          <span className="font-semibold text-teal-700">
                            {formatQuantity(need.receivedQuantity, need.unit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("eventDetail.distributedQty")}:</span>
                          <span className="font-semibold text-emerald-700">
                            {formatQuantity(need.distributedQuantity, need.unit)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Organization card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                {t("eventDetail.organizer")}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  {event.organization?.name.charAt(0) || "O"}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {event.organization?.name || "Verified Organization"}
                  </h3>
                  <div className="mt-1">
                    <StatusBadge status={event.organization?.status || "APPROVED"} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {event.organization?.description}
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{event.organization?.address || "Da Nang"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{event.organization?.contactPhone || event.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{event.organization?.contactEmail || event.contactEmail}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-teal-900">{t("home.readyToHelp")}</h3>
              <p className="text-xs text-teal-700 leading-relaxed">
                {t("home.featuredSubtitle")}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("volunteer")}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  {t("eventDetail.tabs.volunteer")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("donations")}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-teal-300 font-bold text-xs transition cursor-pointer"
                >
                  {t("eventDetail.tabs.donations")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOLUNTEER ROLES */}
      {activeTab === "volunteer" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t("eventDetail.volunteerSectionTitle")}</h2>
              <p className="text-sm text-slate-600">
                {t("eventDetail.volunteerSectionDesc")}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 w-fit">
              {t("eventDetail.roleSlots", { approved: event.totalApprovedVolunteers, required: event.totalRequiredVolunteers })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.volunteerRoles.map((role) => {
              const remaining = Math.max(0, role.requiredQuantity - role.approvedQuantity);
              const isFull = remaining === 0;

              return (
                <div
                  key={role.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900">{role.name}</h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isFull
                            ? "bg-slate-100 text-slate-600"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isFull ? t("eventDetail.roleFull") : `${remaining} ${t("common.quantity").toLowerCase()}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      <span>{t("common.status")}: </span>
                      <strong className="text-slate-800">
                        {role.approvedQuantity} / {role.requiredQuantity}
                      </strong>
                    </div>

                    <button
                      type="button"
                      disabled={event.status !== "PUBLISHED"}
                      onClick={() => handleOpenVolunteerModal(role)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
                    >
                      {t("eventDetail.applyBtn")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DONATION NEEDS */}
      {activeTab === "donations" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t("eventDetail.needsSectionTitle")}</h2>
            <p className="text-sm text-slate-600">
              {t("eventDetail.needsSectionDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.donationNeeds.map((need) => {
              const pct = calculatePercentage(need.receivedQuantity, need.targetQuantity);
              return (
                <div
                  key={need.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900">{need.itemType}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {t("common.unit")}: {need.unit}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span>{t("eventDetail.targetQty")}:</span>
                        <strong className="text-slate-800">
                          {formatQuantity(need.targetQuantity, need.unit)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("eventDetail.pledgedQty")}:</span>
                        <span className="text-blue-700 font-semibold">
                          {formatQuantity(need.pledgedQuantity, need.unit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("eventDetail.receivedQty")}:</span>
                        <span className="text-teal-700 font-semibold">
                          {formatQuantity(need.receivedQuantity, need.unit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("eventDetail.distributedQty")}:</span>
                        <span className="text-emerald-700 font-semibold">
                          {formatQuantity(need.distributedQuantity, need.unit)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>{t("eventDetail.receivedQty")}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={event.status !== "PUBLISHED"}
                    onClick={() => handleOpenDonationModal(need)}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
                  >
                    {t("eventDetail.donateBtn")} ({need.itemType})
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TRANSPARENCY TIMELINE */}
      {activeTab === "transparency" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{t("eventDetail.transparencyLogsTitle")}</h2>
            <p className="text-sm text-slate-600">
              {t("eventDetail.needsSectionDesc")}
            </p>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              {t("eventDetail.noLogsYet")}
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {logs.map((log) => (
                <div key={log.id} className="relative space-y-1">
                  <div className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white ring-2 ring-teal-200" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{log.action}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDateTime(log.timestamp)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.actorName} ({log.actorRole})
                    </span>
                    {log.newStatus && <StatusBadge status={log.newStatus} />}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{log.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VOLUNTEER APPLICATION MODAL */}
      {volunteerModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  {t("eventDetail.applyModalTitle")}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedRole.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVolunteerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitVolunteerApplication} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                <p>
                  <strong>{t("events.title")}:</strong> {event.title}
                </p>
                <p>
                  <strong>{t("common.details")}:</strong> {selectedRole.description}
                </p>
                <p>
                  <strong>{t("eventDetail.applicantName")}:</strong> {user?.name} ({user?.email})
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t("eventDetail.volunteerNoteLabel")}
                </label>
                <textarea
                  rows={3}
                  value={volunteerNote}
                  onChange={(e) => setVolunteerNote(e.target.value)}
                  placeholder={t("eventDetail.volunteerNotePlaceholder")}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVolunteerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submittingVolunteer}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingVolunteer ? t("common.loading") : t("eventDetail.submitApplyBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DONATION PLEDGE MODAL */}
      {donationModalOpen && selectedNeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {createdTrackingId ? (
              /* Success State with Tracking ID */
              <div className="text-center space-y-5 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">{t("eventDetail.donateSuccessTitle")}</h3>
                  <p className="text-xs text-slate-600">
                    {t("eventDetail.donateSuccessDesc")}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t("eventDetail.copyTrackingId")}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-extrabold font-mono text-teal-700">
                      {createdTrackingId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdTrackingId);
                        showToast(`${t("common.copied")}: ${createdTrackingId}`, "success");
                      }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title={t("eventDetail.copyTrackingId")}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/tracking?id=${createdTrackingId}`}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>{t("eventDetail.viewTrackingTimeline")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/my-donations"
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center"
                  >
                    {t("nav.myDonations")}
                  </Link>
                </div>
              </div>
            ) : (
              /* Pledge Form */
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                      {t("eventDetail.donateModalTitle")}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {selectedNeed.itemType}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDonationModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitDonation} className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-700">
                      <strong>{t("eventDetail.targetQty")}:</strong>{" "}
                      {formatQuantity(selectedNeed.targetQuantity, selectedNeed.unit)}
                    </p>
                    <p className="text-slate-700">
                      <strong>{t("eventDetail.pledgedQty")}:</strong>{" "}
                      {formatQuantity(selectedNeed.pledgedQuantity, selectedNeed.unit)}
                    </p>
                    <p className="text-slate-700">
                      <strong>{t("eventDetail.receivedQty")}:</strong>{" "}
                      {formatQuantity(selectedNeed.receivedQuantity, selectedNeed.unit)}
                    </p>
                  </div>

                  {/* Quantity input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {t("eventDetail.pledgeQtyLabel", { unit: selectedNeed.unit })}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        required
                        value={donationQuantity}
                        onChange={(e) =>
                          setDonationQuantity(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder={`e.g. 50`}
                        className="flex-1 p-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500"
                      />
                      <span className="px-3 py-3 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                        {selectedNeed.unit}
                      </span>
                    </div>
                  </div>

                  {/* Target Exceeded Non-Blocking Warning */}
                  {exceedsTarget && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        {t("eventDetail.targetWarning", {
                          qty: currentQtyNum,
                          unit: selectedNeed.unit,
                          current: selectedNeed.pledgedQuantity,
                          target: selectedNeed.targetQuantity,
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {t("eventDetail.donorNotesLabel")}
                    </label>
                    <textarea
                      rows={2}
                      value={donationNote}
                      onChange={(e) => setDonationNote(e.target.value)}
                      placeholder={t("eventDetail.donorNotesPlaceholder")}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {t("trips.photoUrlLabel")}
                    </label>
                    <input
                      type="url"
                      value={donationPhotoUrl}
                      onChange={(e) => setDonationPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDonationModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDonation}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submittingDonation ? t("common.loading") : t("eventDetail.submitDonateBtn")}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
