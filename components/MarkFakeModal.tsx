"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertIcon, CloseIcon, Spinner } from "@/components/Icons";
import { DEMO_ROLE_HEADER, formatDate } from "@/lib/constants";
import type { Report } from "@/lib/types";

interface MarkFakeModalProps {
  report: Report;
  role: string;
  onClose: () => void;
  onSuccess: (updatedReport: Report, message: string) => void;
}

export function MarkFakeModal({
  report,
  role,
  onClose,
  onSuccess,
}: MarkFakeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          [DEMO_ROLE_HEADER]: role,
        },
        body: JSON.stringify({ status: "fake" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setError(
          errorData?.error?.message || "Failed to update status. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      onSuccess(
        data.report,
        `"${report.fileName}" was resolved and marked as Fake.`
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
      aria-labelledby="fake-modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current && !isSubmitting) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-white p-0 text-navy-900 shadow-2xl backdrop:bg-navy-900/60"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5 text-red-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertIcon className="h-5 w-5" />
            </span>
            <h2 id="fake-modal-title" className="text-lg font-extrabold text-navy-900">
              Mark Document as Fake
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

          <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-900">
            <p className="font-bold">Are you sure you want to mark this announcement as Fake?</p>
            <p className="mt-1 text-red-800">
              The status of this item will be updated to <strong>Resolved (Fake)</strong>, indicating that
              officials have verified it is unauthorized or fabricated.
            </p>
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
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                <span>Marking as Fake...</span>
              </>
            ) : (
              <>
                <AlertIcon className="h-4 w-4" />
                <span>Confirm Mark as Fake</span>
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
