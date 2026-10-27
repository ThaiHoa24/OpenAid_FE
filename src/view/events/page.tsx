"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  X,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { AREAS, TIME_FILTERS, SUPPORT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

function EventsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialArea = searchParams.get("area") || "Tất cả khu vực";
  const initialQuery = searchParams.get("q") || "";

  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState(initialQuery);
  const [area, setArea] = useState(initialArea);
  const [supportType, setSupportType] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const resetFilters = () => {
    setSearch("");
    setArea("Tất cả khu vực");
    setSupportType("all");
    setTimeFilter("all");
  };

  useEffect(() => {
    setLoading(true);
    eventService
      .getAll({
        search,
        area: area !== "Tất cả khu vực" ? area : undefined,
        category: initialCategory !== "all" ? initialCategory : undefined,
        status: "PUBLISHED",
      })
      .then((res) => {
        setEvents(res);
        setLoading(false);
      });
  }, [search, area, initialCategory, timeFilter, supportType]);

  const hasActiveFilters =
    search.trim() !== "" || area !== "Tất cả khu vực" || supportType !== "all" || timeFilter !== "all";

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1F4D36]">
            <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
            <span>Chiến Dịch Đang Phát Động</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1C2B24] tracking-tight">
            Khám Phá Chiến Dịch Thiện Nguyện
          </h1>
          <p className="text-sm text-[#5F6F66]">
            Tìm kiếm các chương trình tiếp nhận quyên góp hiện vật hoặc tuyển tình nguyện viên thực địa.
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E5E7E0] bg-white text-xs font-bold text-[#1C2B24] self-start cursor-pointer"
        >
          <Filter className="w-4 h-4 text-[#1F4D36]" />
          <span>Bộ lọc {hasActiveFilters && "• Đang lọc"}</span>
        </button>
      </div>

      {/* Main Grid: Sidebar Filters (Left) + Event Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar (Left 3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-[#E5E7E0] shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-[#1C2B24] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1F4D36]" />
              <span>Bộ lọc tìm kiếm</span>
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          {/* Search keyword */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C2B24]">Từ khóa</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên chiến dịch, vật phẩm..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E7E0] bg-[#FAF9F6] focus:outline-none focus:border-[#1F4D36]"
              />
            </div>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C2B24]">Khu vực / Địa bàn</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7E0] bg-[#FAF9F6] focus:outline-none focus:border-[#1F4D36] cursor-pointer"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Support Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C2B24]">Hình thức hỗ trợ</label>
            <select
              value={supportType}
              onChange={(e) => setSupportType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7E0] bg-[#FAF9F6] focus:outline-none focus:border-[#1F4D36] cursor-pointer"
            >
              {SUPPORT_TYPES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C2B24]">Thời gian</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7E0] bg-[#FAF9F6] focus:outline-none focus:border-[#1F4D36] cursor-pointer"
            >
              {TIME_FILTERS.map((tf) => (
                <option key={tf.id} value={tf.id}>
                  {tf.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Events Grid (Right 9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-3xl border border-[#E5E7E0] space-y-3">
              <p className="font-bold text-base text-[#1C2B24]">Không tìm thấy chiến dịch phù hợp</p>
              <p className="text-xs text-[#5F6F66]">
                Thử điều chỉnh lại từ khóa hoặc chọn &quot;Tất cả khu vực&quot; để tìm thấy nhiều kết quả hơn.
              </p>
              <Button onClick={resetFilters} variant="primary" size="sm">
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => {
                const primaryNeed = evt.donationNeeds[0];
                const neededVolunteers = Math.max(
                  0,
                  evt.totalRequiredVolunteers - evt.totalApprovedVolunteers
                );
                const pledgedPct = primaryNeed
                  ? Math.min(
                      100,
                      Math.round(
                        (primaryNeed.pledgedQuantity / primaryNeed.targetQuantity) * 100
                      )
                    )
                  : 0;

                return (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-5 cursor-pointer border border-[#E5E7E0]/40"
                  >
                    {/* Full cover image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Dark gradient bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    {/* Top: Status dot badge */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-bold border border-white/15">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{evt.category}</span>
                      </span>
                    </div>

                    {/* Bottom info */}
                    <div className="relative z-10 space-y-2.5">
                      <div>
                        <h3 className="text-base font-bold text-white leading-snug line-clamp-2 drop-shadow-sm group-hover:text-amber-200 transition">
                          {evt.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-white/80 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      </div>

                      {/* Slim Progress Bar */}
                      {primaryNeed && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-white/70 font-medium">
                            <span>{primaryNeed.itemType}</span>
                            <span>{pledgedPct}% đã cam kết</span>
                          </div>
                          <ProgressBar
                            value={pledgedPct}
                            className="h-1.5 rounded-full bg-white/20 overflow-hidden"
                            fillClassName="h-full bg-[#F28C1B] rounded-full transition-all duration-500"
                          />
                        </div>
                      )}

                      {/* Date & Missing Volunteers / Progress in Orange */}
                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-white/70">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(evt.startDate).toLocaleDateString("vi-VN")}</span>
                        </div>

                        <div className="font-extrabold text-[#F28C1B] flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{neededVolunteers > 0 ? `Cần ${neededVolunteers} TNV` : "Đã đủ TNV"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom-Sheet / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1C2B24]">Bộ Lọc Chiến Dịch</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C2B24]">Từ khóa</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Bão lũ, mì tôm, áo ấm..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7E0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C2B24]">Khu vực</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7E0]"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C2B24]">Hình thức hỗ trợ</label>
                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7E0]"
                >
                  {SUPPORT_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-3 rounded-full border border-[#E5E7E0] text-xs font-bold text-[#5F6F66] cursor-pointer"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-full bg-[#1F4D36] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1240px] mx-auto px-4 py-20 text-center text-sm font-semibold text-[#5F6F66]">
          Đang tải danh sách chiến dịch...
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
