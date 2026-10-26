"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  Users,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { eventService, type EnrichedEvent, type EventFilterOptions } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AREAS, SUPPORT_CATEGORIES } from "@/constants";
import { formatQuantity, calculatePercentage } from "@/utils";

export default function EventsDiscoveryPage() {
  const { dbVersion } = useAuth();
  const { t, formatDate } = useTranslation();
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Filters state
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "startDate" | "volunteerSlots">("newest");

  const hasActiveFilters =
    search.trim() !== "" || area !== "ALL" || category !== "ALL" || dateFilter !== "ALL" || sortBy !== "newest";

  const fetchEvents = () => {
    setLoading(true);
    const filterOpts: EventFilterOptions = {
      search,
      area,
      category,
      dateFilter,
      sortBy,
      includeDrafts: false, // Public only sees published/closed
    };
    eventService.getAll(filterOpts).then((res) => {
      startTransition(() => {
        setEvents(res);
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, area, category, dateFilter, sortBy, dbVersion]);

  const handleResetFilters = () => {
    setSearch("");
    setArea("ALL");
    setCategory("ALL");
    setDateFilter("ALL");
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("home.heroBadge")}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("events.title")}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          {t("events.subtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Top search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("events.searchPlaceholder")}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 shrink-0">{t("events.sortBy")}:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="newest">{t("events.sortNewest")}</option>
              <option value="startDate">{t("events.sortStartDate")}</option>
              <option value="volunteerSlots">{t("events.sortVolunteer")}</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>{t("common.filter")}:</span>
          </div>

          {/* Area Filter */}
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">{t("events.allAreas")}</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">{t("events.allCategories")}</option>
            {SUPPORT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`categories.${cat}`) !== `categories.${cat}` ? t(`categories.${cat}`) : cat}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">{t("events.allDates")}</option>
            <option value="ACTIVE">{t("status.PUBLISHED")}</option>
            <option value="OCTOBER_2026">October 2026</option>
            <option value="NOVEMBER_DECEMBER_2026">Nov - Dec 2026</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold transition cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t("events.clearFilters")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Events Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">{t("events.noEventsFound")}</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {t("events.noEventsDesc")}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs transition cursor-pointer"
          >
            {t("events.clearFilters")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const openVolunteerSlots = Math.max(
              0,
              event.totalRequiredVolunteers - event.totalApprovedVolunteers
            );

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <StatusBadge status={event.status} />
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/75 text-white backdrop-blur-xs">
                      {t(`categories.${event.category}`) !== `categories.${event.category}`
                        ? t(`categories.${event.category}`)
                        : event.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/95 text-slate-900 shadow-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-600" />
                      {event.area}
                    </span>
                  </div>
                </div>

                {/* Content */}
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
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(event.startDate)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        {openVolunteerSlots > 0
                          ? `${openVolunteerSlots} ${t("events.volunteersNeeded").toLowerCase()}`
                          : t("eventDetail.roleFull")}
                      </span>
                    </div>

                    {/* Progress bars for donation needs */}
                    <div className="space-y-2 pt-1">
                      {event.donationNeeds.slice(0, 2).map((need) => {
                        const pct = calculatePercentage(
                          need.receivedQuantity,
                          need.targetQuantity
                        );
                        return (
                          <div key={need.id} className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-600">
                              <span className="font-medium">{need.itemType}</span>
                              <span className="font-semibold text-slate-700">
                                {formatQuantity(need.receivedQuantity, need.unit)} /{" "}
                                {formatQuantity(need.targetQuantity, need.unit)} ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
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

                  <Link
                    href={`/events/${event.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-900 text-center font-bold text-xs transition cursor-pointer"
                  >
                    {t("events.viewDetails")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
