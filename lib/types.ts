import { z } from "zod";

export const Sha256 = z.string().regex(/^[0-9a-f]{64}$/);
export const ReportStatus = z.enum(["reported", "under_review", "resolved"]);

export const OfficialRecord = z.object({
  id: z.string().uuid(),
  sha256: Sha256,
  title: z.string(),
  fileName: z.string(),
  stampedBy: z.string(),
  stampedAt: z.string(), // ISO 8601
});

export const Report = z.object({
  id: z.string().uuid(),
  sha256: Sha256,
  fileName: z.string(),
  note: z.string().nullable(),
  status: ReportStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
  imageUrl: z.string().url(), // signed URL, expires after SIGNED_URL_TTL_SECONDS
});

export const VerifyRequest = z.object({ sha256: Sha256 });
export const VerifyResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("match"), record: OfficialRecord }),
  z.object({ status: z.literal("no_match") }),
]);

export const StampResponse = z.object({ record: OfficialRecord, alreadyStamped: z.boolean() });
export const RecordListResponse = z.object({ records: z.array(OfficialRecord) });
export const ReportCreateResponse = z.object({ report: Report, alreadyReported: z.boolean() });
export const ReportListResponse = z.object({ reports: z.array(Report) });
export const StatusUpdateRequest = z.object({ status: ReportStatus });

export const ApiErrorCode = z.enum([
  "INVALID_REQUEST", // 400
  "INVALID_FILE",    // 400
  "FILE_TOO_LARGE",  // 413
  "FORBIDDEN",       // 403
  "NOT_FOUND",       // 404
  "ALREADY_OFFICIAL",// 409
  "SERVER_ERROR",    // 500
]);
export const ApiError = z.object({
  error: z.object({ code: ApiErrorCode, message: z.string() }),
});

export type OfficialRecord = z.infer<typeof OfficialRecord>;
export type Report = z.infer<typeof Report>;
export type ReportStatus = z.infer<typeof ReportStatus>;
export type VerifyRequest = z.infer<typeof VerifyRequest>;
export type VerifyResponse = z.infer<typeof VerifyResponse>;
export type StampResponse = z.infer<typeof StampResponse>;
export type RecordListResponse = z.infer<typeof RecordListResponse>;
export type ReportCreateResponse = z.infer<typeof ReportCreateResponse>;
export type ReportListResponse = z.infer<typeof ReportListResponse>;
export type StatusUpdateRequest = z.infer<typeof StatusUpdateRequest>;
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;
export type ApiError = z.infer<typeof ApiError>;

export type OfficialRecordRow = {
  id: string;
  sha256: string;
  title: string;
  file_name: string;
  storage_path: string;
  stamped_by: string;
  stamped_at: string;
};

export function mapOfficialRecordRow(row: OfficialRecordRow): OfficialRecord {
  return {
    id: row.id,
    sha256: row.sha256,
    title: row.title,
    fileName: row.file_name,
    stampedBy: row.stamped_by,
    stampedAt: row.stamped_at,
  };
}

export type ReportRow = {
  id: string;
  sha256: string;
  file_name: string;
  storage_path: string;
  note: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
};

export function mapReportRow(row: ReportRow, imageUrl: string): Report {
  return {
    id: row.id,
    sha256: row.sha256,
    fileName: row.file_name,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    imageUrl,
  };
}
