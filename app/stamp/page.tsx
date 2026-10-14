"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { CheckCircleIcon, FileIcon, Spinner, StampIcon } from "@/components/Icons";
import { useDemoRole } from "@/components/RoleToggle";
import { shortFingerprint } from "@/components/brand";
import { DEMO_ROLE_HEADER, formatDate } from "@/lib/constants";
import type { OfficialRecord } from "@/lib/types";

interface StampSuccess {
  record: OfficialRecord;
  alreadyStamped: boolean;
}

export default function StampPage() {
  const role = useDemoRole();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stampSuccess, setStampSuccess] = useState<StampSuccess | null>(null);

  const [recentRecords, setRecentRecords] = useState<OfficialRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState(false);

  const refreshRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/records");
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setRecentRecords(data.records || []);
      setRecordsError(false);
    } catch {
      setRecordsError(true);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch("/api/records")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch records");
        return res.json();
      })
      .then((data) => {
        if (!ignore && data) {
          setRecentRecords(data.records || []);
          setRecordsError(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setRecordsError(true);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingRecords(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please choose a PNG or JPG under 4 MB.");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Please provide a title.");
      return;
    }

    setErrorMessage(null);
    setStampSuccess(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("file", file);

      const res = await fetch("/api/stamp", {
        method: "POST",
        headers: {
          [DEMO_ROLE_HEADER]: role,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setErrorMessage(
          errorData?.error?.message || "Something went wrong. Please try again."
        );
        return;
      }

      const data = await res.json();
      setStampSuccess({
        record: data.record,
        alreadyStamped: Boolean(data.alreadyStamped),
      });
      setTitle("");
      setFile(null);
      refreshRecords();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-maroon-50 text-maroon-700 sm:h-16 sm:w-16">
          <StampIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Stamp an official file
          </h1>
          <p className="mt-2 text-base text-navy-700 sm:text-lg">
            Upload a real announcement image to create a verified record.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Left: upload and stamp */}
        <section className="lg:col-span-2">
          {role === "public" ? (
            <div
              role="status"
              className="rounded-2xl border border-amber-300 border-l-8 border-l-amber-500 bg-amber-50 p-5 text-amber-950"
            >
              <p className="text-lg font-bold">
                Official access required. Use the Demo mode switch in the header.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-maroon-200 border-l-8 border-l-maroon-700 bg-maroon-50 p-4 font-semibold text-maroon-900"
                >
                  {errorMessage}
                </div>
              )}

              {stampSuccess && (
                <div
                  role="status"
                  className="mb-5 flex gap-3 rounded-xl border border-emerald-300 border-l-8 border-l-emerald-600 bg-emerald-50 p-4 text-emerald-950"
                >
                  <CheckCircleIcon className="h-7 w-7 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold">
                      {stampSuccess.alreadyStamped
                        ? `Already stamped on ${formatDate(stampSuccess.record.stampedAt)}.`
                        : "Stamped"}
                    </h2>
                    <div className="mt-1 space-y-1 text-sm">
                      <p className="break-words">
                        <span className="font-bold">Title:</span> {stampSuccess.record.title}
                      </p>
                      <p>
                        <span className="font-bold">Digital fingerprint:</span>{" "}
                        <code className="font-mono">{shortFingerprint(stampSuccess.record.sha256)}</code>
                      </p>
                      {!stampSuccess.alreadyStamped && (
                        <p>
                          <span className="font-bold">Stamped at:</span>{" "}
                          {formatDate(stampSuccess.record.stampedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <span className="mb-2 block text-sm font-bold text-navy-900">File</span>
                  {file ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <FileIcon className="h-8 w-8 shrink-0 text-maroon-700" />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-navy-900">{file.name}</p>
                          <p className="text-xs text-navy-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        disabled={submitting}
                        className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-bold text-maroon-700 hover:bg-maroon-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <FileDrop
                      onFileSelected={(f) => {
                        setErrorMessage(null);
                        setFile(f);
                      }}
                      onError={(err) => setErrorMessage(err)}
                      disabled={submitting}
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-bold text-navy-900">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    required
                    placeholder="e.g. Enrollment Schedule, Important Announcement"
                    className="min-h-12 w-full rounded-lg border border-line bg-white px-3 text-base text-navy-900 placeholder:text-navy-500/70 focus:border-maroon-700 focus:outline-none focus:ring-2 focus:ring-maroon-700/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !file || !title.trim()}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-maroon-700 px-4 text-base font-bold text-white hover:bg-maroon-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && <Spinner className="h-5 w-5" />}
                  {submitting ? "Stamping..." : "Stamp file"}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Right: recent records */}
        <section className="lg:col-span-3">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-navy-900">Recent stamps</h2>

            {loadingRecords ? (
              <p role="status" className="mt-4 flex items-center gap-2 text-navy-500">
                <Spinner className="h-5 w-5 text-maroon-700" /> Loading...
              </p>
            ) : recordsError ? (
              <p role="alert" className="mt-4 font-semibold text-maroon-800">
                Something went wrong. Please try again.
              </p>
            ) : recentRecords.length === 0 ? (
              <p className="mt-4 text-navy-500">No stamped files yet.</p>
            ) : (
              <>
                {/* Table on larger screens */}
                <table className="mt-4 hidden w-full text-left text-sm md:table">
                  <thead>
                    <tr className="bg-surface text-xs font-bold uppercase tracking-wide text-navy-500">
                      <th scope="col" className="px-3 py-2">Title</th>
                      <th scope="col" className="px-3 py-2">Date Stamped</th>
                      <th scope="col" className="px-3 py-2">File Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecords.map((rec) => (
                      <tr key={rec.id} className="border-b border-line align-top last:border-0">
                        <td className="px-3 py-3">
                          <p className="font-bold text-navy-900">{rec.title}</p>
                          <code className="font-mono text-xs text-navy-500">
                            {shortFingerprint(rec.sha256)}
                          </code>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-navy-700">
                          {formatDate(rec.stampedAt)}
                        </td>
                        <td className="break-all px-3 py-3 text-navy-700">{rec.fileName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Stacked cards on small screens */}
                <ul className="mt-4 space-y-3 md:hidden">
                  {recentRecords.map((rec) => (
                    <li key={rec.id} className="rounded-xl border border-line p-4">
                      <p className="font-bold text-navy-900">{rec.title}</p>
                      <p className="mt-1 text-sm text-navy-700">{formatDate(rec.stampedAt)}</p>
                      <p className="break-all text-sm text-navy-700">{rec.fileName}</p>
                      <code className="mt-1 block font-mono text-xs text-navy-500">
                        {shortFingerprint(rec.sha256)}
                      </code>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
