"use client";

import React, { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/Icons";
import { formatDate } from "@/lib/constants";
import type { OfficialRecord } from "@/lib/types";

interface RecordDetailsModalProps {
  record: OfficialRecord;
  onClose: () => void;
}

// Shows the full verified record returned by the API (native <dialog>:
// Esc closes it, and focus stays inside while it is open).
export function RecordDetailsModal({ record, onClose }: RecordDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Title", value: record.title },
    { label: "File name", value: record.fileName },
    { label: "Stamped by", value: record.stampedBy },
    { label: "Date stamped", value: formatDate(record.stampedAt) },
    {
      label: "SHA-256 fingerprint",
      value: <code className="break-all font-mono text-sm">{record.sha256}</code>,
    },
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="record-details-title"
      onClose={onClose}
      onClick={(e) => {
        // click on the dimmed backdrop closes the dialog
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-white p-0 text-navy-900 shadow-xl backdrop:bg-navy-900/50"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="record-details-title" className="text-lg font-extrabold text-navy-900">
          Official record details
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-500 hover:bg-surface"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <dl className="space-y-3 px-5 py-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-bold uppercase tracking-wide text-navy-500">{row.label}</dt>
            <dd className="mt-0.5 break-words text-base text-navy-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-line px-5 py-4 text-right">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-lg bg-maroon-700 px-6 text-sm font-bold text-white hover:bg-maroon-800"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
