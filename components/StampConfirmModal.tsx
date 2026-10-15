"use client";

import React, { useEffect, useRef, useState } from "react";
import { CloseIcon, Spinner, StampIcon } from "@/components/Icons";
import { DEMO_ROLE_HEADER, formatDate } from "@/lib/constants";
import type { Report } from "@/lib/types";

interface StampConfirmModalProps {
  report: Report;
  role: string;
  onClose: () => void;
  onSuccess: (updatedReport: Report, message: string) => void;
}

export function StampConfirmModal({
  report,
  role,
  onClose,
  onSuccess,
}: StampConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const defaultTitle = report.fileName.replace(/\.[^.]+$/, "").slice(0, 120);
  const [title, setTitle] = useState(defaultTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length < 1 || trimmed.length > 120) {
      setError("Title must be between 1 and 120 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${report.id}/stamp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [DEMO_ROLE_HEADER]: role,
        },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setError(
          errorData?.error?.message || "Failed to stamp this document. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      onSuccess(
        data.report,
        `"${report.fileName}" was officially stamped and resolved as Real.`
      );
      onClose();
    } catch {
      setError("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="stamp-modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current && !isSubmitting) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-white p-0 text-navy-900 shadow-2xl backdrop:bg-navy-900/60"
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <StampIcon className="h-5 w-5" />
            </span>
            <h2 id="stamp-modal-title" className="text-lg font-extrabold text-navy-900">
              Stamp Document as Real
            </h2>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-navy-500 hover:bg-surface disabled:opacity-40"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-5">
          {/* Document Preview Card */}
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.imageUrl}
                alt={report.fileName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-bold text-navy-900 sm:text-sm">{report.fileName}</p>
              <p className="text-navy-500">Reported: {formatDate(report.createdAt)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900">
            <p className="font-bold">Official Stamping Action:</p>
            <p className="mt-1">
              This image will be copied to official university records. Any student or verifier who
              checks this image on LegitBa? in the future will receive an <strong>Authentic</strong> verdict.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="stamp-title" className="text-xs font-bold uppercase tracking-wider text-navy-700">
                Official Record Title <span className="text-maroon-700">*</span>
              </label>
              <span className="text-xs text-navy-500">{title.length}/120</span>
            </div>
            <input
              id="stamp-title"
              type="text"
              value={title}
              disabled={isSubmitting}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office Memorandum No. 74 - Student Guidelines"
              className="mt-1.5 min-h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-navy-900 placeholder:text-navy-400 focus:border-maroon-700 focus:outline-none focus:ring-1 focus:ring-maroon-700 disabled:bg-surface"
              autoFocus
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-line bg-surface/50 px-6 py-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="min-h-10 rounded-lg border border-line bg-white px-4 text-xs font-bold text-navy-700 transition hover:bg-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || title.trim().length === 0}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                <span>Stamping...</span>
              </>
            ) : (
              <>
                <StampIcon className="h-4 w-4" />
                <span>Confirm &amp; Stamp as Real</span>
              </>
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
}
