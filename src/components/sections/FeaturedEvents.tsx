"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";

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
      {/* Compact Deep Forest Green Floor (Vừa vặn trong 1 khung hình thiết bị, hiển thị đầy đủ nội dung) */}
      <div className="bg-[#0B3B24] rounded-3xl py-5 px-5 sm:py-6 sm:px-7 shadow-xl border border-emerald-950/60 space-y-4 sm:space-y-5">
        {/* Section Header: Compact & Clear */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4ADE80]">
              <span className="w-5 h-[2px] bg-[#4ADE80] inline-block" />
              <span>Chiến Dịch Tiếp Ứng Khẩn Cấp</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              Các Hoạt Động Cứu Trợ Đang Phát Động
            </h2>
            <p className="text-xs text-[#D1E7DD] max-w-xl leading-normal">
              Tiếp nhận hiện vật thiết yếu và điều phối tình nguyện viên trực tiếp đến các xã, huyện vùng lũ lụt, sạt lở.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4ADE80] hover:bg-[#3ec770] text-[#0B3B24] font-bold text-xs shadow-sm transition-all self-start sm:self-auto shrink-0 group"
          >
            <span>Xem tất cả chiến dịch</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Cards Grid - Hiển thị đầy đủ nội dung */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/10 rounded-2xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/10 p-8 text-center rounded-2xl text-[#D1E7DD] text-xs">
            Hiện chưa có chiến dịch nào đang mở tiếp nhận.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {events.map((evt) => {
              const primaryNeed = evt.donationNeeds[0];
              const neededVolunteers = Math.max(
                0,
                evt.totalRequiredVolunteers - evt.totalApprovedVolunteers
              );

              return (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className="group bg-white rounded-2xl p-3 sm:p-3.5 text-[#1C2B24] shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer hover:-translate-y-0.5 border border-slate-100"
                >
                  <div className="space-y-2.5">
                    {/* Compact Image */}
                    <div className="relative rounded-xl h-28 sm:h-30 w-full overflow-hidden bg-slate-100">
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Category Tag */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        {evt.category}
                      </div>

                      {/* Icon badge */}
                      <div className="absolute -bottom-1.5 right-2 w-7 h-7 rounded-full bg-[#0B3B24] text-[#4ADE80] border-2 border-white flex items-center justify-center shadow-xs">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Title & Description: Hiển thị trọn vẹn */}
                    <div>
                      <h3 className="font-bold text-sm text-[#1C2B24] group-hover:text-[#0B3B24] transition leading-snug">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[#4A5850] line-clamp-2 mt-1 leading-normal">
                        {evt.description}
                      </p>
                    </div>

                    {/* Checklist: Hiển thị đầy đủ */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-xs text-[#1C2B24]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#185535] shrink-0" />
                        <span className="font-bold truncate">
                          Cần: {primaryNeed ? `${primaryNeed.targetQuantity} ${primaryNeed.unit} ${primaryNeed.itemType}` : "Hiện vật thiết yếu"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#4A5850]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#185535] shrink-0" />
                        <span className="truncate">
                          Tuyển: {neededVolunteers} tình nguyện viên
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#4A5850]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#185535] shrink-0" />
                        <span className="truncate">
                          Khu vực: {evt.area || "Đà Nẵng"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-xs text-[#0B3B24] group-hover:underline">
                      Xem chi tiết tiếp nhận
                    </span>
                    <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-[#0B3B24] group-hover:text-[#4ADE80] transition-colors">
                      <ArrowRight className="w-3 h-3" />
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
