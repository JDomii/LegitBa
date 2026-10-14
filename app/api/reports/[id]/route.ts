export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { SIGNED_URL_TTL_SECONDS } from "@/lib/constants";
import { isOfficialRequest } from "@/lib/mockSession";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  mapReportRow,
  type ReportRow,
  StatusUpdateRequest,
} from "@/lib/types";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, props: RouteProps) {
  try {
    if (!isOfficialRequest(request)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Official access required." } },
        { status: 403 }
      );
    }

    const { id } = await props.params;
    const body = await request.json().catch(() => null);
    const parsed = StatusUpdateRequest.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid status update payload." } },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("reports")
      .update({
        status: parsed.data.status,
        updated_at: now,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle<ReportRow>();

    if (error) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to update report status." } },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Report not found." } },
        { status: 404 }
      );
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from("report-files")
      .createSignedUrl(data.storage_path, SIGNED_URL_TTL_SECONDS);

    if (signedError || !signedData) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to create signed URL." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      report: mapReportRow(data, signedData.signedUrl),
    });
  } catch (err) {
    console.error("PATCH /api/reports/[id] error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
