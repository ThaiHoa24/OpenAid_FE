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
      {/* Dark Forest Green Ribbon (Tầng Cam Kết Minh Bạch) */}
      <div className="bg-[#0B3B24] rounded-3xl py-4 px-5 sm:py-5 sm:px-7 shadow-lg border border-emerald-900/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {FEATURE_STRIP_ITEMS.map((item, idx) => (
          <div key={idx} className="flex items-center sm:items-start gap-3.5 group">
            <div className="w-10 h-10 rounded-full bg-[#185535] border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105">
              {icons[item.iconName]}
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs sm:text-sm text-white tracking-wide leading-tight">
                {item.title}
              </h3>
              <p className="text-[11px] text-[#D1E7DD] leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
