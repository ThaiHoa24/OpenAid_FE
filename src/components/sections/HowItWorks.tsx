import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/constants";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Floor with Warm Sand & Glass Accents */}
      <div className="bg-[#F4F1EA] rounded-3xl py-6 px-5 sm:py-7 sm:px-8 border border-[#E5E7E0] space-y-5 shadow-card">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4A5850]">
              <span className="w-5 h-[2px] bg-[#1F4D36] inline-block" />
              <span>Quy Trình Minh Bạch Toàn Diện</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1C2B24] tracking-tight leading-snug">
              Từ Đóng Góp Hiện Vật Đến Bằng Chứng Trao Tặng
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5850] max-w-2xl leading-relaxed">
              Mọi kiện hàng cam kết được gom vào các Lô hàng (Batch) được kiểm toán, vận chuyển và trao tận tay bà con kèm hình ảnh đối soát.
            </p>
          </div>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D36] hover:bg-[#143D29] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto shrink-0 group hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Tìm hiểu chi tiết</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 2 Guidance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Card 1: Donors */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-subtle hover:shadow-hover transition-all duration-300 flex items-center gap-4 group">
            <div className="w-24 sm:w-28 h-22 sm:h-26 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&auto=format&fit=crop&q=80"
                alt="Relief supplies"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#E6EFE3] px-2.5 py-0.5 rounded-full inline-block">
                Dành cho Nhà hảo tâm
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#1C2B24] leading-snug group-hover:text-[#1F4D36] transition-colors">
                Cam kết hiện vật & theo dõi lộ trình
              </h3>
              <p className="text-xs text-[#4A5850] leading-relaxed">
                Xem định mức nhu cầu thực tế trước khi gửi. Nhận mã Tracking ID bất biến để theo dõi kho bãi và tiến độ phân phát.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F4D36] pt-0.5">
                <Heart className="w-3.5 h-3.5 text-[#F28C1B] fill-current" />
                <span>Không giữ tiền mặt • 100% Hiện vật</span>
              </div>
            </div>
          </div>

          {/* Card 2: Organizers & Volunteers */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-subtle hover:shadow-hover transition-all duration-300 flex items-center gap-4 group">
            <div className="w-24 sm:w-28 h-22 sm:h-26 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80"
                alt="Volunteer distribution"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#E6EFE3] px-2.5 py-0.5 rounded-full inline-block">
                Dành cho Ban tổ chức & TNV
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#1C2B24] leading-snug group-hover:text-[#1F4D36] transition-colors">
                Quản lý kho hàng & biên bản trao tặng
              </h3>
              <p className="text-xs text-[#4A5850] leading-relaxed">
                Kiểm soát sổ cái xuất-nhập-tồn, điều phối chuyến xe và ghi nhận bàn giao tại chỗ kèm bảo vệ quyền riêng tư người nhận.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F4D36] pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F4D36]" />
                <span>Kiểm toán độc lập cấp Lô</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 6-Step Horizontal Strip with Sequential Flow */}
        <div className="pt-4 border-t border-[#1F4D36]/15">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {WORKFLOW_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-start h-full group hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1F4D36] to-[#143D29] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs group-hover:from-[#F28C1B] group-hover:to-[#D9740F] transition-all">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-[#1C2B24] group-hover:text-[#1F4D36] transition-colors">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#4A5850] leading-relaxed mt-2">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
