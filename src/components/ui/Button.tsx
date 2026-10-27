import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "group inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 cursor-pointer rounded-full select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5 min-h-[36px]",
    md: "px-6 py-2.5 text-xs sm:text-sm gap-2 min-h-[42px]",
    lg: "px-7 py-3.5 text-sm sm:text-base gap-2.5 min-h-[48px]",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#F28C1B] to-[#E2760C] hover:from-[#E07C0F] hover:to-[#D16904] text-white shadow-md shadow-[#F28C1B]/25 hover:shadow-xl hover:shadow-[#F28C1B]/35 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#F28C1B]",
    secondary:
      "bg-gradient-to-r from-[#1F4D36] to-[#143D29] hover:from-[#17422E] hover:to-[#0E2C1D] text-white shadow-md shadow-[#1F4D36]/25 hover:shadow-xl hover:shadow-[#1F4D36]/35 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#1F4D36]",
    outline:
      "bg-white/95 backdrop-blur-md border border-[#1F4D36]/30 text-[#1F4D36] hover:bg-[#1F4D36] hover:text-white hover:border-[#1F4D36] shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#1F4D36]",
    ghost:
      "bg-transparent text-[#1C2B24] hover:bg-[#1F4D36]/10 hover:text-[#1F4D36] focus-visible:outline-[#1F4D36]",
    glass:
      "bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 shadow-md hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-white",
  };

  const combined = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combined}>
        <span>{children}</span>
        {icon && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
      </Link>
    );
  }

  return (
    <button className={combined} {...props}>
      <span>{children}</span>
      {icon && <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
    </button>
  );
}
