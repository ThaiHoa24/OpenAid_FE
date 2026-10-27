import type { CSSProperties } from "react";
import styles from "@/styles/ProgressBar.module.css";

interface ProgressBarProps {
  value: number;
  className?: string;
  fillClassName?: string;
}

export function ProgressBar({
  value,
  className,
  fillClassName = "",
}: ProgressBarProps) {
  return (
    <div className={className}>
      <div
        className={`${styles.fill} ${fillClassName}`}
        style={{ "--progress-value": `${value}%` } as CSSProperties}
      />
    </div>
  );
}
