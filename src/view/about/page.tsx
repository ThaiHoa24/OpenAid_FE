"use client";

import React from "react";
import Link from "next/link";
import { 
  HeartHandshake, ShieldCheck, Scale, Award, 
  Users, CheckCircle2, ArrowRight, Layers, Lock, Truck
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero / Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          {t("about.badge")}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {t("about.title")}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          {t("about.subtitle")}
        </p>
      </div>

      {/* The Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border border-rose-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-rose-950">{t("about.problemTitle")}</h3>
          <p className="text-xs sm:text-sm text-rose-900/80 leading-relaxed">
            {t("about.problemDesc")}
          </p>
        </div>

        <div className="bg-emerald-50/60 rounded-3xl p-6 sm:p-8 border border-emerald-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-emerald-950">{t("about.solutionTitle")}</h3>
          <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed">
            {t("about.solutionDesc")}
          </p>
        </div>
      </div>

      {/* 4 Pillars of Integrity */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900">{t("about.pillarsTitle")}</h2>
          <p className="text-xs text-slate-500 mt-1">{t("about.pillarsSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{t("about.pillar1Title")}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar1Desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{t("about.pillar2Title")}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar2Desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{t("about.pillar3Title")}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar3Desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{t("about.pillar4Title")}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("about.pillar4Desc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{t("about.teamRole")}</span>
            <h3 className="text-xl font-bold mt-1">{t("about.teamName")}</h3>
            <p className="text-xs text-slate-400 mt-1">{t("about.teamSub")}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            {t("about.teamGoal")}
          </p>
          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            {t("about.tryPlatform")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
