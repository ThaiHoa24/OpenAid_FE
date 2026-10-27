"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ShieldCheck, ArrowRight, Layers, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/lib/constants";

export default function TrackLandingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/track/${encodeURIComponent(code.trim().toUpperCase())}`);
  };

  const sampleCodes = [
    { code: "DON-2026-7K3Q9X", label: "50 kg Gạo tẻ thơm (Đã bàn giao tại thôn bản)" },
    { code: "DON-2026-5W9K2N", label: "500 Chai nước khoáng (Đang trên chuyến xe)" },
    { code: "DON-2026-3H6V8B", label: "60 kg Gạo cứu trợ (Đã nhập kho an toàn)" },
    { code: "DON-2026-2F7J9K", label: "50 kg Gạo đóng góp (Mới cam kết)" },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header & Big Search Input */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6EFE3] text-[#1F4D36] text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Cổng tra cứu kiểm toán công khai</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1C2B24] tracking-tight leading-tight">
          Hành Trình Hiện Vật Cứu Trợ
        </h1>

        <p className="text-sm sm:text-base text-[#5F6F66] leading-relaxed">
          OpenAid truy vết các phần hiện vật đóng góp với độ chính xác đến từng Lô hàng (Batch). Nhập mã Tracking ID để kiểm tra trạng thái nhập kho, lịch trình xe vận chuyển và ảnh bằng chứng trao quà tại địa phương.
        </p>

        {/* Big Search Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-3 sm:p-4 rounded-3xl shadow-[0_20px_50px_rgba(31,77,54,0.12)] border border-[#E5E7E0] flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl text-slate-800">
            <Package className="w-5 h-5 text-[#1F4D36] shrink-0" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Nhập mã vận đơn (VD: DON-2026-948201)"
              className="w-full bg-transparent text-sm sm:text-base font-mono font-bold text-[#1C2B24] placeholder:text-slate-400 focus:outline-none uppercase"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Tra cứu ngay
          </Button>
        </form>

        {/* Sample Codes */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-[#5F6F66] font-semibold">Mã thử nghiệm:</span>
          {sampleCodes.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => router.push(`/track/${s.code}`)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-[#E6EFE3] border border-[#E5E7E0] font-mono text-[11px] font-bold text-[#1F4D36] transition cursor-pointer"
              title={s.label}
            >
              {s.code}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Steps of Traceability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7E0] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1C2B24]">1. Tiếp nhận & Nhập kho</h3>
          <p className="text-xs text-[#5F6F66] leading-relaxed">
            Ngay khi cam kết gửi, hiện vật được cân đối và kiểm đếm tại kho trung tâm theo nguyên tắc bảo toàn vật tư.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5E7E0] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1C2B24]">2. Đóng gói Lô hàng (Batch)</h3>
          <p className="text-xs text-[#5F6F66] leading-relaxed">
            Nhiều đóng góp nhỏ được gom thành các lô hàng đồng nhất, gán mã định danh phân phối và niêm phong đưa lên xe vận tải.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5E7E0] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6EFE3] text-[#1F4D36] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#1C2B24]">3. Bằng chứng bàn giao</h3>
          <p className="text-xs text-[#5F6F66] leading-relaxed">
            Biên bản trao quà và ảnh chụp thực địa (đã bảo vệ quyền riêng tư) được ghi nhận trực tiếp lên dòng thời gian công khai.
          </p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center text-xs text-amber-900 font-medium">
        {APP_CONFIG.traceabilityNote} {APP_CONFIG.disclaimer}
      </div>
    </div>
  );
}
