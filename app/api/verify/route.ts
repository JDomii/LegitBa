export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  mapOfficialRecordRow,
  type OfficialRecordRow,
  VerifyRequest,
} from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = VerifyRequest.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid request payload." } },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("verified_records")
      .select("*")
      .eq("sha256", parsed.data.sha256)
      .maybeSingle<OfficialRecordRow>();

    if (error) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Database query failed." } },
        { status: 500 }
      );
    }

    if (data) {
      return NextResponse.json({
        status: "match",
        record: mapOfficialRecordRow(data),
      });
    }

    return NextResponse.json({
      status: "no_match",
    });
  } catch (err) {
    console.error("POST /api/verify error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
