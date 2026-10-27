"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Package, MapPin, Users } from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

export function FeaturedEvents() {
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    eventService.getAll({ status: "PUBLISHED" }).then((res) => {
      setEvents(res.slice(0, 4));
      setIsLoading(false);
    });
  }, []);

  return (
    <section id="featured-events" className="scroll-mt-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Deep Forest Green Floor with Ambient Backlight */}
      <div className="relative bg-gradient-to-b from-[#0B3B24] via-[#09331F] to-[#062416] rounded-3xl py-6 px-5 sm:py-8 sm:px-8 shadow-card border border-emerald-950/60 space-y-5 sm:space-y-6 overflow-hidden">
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4ADE80]">
              <span className="w-5 h-[2px] bg-[#4ADE80] inline-block" />
              <span>Chiến Dịch Tiếp Ứng Khẩn Cấp</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Các Hoạt Động Cứu Trợ Đang Phát Động
            </h2>
            <p className="text-xs sm:text-sm text-[#D1E7DD] max-w-xl leading-normal">
              Tiếp nhận hiện vật thiết yếu và điều phối tình nguyện viên trực tiếp đến các xã, huyện vùng lũ lụt, sạt lở.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#3ec770] hover:to-[#16a34a] text-[#062416] font-bold text-xs shadow-md transition-all self-start sm:self-auto shrink-0 group hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Xem tất cả chiến dịch</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/10 rounded-3xl h-80 animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/10 p-10 text-center rounded-3xl text-[#D1E7DD] text-xs">
            Hiện chưa có chiến dịch nào đang mở tiếp nhận.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
            {events.map((evt) => {
              const primaryNeed = evt.donationNeeds[0];
              const neededVolunteers = Math.max(
                0,
                evt.totalRequiredVolunteers - evt.totalApprovedVolunteers
              );
              const progress =
                primaryNeed && primaryNeed.targetQuantity > 0
                  ? Math.min(
                      100,
                      Math.round(
                        ((primaryNeed.receivedQuantity ||
                          primaryNeed.pledgedQuantity ||
                          0) /
                          primaryNeed.targetQuantity) *
                          100
                      )
                    )
                  : 65;

              return (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className="group bg-white rounded-3xl p-3.5 sm:p-4 text-[#1C2B24] shadow-card hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer hover:-translate-y-1.5 border border-slate-100"
                >
                  <div className="space-y-3">
                    {/* Event Photo with Rounded Frame & Category Chip */}
                    <div className="relative rounded-2xl h-32 sm:h-36 w-full overflow-hidden bg-slate-100 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      {/* Category Tag */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        {evt.category}
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <Badge status="PUBLISHED" showDot pulse />
                      </div>

                      {/* Icon badge */}
                      <div className="absolute -bottom-1.5 right-2.5 w-8 h-8 rounded-full bg-[#0B3B24] text-[#4ADE80] border-2 border-white flex items-center justify-center shadow-xs">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#1C2B24] group-hover:text-[#1F4D36] transition leading-snug line-clamp-2">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[#5F6F66] line-clamp-2 mt-1 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    {/* Progress Bar with Percentage */}
                    <div className="pt-1">
                      <ProgressBar
                        value={progress}
                        showLabel
                        size="sm"
                        variant="gradient"
                      />
                    </div>

                    {/* Key Metrics Checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-xs text-[#1C2B24]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#185535] shrink-0" />
                        <span className="font-bold truncate">
                          Cần:{" "}
                          {primaryNeed
                            ? `${primaryNeed.targetQuantity} ${primaryNeed.unit} ${primaryNeed.itemType}`
                            : "Hiện vật thiết yếu"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5F6F66]">
                        <Users className="w-3.5 h-3.5 text-[#185535] shrink-0" />
                        <span className="truncate">
                          Tuyển: {neededVolunteers} tình nguyện viên
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5F6F66]">
                        <MapPin className="w-3.5 h-3.5 text-[#185535] shrink-0" />
                        <span className="truncate">
                          Khu vực: {evt.area || "Đà Nẵng"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-xs text-[#1F4D36] group-hover:text-[#F28C1B] transition-colors">
                      Xem chi tiết tiếp nhận
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-[#1F4D36] group-hover:text-white transition-all shadow-2xs">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
