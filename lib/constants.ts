export const APP_NAME = "LegitBa?";
export const TAGLINE = "Proof of what's real.";
export const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel request body limit is about 4.5 MB)
export const ALLOWED_MIME = ["image/png", "image/jpeg"] as const;
export const DEMO_ROLE_HEADER = "x-demo-role";
export const MOCK_OFFICIAL_NAME = "Registrar Office";
export const SIGNED_URL_TTL_SECONDS = 3600;
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}
