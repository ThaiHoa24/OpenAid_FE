"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Search,
  ArrowRight,
  ShieldCheck,
  Package,
  Truck,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatQuantity, calculatePercentage } from "@/utils";

export default function HomePage() {
  const { dbVersion } = useAuth();
  const { t, formatDate } = useTranslation();
  const [upcomingEvents, setUpcomingEvents] = useState<EnrichedEvent[]>([]);
  const [quickTrackingId, setQuickTrackingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    eventService
      .getAll({ status: "PUBLISHED", sortBy: "newest" })
      .then((data) => {
        if (mounted) {
          setUpcomingEvents(data.slice(0, 3));
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [dbVersion]);

  const workflowSteps = [
    {
      step: "01",
      title: t("home.steps.step1Title"),
      desc: t("home.steps.step1Desc"),
      icon: Calendar,
      color: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      step: "02",
      title: t("home.steps.step2Title"),
      desc: t("home.steps.step2Desc"),
      icon: Package,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      step: "03",
      title: t("home.steps.step3Title"),
      desc: t("home.steps.step3Desc"),
      icon: Layers,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      step: "04",
      title: t("home.steps.step4Title"),
      desc: t("home.steps.step4Desc"),
      icon: Truck,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      step: "05",
      title: t("home.steps.step5Title"),
      desc: t("home.steps.step5Desc"),
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("home.heroBadge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {t("home.heroTitle")}
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            {t("home.heroSubtitle")}
          </p>

          {/* Search Tracking Box inside Hero */}
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl text-slate-800">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={quickTrackingId}
                onChange={(e) => setQuickTrackingId(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="w-full bg-transparent text-sm placeholder:text-slate-400 focus:outline-none uppercase font-mono font-medium"
              />
            </div>
            <Link
              href={
                quickTrackingId.trim()
                  ? `/tracking?id=${encodeURIComponent(quickTrackingId.trim().toUpperCase())}`
                  : "/tracking"
              }
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{t("home.trackDonationBtn")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick CTA Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/events"
              className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm transition shadow-lg flex items-center gap-2"
            >
              <span>{t("home.exploreEventsBtn")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tracking"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
            >
              {t("nav.tracking")}
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 font-semibold text-sm transition border border-slate-700"
            >
              {t("nav.about")}
            </Link>
          </div>
        </div>
      </section>

      {/* Value Chain / How OpenAid Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t("home.workflowBadge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t("home.workflowTitle")}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t("home.workflowSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 font-mono">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured / Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              {t("home.featuredTitle")}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {t("home.featuredSubtitle")}
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 shrink-0"
          >
            <span>{t("home.viewAllEvents")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <p className="text-slate-500">{t("common.noData")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => {
              const primaryNeed = event.donationNeeds[0];
              const pct = primaryNeed
                ? calculatePercentage(primaryNeed.receivedQuantity, primaryNeed.targetQuantity)
                : 0;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <StatusBadge status={event.status} />
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/70 text-white backdrop-blur-xs">
                        {t(`categories.${event.category}`) !== `categories.${event.category}`
                          ? t(`categories.${event.category}`)
                          : event.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-teal-700">
                        {event.organization?.name || "Verified Organization"}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      {/* Volunteer & Target progress */}
                      {primaryNeed && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                            <span>
                              {primaryNeed.itemType} ({formatQuantity(primaryNeed.receivedQuantity, primaryNeed.unit)} {t("eventDetail.receivedQty").toLowerCase()})
                            </span>
                            <span>{pct}% / {formatQuantity(primaryNeed.targetQuantity, primaryNeed.unit)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full transition-all"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/events/${event.id}`}
                      className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-800 text-center font-bold text-xs transition cursor-pointer"
                    >
                      {t("events.viewDetails")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Capstone Organizer Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-teal-800/40 space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
              OpenAid Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("home.readyToHelp")}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t("home.readyToHelpDesc")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/tracking?id=DON-2026-7K3Q9X"
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm transition shadow-md"
            >
              DON-2026-7K3Q9X ({t("home.trackDonationBtn")})
            </Link>
            <Link
              href="/organizer/dashboard"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
            >
              {t("nav.organizerConsole")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
