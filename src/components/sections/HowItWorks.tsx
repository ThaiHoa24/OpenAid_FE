import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/constants";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Floor (Vừa vặn trong 1 khung hình thiết bị, hiển thị đầy đủ nội dung) */}
      <div className="bg-[#F4F1EA] rounded-3xl py-5 px-5 sm:py-6 sm:px-8 border border-[#E5E7E0] space-y-4 shadow-sm">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4A5850]">
              <span className="w-5 h-[2px] bg-[#1F4D36] inline-block" />
              <span>Quy Trình Minh Bạch</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight leading-snug">
              Từ Đóng Góp Hiện Vật Đến Bằng Chứng Trao Tặng
            </h2>
            <p className="text-xs text-[#4A5850] max-w-2xl leading-normal">
              Mọi kiện hàng cam kết được gom vào các Lô hàng (Batch) được kiểm toán, vận chuyển và trao tận tay bà con kèm hình ảnh đối soát.
            </p>
          </div>

          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1F4D36] hover:bg-[#153826] text-white font-bold text-xs shadow-sm transition-all self-start sm:self-auto shrink-0 group"
          >
            <span>Tìm hiểu chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 2 Guidance Cards - Hiển thị đầy đủ nội dung */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Donors */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-24 sm:w-28 h-20 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&auto=format&fit=crop&q=80"
                alt="Relief supplies"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#E6EFE3] px-2 py-0.5 rounded-md inline-block">
                Dành cho Nhà hảo tâm
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[#1C2B24]">
                Cam kết hiện vật & theo dõi lộ trình
              </h4>
              <p className="text-xs text-[#4A5850] leading-snug">
                Xem định mức nhu cầu thực tế trước khi gửi. Nhận mã Tracking ID bất biến để theo dõi kho bãi và tiến độ phân phát.
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#1F4D36] pt-0.5">
                <Heart className="w-3 h-3 text-[#F28C1B]" />
                <span>Không giữ tiền mặt</span>
              </div>
            </div>
          </div>

          {/* Card 2: Organizers & Volunteers */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-24 sm:w-28 h-20 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80"
                alt="Volunteer distribution"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F4D36] bg-[#E6EFE3] px-2 py-0.5 rounded-md inline-block">
                Dành cho Ban tổ chức & TNV
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[#1C2B24]">
                Quản lý kho hàng & biên bản trao tặng
              </h4>
              <p className="text-xs text-[#4A5850] leading-snug">
                Kiểm soát sổ cái xuất-nhập-tồn, điều phối chuyến xe và ghi nhận bàn giao tại chỗ kèm bảo vệ quyền riêng tư người nhận.
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#1F4D36] pt-0.5">
                <ShieldCheck className="w-3 h-3 text-[#1F4D36]" />
                <span>Kiểm toán độc lập cấp Lô</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 6-Step Horizontal Strip - HIỂN THỊ ĐẦY ĐỦ NỘI DUNG TỪNG BƯỚC */}
        <div className="pt-3 border-t border-[#1F4D36]/15">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {WORKFLOW_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col justify-start h-full"
              >
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#1F4D36] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-[#1C2B24]">
                    {step.title}
                  </span>
                </div>
                {/* Hiển thị toàn bộ câu văn, không cắt dấu ... */}
                <p className="text-[11px] text-[#4A5850] leading-snug mt-1.5">
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
