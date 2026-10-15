export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { SIGNED_URL_TTL_SECONDS } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { mapOfficialRecordRow, type OfficialRecordRow } from "@/lib/types";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("verified_records")
      .select("*")
      .order("stamped_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to fetch records." } },
        { status: 500 }
      );
    }

    const rows = ((data as OfficialRecordRow[]) || []);
    if (rows.length === 0) {
      return NextResponse.json({ records: [] });
    }

    // Generate signed image URLs from official-files bucket
    const paths = rows.map((r) => r.storage_path);
    const { data: signedUrls } = await supabase.storage
      .from("official-files")
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

    const urlMap = new Map(signedUrls?.map((item) => [item.path, item.signedUrl]) || []);
    const records = rows.map((row) =>
      mapOfficialRecordRow(row, urlMap.get(row.storage_path) || undefined)
    );

    return NextResponse.json({ records });
  } catch (err) {
    console.error("GET /api/records error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
