"use client";

import React from "react";
import { Search, HeartHandshake, CheckCircle2, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Tìm chiến dịch",
    description: "Khám phá những hoạt động thiện nguyện phù hợp.",
  },
  {
    step: "02",
    icon: HeartHandshake,
    title: "Tham gia hỗ trợ",
    description: "Đóng góp hiện vật hoặc đăng ký tình nguyện.",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Theo dõi kết quả",
    description: "Theo dõi tiến độ và thông tin bàn giao khi có dữ liệu.",
  },
];

export function HowItWorks() {
  return (
    <section className="pt-12 sm:pt-16 lg:pt-20 pb-0 bg-[#EDF8EF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D36]/10 text-[#1F4D36] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
            <span>Quy trình minh bạch</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C2B24] tracking-tight">
            OpenAid hoạt động như thế nào?
          </h2>
          <p className="text-sm sm:text-base text-[#5F6F66] max-w-xl mx-auto leading-relaxed">
            Quy trình 3 bước rõ ràng giúp việc đóng góp và hỗ trợ trở nên dễ dàng, minh bạch.
          </p>
        </div>

        {/* 3 Khối bước quy trình */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl sm:rounded-3xl p-7 sm:p-8 border border-[#1F4D36]/10 shadow-sm hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center space-y-4 group relative"
              >
                {/* Badge số bước */}
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#DAF1DE] text-[#1F4D36] text-xs font-extrabold font-mono tracking-wider">
                  BƯỚC {item.step}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#EDF8EF] text-[#1F4D36] group-hover:bg-[#1F4D36] group-hover:text-white transition-colors duration-300 flex items-center justify-center shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Tiêu đề & Mô tả */}
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1C2B24] group-hover:text-[#1F4D36] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5F6F66] leading-relaxed max-w-xs">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Đường lượn sóng nhẹ chuyển tiếp sang Footer (#163D2A) */}
      <div className="w-full overflow-hidden leading-none -mb-px pt-12 sm:pt-16">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-11 lg:h-14 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C320,44 640,-4 960,20 C1160,32 1340,16 1440,24 L1440,60 L0,60 Z"
            fill="#163D2A"
          />
        </svg>
      </div>
    </section>
  );
}
