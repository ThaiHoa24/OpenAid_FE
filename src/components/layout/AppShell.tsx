"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Gift,
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Truck,
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowRight,
  Globe,
  Search,
  Home,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { RoleSwitcherBar } from "@/components/layout/RoleSwitcherBar";
import { useAuth } from "@/hooks/useAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isOrganizer, isAdmin, activeOrganization } = useAuth();

  const isOrganizerRoute = pathname?.startsWith("/organizer");
  const isAdminRoute = pathname?.startsWith("/admin");

  const organizerLinks = [
    { href: "/organizer/dashboard", label: "Tổng quan điều phối", icon: LayoutDashboard },
    { href: "/organizer/events", label: "Chiến dịch cứu trợ", icon: Calendar },
    { href: "/organizer/volunteers", label: "Duyệt tình nguyện viên", icon: Users },
    { href: "/organizer/donations", label: "Tiếp nhận hiện vật", icon: Gift },
    { href: "/organizer/inventory", label: "Sổ cái kho bãi", icon: Package },
    { href: "/organizer/batches", label: "Đóng gói lô hàng (Batch)", icon: Layers },
    { href: "/organizer/trips", label: "Chuyến xe phân phối", icon: Truck },
    { href: "/organizer/transparency", label: "Bằng chứng & Đối soát", icon: FileCheck2 },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Tổng quan nền tảng", icon: LayoutDashboard },
    { href: "/admin/organizations", label: "Xét duyệt tổ chức", icon: Building2 },
    { href: "/admin/users", label: "Quản lý người dùng", icon: Users },
    { href: "/admin/events", label: "Kiểm toán chiến dịch", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C2B24] overflow-x-clip">
      {/* Temporary Role Switcher Toolbar */}
      <RoleSwitcherBar />

      {/* Top Main Navigation (Sticky Header 4.1) */}
      <Header />

      {/* Main Content Area */}
      {isOrganizerRoute || isAdminRoute ? (
        <div className="flex-1 flex max-w-[1240px] w-full mx-auto">
          {/* Console Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#E5E7E0] bg-white/70 py-6 px-4">
            {isOrganizerRoute ? (
              <>
                <div className="px-3 pb-4 mb-4 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1F4D36]">
                    Bàn Điều Phối
                  </span>
                  <h2 className="text-sm font-bold text-[#1C2B24] mt-1 truncate">
                    {activeOrganization?.name || "Tổ Chức Từ Thiện"}
                  </h2>
                </div>
                <nav className="space-y-1 flex-1">
                  {organizerLinks.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition ${
                          active
                            ? "bg-[#1F4D36] text-white shadow-xs"
                            : "text-[#5F6F66] hover:bg-[#E6EFE3]/70 hover:text-[#1C2B24]"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    Xem Trang Công Khai
                  </span>
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5F6F66] hover:text-[#1C2B24] hover:bg-slate-100 transition"
                  >
                    <Globe className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Trang chủ OpenAid</span>
                  </Link>
                  <Link
                    href="/events"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5F6F66] hover:text-[#1C2B24] hover:bg-slate-100 transition"
                  >
                    <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Danh sách chiến dịch</span>
                  </Link>
                  <Link
                    href="/track"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5F6F66] hover:text-[#1C2B24] hover:bg-slate-100 transition"
                  >
                    <Search className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Tra cứu vận đơn</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="px-3 pb-4 mb-4 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Bàn Quản Trị Hệ Thống
                  </span>
                  <h2 className="text-sm font-bold text-[#1C2B24] mt-1">
                    Ban Quản Trị OpenAid
                  </h2>
                </div>
                <nav className="space-y-1 flex-1">
                  {adminLinks.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition ${
                          active
                            ? "bg-[#133724] text-white shadow-xs"
                            : "text-[#5F6F66] hover:bg-slate-100 hover:text-[#1C2B24]"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    Xem Trang Công Khai
                  </span>
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5F6F66] hover:text-[#1C2B24] hover:bg-slate-100 transition"
                  >
                    <Globe className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Trang chủ OpenAid</span>
                  </Link>
                  <Link
                    href="/events"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5F6F66] hover:text-[#1C2B24] hover:bg-slate-100 transition"
                  >
                    <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Kiểm toán chiến dịch</span>
                  </Link>
                </div>
              </>
            )}
          </aside>

          {/* Console Body */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {/* Mobile Subnav Strip */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-none border-b border-[#E5E7E0]">
              {(isOrganizerRoute ? organizerLinks : adminLinks).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                      active
                        ? isOrganizerRoute
                          ? "bg-[#1F4D36] text-white shadow-xs"
                          : "bg-[#133724] text-white shadow-xs"
                        : "bg-white text-[#5F6F66] border border-[#E5E7E0] hover:text-[#1C2B24]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {children}
          </main>
        </div>
      ) : (
        <main className="flex-1">{children}</main>
      )}

      {/* Floating Role Workspace Return Button if user navigated to public tabs */}
      {isOrganizer && !isOrganizerRoute && (
        <Link
          href="/organizer/dashboard"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1F4D36] text-white shadow-2xl hover:bg-[#153826] hover:scale-105 transition-all text-xs font-bold border-2 border-emerald-400/60 group animate-bounce"
          title="Quay lại Bàn Điều Phối Organizer"
        >
          <Building2 className="w-4 h-4 text-[#F28C1B]" />
          <span>Về Bàn Điều Phối</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-300 transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      {isAdmin && !isAdminRoute && (
        <Link
          href="/admin/dashboard"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-purple-900 text-purple-100 shadow-2xl hover:bg-purple-950 hover:scale-105 transition-all text-xs font-bold border-2 border-purple-400/60 group animate-bounce"
          title="Quay lại Bàn Quản Trị Hệ Thống"
        >
          <ShieldCheck className="w-4 h-4 text-purple-300" />
          <span>Về Bàn Quản Trị</span>
          <ArrowRight className="w-3.5 h-3.5 text-purple-200 transition-transform group-hover:translate-x-1" />
        </Link>
      )}



      {/* Main Footer (4.9) */}
      <Footer />
    </div>
  );
}
