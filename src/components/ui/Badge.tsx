import React from "react";
import { STATUS_CONFIG } from "@/lib/constants";

interface BadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
  pulse?: boolean;
}

export function Badge({
  status,
  className = "",
  showDot = true,
  pulse = false,
}: BadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-slate-100/90 text-slate-700 border-slate-200/80",
    dotColor: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border tracking-wide uppercase shadow-2xs backdrop-blur-xs ${config.color} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor} ${
            pulse ? "animate-pulse" : ""
          }`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
