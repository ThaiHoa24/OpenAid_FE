"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Heart, Sparkles } from "lucide-react";
import { eventService, type EnrichedEvent } from "@/services/eventService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80";

interface FeaturedEventsProps {
  campaigns?: EnrichedEvent[];
  isLoading?: boolean;
}

export function FeaturedEvents({
  campaigns: propCampaigns,
  isLoading: propIsLoading,
}: FeaturedEventsProps) {
  const [internalEvents, setInternalEvents] = useState<EnrichedEvent[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  // Nếu cha truyền props thì dùng props, ngược lại tự fetch fallback
  const isControlled = propCampaigns !== undefined;
  const isLoading = isControlled ? !!propIsLoading : internalLoading;
  const events = isControlled ? (propCampaigns || []) : internalEvents;

  useEffect(() => {
    if (isControlled) return;

    let isMounted = true;
    async function fetchEvents() {
      try {
        const res = await eventService.getAll({ status: "PUBLISHED" });
        if (isMounted) {
          setInternalEvents(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách chiến dịch trang chủ:", err);
        if (isMounted) {
          setInternalEvents([]);
        }
      } finally {
        if (isMounted) {
          setInternalLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [isControlled]);

  return (
    <section className="pt-12 sm:pt-16 lg:pt-20 pb-0 bg-[#F8FBF8]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề & Nút Xem tất cả */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D36]/10 text-[#1F4D36] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
              <span>Cộng đồng chung tay</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C2B24] tracking-tight">
              Chiến dịch đang diễn ra
            </h2>
            <p className="text-sm sm:text-base text-[#5F6F66] max-w-xl">
              Các hoạt động thiện nguyện đang mở tiếp nhận đóng góp hiện vật và tình nguyện viên.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F4D36] hover:text-[#F28C1B] transition-colors self-start sm:self-auto group py-1"
          >
            <span>Xem tất cả chiến dịch</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Danh sách chiến dịch */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-[#E5E7E0] p-4 space-y-4 animate-pulse"
              >
                <div className="h-48 rounded-2xl bg-slate-100" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-4/5" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-10 bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#E5E7E0] shadow-subtle space-y-3.5 max-w-xl mx-auto">
            <div className="w-13 h-13 rounded-2xl bg-[#EDF8EF] text-[#1F4D36] flex items-center justify-center mx-auto shadow-2xs">
              <Heart className="w-6 h-6 text-[#1F4D36]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1C2B24]">
              Hiện chưa có chiến dịch nào đang mở tiếp nhận
            </h3>
            <p className="text-xs sm:text-sm text-[#5F6F66] max-w-md mx-auto leading-relaxed">
              Các chiến dịch mới sẽ được cập nhật liên tục. Mời bạn quay lại sau hoặc theo dõi thông tin từ ban tổ chức.
            </p>
            <div className="pt-2">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1F4D36] text-white text-xs font-bold hover:bg-[#163B29] transition-all shadow-sm hover:shadow-md"
              >
                <span>Khám phá kho chiến dịch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-6 lg:gap-8 ${
              events.length === 1
                ? "max-w-md mx-auto grid-cols-1"
                : events.length === 2
                ? "max-w-3xl mx-auto grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E7E0] shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Ảnh chiến dịch tỉ lệ nhất quán */}
                  <div className="h-52 w-full relative overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.imageUrl || FALLBACK_IMAGE}
                      alt={evt.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  {/* Nội dung chiến dịch */}
                  <div className="p-6 space-y-2.5">
                    {evt.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[#5F6F66]">
                        <MapPin className="w-3.5 h-3.5 text-[#1F4D36] shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}

                    <h3 className="text-base sm:text-lg font-bold text-[#1C2B24] line-clamp-2 leading-snug group-hover:text-[#1F4D36] transition-colors">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="text-xs sm:text-sm text-[#5F6F66] line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nút Xem chi tiết */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/events/${evt.id}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#EDF8EF] hover:bg-[#1F4D36] text-[#1F4D36] hover:text-white font-bold text-xs border border-[#1F4D36]/20 hover:border-[#1F4D36] transition-all group/btn"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Đường lượn sóng nhẹ chuyển tiếp sang Section 4 (#EDF8EF) */}
      <div className="w-full overflow-hidden leading-none -mb-px pt-12 sm:pt-16">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-11 lg:h-14 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,24 C360,48 720,0 1080,24 C1260,36 1380,18 1440,22 L1440,60 L0,60 Z"
            fill="#EDF8EF"
          />
        </svg>
      </div>
    </section>
  );
}
