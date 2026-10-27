import React from "react";
import { ShieldCheck, Package, Layers, Clock } from "lucide-react";
import { FEATURE_STRIP_ITEMS } from "@/lib/constants";

export function FeatureStrip() {
  const icons: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />,
    Package: <Package className="w-5 h-5 text-[#4ADE80]" />,
    Layers: <Layers className="w-5 h-5 text-[#4ADE80]" />,
    Clock: <Clock className="w-5 h-5 text-[#4ADE80]" />,
  };

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Luxury Dark Forest Ribbon with subtle layered glow */}
      <div className="relative bg-gradient-to-r from-[#0B3B24] via-[#0E4229] to-[#0B3B24] rounded-3xl py-4.5 px-5 sm:py-5 sm:px-7 shadow-card border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-hidden">
        {/* Soft background ambient light */}
        <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-[#F28C1B]/10 blur-2xl pointer-events-none" />

        {FEATURE_STRIP_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center sm:items-start gap-3.5 group p-2 rounded-2xl hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#185535] to-[#0D3821] border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-subtle transition-all duration-300 group-hover:scale-108 group-hover:border-[#4ADE80]">
              {icons[item.iconName]}
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs sm:text-sm text-white tracking-tight leading-tight group-hover:text-[#4ADE80] transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-[#D1E7DD]/90 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
