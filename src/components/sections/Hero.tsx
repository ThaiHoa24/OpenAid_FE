"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  MapPin,
  Calendar,
  Layers,
  Leaf,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Package,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AREAS, TIME_FILTERS, SUPPORT_TYPES } from "@/lib/constants";
import { eventService } from "@/services/eventService";

interface ProjectSlide {
  id: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  eyebrow: string;
  location: string;
  imageUrl: string;
  eventId: string;
  progressPercent?: number;
}

const CATEGORY_MAP: Record<string, string> = {
  "Disaster Relief": "Cứu trợ thiên tai",
  "Food & Water": "Lương thực & Nước sạch",
  "Community Support": "Hỗ trợ cộng đồng",
  "Medical Aid": "Vật tư y tế",
  "Education": "Giáo dục & Học đường",
  "Emergency Shelter": "Chỗ ở khẩn cấp",
  "Volunteer": "Tình nguyện viên",
  "Rice & Food": "Gạo & Lương thực",
  "Water": "Nước sạch",
  "Clothes": "Quần áo ấm",
  "Medical Supplies": "Vật tư y tế",
  "Study Supplies": "Dụng cụ học tập",
};

function formatEventToSlide(evt: {
  id: string;
  title: string;
  description: string;
  location: string;
  area: string;
  imageUrl: string;
  category: string;
}): ProjectSlide {
  let titleLine1 = evt.title;
  let titleLine2 = "";

  if (evt.title.includes("–")) {
    const parts = evt.title.split("–");
    titleLine1 = parts[0].trim();
    titleLine2 = parts.slice(1).join("–").trim();
  } else if (evt.title.includes(":")) {
    const parts = evt.title.split(":");
    titleLine1 = parts[0].trim();
    titleLine2 = parts.slice(1).join(":").trim();
  } else {
    const words = evt.title.split(" ");
    if (words.length > 3) {
      const mid = Math.ceil(words.length / 2);
      titleLine1 = words.slice(0, mid).join(" ");
      titleLine2 = words.slice(mid).join(" ");
    }
  }

  const categoryVi = CATEGORY_MAP[evt.category] || evt.category;

  return {
    id: evt.id,
    eyebrow: `CHIẾN DỊCH • ${categoryVi.toUpperCase()}`,
    titleLine1,
    titleLine2: titleLine2 || evt.area || "Việt Nam",
    tagline: evt.description,
    location: evt.location || evt.area,
    imageUrl: evt.imageUrl.replace("w=800", "w=1920"),
    eventId: evt.id,
    progressPercent: 78,
  };
}

const DEFAULT_SLIDES: ProjectSlide[] = [
  {
    id: "evt-1",
    eyebrow: "CHIẾN DỊCH • CỨU TRỢ THIÊN TAI",
    titleLine1: "Cứu trợ khẩn cấp lũ lụt",
    titleLine2: "Huyện Hòa Vang",
    tagline:
      "Mưa lớn kéo dài gây ngập lụt nghiêm trọng tại các xã Hòa Bắc và Hòa Phú, huyện Hòa Vang. Chúng tôi tiếp nhận lương thực khẩn cấp, nước sạch và huy động 30 tình nguyện viên thực địa hỗ trợ 350 hộ dân bị cô lập.",
    location: "Xã Hòa Bắc & Hòa Phú, Huyện Hòa Vang, Đà Nẵng",
    imageUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1920&auto=format&fit=crop&q=85",
    eventId: "evt-1",
    progressPercent: 85,
  },
  {
    id: "evt-2",
    eyebrow: "CHIẾN DỊCH • LƯƠNG THỰC & NƯỚC SẠCH",
    titleLine1: "Nước sạch & Lương thực",
    titleLine2: "Vùng cao Quảng Nam",
    tagline:
      "Tiếp tế cho các bản làng bị cô lập tại huyện Tây Giang và Đông Giang sau đợt sạt lở núi. Nhu cầu cấp thiết: Gạo, đồ hộp, nước uống tinh khiết và tình nguyện viên bốc xếp, điều phối vận tải vượt lũ.",
    location: "Trung tâm văn hóa huyện Tây Giang, Quảng Nam",
    imageUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&auto=format&fit=crop&q=85",
    eventId: "evt-2",
    progressPercent: 62,
  },
  {
    id: "evt-3",
    eyebrow: "CHIẾN DỊCH • HỖ TRỢ CỘNG ĐỒNG",
    titleLine1: "Áo ấm mùa đông",
    titleLine2: "Trẻ em vùng cao A Lưới",
    tagline:
      "Trao tặng 400 chăn ấm, áo khoác mùa đông và phần quà dinh dưỡng cho học sinh tiểu học vùng cao huyện A Lưới trước đợt gió mùa đông bắc rét đậm tràn về.",
    location: "Nhà văn hóa thị trấn A Lưới, Thừa Thiên Huế",
    imageUrl:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1920&auto=format&fit=crop&q=85",
    eventId: "evt-3",
    progressPercent: 92,
  },
  {
    id: "evt-4",
    eyebrow: "CHIẾN DỊCH • VẬT TƯ Y TẾ",
    titleLine1: "Túi y tế & Đồ vệ sinh phòng dịch",
    titleLine2: "Vùng ngập Cẩm Lệ",
    tagline:
      "Phòng ngừa dịch bệnh và ô nhiễm nguồn nước sau lũ rút: Đóng gói và trao tận tay 500 túi sơ cứu gia đình, viên khử khuẩn nước Aquatabs và đồ dùng vệ sinh thiết yếu cho bà con.",
    location: "Phường Cẩm Lệ & Hòa Xuân, Đà Nẵng",
    imageUrl:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1920&auto=format&fit=crop&q=85",
    eventId: "evt-4",
    progressPercent: 74,
  },
];

export function Hero() {
  const router = useRouter();
  const [slides, setSlides] = useState<ProjectSlide[]>(DEFAULT_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Form search states
  const [area, setArea] = useState("Tất cả khu vực");
  const [time, setTime] = useState("all");
  const [supportType, setSupportType] = useState("all");
  const [keyword, setKeyword] = useState("");

  // Load published events
  useEffect(() => {
    eventService.getAll({ status: "PUBLISHED" }).then((events) => {
      if (events && events.length > 0) {
        const mappedSlides = events.slice(0, 5).map(formatEventToSlide);
        setSlides(mappedSlides);
      }
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto switch slides every 5.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  const currentSlide = slides[currentSlideIndex] || slides[0] || DEFAULT_SLIDES[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (area !== "Tất cả khu vực") params.set("area", area);
    if (time !== "all") params.set("time", time);
    if (supportType !== "all") params.set("type", supportType);
    if (keyword.trim()) params.set("q", keyword.trim());
    router.push(`/events?${params.toString()}`);
  };

  const copySampleTracking = () => {
    navigator.clipboard.writeText("DON-2026-7K3Q9X");
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-4.75rem)] lg:min-h-[calc(100vh-5rem)] max-h-[880px] flex flex-col justify-between overflow-hidden">
      {/* Background Image Carousel with Ken Burns Slow Zoom */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlideIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={slide.titleLine1}
              className={`w-full h-full object-cover object-center ${
                idx === currentSlideIndex ? "animate-kenburns" : "scale-100"
              }`}
            />
          </div>
        ))}

        {/* Dual-layer contrast overlay: rich cream-white gradient on left text + subtle dark vignette at bottom */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[62%] bg-gradient-to-r from-[#FAF9F6]/95 via-[#FAF9F6]/85 sm:via-[#FAF9F6]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Decorative Organic Leaf Ornament */}
      <div
        className="absolute top-4 left-4 sm:top-8 sm:left-10 z-10 pointer-events-none opacity-75 animate-float"
        aria-hidden="true"
      >
        <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
          <path
            d="M10 80 C 10 30, 40 10, 80 10 C 60 40, 60 70, 10 80 Z"
            fill="#5A8D67"
            fillOpacity="0.3"
          />
          <path
            d="M10 80 Q 45 45 80 10"
            stroke="#1F4D36"
            strokeWidth="2.5"
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      {/* Top Half: Content Hero + Floating Glass Status Card */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Text Narrative (8 Cols) */}
          <div className="lg:col-span-8 max-w-3xl space-y-3 sm:space-y-4">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#E5E7E0] shadow-subtle text-[11px] font-bold uppercase tracking-[0.16em] text-[#1F4D36]">
              <Leaf className="w-3.5 h-3.5 text-[#F28C1B]" />
              <span>{currentSlide.eyebrow}</span>
            </div>

            {/* Impactful Title with Accent Highlight */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-[#1C2B24] leading-[1.14]">
                {currentSlide.titleLine1}
                {currentSlide.titleLine2 && (
                  <>
                    <br />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#1F4D36] via-[#143D29] to-[#F28C1B]">
                      {currentSlide.titleLine2}
                      <svg
                        viewBox="0 0 200 24"
                        preserveAspectRatio="none"
                        className="absolute -bottom-2 left-0 w-full h-3 text-[#F28C1B] stroke-current fill-none stroke-[5] pointer-events-none"
                        aria-hidden="true"
                      >
                        <path d="M4 18 Q 100 4 196 18" strokeLinecap="round" />
                      </svg>
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Concise Tagline */}
            <div>
              <p className="text-xs sm:text-sm text-[#2E4237] leading-relaxed max-w-xl font-medium drop-shadow-xs line-clamp-2">
                {currentSlide.tagline}
              </p>
            </div>
          </div>

          {/* Right Floating Glass Card (4 Cols - Desktop only) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#E5E7E0] shadow-float space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D36]">
                  <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
                  <span>100% Minh Bạch Cấp Lô</span>
                </span>
                <span className="text-[10px] font-mono text-[#5F6F66] bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                  {currentSlide.location.split(",")[0]}
                </span>
              </div>

              {/* Progress Bar of Current Event */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1C2B24] flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-[#F28C1B]" />
                    <span>Tiến độ huy động</span>
                  </span>
                  <span className="text-[#1F4D36] font-mono">
                    {currentSlide.progressPercent || 78}%
                  </span>
                </div>
                <ProgressBar value={currentSlide.progressPercent || 78} size="sm" variant="gradient" />
              </div>

              {/* Sample Tracking Chip */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-[#5F6F66]">
                  <span>Mã vận đơn minh chứng:</span>
                  <button
                    type="button"
                    onClick={copySampleTracking}
                    className="inline-flex items-center gap-1 font-mono font-bold text-[#1F4D36] hover:text-[#F28C1B] transition cursor-pointer"
                    title="Sao chép mã tra cứu"
                  >
                    <span>DON-2026-7K3Q9X</span>
                    {copiedTracking ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Half: Action Buttons & Floating 4-Field Search Bar */}
      <div className="relative z-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6 sm:pb-8 space-y-3">
        {/* CTAs & Slide Switcher Tabs: Fixed stable position */}
        <div className="w-full max-w-[1180px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              href={`/events/${currentSlide.eventId}`}
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Khám phá chiến dịch
            </Button>
            <Button
              href={`/track`}
              variant="outline"
              size="md"
            >
              Tra cứu vận đơn
            </Button>
          </div>

          {/* Carousel Controls: Prev/Next Buttons + Dot Indicators */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1C2B24] border border-[#E5E7E0] flex items-center justify-center transition shadow-subtle hover:scale-105 cursor-pointer"
              aria-label="Chiến dịch trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-[#E5E7E0]">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlideIndex
                      ? "w-7 bg-[#F28C1B] shadow-xs"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Chuyển đến chiến dịch ${idx + 1}`}
                  title={s.location}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1C2B24] border border-[#E5E7E0] flex items-center justify-center transition shadow-subtle hover:scale-105 cursor-pointer"
              aria-label="Chiến dịch tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main 4-Field Search Box */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-[1180px] mx-auto bg-white/95 backdrop-blur-xl rounded-2xl p-2 sm:p-2.5 shadow-float border border-[#E5E7E0] flex flex-col lg:flex-row items-stretch lg:items-center gap-2 transition-all hover:shadow-[0_28px_60px_-12px_rgba(11,59,36,0.25)]"
        >
          {/* Field 1: Area */}
          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer focus-within:ring-2 focus-within:ring-[#1F4D36]/20">
            <div className="w-7 h-7 rounded-lg bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-[#5F6F66]">
                Khu vực
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#1C2B24] focus:outline-none cursor-pointer"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-6 bg-[#E5E7E0]" />

          {/* Field 2: Time */}
          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer focus-within:ring-2 focus-within:ring-[#1F4D36]/20">
            <div className="w-7 h-7 rounded-lg bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-[#5F6F66]">
                Thời gian
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#1C2B24] focus:outline-none cursor-pointer"
              >
                {TIME_FILTERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-6 bg-[#E5E7E0]" />

          {/* Field 3: Support Type */}
          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer focus-within:ring-2 focus-within:ring-[#1F4D36]/20">
            <div className="w-7 h-7 rounded-lg bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-[#5F6F66]">
                Hình thức hỗ trợ
              </label>
              <select
                value={supportType}
                onChange={(e) => setSupportType(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#1C2B24] focus:outline-none cursor-pointer"
              >
                {SUPPORT_TYPES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-6 bg-[#E5E7E0]" />

          {/* Field 4: Keyword */}
          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition focus-within:ring-2 focus-within:ring-[#1F4D36]/20">
            <div className="w-7 h-7 rounded-lg bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-[#5F6F66]">
                Từ khóa
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Bão lũ, gạo, áo ấm, thuốc men..."
                className="w-full bg-transparent text-xs font-bold text-[#1C2B24] placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
              >
              </input>
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            variant="secondary"
            size="md"
            icon={<Search className="w-4 h-4" />}
            className="w-full lg:w-auto px-6 py-2.5 text-xs font-bold shadow-card"
          >
            Tìm kiếm
          </Button>
        </form>
      </div>
    </section>
  );
}
