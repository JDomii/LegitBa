"use client";

import React, { useEffect, useState } from "react";
import { ReportImageModal } from "@/components/ReportImageModal";
import { StampConfirmModal } from "@/components/StampConfirmModal";
import { MarkFakeModal } from "@/components/MarkFakeModal";
import { Spinner, UsersIcon } from "@/components/Icons";
import { useDemoRole } from "@/components/RoleToggle";
import { StatusBadge } from "@/components/StatusBadge";
import { shortFingerprint } from "@/components/brand";
import { DEMO_ROLE_HEADER, formatDate } from "@/lib/constants";
import type { Report, ReportStatus } from "@/lib/types";

// Filter options at top of queue
const FILTER_OPTIONS: { value: "all" | "reported" | "under_review" | "resolved"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "reported", label: "Reported" },
  { value: "under_review", label: "Under review" },
  { value: "resolved", label: "Resolved" },
];

export default function QueuePage() {
  const role = useDemoRole();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal states
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [stampingReport, setStampingReport] = useState<Report | null>(null);
  const [fakingReport, setFakingReport] = useState<Report | null>(null);

  const [filter, setFilter] = useState<"all" | "reported" | "under_review" | "resolved">("all");

  useEffect(() => {
    let ignore = false;

    fetch("/api/reports")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reports");
        return res.json();
      })
      .then((data) => {
        if (!ignore && data) {
          setReports(data.reports || []);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoadFailed(true);
          setErrorMessage("Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: ReportStatus) => {
    setUpdatingId(id);
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          [DEMO_ROLE_HEADER]: role,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setErrorMessage(
          errorData?.error?.message || "Something went wrong. Please try again."
        );
        return;
      }

      const data = await res.json();
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: data.report.status } : r))
      );
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleModalSuccess = (updatedReport: Report, message: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
    );
    setNoticeMessage(message);
    setErrorMessage(null);
  };

  const visibleReports = reports.filter((r) => {
    if (filter === "all") return true;
    if (filter === "resolved") {
      return r.status === "resolved" || r.status === "fake" || r.status === "stamped";
    }
    return r.status === filter;
  });

  const viewingReport = reports.find((r) => r.id === viewingId) ?? null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-maroon-50 text-maroon-700 sm:h-16 sm:w-16">
            <UsersIcon className="h-7 w-7 sm:h-8 sm:w-8" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Community review queue
            </h1>
            <p className="mt-2 text-base text-navy-700 sm:text-lg">
              Click an image to inspect it. Under review items can be resolved as Real or Fake.
            </p>
          </div>
        </div>

        <div className="sm:w-48 sm:shrink-0">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "reported" | "under_review" | "resolved")}
            className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-semibold text-navy-900 focus:border-maroon-700 focus:outline-none"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-maroon-200 border-l-8 border-l-maroon-700 bg-maroon-50 p-4 font-semibold text-maroon-900"
          >
            {errorMessage}
          </div>
        )}

        {noticeMessage && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-300 border-l-8 border-l-emerald-600 bg-emerald-50 p-4 font-semibold text-emerald-900"
          >
            {noticeMessage}
          </div>
        )}

        {loading ? (
          <p role="status" className="flex items-center gap-2 text-navy-500">
            <Spinner className="h-5 w-5 text-maroon-700" /> Loading...
          </p>
        ) : loadFailed ? (
          <p role="alert" className="font-semibold text-maroon-800">
            Something went wrong. Please try again.
          </p>
        ) : reports.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-6 text-navy-500">
            No reports yet.
          </p>
        ) : visibleReports.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-6 text-navy-500">
            No reports found with this status.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {visibleReports.map((report) => {
              const isResolved =
                report.status === "fake" ||
                report.status === "stamped" ||
                report.status === "resolved";

              return (
                <li
                  key={report.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  {/* Clickable Image Thumbnail */}
                  <button
                    type="button"
                    onClick={() => setViewingId(report.id)}
                    aria-label={`View reported image ${report.fileName}`}
                    title="Click to zoom and inspect image"
                    className="group relative h-24 w-20 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-line bg-surface transition hover:ring-2 hover:ring-maroon-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.imageUrl}
                      alt={`Reported image ${report.fileName}`}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-navy-950/70 py-0.5 text-center text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                      View
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <h2 className="break-all text-base font-extrabold text-navy-900">
                      {report.fileName}
                    </h2>
                    <p className="mt-0.5 font-mono text-xs text-navy-500">
                      SHA-256: {shortFingerprint(report.sha256)}
                    </p>
                    <p className="mt-0.5 text-sm text-navy-700">
                      Reported: {formatDate(report.createdAt)}
                    </p>
                    {report.note && (
                      <p className="mt-1 break-words text-sm text-navy-700">
                        <span className="font-semibold text-navy-800">Note:</span> {report.note}
                      </p>
                    )}
                  </div>

                  {/* Actions & Status Column */}
                  <div className="flex flex-col items-start gap-2.5 sm:w-56 sm:shrink-0 sm:items-end">
                    <StatusBadge status={report.status} />

                    {/* Resolved State */}
                    {isResolved ? (
                      <div className="text-xs text-navy-600 sm:text-right">
                        <p className="font-medium">
                          {report.status === "stamped"
                            ? "Official record created (Authentic)."
                            : "Marked as fake announcement."}
                        </p>
                        {role === "official" && (
                          <button
                            type="button"
                            disabled={updatingId === report.id}
                            onClick={() => handleStatusChange(report.id, "under_review")}
                            className="mt-1 inline-block text-xs font-semibold text-maroon-700 underline hover:text-maroon-900 disabled:opacity-50"
                          >
                            Re-open to Under review
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Pending State: Reported or Under Review */
                      role === "official" && (
                        <div className="w-full space-y-2">
                          <label htmlFor={`status-${report.id}`} className="sr-only">
                            Update status for {report.fileName}
                          </label>
                          <div className="flex items-center gap-2">
                            {/* STRICTLY 2 OPTIONS: Reported and Under review */}
                            <select
                              id={`status-${report.id}`}
                              value={report.status}
                              disabled={updatingId === report.id}
                              onChange={(e) =>
                                handleStatusChange(report.id, e.target.value as ReportStatus)
                              }
                              className="min-h-10 w-full rounded-lg border border-line bg-white px-3 text-xs font-bold text-navy-900 focus:border-maroon-700 focus:outline-none disabled:opacity-60"
                            >
                              <option value="reported">Reported</option>
                              <option value="under_review">Under review</option>
                            </select>
                            {updatingId === report.id && (
                              <Spinner className="h-4 w-4 shrink-0 text-maroon-700" />
                            )}
                          </div>

                          {/* Stamp as Real and Mark as Fake ONLY show when Under Review */}
                          {report.status === "under_review" && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                disabled={updatingId === report.id}
                                onClick={() => setStampingReport(report)}
                                className="min-h-10 rounded-lg bg-emerald-600 px-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Stamp as Real
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === report.id}
                                onClick={() => setFakingReport(report)}
                                className="min-h-10 rounded-lg bg-red-600 px-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Mark as Fake
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Lightbox Image Modal */}
      {viewingReport && (
        <ReportImageModal report={viewingReport} onClose={() => setViewingId(null)} />
      )}

      {/* Stamp as Real Custom Popup */}
      {stampingReport && (
        <StampConfirmModal
          report={stampingReport}
          role={role}
          onClose={() => setStampingReport(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Mark as Fake Custom Popup */}
      {fakingReport && (
        <MarkFakeModal
          report={fakingReport}
          role={role}
          onClose={() => setFakingReport(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </main>
  );
}
