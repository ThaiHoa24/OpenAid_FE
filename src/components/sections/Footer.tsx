"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HeartHandshake, Send, ShieldCheck, Heart } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-white border-t border-[#E5E7E0] mt-auto pt-16 pb-12">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-[#E5E7E0]">
          {/* Col 1: Brand & Bio */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1F4D36] to-[#0E2C1D] flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5 text-[#F28C1B]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-[#1C2B24] leading-tight">
                  Open<span className="text-[#1F4D36]">Aid</span>
                </span>
                <span className="text-[9px] font-bold text-[#5F6F66] tracking-widest uppercase">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#5F6F66] leading-relaxed">
              Hệ thống hạ tầng số điều phối minh bạch, kết nối các tổ chức cứu trợ, nhà hảo tâm đóng góp hiện vật và tình nguyện viên thực địa với công nghệ truy vết cấp lô hàng.
            </p>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B24]">
              Nền tảng
            </h4>
            <ul className="space-y-2 text-xs text-[#5F6F66]">
              <li>
                <Link href="/events" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Khám phá chiến dịch
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Tra cứu vận đơn
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Quy trình hoạt động
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Về OpenAid
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Organizations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B24]">
              Dành cho Tổ chức
            </h4>
            <ul className="space-y-2 text-xs text-[#5F6F66]">
              <li>
                <Link href="/organizer/dashboard" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Bàn điều phối Organizer
                </Link>
              </li>
              <li>
                <Link href="/about#transparency" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Tiêu chuẩn sổ cái kho bãi
                </Link>
              </li>
              <li>
                <Link href="/about#privacy" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Bảo vệ nhân phẩm người nhận
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Đăng ký tổ chức thiện nguyện
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Ethics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B24]">
              Hỗ trợ & Minh bạch
            </h4>
            <ul className="space-y-2 text-xs text-[#5F6F66]">
              <li>
                <Link href="/about#help" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/about#terms" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/about#privacy" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/about#faq" className="hover:text-[#1F4D36] hover:font-bold transition-all">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B24]">
              Bản tin cứu trợ
            </h4>
            <p className="text-xs text-[#5F6F66] leading-relaxed">
              Đăng ký nhận báo cáo kiểm toán định kỳ và thông báo khẩn cấp khi có thiên tai bão lũ.
            </p>
            {subscribed ? (
              <p className="text-xs text-[#1F4D36] font-bold bg-[#E6EFE3] p-3 rounded-2xl border border-emerald-500/20 shadow-2xs">
                Cảm ơn bạn đã đăng ký nhận thông tin từ OpenAid!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  required
                  className="w-full px-4 py-2.5 rounded-full border border-[#E5E7E0] bg-[#FAF9F6] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#1F4D36] shadow-2xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#1F4D36] to-[#143D29] hover:from-[#17422E] hover:to-[#0E2C1D] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-subtle hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Đăng ký nhận tin</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5F6F66]">
          <p>© {new Date().getFullYear()} OpenAid. Bản quyền thuộc về hệ thống OpenAid.</p>
          <p className="text-center font-medium text-[11px] text-[#5F6F66]/90 max-w-xl">
            {APP_CONFIG.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
