"use client";

import React, { useEffect, useState } from "react";
import { Spinner, UsersIcon } from "@/components/Icons";
import { useDemoRole } from "@/components/RoleToggle";
import { StatusBadge } from "@/components/StatusBadge";
import { shortFingerprint } from "@/components/brand";
import { DEMO_ROLE_HEADER, formatDate } from "@/lib/constants";
import type { Report, ReportStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ReportStatus>("all");

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

  const visibleReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

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
              Review reported images and update their status.
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
            onChange={(e) => setFilter(e.target.value as "all" | ReportStatus)}
            className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-semibold text-navy-900 focus:border-maroon-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
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
            No reports with this status.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {visibleReports.map((report) => (
              <li
                key={report.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.imageUrl}
                    alt={`Reported image ${report.fileName}`}
                    className="h-full w-full object-cover"
                  />
                </div>

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
                    <p className="mt-1 break-words text-sm text-navy-700">Note: {report.note}</p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 sm:w-44 sm:shrink-0 sm:items-end">
                  <StatusBadge status={report.status} />
                  {role === "official" && (
                    <div className="w-full">
                      <label htmlFor={`status-${report.id}`} className="sr-only">
                        Update status for {report.fileName}
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          id={`status-${report.id}`}
                          value={report.status}
                          disabled={updatingId === report.id}
                          onChange={(e) =>
                            handleStatusChange(report.id, e.target.value as ReportStatus)
                          }
                          className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-semibold text-navy-900 focus:border-maroon-700 focus:outline-none disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {updatingId === report.id && (
                          <Spinner className="h-5 w-5 shrink-0 text-maroon-700" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
