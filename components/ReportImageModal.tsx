"use client";

import React, { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/Icons";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/constants";
import type { Report } from "@/lib/types";

interface ReportImageModalProps {
  report: Report;
  onClose: () => void;
}

export function ReportImageModal({ report, onClose }: ReportImageModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState<number>(100); // percentage: 50% to 250%
  const [fitMode, setFitMode] = useState<boolean>(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const handleZoomIn = () => {
    setFitMode(false);
    setZoom((prev) => Math.min(prev + 25, 250));
  };

  const handleZoomOut = () => {
    setFitMode(false);
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setFitMode(false);
    setZoom(100);
  };

  const toggleFitMode = () => {
    setFitMode((prev) => !prev);
    if (!fitMode) {
      setZoom(100);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="report-image-title"
      onClose={onClose}
      onClick={(e) => {
        // click on the dimmed backdrop closes the dialog
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-5xl rounded-2xl border border-line bg-white p-0 text-navy-900 shadow-2xl backdrop:bg-navy-900/60"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 id="report-image-title" className="truncate text-lg font-extrabold text-navy-900">
            {report.fileName}
          </h2>
          <p className="mt-0.5 text-xs text-navy-500 sm:text-sm">
            Reported: {formatDate(report.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={report.status} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-500 transition hover:bg-surface hover:text-navy-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface/70 px-5 py-2.5 text-xs font-semibold text-navy-700">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-navy-500">Zoom:</span>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={fitMode || zoom <= 50}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-base font-bold text-navy-800 transition hover:bg-surface disabled:opacity-40"
            title="Zoom out"
          >
            &minus;
          </button>
          <span className="inline-block min-w-12 text-center font-mono font-bold text-navy-900">
            {fitMode ? "Fit" : `${zoom}%`}
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={fitMode || zoom >= 250}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-base font-bold text-navy-800 transition hover:bg-surface disabled:opacity-40"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-navy-700 transition hover:bg-surface"
          >
            100%
          </button>
          <button
            type="button"
            onClick={toggleFitMode}
            className={`rounded-md border px-2.5 py-1.5 text-xs font-bold transition ${
              fitMode
                ? "border-maroon-700 bg-maroon-50 text-maroon-700"
                : "border-line bg-white text-navy-700 hover:bg-surface"
            }`}
          >
            {fitMode ? "✓ Fitted" : "Fit to screen"}
          </button>
        </div>

        <a
          href={report.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-1.5 font-bold text-maroon-700 transition hover:bg-maroon-50"
        >
          <span>Open raw image in new tab</span>
          <span aria-hidden="true">&nearr;</span>
        </a>
      </div>

      {/* Main Image Viewing Canvas */}
      <div className="relative max-h-[72vh] overflow-auto bg-neutral-900/5 p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.imageUrl}
            alt={`Reported announcement ${report.fileName}`}
            style={{
              width: fitMode ? "auto" : `${zoom}%`,
              maxWidth: fitMode ? "100%" : "none",
              maxHeight: fitMode ? "68vh" : "none",
              objectFit: fitMode ? "contain" : undefined,
            }}
            className="rounded-lg border border-line bg-white shadow-md transition-all duration-150"
          />
        </div>
      </div>

      {/* Note footer if present */}
      {report.note && (
        <div className="border-t border-line bg-surface/40 px-5 py-3 text-sm text-navy-700">
          <span className="font-bold text-navy-900">Reporter Note:</span> {report.note}
        </div>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="text-xs text-navy-500">
          Tip: Use the zoom buttons or open the raw image in a new tab to inspect fine details.
        </span>
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-lg bg-navy-900 px-5 text-sm font-bold text-white transition hover:bg-navy-800"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
