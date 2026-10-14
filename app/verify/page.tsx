"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileDrop } from "@/components/FileDrop";
import { ResultBanner } from "@/components/ResultBanner";
import { RecordDetailsModal } from "@/components/RecordDetailsModal";
import { CheckCircleIcon, SearchIcon, Spinner } from "@/components/Icons";
import { sha256Hex } from "@/lib/hash";
import type { OfficialRecord, ReportStatus } from "@/lib/types";

interface VerifyResult {
  status: "match" | "no_match";
  record?: OfficialRecord;
}

interface ReportResult {
  report: {
    id: string;
    sha256: string;
    fileName: string;
    status: ReportStatus;
    note: string | null;
    createdAt: string;
    imageUrl: string;
  };
  alreadyReported: boolean;
  status: string;
}

const solidButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-maroon-700 px-6 text-sm font-bold text-white transition hover:bg-maroon-800 disabled:cursor-not-allowed disabled:opacity-50";
const outlineButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-6 text-sm font-bold text-navy-900 transition hover:bg-surface";

const STATUS_LABELS: Record<string, string> = {
  reported: "Reported",
  under_review: "Under review",
  resolved: "Resolved",
};

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setVerifyResult(null);
    setReportResult(null);
    setShowDetails(false);
    setLoading(true);

    try {
      let hash = "";
      try {
        hash = await sha256Hex(selectedFile);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === "HTTPS_REQUIRED") {
          setErrorMessage("Please open this page over HTTPS.");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha256: hash }),
      });

      if (!res.ok) {
        setErrorMessage("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setVerifyResult(data);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!file || submittingReport) return;
    setSubmittingReport(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 409 && errorData?.error?.code === "ALREADY_OFFICIAL") {
          setErrorMessage("This file is an official record.");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
        return;
      }

      const data = await res.json();
      setReportResult({
        report: data.report,
        alreadyReported: Boolean(data.alreadyReported),
        status: data.report?.status || "reported",
      });
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setErrorMessage(null);
    setVerifyResult(null);
    setReportResult(null);
    setShowDetails(false);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-maroon-50 text-maroon-700 sm:h-16 sm:w-16">
          <SearchIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Verify an image
          </h1>
          <p className="mt-2 text-base leading-relaxed text-navy-700 sm:text-lg">
            Upload an image you found online. We compare its digital fingerprint with official records. Your image stays on your device unless you choose to report it.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-maroon-200 border-l-8 border-l-maroon-700 bg-maroon-50 p-4 font-semibold text-maroon-900"
          >
            {errorMessage}
          </div>
        )}

        {loading && (
          <div
            role="status"
            className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-6"
          >
            <Spinner className="h-10 w-10 shrink-0 text-maroon-700" />
            <div className="min-w-0">
              <p className="text-xl font-bold text-navy-900">Checking...</p>
              {file && <p className="truncate text-sm text-navy-500">{file.name}</p>}
            </div>
          </div>
        )}

        {!loading && !verifyResult && (
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
            <FileDrop
              onFileSelected={handleFileSelected}
              onError={(msg) => setErrorMessage(msg)}
            />
          </div>
        )}

        {!loading && verifyResult && (
          <>
            {verifyResult.status === "match" && (
              <ResultBanner status="match" record={verifyResult.record}>
                <button type="button" onClick={() => setShowDetails(true)} className={solidButton}>
                  View Details
                </button>
                <button type="button" onClick={handleReset} className={outlineButton}>
                  Check another image
                </button>
              </ResultBanner>
            )}

            {verifyResult.status === "no_match" && (
              <ResultBanner status="no_match">
                {!reportResult && (
                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={submittingReport}
                    className={solidButton}
                  >
                    {submittingReport ? "Submitting..." : "Submit for community review"}
                  </button>
                )}
                <button type="button" onClick={handleReset} className={outlineButton}>
                  Check another image
                </button>
              </ResultBanner>
            )}

            {verifyResult.status === "no_match" && reportResult && (
              <div
                role="status"
                className="flex gap-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950"
              >
                <CheckCircleIcon className="h-8 w-8 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-lg font-bold sm:text-xl">
                    {reportResult.alreadyReported
                      ? `This image was already reported. Status: ${
                          STATUS_LABELS[reportResult.status] || reportResult.status
                        }.`
                      : "Submitted for review. Status: Reported."}
                  </p>
                  <Link
                    href="/queue"
                    className="mt-2 inline-flex min-h-11 items-center text-base font-bold text-maroon-700 underline"
                  >
                    View the queue
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showDetails && verifyResult?.record && (
        <RecordDetailsModal record={verifyResult.record} onClose={() => setShowDetails(false)} />
      )}
    </main>
  );
}
