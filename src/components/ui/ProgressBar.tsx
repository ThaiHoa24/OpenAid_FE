import React from "react";
import type { CSSProperties } from "react";
import styles from "@/styles/ProgressBar.module.css";

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "forest" | "gradient";
  className?: string;
  fillClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  variant = "gradient",
  className = "",
  fillClassName = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const variantFills = {
    primary: "bg-[#F28C1B]",
    forest: "bg-[#1F4D36]",
    gradient: "bg-gradient-to-r from-[#F28C1B] via-[#E2760C] to-[#1F4D36]",
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-[11px] font-bold text-[#1C2B24]">
          <span className="text-[#5F6F66]">Tiến độ tiếp nhận</span>
          <span className="text-[#1F4D36]">{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60 shadow-inner ${sizeClasses[size]} ${className}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${styles.fill} h-full rounded-full transition-all duration-700 ease-out shadow-xs ${variantFills[variant]} ${fillClassName}`}
          style={{ "--progress-value": `${percentage}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
