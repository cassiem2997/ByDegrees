import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const LOCALE_COOKIE = "bydegrees_locale";
const ENGLISH_REDIRECT_COUNTRIES = new Set(["US", "CA", "GB", "AU", "NZ", "IE", "SG", "PH"]);
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function responseWithLocaleCookie(request: NextRequest, locale: "ko" | "en") {
  const url = request.nextUrl.clone();
  url.searchParams.delete("lang");

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
    sameSite: "lax"
  });

  return response;
}

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const isAdmin = request.cookies.get("temptracks_admin")?.value === "true";

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const selectedLocale = request.nextUrl.searchParams.get("lang");
  if (
    (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/en") &&
    (selectedLocale === "ko" || selectedLocale === "en")
  ) {
    return responseWithLocaleCookie(request, selectedLocale);
  }

  if (request.nextUrl.pathname === "/") {
    const locale = request.cookies.get(LOCALE_COOKIE)?.value;
    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("x-country") ??
      "";

    if (!locale && ENGLISH_REDIRECT_COUNTRIES.has(country)) {
      const url = request.nextUrl.clone();
      url.pathname = "/en";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/en", "/admin/:path*"]
};
