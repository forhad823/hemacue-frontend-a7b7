import { NextResponse, type NextRequest } from "next/server";

const ROLE_COOKIE = "user-role";

const rolePathMap: Record<string, string> = {
  "/admin": "ADMIN",
  "/patient": "PATIENT",
  "/donor": "DONOR",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const matched = Object.keys(rolePathMap).find((p) => pathname.startsWith(p));
  if (!matched) return NextResponse.next();

  const role = req.cookies.get(ROLE_COOKIE)?.value;
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (role !== rolePathMap[matched]) {
    const url = req.nextUrl.clone();
    url.pathname = `/${role.toLowerCase()}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/patient/:path*", "/donor/:path*"],
};
