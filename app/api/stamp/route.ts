export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { MOCK_OFFICIAL_NAME } from "@/lib/constants";
import { isOfficialRequest } from "@/lib/mockSession";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { mapOfficialRecordRow, type OfficialRecordRow } from "@/lib/types";
import { validateFile, validateTitle } from "@/lib/validateFile";

export async function POST(request: Request) {
  try {
    if (!isOfficialRequest(request)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Official access required." } },
        { status: 403 }
      );
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid form data." } },
        { status: 400 }
      );
    }

    const fileEntry = formData.get("file");
    const titleEntry = formData.get("title");

    const titleValidation = validateTitle(titleEntry);
    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: titleValidation.message } },
        { status: 400 }
      );
    }

    const fileValidation = validateFile(fileEntry);
    if (!fileValidation.valid) {
      const status = fileValidation.code === "FILE_TOO_LARGE" ? 413 : 400;
      return NextResponse.json(
        { error: { code: fileValidation.code, message: fileValidation.message } },
        { status }
      );
    }

    const { file, ext } = fileValidation;
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(buffer).digest("hex");

    const supabase = getSupabaseServerClient();

    // Check if record exists
    const { data: existing, error: selectError } = await supabase
      .from("verified_records")
      .select("*")
      .eq("sha256", sha256)
      .maybeSingle<OfficialRecordRow>();

    if (selectError) {
      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Database query failed." } },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        record: mapOfficialRecordRow(existing),
        alreadyStamped: true,
      });
    }

    const recordId = randomUUID();
    const storagePath = `${recordId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("official-files")
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
      .from("verified_records")
      .insert({
        id: recordId,
        sha256,
        title: titleValidation.title,
        file_name: file.name,
        storage_path: storagePath,
        stamped_by: MOCK_OFFICIAL_NAME,
      })
      .select("*")
      .single<OfficialRecordRow>();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existingAfterConflict } = await supabase
          .from("verified_records")
          .select("*")
          .eq("sha256", sha256)
          .single<OfficialRecordRow>();

        if (existingAfterConflict) {
          return NextResponse.json({
            record: mapOfficialRecordRow(existingAfterConflict),
            alreadyStamped: true,
          });
        }
      }

      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: "Failed to record stamp." } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      record: mapOfficialRecordRow(inserted),
      alreadyStamped: false,
    });
  } catch (err) {
    console.error("POST /api/stamp error:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
