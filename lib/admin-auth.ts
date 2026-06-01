import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "temptracks_admin";

export function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === "true";
}
