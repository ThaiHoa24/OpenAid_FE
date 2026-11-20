"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  MapPin,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { EnrichedEvent } from "@/services/eventService";

interface HeroProps {
  campaigns?: EnrichedEvent[];
  isLoading?: boolean;
}

interface SlideItem {
  id: string;
  title: string;
  description: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  imageUrl?: string;
  isDefault?: boolean;
}

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&auto=format&fit=crop&q=85";

const DEFAULT_SLIDE: SlideItem = {
  id: "default",
  title: "Kết nối sự sẻ chia, lan tỏa yêu thương.",
  description:
    "OpenAid kết nối tổ chức thiện nguyện, nhà hảo tâm và tình nguyện viên, giúp mọi người cùng tham gia các chiến dịch hỗ trợ cộng đồng và theo dõi hành trình trao tặng minh bạch.",
  location: "Toàn quốc",
  category: "Cộng đồng",
  imageUrl: FALLBACK_BG,
  isDefault: true,
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function Hero({ campaigns = [], isLoading = false }: HeroProps) {
  // Chuẩn bị danh sách slide (tất cả chiến dịch PUBLISHED, hoặc slide mặc định)
  const slides: SlideItem[] = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return [DEFAULT_SLIDE];
    }

    return campaigns.map((evt) => ({
      id: evt.id,
      title: evt.title,
      description: evt.description || "Chung tay tiếp ứng hiện vật và nguồn lực cho chiến dịch thiện nguyện vì cộng đồng.",
      location: evt.location || evt.area || "",
      startDate: evt.startDate,
      endDate: evt.endDate,
      category: evt.category || "Cứu trợ",
      imageUrl: evt.imageUrl || FALLBACK_BG,
      isDefault: false,
    }));
  }, [campaigns]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Tự động chuyển slide mỗi 7 giây (nếu có nhiều hơn 1 slide và không bị pause)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Điều hướng trước / sau - reset pause khi user chủ động chuyển slide
  const goToPrev = useCallback(() => {
    setIsPaused(false);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setIsPaused(false);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setIsPaused(false);
    setCurrentIndex(index);
  }, []);

  const currentSlide = slides[currentIndex] || DEFAULT_SLIDE;
  const isDefault = currentSlide.isDefault;

  // Trạng thái đang tải dữ liệu ban đầu
  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden h-[100svh] min-h-[100svh] bg-[#0A2317] flex items-center pt-20 sm:pt-24">
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-6">
          <div className="w-48 h-6 bg-white/10 rounded-full" />
          <div className="w-3/4 max-w-xl h-12 bg-white/10 rounded-2xl" />
          <div className="w-full max-w-lg h-20 bg-white/10 rounded-2xl" />
          <div className="flex gap-4 pt-4">
            <div className="w-40 h-12 bg-white/10 rounded-full" />
            <div className="w-40 h-12 bg-white/10 rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden h-[100svh] min-h-[100svh] flex items-center pt-20 sm:pt-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Chiến dịch thiện nguyện nổi bật"
    >
      {/* 1. Background Slideshow (Full-width, fade-in/fade-out 700ms) */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
              }`}
              aria-hidden={!isActive}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl || FALLBACK_BG}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out motion-reduce:transform-none ${
                  isActive ? "scale-105" : "scale-100"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_BG;
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 2. Hiển thị ảnh trực tiếp, tự nhiên 100%, không dùng lớp phủ toàn màn hình làm tối hay mờ ảnh */}

      {/* 3. Nội dung chữ nằm trực tiếp trên ảnh, lệch về bên trái, căn giữa viewport */}
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 h-full flex flex-col justify-center relative z-20">
        <div className="max-w-md sm:max-w-lg lg:max-w-[480px] -translate-y-[20px] sm:-translate-y-[24px] lg:-translate-y-[28px] -translate-x-0 sm:-translate-x-3 md:-translate-x-6 lg:-translate-x-[80px] text-white mr-auto">
          {/* Khối nội dung chiến dịch */}
          <div className="space-y-3 sm:space-y-3.5">
            {/* Dòng nhỏ phía trên (Eyebrow) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/20 text-[#DAF1DE] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
              <span>
                {isDefault ? "OPENAID • KẾT NỐI MINH BẠCH" : "OPENAID • CHIẾN DỊCH THIỆN NGUYỆN"}
              </span>
            </div>

            {/* Tiêu đề chiến dịch (nằm trực tiếp trên ảnh, gọn gàng, đổ bóng sắc nét) */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold text-white tracking-tight leading-[1.2] transition-all duration-500 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {currentSlide.title}
            </h1>

            {/* Mô tả ngắn (gọn hơn, không chiếm không gian ở giữa) */}
            <p className="text-xs sm:text-sm lg:text-[15px] text-white/95 leading-relaxed line-clamp-3 font-normal max-w-md transition-all duration-500 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {currentSlide.description}
            </p>

            {/* Thông tin phụ: Địa điểm, Thời gian, Phân loại */}
            {!isDefault && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {currentSlide.location && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/95 bg-black/60 px-3 py-1 rounded-full border border-white/20 shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[220px]">{currentSlide.location}</span>
                  </div>
                )}
                {currentSlide.startDate && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/95 bg-black/60 px-3 py-1 rounded-full border border-white/20 shadow-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    <span>
                      {formatDate(currentSlide.startDate)}
                      {currentSlide.endDate ? ` – ${formatDate(currentSlide.endDate)}` : ""}
                    </span>
                  </div>
                )}
                {currentSlide.category && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/95 bg-black/60 px-3 py-1 rounded-full border border-white/20 shadow-xs">
                    <Tag className="w-3.5 h-3.5 text-[#F28C1B] shrink-0" />
                    <span>{currentSlide.category}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hai nút CTA nhỏ lại, kéo thấp xuống phía dưới tầm 50px */}
          <div className="flex flex-wrap items-center gap-3 pt-5 sm:pt-7 translate-y-[50px]">
            {isDefault ? (
              <>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-4.5 sm:px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-[#062416] font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 group hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Khám phá chiến dịch</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 px-4.5 sm:px-5 py-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/30 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 group hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#F28C1B]" />
                  <span>Theo dõi đóng góp</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/events/${currentSlide.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4.5 sm:px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-[#062416] font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 group hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Xem chiến dịch</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-4.5 sm:px-5 py-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/30 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 group hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Khám phá tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/70 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Điều hướng Slideshow (Chỉ hiển thị khi có > 1 slide) */}
      {slides.length > 1 && (
        <div className="absolute bottom-9 sm:bottom-12 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Thanh tiến trình / Dots indicator */}
            <div className="flex items-center gap-2 pointer-events-auto bg-[#081C13]/85 px-3 py-1.5 rounded-full border border-white/20 shadow-md">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentIndex
                      ? "w-8 bg-[#22C55E]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Chuyển đến chiến dịch ${i + 1}`}
                />
              ))}
              <span className="text-[11px] font-mono text-white/80 ml-2 font-semibold">
                0{currentIndex + 1} / 0{slides.length}
              </span>
            </div>

            {/* Nút mũi tên Trước / Tiếp theo */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={goToPrev}
                className="w-10 h-10 rounded-full bg-[#081C13]/85 hover:bg-black/90 text-white border border-white/25 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                aria-label="Chiến dịch trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="w-10 h-10 rounded-full bg-[#081C13]/85 hover:bg-black/90 text-white border border-white/25 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                aria-label="Chiến dịch tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Đường lượn sóng nhẹ chuyển tiếp sang Section 2 (#DAF1DE) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 w-full overflow-hidden leading-none pointer-events-none -mb-px">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-11 lg:h-14 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,24 C360,48 720,0 1080,24 C1260,36 1380,18 1440,22 L1440,60 L0,60 Z"
            fill="#DAF1DE"
          />
        </svg>
      </div>
    </section>
  );
}
