"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";

export function HomeTrackingSection() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("DON-2026-7K3Q9X");
  const [activeTab, setActiveTab] = useState<"DON-2026-7K3Q9X" | "DON-2026-5W9K2N">("DON-2026-7K3Q9X");

  const sampleOrders = {
    "DON-2026-7K3Q9X": {
      item: "50 kg Gạo tẻ thơm",
      campaign: "Cứu trợ khẩn cấp lũ lụt Huyện Hòa Vang",
      status: "Đã bàn giao tại thôn bản",
      batch: "BATCH-2026-HV01",
      destination: "Xã Hòa Bắc, Đà Nẵng",
      completedSteps: 5,
    },
    "DON-2026-5W9K2N": {
      item: "500 Chai nước khoáng tinh khiết",
      campaign: "Nước sạch vùng cao Quảng Nam",
      status: "Đang trên chuyến xe phân phối",
      batch: "BATCH-2026-QN04",
      destination: "Huyện Tây Giang, Quảng Nam",
      completedSteps: 3,
    },
  };

  const currentOrder = sampleOrders[activeTab];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    router.push(`/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`);
  };

  const steps = [
    { title: "Cam kết", desc: "Xác nhận ủng hộ", time: "15/10/2026", icon: CheckCircle2 },
    { title: "Nhập kho", desc: "Cân đối & Kiểm đếm", time: "16/10/2026", icon: Package },
    { title: "Đóng lô", desc: `Gom vào ${currentOrder.batch}`, time: "18/10/2026", icon: Layers },
    { title: "Chuyến xe", desc: "Vận chuyển vượt lũ", time: "20/10/2026", icon: Truck },
    { title: "Bàn giao", desc: "Ảnh minh chứng đối soát", time: "22/10/2026", icon: ShieldCheck },
  ];

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Floor with Crisp Sand Theme & Layered Elevation */}
      <div className="bg-white rounded-3xl py-6 px-5 sm:py-8 sm:px-8 border border-[#E5E7E0] shadow-card hover:shadow-hover transition-all duration-300 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
              <span>Minh Bạch Tuyệt Đối • Không Giữ Tiền Mặt</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1C2B24] tracking-tight leading-snug">
              Trải Nghiệm Tra Cứu Vận Đơn Trực Tuyến
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5850] max-w-2xl leading-relaxed">
              Mỗi món hiện vật mang một mã Tracking ID độc nhất. Nhập mã để kiểm tra hành trình từ kho tập kết đến tận tay bà con tại từng thôn bản.
            </p>
          </div>

          <Link
            href="/track"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D36] hover:bg-[#143D29] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto shrink-0 group hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Trang tra cứu chuyên sâu</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Input Bar & Sample Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Input Search Box (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Nhập mã ví dụ: DON-2026-7K3Q9X"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E5E7E0] bg-[#FAF9F6] text-xs font-mono font-bold text-[#1C2B24] uppercase placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:border-[#1F4D36] focus:ring-2 focus:ring-[#1F4D36]/20 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#1F4D36] to-[#143D29] hover:from-[#17422E] hover:to-[#0E2C1D] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search className="w-4 h-4" />
                <span>Tra cứu hành trình vận đơn này</span>
              </button>
            </form>

            {/* Quick Sample Selector */}
            <div className="flex items-center gap-2 pt-1 text-xs text-[#5F6F66]">
              <span className="font-semibold text-[11px]">Thử mã mẫu:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackingId("DON-2026-7K3Q9X");
                  setActiveTab("DON-2026-7K3Q9X");
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer ${
                  activeTab === "DON-2026-7K3Q9X"
                    ? "bg-[#1F4D36] text-white shadow-2xs"
                    : "bg-slate-100 text-[#1C2B24] hover:bg-slate-200"
                }`}
              >
                DON-2026-7K3Q9X
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackingId("DON-2026-5W9K2N");
                  setActiveTab("DON-2026-5W9K2N");
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer ${
                  activeTab === "DON-2026-5W9K2N"
                    ? "bg-[#1F4D36] text-white shadow-2xs"
                    : "bg-slate-100 text-[#1C2B24] hover:bg-slate-200"
                }`}
              >
                DON-2026-5W9K2N
              </button>
            </div>
          </div>

          {/* Right: Mockup Interactive Journey Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-[#FAF9F6] rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
            {/* Package Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#5F6F66] font-bold">
                  Mã kiện: <span className="text-[#1F4D36]">{activeTab}</span>
                </span>
                <h4 className="text-sm font-bold text-[#1C2B24] mt-0.5">
                  {currentOrder.item}
                </h4>
                <p className="text-[11px] text-[#5F6F66] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#1F4D36]" />
                  <span>Điểm đến: {currentOrder.destination}</span>
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6EFE3] text-[#1F4D36] text-xs font-bold self-start sm:self-auto shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentOrder.status}</span>
              </div>
            </div>

            {/* Stepper Timeline Visual */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {steps.map((st, i) => {
                const isDone = i < currentOrder.completedSteps;
                const isCurrent = i === currentOrder.completedSteps - 1;
                const Icon = st.icon;

                return (
                  <div key={i} className="flex flex-col items-center text-center space-y-1">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shadow-2xs ${
                        isDone
                          ? "bg-[#1F4D36] text-white"
                          : "bg-slate-200/80 text-slate-400"
                      } ${isCurrent ? "ring-2 ring-[#F28C1B] ring-offset-2" : ""}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[11px] text-[#1C2B24] leading-tight">
                      {st.title}
                    </span>
                    <span className="text-[9.5px] text-[#5F6F66] hidden sm:inline leading-tight">
                      {st.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
