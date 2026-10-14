export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { mapOfficialRecordRow, type OfficialRecordRow } from "@/lib/types";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("verified_records")
      .select("*")
      .order("stamped_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to fetch records." } },
        { status: 500 }
      );
    }

    const records = ((data as OfficialRecordRow[]) || []).map(mapOfficialRecordRow);
    return NextResponse.json({ records });
  } catch (err) {
    console.error("GET /api/records error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
