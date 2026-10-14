// Small display helpers shared by the redesigned pages (frontend only).

export const UNIVERSITY_NAME = "Tarlac State University";
export const LOGO_SRC = "/images/campus-shield-logo.png";

// First 8 and last 8 characters of a SHA-256 hash, e.g. a1b2c3d4...e5f6a7b8
export function shortFingerprint(sha256: string): string {
  return `${sha256.slice(0, 8)}...${sha256.slice(-8)}`;
}

// Compact date for tables, e.g. "Oct 12, 2026 10:24 AM"
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(d);
  return `${date} ${time}`;
}
    