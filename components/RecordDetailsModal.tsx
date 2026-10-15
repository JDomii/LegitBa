"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, CloseIcon } from "@/components/Icons";
import { formatDate } from "@/lib/constants";
import type { OfficialRecord } from "@/lib/types";

interface RecordDetailsModalProps {
  record: OfficialRecord;
  onClose: () => void;
}

export function RecordDetailsModal({ record, onClose }: RecordDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomIn, setZoomIn] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="record-details-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-2xl border border-line bg-white p-0 text-navy-900 shadow-2xl backdrop:bg-navy-900/60"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 id="record-details-title" className="text-lg font-extrabold text-navy-900">
              Official Stamped Record
            </h2>
            <p className="text-xs text-navy-500">Verified institutional announcement</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-navy-500 hover:bg-surface"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
        {/* Left: Image preview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-500">
              Document Preview
            </span>
            {record.imageUrl && (
              <a
                href={record.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-maroon-700 hover:underline"
              >
                <span>Open raw image</span>
                <span aria-hidden="true">&nearr;</span>
              </a>
            )}
          </div>

          <div className="relative flex max-h-[55vh] min-h-60 flex-1 items-center justify-center overflow-auto rounded-xl border border-line bg-neutral-900/5 p-3">
            {record.imageUrl ? (
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={record.imageUrl}
                  alt={record.title}
                  onClick={() => setZoomIn(!zoomIn)}
                  style={{
                    maxHeight: zoomIn ? "none" : "50vh",
                    width: zoomIn ? "100%" : "auto",
                  }}
                  className="cursor-zoom-in rounded-lg border border-line bg-white shadow transition-all duration-200"
                  title="Click to toggle size"
                />
                <span className="mt-2 text-[11px] text-navy-400">
                  {zoomIn ? "Click image to shrink" : "Click image to expand"}
                </span>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-navy-500">
                <p className="font-semibold">No direct image preview available.</p>
                <p className="mt-1 text-navy-400 font-mono text-[11px]">Storage: {record.fileName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Metadata details */}
        <div className="flex flex-col justify-between space-y-4">
          <dl className="space-y-3.5">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-navy-500">
                Announcement Title
              </dt>
              <dd className="mt-1 text-base font-extrabold text-navy-900">{record.title}</dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-navy-500">
                Original File Name
              </dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-navy-800">
                {record.fileName}
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-navy-500">
                  Stamped By
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-navy-900">{record.stampedBy}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-navy-500">
                  Date Stamped
                </dt>
                <dd className="mt-0.5 text-sm text-navy-700">{formatDate(record.stampedAt)}</dd>
              </div>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-navy-500">
                SHA-256 Digital Fingerprint
              </dt>
              <dd className="mt-1">
                <code className="block break-all rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 font-mono text-xs font-bold text-emerald-900">
                  {record.sha256}
                </code>
              </dd>
            </div>
          </dl>

          <div className="rounded-xl border border-line bg-surface p-3 text-xs text-navy-600">
            <span className="font-bold text-navy-900">Cryptographic Proof:</span> Any digital file
            with this exact SHA-256 hash is identical down to the byte and officially authentic.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end border-t border-line bg-surface/50 px-5 py-3.5">
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-lg bg-navy-900 px-6 text-xs font-bold text-white transition hover:bg-navy-800"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
