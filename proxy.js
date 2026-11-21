import { NextResponse } from "next/server";
import { verifySessionToken, SITE_COOKIE } from "./lib/session";

// Everything except /login and the auth API routes requires a valid
// site-wide session cookie. The admin area has its OWN extra key check
// done inside the admin page/API routes, on top of this.
const PUBLIC_PATHS = ["/login", "/api/auth/site", "/setup", "/api/setup"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SITE_COOKIE)?.value;
  const valid = await verifySessionToken(token, "site");

  if (!valid) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
