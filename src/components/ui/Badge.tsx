import React from "react";
import { STATUS_CONFIG } from "@/lib/constants";

interface BadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function Badge({ status, className = "", showDot = true }: BadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${config.color} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
