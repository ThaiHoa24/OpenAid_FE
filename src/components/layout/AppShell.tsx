"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HeartHandshake,
  Calendar,
  Search,
  Info,
  UserCheck,
  Gift,
  UserCircle,
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Truck,
  ShieldCheck,
  Building2,
  LogOut,
  RotateCcw,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { authService } from "@/services";
import { DEMO_ACCOUNTS } from "@/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isOrganizer,
    isAdmin,
    activeOrganization,
    logout,
    resetDemoData,
  } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const isOrganizerRoute = pathname?.startsWith("/organizer");
  const isAdminRoute = pathname?.startsWith("/admin");

  const publicLinks = [
    { href: "/", label: t("nav.home"), icon: HeartHandshake },
    { href: "/events", label: t("nav.events"), icon: Calendar },
    { href: "/tracking", label: t("nav.tracking"), icon: Search },
    { href: "/about", label: t("nav.about"), icon: Info },
  ];

  const userLinks = user
    ? [
        { href: "/my-activities", label: t("nav.myActivities"), icon: UserCheck },
        { href: "/my-donations", label: t("nav.myDonations"), icon: Gift },
        { href: "/profile", label: t("nav.profile"), icon: UserCircle },
      ]
    : [];

  const organizerLinks = [
    { href: "/organizer/dashboard", label: t("organizer.dashboard.title"), icon: LayoutDashboard },
    { href: "/organizer/events", label: t("organizer.events.title"), icon: Calendar },
    { href: "/organizer/volunteers", label: t("organizer.volunteers.title"), icon: Users },
    { href: "/organizer/donations", label: t("organizer.donations.title"), icon: Gift },
    { href: "/organizer/inventory", label: t("organizer.inventory.title"), icon: Package },
    { href: "/organizer/batches", label: t("organizer.batches.title"), icon: Layers },
    { href: "/organizer/trips", label: t("organizer.trips.title"), icon: Truck },
    { href: "/organizer/transparency", label: t("organizer.transparency.title"), icon: FileCheck2 },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: t("admin.dashboard.title"), icon: LayoutDashboard },
    { href: "/admin/organizations", label: t("admin.orgs.title"), icon: Building2 },
    { href: "/admin/users", label: t("admin.users.title"), icon: Users },
    { href: "/admin/events", label: t("admin.events.title"), icon: ShieldCheck },
  ];

  const handleQuickDemoSwitch = async (email: string, label: string) => {
    try {
      const ctx = await authService.login(email, "123456");
      setDemoMenuOpen(false);
      showToast(`${t("common.success")}: ${label}`, "info", t("nav.demoAccount"));
      if (ctx.user.systemRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (ctx.isOrganizer) {
        router.push("/organizer/dashboard");
      } else {
        router.push("/events");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("common.error"),
        "error"
      );
    }
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setResetModalOpen(false);
    showToast(
      t("nav.resetConfirmDesc"),
      "success",
      t("nav.resetData")
    );
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    showToast(t("nav.logout"), "info");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Demo & Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
              <Sparkles className="w-3 h-3" />
              OpenAid MVP v1.0
            </span>
            <span className="hidden sm:inline text-slate-400">
              {t("home.heroBadge")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Account Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer border border-slate-700"
              >
                <span>{t("nav.quickDemo")}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {demoMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDemoMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {t("auth.quickDemoHeader")} (123456)
                      </p>
                    </div>
                    {DEMO_ACCOUNTS.map((acc) => {
                      const isCurrent = user?.email === acc.email;
                      return (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() =>
                            handleQuickDemoSwitch(acc.email, acc.label)
                          }
                          className={`w-full text-left px-3 py-2 hover:bg-teal-50/70 transition flex flex-col gap-0.5 cursor-pointer ${
                            isCurrent ? "bg-teal-50/90" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-slate-900">
                              {acc.label}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {acc.roleBadge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {acc.email}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/60 font-medium transition cursor-pointer"
              title={t("nav.resetConfirmDesc")}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t("nav.resetData")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">
                  Open<span className="text-teal-600">Aid</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 tracking-wide">
                  TRANSPARENT RELIEF
                </span>
              </div>
            </Link>

            {/* Desktop Primary Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {publicLinks.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-teal-50 text-teal-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {userLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-teal-50 text-teal-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Console Buttons & Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Switcher - placed right before console / profile / login */}
            <LanguageSwitcher />

            {isOrganizer && (
              <Link
                href="/organizer/dashboard"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  isOrganizerRoute
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t("nav.organizerConsole")}</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  isAdminRoute
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t("nav.adminConsole")}</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {isAdmin
                        ? t("roles.ADMIN")
                        : isOrganizer
                        ? activeOrganization?.name || t("roles.ORGANIZER")
                        : t("roles.USER")}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title={t("nav.logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition shadow-xs"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Bar (Switcher + Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher showIcon={false} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label={t("nav.menu")}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-4">
            {/* Top of Drawer: Language Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Language / Ngôn ngữ
              </span>
              <LanguageSwitcher />
            </div>

            <div className="space-y-1">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t("nav.menu")}
              </p>
              {[...publicLinks, ...userLinks].map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      active
                        ? "bg-teal-50 text-teal-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {isOrganizer && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  {t("nav.organizerConsole")} ({activeOrganization?.name})
                </p>
                {organizerLinks.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                        active
                          ? "bg-teal-600 text-white font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {isAdmin && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t("nav.adminConsole")}
                </p>
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                        active
                          ? "bg-slate-900 text-white font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-teal-600 text-sm font-semibold text-white"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area (with Sidebar for Organizer / Admin routes) */}
      {isOrganizerRoute || isAdminRoute ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Desktop Console Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white py-6 px-4">
            {isOrganizerRoute ? (
              <>
                <div className="px-3 pb-4 mb-4 border-b border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                    {t("nav.organizerConsole")}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 mt-1">
                    {activeOrganization?.name || "Helping Hands Da Nang"}
                  </h2>
                  {activeOrganization && (
                    <div className="mt-2">
                      <StatusBadge status={activeOrganization.status} />
                    </div>
                  )}
                </div>
                <nav className="space-y-1 flex-1">
                  {organizerLinks.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          active
                            ? "bg-teal-600 text-white font-semibold shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </>
            ) : (
              <>
                <div className="px-3 pb-4 mb-4 border-b border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {t("admin.dashboard.badge")}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 mt-1">
                    {t("nav.adminConsole")}
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                          active
                            ? "bg-slate-900 text-white font-semibold shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </>
            )}
          </aside>

          {/* Console Page Body */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      ) : (
        <main className="flex-1">{children}</main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">OpenAid v1.0</span>
            <span>
              — {t("home.heroBadge")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/events" className="hover:text-teal-600 transition">
              {t("nav.events")}
            </Link>
            <Link href="/tracking" className="hover:text-teal-600 transition">
              {t("nav.tracking")}
            </Link>
            <Link href="/about" className="hover:text-teal-600 transition">
              {t("nav.about")}
            </Link>
          </div>
        </div>
      </footer>

      {/* Reset Demo Data Confirmation Modal */}
      <ConfirmModal
        isOpen={resetModalOpen}
        title={t("nav.resetConfirmTitle")}
        description={t("nav.resetConfirmDesc")}
        confirmLabel={t("nav.resetData")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
}
