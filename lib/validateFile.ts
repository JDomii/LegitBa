import { ALLOWED_MIME, MAX_FILE_BYTES } from "./constants";
import type { ApiErrorCode } from "./types";

export type FileValidationSuccess = {
  valid: true;
  file: File;
  ext: "png" | "jpg";
};

export type FileValidationError = {
  valid: false;
  code: Extract<ApiErrorCode, "INVALID_REQUEST" | "INVALID_FILE" | "FILE_TOO_LARGE">;
  message: string;
};

export type FileValidationResult = FileValidationSuccess | FileValidationError;

export function validateFile(file: unknown): FileValidationResult {
  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      valid: false,
      code: "INVALID_REQUEST",
      message: "Please choose a PNG or JPG under 4 MB.",
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      valid: false,
      code: "FILE_TOO_LARGE",
      message: "File exceeds maximum size of 4 MB.",
    };
  }

  const mime = file.type;
  if (!ALLOWED_MIME.includes(mime as (typeof ALLOWED_MIME)[number])) {
    return {
      valid: false,
      code: "INVALID_FILE",
      message: "Please choose a PNG or JPG under 4 MB.",
    };
  }

  const ext = mime === "image/png" ? "png" : "jpg";
  return {
    valid: true,
    file,
    ext,
  };
}

export function validateTitle(title: unknown): { valid: true; title: string } | { valid: false; message: string } {
  if (typeof title !== "string") {
    return { valid: false, message: "Title is required." };
  }
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 120) {
    return { valid: false, message: "Title must be between 1 and 120 characters." };
  }
  return { valid: true, title: trimmed };
}

export function validateNote(note: unknown): { valid: true; note: string | null } | { valid: false; message: string } {
  if (note === null || note === undefined || note === "") {
    return { valid: true, note: null };
  }
  if (typeof note !== "string") {
    return { valid: false, message: "Note must be a string." };
  }
  if (note.length > 280) {
    return { valid: false, message: "Note must be at most 280 characters." };
  }
  return { valid: true, note };
}
