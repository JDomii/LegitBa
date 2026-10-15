export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { MOCK_OFFICIAL_NAME, SIGNED_URL_TTL_SECONDS } from "@/lib/constants";
import { isOfficialRequest } from "@/lib/mockSession";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  mapOfficialRecordRow,
  mapReportRow,
  type OfficialRecordRow,
  type ReportRow,
  StampReportRequest,
} from "@/lib/types";
import { validateTitle } from "@/lib/validateFile";

type RouteProps = {
  params: Promise<{ id: string }>;
};

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

// Official stamps a reported image: the reported file becomes a verified record
// (so /verify will show it as Authentic) and the report is marked "stamped".
export async function POST(request: Request, props: RouteProps) {
  try {
    if (!isOfficialRequest(request)) {
      return errorResponse("FORBIDDEN", "Official access required.", 403);
    }

    const { id } = await props.params;
    const body = await request.json().catch(() => null);
    const parsedBody = StampReportRequest.safeParse(body);
    if (!parsedBody.success) {
      return errorResponse("INVALID_REQUEST", "Title is required.", 400);
    }

    const titleValidation = validateTitle(parsedBody.data.title);
    if (!titleValidation.valid) {
      return errorResponse("INVALID_REQUEST", titleValidation.message, 400);
    }

    const supabase = getSupabaseServerClient();

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle<ReportRow>();

    if (reportError) {
      return errorResponse("SERVER_ERROR", "Failed to load report.", 500);
    }
    if (!report) {
      return errorResponse("NOT_FOUND", "Report not found.", 404);
    }

    // The same file may already be an official record (e.g. stamped from /stamp).
    const { data: existing, error: existingError } = await supabase
      .from("verified_records")
      .select("*")
      .eq("sha256", report.sha256)
      .maybeSingle<OfficialRecordRow>();

    if (existingError) {
      return errorResponse("SERVER_ERROR", "Database query failed.", 500);
    }

    let recordRow = existing;
    let alreadyStamped = Boolean(existing);

    if (!recordRow) {
      const { data: blob, error: downloadError } = await supabase.storage
        .from("report-files")
        .download(report.storage_path);

      if (downloadError || !blob) {
        return errorResponse("SERVER_ERROR", "Failed to read the reported file.", 500);
      }

      const buffer = Buffer.from(await blob.arrayBuffer());
      const ext = report.storage_path.split(".").pop() || "png";
      const recordId = randomUUID();
      const storagePath = `${recordId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("official-files")
        .upload(storagePath, buffer, {
          contentType: blob.type || (ext === "png" ? "image/png" : "image/jpeg"),
          upsert: false,
        });

      if (uploadError) {
        return errorResponse("SERVER_ERROR", "File upload failed.", 500);
      }

      const { data: inserted, error: insertError } = await supabase
        .from("verified_records")
        .insert({
          id: recordId,
          sha256: report.sha256,
          title: titleValidation.title,
          file_name: report.file_name,
          storage_path: storagePath,
          stamped_by: MOCK_OFFICIAL_NAME,
        })
        .select("*")
        .single<OfficialRecordRow>();

      if (insertError) {
        // Clean up the copy we just uploaded, it has no record pointing to it.
        await supabase.storage.from("official-files").remove([storagePath]);

        if (insertError.code === "23505") {
          // Someone stamped the same file at the same moment: reuse that record.
          const { data: conflicting } = await supabase
            .from("verified_records")
            .select("*")
            .eq("sha256", report.sha256)
            .single<OfficialRecordRow>();
          if (conflicting) {
            recordRow = conflicting;
            alreadyStamped = true;
          }
        }

        if (!recordRow) {
          return errorResponse("SERVER_ERROR", "Failed to record stamp.", 500);
        }
      } else {
        recordRow = inserted;
        alreadyStamped = false;
      }
    }

    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update({ status: "stamped", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single<ReportRow>();

    if (updateError || !updatedReport) {
      return errorResponse("SERVER_ERROR", "Failed to update report status.", 500);
    }

    const { data: signedData } = await supabase.storage
      .from("report-files")
      .createSignedUrl(updatedReport.storage_path, SIGNED_URL_TTL_SECONDS);

    return NextResponse.json({
      record: mapOfficialRecordRow(recordRow!),
      report: mapReportRow(updatedReport, signedData?.signedUrl || ""),
      alreadyStamped,
    });
  } catch (err) {
    console.error("POST /api/reports/[id]/stamp error:", err);
    return errorResponse("SERVER_ERROR", "An unexpected error occurred.", 500);
  }
}
