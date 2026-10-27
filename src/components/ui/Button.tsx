import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
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
    "inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer rounded-full select-none focus-visible:outline-2 focus-visible:outline-offset-2";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5 min-h-[36px]",
    md: "px-6 py-3 text-sm gap-2 min-h-[44px]",
    lg: "px-8 py-4 text-base gap-2.5 min-h-[48px]",
  };

  const variantStyles = {
    primary:
      "bg-[#F28C1B] hover:bg-[#E07C0F] text-white shadow-md shadow-[#F28C1B]/25 hover:shadow-lg hover:shadow-[#F28C1B]/35 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#F28C1B]",
    secondary:
      "bg-[#1F4D36] hover:bg-[#133724] text-white shadow-md shadow-[#1F4D36]/20 hover:shadow-lg hover:shadow-[#1F4D36]/30 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-[#1F4D36]",
    outline:
      "bg-transparent border-2 border-[#1F4D36] text-[#1F4D36] hover:bg-[#1F4D36] hover:text-white focus-visible:outline-[#1F4D36]",
    ghost:
      "bg-transparent text-[#1C2B24] hover:bg-[#E6EFE3]/60 focus-visible:outline-[#1F4D36]",
  };

  const combined = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combined}>
        <span>{children}</span>
        {icon && <span className="shrink-0">{icon}</span>}
      </Link>
    );
  }

  return (
    <button className={combined} {...props}>
      <span>{children}</span>
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
