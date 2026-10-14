import React from "react";
import { formatDate } from "@/lib/constants";
import { AlertIcon, CheckCircleIcon } from "@/components/Icons";
import { shortFingerprint } from "@/components/brand";
import type { OfficialRecord } from "@/lib/types";

interface ResultBannerProps {
  status: "match" | "no_match";
  record?: OfficialRecord;
  // Action buttons shown inside the banner (View Details, Submit for community review, ...)
  children?: React.ReactNode;
}

export function ResultBanner({ status, record, children }: ResultBannerProps) {
  if (status === "match" && record) {
    return (
      <section
        role="status"
        className="pop-in w-full rounded-2xl border border-emerald-300 border-l-8 border-l-emerald-600 bg-emerald-50 p-5 text-emerald-950 shadow-sm sm:p-8"
      >
        <div className="flex gap-4">
          <CheckCircleIcon className="h-10 w-10 shrink-0 text-emerald-600 sm:h-12 sm:w-12" />
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-emerald-800 sm:text-4xl">
              Authentic
            </h2>
            <p className="mt-2 text-lg font-medium leading-snug sm:text-xl">
              This exact file was stamped by {record.stampedBy} on {formatDate(record.stampedAt)}.
            </p>
            <dl className="mt-5 space-y-2 rounded-xl border border-emerald-200 bg-white/70 p-4 text-base">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                <dt className="font-bold">Title:</dt>
                <dd className="break-words">{record.title}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <dt className="font-bold">Digital fingerprint:</dt>
                <dd>
                  <code className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-sm font-semibold tracking-wide">
                    {shortFingerprint(record.sha256)}
                  </code>
                </dd>
              </div>
            </dl>
            {children && <div className="mt-5 flex flex-col gap-3 sm:flex-row">{children}</div>}
          </div>
        </div>
      </section>
    );
  }

  if (status === "no_match") {
    return (
      <section
        role="status"
        className="pop-in w-full rounded-2xl border border-amber-300 border-l-8 border-l-amber-500 bg-amber-50 p-5 text-amber-950 shadow-sm sm:p-8"
      >
        <div className="flex gap-4">
          <AlertIcon className="h-10 w-10 shrink-0 text-amber-600 sm:h-12 sm:w-12" />
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">
              No official record found
            </h2>
            <p className="mt-2 text-lg font-medium leading-relaxed sm:text-xl">
              This file doesn&apos;t match any official record. That can mean it was edited, or that a real file was re-saved, screenshotted, or compressed by a social platform. It does not mean the image is fake.
            </p>
            {children && <div className="mt-5 flex flex-col gap-3 sm:flex-row">{children}</div>}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
