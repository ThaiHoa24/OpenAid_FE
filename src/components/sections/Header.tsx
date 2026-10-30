"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartHandshake,
  Search,
  Menu,
  X,
  User,
  Heart,
  LogOut,
  Calendar,
  Gift,
  Building2,
  ShieldCheck,
  Layers,
  Package,
  Truck,
  FileCheck2,
  Users,
  LayoutDashboard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { APP_CONFIG, NAV_LINKS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/styles/Header.module.css";

export function Header({ isTransparent }: { isTransparent?: boolean } = {}) {
  const pathname = usePathname();
  const isAuthPage = isTransparent ?? (pathname === "/login" || pathname === "/register");
  const { user, isOrganizer, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("home");

  // Rubber Segment references and geometry
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  // Calculate & position the Rubber Segment indicator with elastic spring
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeNav];
      if (activeEl && navRef.current) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          top: activeEl.offsetTop,
          width: activeEl.offsetWidth,
          height: activeEl.offsetHeight,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    const timer = setTimeout(updateIndicator, 20);
    window.addEventListener("resize", updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeNav]);

  // Determine user role details for quick jump
  let roleTitle = "Người dùng";
  let roleBadgeClass = "bg-slate-100 text-slate-700 border-slate-200";
  let mainHubUrl = "/my/activities";
  let mainHubName = "Khu Vực Cá Nhân";
  let RoleIcon = User;

  if (isAdmin) {
    roleTitle = "Quản trị viên";
    roleBadgeClass = "bg-purple-100 text-purple-800 border-purple-200";
    mainHubUrl = "/admin/dashboard";
    mainHubName = "Bàn Quản Trị Hệ Thống";
    RoleIcon = ShieldCheck;
  } else if (isOrganizer) {
    roleTitle = "Ban tổ chức";
    roleBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
    mainHubUrl = "/organizer/dashboard";
    mainHubName = "Bàn Điều Phối Organizer";
    RoleIcon = Building2;
  } else if (user) {
    roleTitle = "Người dùng";
    roleBadgeClass = "bg-teal-100 text-teal-800 border-teal-200";
    mainHubUrl = "/my/activities";
    mainHubName = "Khu Vực Cá Nhân";
    RoleIcon = User;
  }

  // Real-time ScrollSpy & Header state
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 15);

      // Only perform section scrollspy on homepage
      if (pathname === "/") {
        const triggerPoint = Math.min(260, window.innerHeight * 0.35);
        const howItWorksElem = document.getElementById("how-it-works");
        const featuredElem = document.getElementById("featured-events");

        const howItWorksTop = howItWorksElem
          ? howItWorksElem.getBoundingClientRect().top
          : Infinity;
        const featuredTop = featuredElem
          ? featuredElem.getBoundingClientRect().top
          : Infinity;

        if (howItWorksTop <= triggerPoint) {
          setActiveNav("how-it-works");
        } else if (featuredTop <= triggerPoint) {
          setActiveNav("events");
        } else {
          setActiveNav("home");
        }
      }
    };

    if (pathname !== "/") {
      if (pathname.startsWith("/track")) setActiveNav("track");
      else if (pathname.startsWith("/about")) setActiveNav("about");
      else if (pathname.startsWith("/events")) setActiveNav("events");
      else setActiveNav("");
    } else {
      // Run once on mount / load
      handleScroll();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof NAV_LINKS[number]) => {
    if (link.key === "home" || link.href === "/") {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveNav("home");
        if (window.location.hash) {
          window.history.pushState(null, "", "/");
        }
      }
    } else if (link.href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = link.href.replace("/#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
        setActiveNav(link.key);
      }
    }
  };

  return (
    <header
      className={`z-40 w-full transition-all duration-300 ${
        isAuthPage
          ? "fixed top-0 left-0 right-0 bg-[#141822]/40 backdrop-blur-md py-3 border-b border-white/5"
          : isScrolled
          ? "sticky top-0 bg-white/85 backdrop-blur-xl shadow-card border-b border-[#E5E7E0]/90 py-2.5"
          : "sticky top-0 bg-[#FAF9F6]/85 backdrop-blur-md py-3.5 border-b border-black/[0.03]"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo + Small Tagline */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActiveNav("home");
            }
          }}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#1F4D36] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 border border-white/10">
            <HeartHandshake className="w-6 h-6 text-[#F28C1B]" />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-bold text-2xl tracking-tight leading-tight flex items-center gap-0.5 ${
                isAuthPage ? "text-white" : "text-[#1C2B24]"
              }`}
            >
              Open<span className={isAuthPage ? "text-emerald-400" : "text-[#1F4D36]"}>Aid</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C1B] inline-block ml-0.5 mb-1" />
            </span>
            <span
              className={`text-[10px] font-bold tracking-widest uppercase ${
                isAuthPage ? "text-gray-400" : "text-[#4A5850]"
              }`}
            >
              {APP_CONFIG.tagline}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation with Rubber Segment Sliding Pill Effect */}
        <nav
          ref={navRef}
          className={`relative hidden lg:flex items-center p-1 rounded-full border shadow-2xs backdrop-blur-xs ${
            isAuthPage
              ? "bg-white/5 border-white/10"
              : "bg-black/[0.035] border-[#E5E7E0]/80"
          }`}
        >
          {/* Elastic Rubber Segment Sliding Pill */}
          <div
            className={`${styles.navIndicator} absolute rounded-full ${
              isAuthPage ? "bg-white/15 border border-white/10" : "bg-white border border-[#E5E7E0]"
            } shadow-[0_2px_10px_rgba(0,0,0,0.08)] pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0`}
            style={{
              "--indicator-left": `${indicatorStyle.left}px`,
              "--indicator-top": `${indicatorStyle.top}px`,
              "--indicator-width": `${indicatorStyle.width}px`,
              "--indicator-height": `${indicatorStyle.height}px`,
              "--indicator-opacity": indicatorStyle.opacity,
            } as React.CSSProperties}
          />

          {NAV_LINKS.map((link) => {
            const isActive = activeNav === link.key;

            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  tabRefs.current[link.key] = el;
                }}
                onClick={(e) => handleNavClick(e, link)}
                className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-250 select-none ${
                  isActive
                    ? "text-[#F28C1B] font-bold"
                    : isAuthPage
                    ? "text-gray-300 hover:text-white"
                    : "text-[#1C2B24] hover:text-[#1F4D36]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Round Action Buttons & User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Console Jump Pill when logged in */}
          {user && (
            <Link
              href={mainHubUrl}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-card hover:shadow-hover transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                isOrganizer
                  ? "bg-gradient-to-r from-[#1F4D36] to-[#143D29] text-white border border-emerald-500/40"
                  : isAdmin
                  ? "bg-gradient-to-r from-purple-900 to-purple-800 text-purple-100 border border-purple-500/40"
                  : "bg-gradient-to-r from-[#1F4D36] to-[#143D29] text-white border border-emerald-500/40"
              }`}
              title={`Chuyển đến ${mainHubName}`}
            >
              <RoleIcon className="w-3.5 h-3.5 text-[#F28C1B]" />
              <span>{mainHubName}</span>
            </Link>
          )}

          {/* Circular Search Button */}
          <Link
            href="/track"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs ${
              isAuthPage
                ? "border-white/10 hover:border-emerald-400 text-gray-300 hover:text-white hover:bg-white/10"
                : "border-[#E5E7E0] hover:border-[#1F4D36] text-[#1C2B24] hover:text-[#1F4D36] hover:bg-[#E6EFE3]/60"
            }`}
            title="Tra cứu vận đơn"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Circular Favorite / Heart Button */}
          <Link
            href={user ? "/my/donations" : "/events"}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs ${
              isAuthPage
                ? "border-white/10 hover:border-[#F28C1B] text-gray-300 hover:text-[#F28C1B] hover:bg-white/10"
                : "border-[#E5E7E0] hover:border-[#F28C1B] text-[#1C2B24] hover:text-[#F28C1B] hover:bg-amber-50/60"
            }`}
            title={user ? "Đóng góp của tôi" : "Khám phá chiến dịch"}
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* User / Auth Menu Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen((o) => !o)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                isAuthPage
                  ? "border-white/10 hover:border-emerald-400 text-gray-300 hover:text-white hover:bg-white/10"
                  : "border-[#E5E7E0] hover:border-[#1F4D36] text-[#1C2B24] hover:text-[#1F4D36] hover:bg-[#E6EFE3]/60"
              }`}
              title={user ? user.name : "Tài khoản"}
            >
              {user ? (
                <div className="w-7 h-7 rounded-full bg-[#1F4D36] text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white text-[#1C2B24] rounded-2xl shadow-2xl border border-[#E5E7E0] py-3 z-50 space-y-2 max-h-[85vh] overflow-y-auto">
                  {user ? (
                    <>
                      {/* User Header Profile */}
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#1C2B24] truncate">{user.name}</p>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeClass}`}
                          >
                            {roleTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5F6F66] truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* Primary Role Hub Big Action Button */}
                      <div className="px-3 pt-1">
                        <Link
                          href={mainHubUrl}
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#1F4D36] hover:bg-[#163b29] text-white font-bold text-xs transition shadow-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <RoleIcon className="w-4 h-4 text-[#F28C1B]" />
                            <span>Vào {mainHubName}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>

                      {/* Role Specific Shortcuts */}
                      {isOrganizer && (
                        <div className="px-2 pt-1 pb-1 space-y-0.5">
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Các phân hệ điều phối
                          </div>
                          <Link
                            href="/organizer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Tổng quan điều phối</span>
                          </Link>
                          <Link
                            href="/organizer/events"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <Calendar className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Chiến dịch cứu trợ</span>
                          </Link>
                          <Link
                            href="/organizer/volunteers"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <Users className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Duyệt tình nguyện viên</span>
                          </Link>
                          <Link
                            href="/organizer/donations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <Gift className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Tiếp nhận hiện vật</span>
                          </Link>
                          <Link
                            href="/organizer/inventory"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <Package className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Sổ cái kho bãi</span>
                          </Link>
                          <Link
                            href="/organizer/batches"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Đóng gói lô hàng</span>
                          </Link>
                          <Link
                            href="/organizer/trips"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Chuyến xe phân phối</span>
                          </Link>
                          <Link
                            href="/organizer/transparency"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6EFE3]/50 text-[#1C2B24]"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-[#1F4D36]" />
                            <span>Bằng chứng & đối soát</span>
                          </Link>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="px-2 pt-1 pb-1 space-y-0.5">
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Phân hệ quản trị
                          </div>
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-50 text-[#1C2B24]"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-purple-700" />
                            <span>Tổng quan nền tảng</span>
                          </Link>
                          <Link
                            href="/admin/organizations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-50 text-[#1C2B24]"
                          >
                            <Building2 className="w-3.5 h-3.5 text-purple-700" />
                            <span>Xét duyệt tổ chức</span>
                          </Link>
                          <Link
                            href="/admin/users"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-50 text-[#1C2B24]"
                          >
                            <Users className="w-3.5 h-3.5 text-purple-700" />
                            <span>Quản lý người dùng</span>
                          </Link>
                          <Link
                            href="/admin/events"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-50 text-[#1C2B24]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                            <span>Kiểm toán chiến dịch</span>
                          </Link>
                        </div>
                      )}

                      {!isOrganizer && !isAdmin && (
                        <div className="px-2 pt-1 pb-1 space-y-0.5">
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Khu vực cá nhân
                          </div>
                          <Link
                            href="/my/activities"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-teal-50 text-[#1C2B24]"
                          >
                            <Users className="w-3.5 h-3.5 text-teal-700" />
                            <span>Hoạt động tình nguyện & QR</span>
                          </Link>
                          <Link
                            href="/my/donations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-50 text-[#1C2B24]"
                          >
                            <Gift className="w-3.5 h-3.5 text-[#F28C1B]" />
                            <span>Lịch sử quyên góp hiện vật</span>
                          </Link>
                          <Link
                            href="/events"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 text-[#1C2B24]"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#F28C1B]" />
                            <span>Khám phá chiến dịch</span>
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 text-[#1C2B24]"
                          >
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>Hồ sơ cá nhân</span>
                          </Link>
                        </div>
                      )}

                      {/* General links */}
                      <div className="pt-2 border-t border-slate-100 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block w-full py-2.5 text-center text-xs font-bold rounded-full border border-[#1F4D36] text-[#1F4D36] hover:bg-[#E6EFE3] transition"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block w-full py-2.5 text-center text-xs font-bold rounded-full bg-[#1F4D36] text-white hover:bg-[#133724] transition shadow-xs"
                      >
                        Đăng ký
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {user && (
            <Link
              href={mainHubUrl}
              className={`p-2 rounded-full font-bold text-xs shadow-xs transition ${
                isOrganizer
                  ? "bg-[#1F4D36] text-white"
                  : isAdmin
                  ? "bg-purple-900 text-white"
                  : "bg-teal-800 text-white"
              }`}
              title={`Vào ${mainHubName}`}
            >
              <RoleIcon className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-full border border-[#E5E7E0] text-[#1C2B24] flex items-center justify-center hover:bg-[#E6EFE3]/60 cursor-pointer"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Full height, locks scroll, overlay & ESC dismiss) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-extrabold text-xl text-[#1C2B24]"
                >
                  Open<span className="text-[#1F4D36]">Aid</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Role Quick Return Card on Mobile */}
              {user && (
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E7E0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#5F6F66]">
                      Vai trò hiện tại
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeClass}`}
                    >
                      {roleTitle}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#1C2B24] truncate">{user.name}</p>
                  <Link
                    href={mainHubUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1F4D36] text-white font-bold text-xs shadow-xs"
                  >
                    <RoleIcon className="w-3.5 h-3.5 text-[#F28C1B]" />
                    <span>Về {mainHubName}</span>
                  </Link>
                </div>
              )}

              {/* Mobile Links */}
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = activeNav === link.key;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        handleNavClick(e, link);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-white/90 backdrop-blur-md text-[#F28C1B] font-bold shadow-xs border border-[#E5E7E0]"
                          : "text-[#1C2B24] hover:bg-slate-50"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#F28C1B]" />}
                    </Link>
                  );
                })}
              </nav>

              {/* If Organizer, show quick console shortcuts on mobile */}
              {isOrganizer && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6F66] px-2 mb-1">
                    Bàn Điều Phối Organizer
                  </p>
                  <Link
                    href="/organizer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#1F4D36]" />
                    <span>Tổng quan điều phối</span>
                  </Link>
                  <Link
                    href="/organizer/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Calendar className="w-4 h-4 text-[#1F4D36]" />
                    <span>Chiến dịch cứu trợ</span>
                  </Link>
                  <Link
                    href="/organizer/volunteers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Users className="w-4 h-4 text-[#1F4D36]" />
                    <span>Duyệt tình nguyện viên</span>
                  </Link>
                  <Link
                    href="/organizer/donations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Gift className="w-4 h-4 text-[#1F4D36]" />
                    <span>Tiếp nhận hiện vật</span>
                  </Link>
                  <Link
                    href="/organizer/inventory"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Package className="w-4 h-4 text-[#1F4D36]" />
                    <span>Sổ cái kho bãi</span>
                  </Link>
                </div>
              )}

              {/* If Admin, show quick console shortcuts on mobile */}
              {isAdmin && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                    Bàn Quản Trị Hệ Thống
                  </p>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-700" />
                    <span>Tổng quan nền tảng</span>
                  </Link>
                  <Link
                    href="/admin/organizations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Building2 className="w-4 h-4 text-purple-700" />
                    <span>Xét duyệt tổ chức</span>
                  </Link>
                  <Link
                    href="/admin/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>Kiểm toán chiến dịch</span>
                  </Link>
                </div>
              )}

              {/* If User, show quick shortcuts on mobile */}
              {user && !isOrganizer && !isAdmin && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 px-2 mb-1">
                    Khu Vực Cá Nhân
                  </p>
                  <Link
                    href="/my/activities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Users className="w-4 h-4 text-teal-700" />
                    <span>Hoạt động & Điểm danh QR</span>
                  </Link>
                  <Link
                    href="/my/donations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Gift className="w-4 h-4 text-[#F28C1B]" />
                    <span>Lịch sử quyên góp hiện vật</span>
                  </Link>
                  <Link
                    href="/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <Sparkles className="w-4 h-4 text-[#F28C1B]" />
                    <span>Khám phá chiến dịch</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2B24] hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Auth Bottom Buttons */}
            <div className="pt-6 border-t border-slate-100 space-y-2">
              {user ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs text-center cursor-pointer hover:bg-rose-100 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-center text-xs font-bold rounded-full border border-[#1F4D36] text-[#1F4D36]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-center text-xs font-bold rounded-full bg-[#1F4D36] text-white shadow-xs"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
