export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { SIGNED_URL_TTL_SECONDS } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  mapReportRow,
  type ReportRow,
} from "@/lib/types";
import { validateFile, validateNote } from "@/lib/validateFile";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to fetch reports." } },
        { status: 500 }
      );
    }

    const rows = (data as ReportRow[]) || [];
    if (rows.length === 0) {
      return NextResponse.json({ reports: [] });
    }

    const paths = rows.map((r) => r.storage_path);
    const { data: signedUrls, error: signedError } = await supabase.storage
      .from("report-files")
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    if (signedError || !signedUrls) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to create image URLs." } },
        { status: 500 }
      );
    }

    const urlMap = new Map(signedUrls.map((item) => [item.path, item.signedUrl]));
    const reports = rows.map((row) =>
      mapReportRow(row, urlMap.get(row.storage_path) || "")
    );

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid form data." } },
        { status: 400 }
      );
    }

    const fileEntry = formData.get("file");
    const noteEntry = formData.get("note");

    const fileValidation = validateFile(fileEntry);
    if (!fileValidation.valid) {
      const status = fileValidation.code === "FILE_TOO_LARGE" ? 413 : 400;
      return NextResponse.json(
        { error: { code: fileValidation.code, message: fileValidation.message } },
        { status }
      );
    }

    const noteValidation = validateNote(noteEntry);
    if (!noteValidation.valid) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: noteValidation.message } },
        { status: 400 }
      );
    }

    const { file, ext } = fileValidation;
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(buffer).digest("hex");

    const supabase = getSupabaseServerClient();

    // Check if the hash matches a Verified Record
    const { data: officialRecord, error: officialCheckError } = await supabase
      .from("verified_records")
      .select("id")
      .eq("sha256", sha256)
      .maybeSingle();

    if (officialCheckError) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Database query failed." } },
        { status: 500 }
      );
    }

    if (officialRecord) {
      return NextResponse.json(
        { error: { code: "ALREADY_OFFICIAL", message: "This file is an official record." } },
        { status: 409 }
      );
    }

    // Check if a report with this hash exists
    const { data: existingReport, error: reportCheckError } = await supabase
      .from("reports")
      .select("*")
      .eq("sha256", sha256)
      .maybeSingle<ReportRow>();

    if (reportCheckError) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Database query failed." } },
        { status: 500 }
      );
    }

    if (existingReport) {
      const { data: signedData } = await supabase.storage
        .from("report-files")
        .createSignedUrl(existingReport.storage_path, SIGNED_URL_TTL_SECONDS);

      return NextResponse.json({
        report: mapReportRow(existingReport, signedData?.signedUrl || ""),
        alreadyReported: true,
      });
    }

    const reportId = randomUUID();
    const storagePath = `${reportId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("report-files")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "File upload failed." } },
        { status: 500 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("reports")
      .insert({
        id: reportId,
        sha256,
        file_name: file.name,
        storage_path: storagePath,
        note: noteValidation.note,
        status: "reported",
      })
      .select("*")
      .single<ReportRow>();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existingAfterConflict } = await supabase
          .from("reports")
          .select("*")
          .eq("sha256", sha256)
          .single<ReportRow>();

        if (existingAfterConflict) {
          const { data: conflictSignedData } = await supabase.storage
            .from("report-files")
            .createSignedUrl(existingAfterConflict.storage_path, SIGNED_URL_TTL_SECONDS);

          return NextResponse.json({
            report: mapReportRow(existingAfterConflict, conflictSignedData?.signedUrl || ""),
            alreadyReported: true,
          });
        }
      }

      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to record report." } },
        { status: 500 }
      );
    }

    const { data: signedData } = await supabase.storage
      .from("report-files")
      .createSignedUrl(inserted.storage_path, SIGNED_URL_TTL_SECONDS);

    return NextResponse.json({
      report: mapReportRow(inserted, signedData?.signedUrl || ""),
      alreadyReported: false,
    });
  } catch (err) {
    console.error("POST /api/reports error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
