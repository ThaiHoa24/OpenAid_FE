"use client";

import React, { useEffect, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { HomeFeatures } from "@/components/sections/HomeFeatures";
import { FeaturedEvents } from "@/components/sections/FeaturedEvents";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { eventService, type EnrichedEvent } from "@/services/eventService";

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<EnrichedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tải danh sách chiến dịch 1 lần duy nhất cho toàn bộ trang chủ
  useEffect(() => {
    let isMounted = true;

    async function fetchHomeCampaigns() {
      try {
        const res = await eventService.getAll({ status: "PUBLISHED" });
        if (!isMounted) return;

        if (Array.isArray(res)) {
          // Lọc các chiến dịch hợp lệ
          // Ưu tiên chiến dịch đang hoạt động (chưa hết hạn endDate nếu có)
          const now = Date.now();
          const activeCampaigns = res.filter((e) => {
            if (!e.id || !e.title) return false;
            if (e.status !== "PUBLISHED") return false;
            if (e.endDate) {
              const end = new Date(e.endDate).getTime();
              // Nếu có ngày kết thúc và đã qua hơn 1 ngày thì không ưu tiên
              if (!isNaN(end) && end < now - 24 * 60 * 60 * 1000) {
                return false;
              }
            }
            return true;
          });

          // Nếu có chiến dịch đang diễn ra thì dùng, ngược lại dùng tất cả chiến dịch PUBLISHED hợp lệ
          const finalCampaigns =
            activeCampaigns.length > 0
              ? activeCampaigns
              : res.filter((e) => e.id && e.title);

          setCampaigns(finalCampaigns);
        } else {
          setCampaigns([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải chiến dịch trang chủ:", err);
        if (isMounted) {
          setCampaigns([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchHomeCampaigns();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-x-clip relative">
      {/* Hiệu ứng Lenis Smooth Scrolling mượt mà */}
      <SmoothScroll />

      {/* Section 1: Hero Banner toàn màn hình với dynamic slideshow từ API */}
      <Hero campaigns={campaigns} isLoading={isLoading} />

      {/* Section 2: Bạn có thể làm gì với OpenAid? (Nền xanh mint #DAF1DE) */}
      <HomeFeatures />

      {/* Section 3: Chiến dịch đang diễn ra (Nền #F8FBF8) */}
      <FeaturedEvents campaigns={campaigns} isLoading={isLoading} />

      {/* Section 4: OpenAid hoạt động như thế nào? (Nền xanh mint nhạt #EDF8EF) */}
      <HowItWorks />
    </div>
  );
}
