import React from "react";
import type { ReportStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ReportStatus;
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  reported: "Reported",
  under_review: "Under review",
  resolved: "Resolved",
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  reported: "bg-maroon-100 text-maroon-800 border-maroon-200",
  under_review: "bg-amber-100 text-amber-900 border-amber-300",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const colorClasses = STATUS_STYLES[status] || "bg-surface text-navy-700 border-line";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${colorClasses}`}
    >
      {label}
    </span>
  );
}
