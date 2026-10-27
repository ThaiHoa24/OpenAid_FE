import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Star } from "lucide-react";

export function AboutMission() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Compact Boxed Floor (Vừa vặn trong 1 khung hình thiết bị) */}
      <div className="bg-white rounded-3xl py-5 px-5 sm:py-6 sm:px-8 border border-[#E5E7E0] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Narrative, Mission, Social Proof */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
              <span className="w-5 h-[2px] bg-[#1F4D36] inline-block" />
              <span>Về Nền Tảng OpenAid</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1C2B24] tracking-tight leading-snug">
              Chúng Tôi Kết Nối Hiện Vật Đến Đúng Người, Đúng Nơi Cần Nhất.
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#4A5850] leading-relaxed">
            OpenAid là hệ thống điều phối số độc lập kết nối giữa Nhà hảo tâm, Tổ chức từ thiện được xác minh và Đội ngũ tình nguyện viên. Toàn bộ chuỗi vận hành từ tiếp nhận, gom vào Lô hàng (Batch) đến chuyến xe phân phối đều được kiểm toán và công khai minh bạch qua dòng thời gian thực địa.
          </p>

          <div className="text-xs font-bold text-[#1F4D36] bg-[#E6EFE3]/70 px-3.5 py-2 rounded-xl border border-[#1F4D36]/15 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F4D36] shrink-0" />
            <span>Hệ thống hoàn toàn phi tài chính — không giữ tiền, không trung gian quỹ.</span>
          </div>

          <div className="pt-1 flex items-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1F4D36] hover:bg-[#153826] text-white text-xs font-bold shadow-sm transition-all group"
            >
              <span>Tìm hiểu thêm về OpenAid</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Social Proof & Rating Stack */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-4">
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
                <span className="font-bold text-xs text-[#1C2B24]">5.0/5</span>
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
        <div className="lg:col-span-6 grid grid-cols-2 gap-3 relative">
          {/* Main Photo */}
          <div className="relative rounded-2xl overflow-hidden h-56 sm:h-64 shadow-md border border-slate-100 group">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80"
              alt="Volunteer delivering food package"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Experience badge */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#0B3B24]/95 backdrop-blur-xs rounded-xl p-2 text-white flex items-center gap-2 border border-emerald-500/30">
              <div className="w-7 h-7 rounded-full bg-[#185535] text-[#4ADE80] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-bold">100% Minh Bạch</p>
                <p className="text-[10px] text-[#D1E7DD]">Truy vết cấp Lô hàng</p>
              </div>
            </div>
          </div>

          {/* Right Stack of 2 smaller photos */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl overflow-hidden h-26 sm:h-30 shadow-xs border border-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80"
                alt="Warehouse inventory pallets"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="rounded-2xl overflow-hidden h-26 sm:h-30 shadow-xs border border-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80"
                alt="Community distribution site"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
