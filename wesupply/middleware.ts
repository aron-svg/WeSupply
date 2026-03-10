import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("wesupply_auth")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/login/create";
  const isProtectedPage = pathname.startsWith("/preferences");

  if (isProtectedPage && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    const preferencesUrl = new URL("/preferences", request.url);
    return NextResponse.redirect(preferencesUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/login/create", "/preferences/:path*"],
};
