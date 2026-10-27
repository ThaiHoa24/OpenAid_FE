import React from "react";
import Link from "next/link";
import { ArrowRight, HeartHandshake, UserPlus, Building2, ShieldCheck, Package, Truck, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Floor: Lan tỏa yêu thương & Minh bạch thực địa (Vừa vặn trong 1 khung hình thiết bị) */}
      <div className="bg-[#0B3B24] rounded-3xl py-6 px-6 sm:py-8 sm:px-10 text-white shadow-xl border border-emerald-950/60 relative overflow-hidden">
        {/* Subtle decorative glow in corner */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Rich Content & Value Pillars (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4ADE80]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lan Tỏa Yêu Thương & Đồng Hành Thực Địa</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-snug">
                Minh Bạch Từng Kiện Hàng. Vẹn Tròn Niềm Tin Sẻ Chia.
              </h2>
              <p className="text-xs sm:text-sm text-[#D1E7DD] leading-relaxed">
                Cùng OpenAid tiếp ứng đúng nơi, kiểm toán đúng người, bảo vệ niềm tin cộng đồng. Mỗi món hiện vật gửi đi đều được cấp mã Tracking ID duy nhất, gom vào Lô hàng (Batch) kiểm toán và trao tận tay bà con vùng thiên tai kèm hình ảnh đối soát thực địa.
              </p>
            </div>

            {/* 3 Value Pillars Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-[#14472E]/90 rounded-xl p-3 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <Package className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs text-white">Hiện vật thiết yếu</span>
                </div>
                <p className="text-[11px] text-[#D1E7DD] leading-tight">
                  Tiếp nhận lương thực, nước sạch, thuốc men theo định mức.
                </p>
              </div>

              <div className="bg-[#14472E]/90 rounded-xl p-3 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs text-white">Truy vết chuyến xe</span>
                </div>
                <p className="text-[11px] text-[#D1E7DD] leading-tight">
                  Theo dõi lộ trình xe tải và thời điểm bàn giao tại thôn bản.
                </p>
              </div>

              <div className="bg-[#14472E]/90 rounded-xl p-3 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-2 text-[#4ADE80]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs text-white">Kiểm toán độc lập</span>
                </div>
                <p className="text-[11px] text-[#D1E7DD] leading-tight">
                  Không giữ tiền mặt, công khai minh bạch không cần đăng nhập.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4ADE80] hover:bg-[#3ec770] text-[#0B3B24] font-bold text-xs shadow-md transition-all group"
              >
                <UserPlus className="w-4 h-4" />
                <span>Trở thành Tình nguyện viên</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
              >
                <Building2 className="w-3.5 h-3.5" />
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
            <div className="relative rounded-2xl overflow-hidden h-60 sm:h-72 shadow-lg border border-emerald-500/30 group">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80"
                alt="Highland relief expedition"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B24]/90 via-transparent to-black/30" />

              {/* Floating Top Badge */}
              <div className="absolute top-3 left-3 bg-[#0B3B24]/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 text-white flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="text-xs font-bold">45+ Chuyến xe thực địa</span>
              </div>

              {/* Floating Bottom Card */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#0B3B24]/95 backdrop-blur-xs p-3 rounded-xl border border-emerald-500/30 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#185535] text-[#4ADE80] flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">100% Ảnh Đối Soát Thực Địa</p>
                    <p className="text-[10px] text-[#D1E7DD]">Công khai trên dòng thời gian</p>
                  </div>
                </div>
                <Link
                  href="/track"
                  className="px-2.5 py-1 rounded-lg bg-[#4ADE80] text-[#0B3B24] font-bold text-[11px] hover:bg-[#3ec770] transition whitespace-nowrap"
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
