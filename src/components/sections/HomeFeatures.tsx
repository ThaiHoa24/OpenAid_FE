"use client";

import React from "react";
import Link from "next/link";
import { Package, Users, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Package,
    title: "Đóng góp hiện vật",
    description: "Tìm kiếm và hỗ trợ các chiến dịch đang cần giúp đỡ.",
    href: "/events",
    actionText: "Khám phá chiến dịch",
  },
  {
    icon: Users,
    title: "Tham gia tình nguyện",
    description: "Đăng ký đồng hành cùng các hoạt động thiện nguyện.",
    href: "/events",
    actionText: "Xem hoạt động",
  },
  {
    icon: ShieldCheck,
    title: "Theo dõi minh bạch",
    description: "Tra cứu tiến độ tiếp nhận và trao tặng các đóng góp.",
    href: "/track",
    actionText: "Tra cứu ngay",
  },
];

export function HomeFeatures() {
  return (
    <section className="pt-12 sm:pt-16 lg:pt-20 pb-0 bg-[#DAF1DE]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D36]/10 text-[#1F4D36] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
            <span>Đồng hành & Kết nối</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C2B24] tracking-tight">
            Bạn có thể làm gì với OpenAid?
          </h2>
          <p className="text-sm sm:text-base text-[#1C2B24]/80 max-w-xl mx-auto leading-relaxed">
            Giải pháp kết nối đơn giản, trực tiếp và minh bạch giúp sự sẻ chia của bạn đến đúng nơi cần nhất.
          </p>
        </div>

        {/* 3 Thẻ nằm ngang trên desktop, responsive trên mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl sm:rounded-3xl p-7 sm:p-8 border border-[#1F4D36]/10 shadow-sm hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-13 h-13 rounded-2xl bg-[#EDF8EF] text-[#1F4D36] flex items-center justify-center mb-6 group-hover:bg-[#1F4D36] group-hover:text-white transition-colors duration-300 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1C2B24] mb-2.5 group-hover:text-[#1F4D36] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5F6F66] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D36] group-hover:text-[#F28C1B] transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Đường lượn sóng nhẹ chuyển tiếp sang Section 3 (#F8FBF8) */}
      <div className="w-full overflow-hidden leading-none -mb-px pt-12 sm:pt-16">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-11 lg:h-14 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,24 C320,48 640,0 960,24 C1160,36 1340,16 1440,24 L1440,60 L0,60 Z"
            fill="#F8FBF8"
          />
        </svg>
      </div>
    </section>
  );
}
