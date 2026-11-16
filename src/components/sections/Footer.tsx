"use client";

import React from "react";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[#163D2A] text-white mt-auto pt-10 sm:pt-14 pb-10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-white/10">
          {/* Cột 1: Thông tin thương hiệu & Mô tả ngắn */}
          <div className="md:col-span-6 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform border border-white/15">
                <HeartHandshake className="w-5 h-5 text-[#F28C1B]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white leading-tight">
                  Open<span className="text-[#DAF1DE]">Aid</span>
                </span>
                <span className="text-[10px] font-bold text-[#DAF1DE]/70 tracking-widest uppercase">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Nền tảng kết nối các tổ chức thiện nguyện, nhà hảo tâm và tình nguyện viên, hỗ trợ minh bạch quá trình tiếp nhận và trao tặng đóng góp cộng đồng.
            </p>
          </div>

          {/* Cột 2: Liên kết Nền tảng */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#DAF1DE]">
              Nền tảng
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link
                  href="/events"
                  className="hover:text-white hover:underline transition-all"
                >
                  Khám phá chiến dịch
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="hover:text-white hover:underline transition-all"
                >
                  Theo dõi đóng góp
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-white hover:underline transition-all"
                >
                  Quy trình hoạt động
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white hover:underline transition-all"
                >
                  Giới thiệu OpenAid
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên kết Dành cho Tổ chức & Người dùng */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#DAF1DE]">
              Tổ chức & Tham gia
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link
                  href="/register"
                  className="hover:text-white hover:underline transition-all"
                >
                  Đăng ký tài khoản
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white hover:underline transition-all"
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/dashboard"
                  className="hover:text-white hover:underline transition-all"
                >
                  Bàn điều phối tổ chức
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền & Tuyên bố trách nhiệm thực tế */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OpenAid. Toàn quyền bảo lưu.</p>
          <p className="text-center sm:text-right text-[11px] text-slate-400 max-w-xl leading-relaxed">
            OpenAid là nền tảng trung gian kết nối thiện nguyện; không trực tiếp vận hành hoạt động từ thiện, không trực tiếp vận chuyển hàng hóa hoặc giữ tiền quyên góp.
          </p>
        </div>
      </div>
    </footer>
  );
}
