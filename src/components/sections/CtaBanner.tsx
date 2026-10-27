import React from "react";
import Link from "next/link";
import { ArrowRight, HeartHandshake, UserPlus, Building2, ShieldCheck, Package, Truck, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Floor with Luxury Deep Forest Gradient */}
      <div className="relative bg-gradient-to-br from-[#0B3B24] via-[#093520] to-[#051F13] rounded-3xl py-7 px-6 sm:py-10 sm:px-10 text-white shadow-card border border-emerald-900/60 overflow-hidden">
        {/* Subtle decorative glow in corners */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[#F28C1B]/15 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* Left Column: Rich Content & Value Pillars (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider text-[#4ADE80]">
                <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
                <span>Lan Tỏa Yêu Thương & Đồng Hành Thực Địa</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Minh Bạch Từng Kiện Hàng. <br className="hidden sm:inline" />
                Vẹn Tròn Niềm Tin Sẻ Chia.
              </h2>
              <p className="text-xs sm:text-sm text-[#D1E7DD] leading-relaxed max-w-xl">
                Cùng OpenAid tiếp ứng đúng nơi, kiểm toán đúng người, bảo vệ niềm tin cộng đồng. Mỗi món hiện vật gửi đi đều được cấp mã Tracking ID duy nhất, gom vào Lô hàng (Batch) kiểm toán và trao tận tay bà con vùng thiên tai kèm hình ảnh đối soát thực địa.
              </p>
            </div>

            {/* 3 Value Pillars Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-[#14472E]/90 hover:bg-[#185535] rounded-2xl p-3.5 border border-emerald-500/25 space-y-1 transition-all duration-200 shadow-2xs hover:-translate-y-0.5">
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <Package className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs text-white">Hiện vật thiết yếu</span>
                </div>
                <p className="text-[11px] text-[#D1E7DD]/90 leading-tight">
                  Tiếp nhận lương thực, nước sạch, thuốc men theo định mức.
                </p>
              </div>

              <div className="bg-[#14472E]/90 hover:bg-[#185535] rounded-2xl p-3.5 border border-emerald-500/25 space-y-1 transition-all duration-200 shadow-2xs hover:-translate-y-0.5">
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs text-white">Truy vết chuyến xe</span>
                </div>
                <p className="text-[11px] text-[#D1E7DD]/90 leading-tight">
                  Theo dõi lộ trình xe tải và thời điểm bàn giao tại thôn bản.
                </p>
              </div>

              <div className="bg-[#14472E]/90 hover:bg-[#185535] rounded-2xl p-3.5 border border-emerald-500/25 space-y-1 transition-all duration-200 shadow-2xs hover:-translate-y-0.5">
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs text-white">Kiểm toán độc lập</span>
                </div>
                <p className="text-[11px] text-[#D1E7DD]/90 leading-tight">
                  Không giữ tiền mặt, công khai minh bạch không cần tài khoản.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:from-[#3ec770] hover:to-[#16a34a] text-[#0B3B24] font-bold text-xs shadow-md hover:shadow-lg transition-all group hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Trở thành Tình nguyện viên</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/25 backdrop-blur-md transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0"
              >
                <Building2 className="w-4 h-4" />
                <span>Đăng ký Tổ chức cứu trợ</span>
              </Link>

              <Link
                href="/events"
                className="text-xs font-bold text-[#4ADE80] hover:underline px-2 py-1"
              >
                Khám phá chiến dịch →
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Photo Card with Overlays (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden h-64 sm:h-80 shadow-2xl border border-emerald-500/30 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80"
                alt="Highland relief expedition"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B24]/95 via-transparent to-black/30" />

              {/* Floating Top Badge */}
              <div className="absolute top-3.5 left-3.5 bg-[#0B3B24]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-white flex items-center gap-2 shadow-xs">
                <Truck className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="text-xs font-bold">45+ Chuyến xe thực địa</span>
              </div>

              {/* Floating Bottom Card */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 text-[#1C2B24] flex items-center justify-between shadow-float">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0B3B24] text-[#4ADE80] flex items-center justify-center shrink-0 shadow-2xs">
                    <HeartHandshake className="w-4.5 h-4.5 text-[#F28C1B]" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#1C2B24]">100% Ảnh Đối Soát Thực Địa</p>
                    <p className="text-[10px] text-[#5F6F66]">Công khai trên dòng thời gian</p>
                  </div>
                </div>
                <Link
                  href="/track"
                  className="px-3.5 py-1.5 rounded-full bg-[#1F4D36] text-white font-bold text-[11px] hover:bg-[#143D29] transition whitespace-nowrap shadow-xs hover:scale-105 active:scale-100"
                >
                  Tra cứu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
