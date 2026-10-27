import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Star } from "lucide-react";

export function AboutMission() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Floor with Crisp Borders & Soft Elevation */}
      <div className="bg-white rounded-3xl py-6 px-5 sm:py-8 sm:px-8 border border-[#E5E7E0] shadow-card hover:shadow-hover transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Narrative, Mission, Social Proof */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
              <span className="w-5 h-[2px] bg-[#1F4D36] inline-block" />
              <span>Về Nền Tảng OpenAid</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1C2B24] tracking-tight leading-snug">
              Chúng Tôi Kết Nối Hiện Vật Đến Đúng Người, Đúng Nơi Cần Nhất.
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#4A5850] leading-relaxed">
            OpenAid là hệ thống điều phối số độc lập kết nối giữa Nhà hảo tâm, Tổ chức từ thiện được xác minh và Đội ngũ tình nguyện viên. Toàn bộ chuỗi vận hành từ tiếp nhận, gom vào Lô hàng (Batch) đến chuyến xe phân phối đều được kiểm toán và công khai minh bạch qua dòng thời gian thực địa.
          </p>

          <div className="text-xs font-bold text-[#1F4D36] bg-[#E6EFE3]/80 px-4 py-2.5 rounded-2xl border border-[#1F4D36]/15 flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#1F4D36] shrink-0" />
            <span>Hệ thống hoàn toàn phi tài chính — không giữ tiền, không trung gian quỹ.</span>
          </div>

          <div className="pt-1 flex items-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1F4D36] to-[#143D29] hover:from-[#17422E] hover:to-[#0E2C1D] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all group hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Tìm hiểu thêm về OpenAid</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Social Proof & Rating Stack */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Volunteer avatar"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Volunteer avatar"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Volunteer avatar"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                alt="Volunteer avatar"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs text-[#1C2B24]">5.0/5</span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
              </div>
              <p className="text-[11px] text-[#4A5850]">
                Đánh giá tin cậy từ 2,500+ Nhà hảo tâm & TNV
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Compact Photo Collage */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 relative">
          {/* Main Photo */}
          <div className="relative rounded-3xl overflow-hidden h-60 sm:h-72 shadow-card border border-slate-100 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80"
              alt="Volunteer delivering food package"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            />
            {/* Experience badge */}
            <div className="absolute bottom-3 left-3 right-3 bg-[#0B3B24]/95 backdrop-blur-md rounded-2xl p-2.5 text-white flex items-center gap-2.5 border border-emerald-500/30 shadow-subtle">
              <div className="w-8 h-8 rounded-xl bg-[#185535] text-[#4ADE80] flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold">100% Minh Bạch</p>
                <p className="text-[10px] text-[#D1E7DD]">Truy vết cấp Lô hàng</p>
              </div>
            </div>
          </div>

          {/* Right Stack of 2 smaller photos */}
          <div className="flex flex-col gap-3.5">
            <div className="rounded-3xl overflow-hidden h-28 sm:h-34 shadow-subtle border border-slate-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80"
                alt="Warehouse inventory pallets"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
            </div>
            <div className="rounded-3xl overflow-hidden h-28 sm:h-34 shadow-subtle border border-slate-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80"
                alt="Community distribution site"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
