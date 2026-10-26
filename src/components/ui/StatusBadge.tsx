"use client";

import React from "react";
import { getStatusBadgeClass } from "@/utils";
import { useTranslation } from "@/hooks/useTranslation";

export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const translationKey = `status.${status}`;
  const translated = t(translationKey);
  const displayLabel = translated !== translationKey ? translated : status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
        status
      )} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
