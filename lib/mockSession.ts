import { DEMO_ROLE_HEADER } from "./constants";

export function isOfficialRequest(request: Request): boolean {
  return request.headers.get(DEMO_ROLE_HEADER) === "official";
}
