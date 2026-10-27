"use client";

import React from "react";
import { Hero } from "@/components/sections/Hero";
import { FeatureStrip } from "@/components/sections/FeatureStrip";
import { AboutMission } from "@/components/sections/AboutMission";
import { StatsBar } from "@/components/sections/StatsBar";
import { FeaturedEvents } from "@/components/sections/FeaturedEvents";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { HomeTrackingSection } from "@/components/sections/HomeTrackingSection";
import { CtaBanner } from "@/components/sections/CtaBanner";

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 pb-16 overflow-x-clip">
      {/* Tầng 1: Hero Banner với ảnh các dự án tự chuyển 5s + Thanh tìm kiếm nổi */}
      <Hero />

      {/* Tầng 2: Dải băng 4 Cam kết Minh bạch (Nền xanh rừng thẫm) */}
      <FeatureStrip />

      {/* Tầng 3: Giới thiệu Sứ mệnh OpenAid + Ảnh thực địa + Khối đánh giá */}
      <AboutMission />

      {/* Tầng 4: Thống kê chỉ số minh bạch 4 cột tròn đóng khung */}
      <StatsBar />

      {/* Tầng 5: Chiến dịch cứu trợ trọng điểm (Nền xanh đậm với các thẻ trắng checklist) */}
      <FeaturedEvents />

      {/* Tầng 6: Quy trình minh bạch khép kín (Khối đóng khung hiện đại) */}
      <HowItWorks />

      {/* Tầng 7: Trải nghiệm tra cứu vận đơn trực tuyến với Mockup hành trình */}
      <HomeTrackingSection />

      {/* Tầng 8: Banner cam kết & kêu gọi hành động chân trang */}
      <CtaBanner />
    </div>
  );
}
