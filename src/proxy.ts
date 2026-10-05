import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  baseCookieOptions,
} from "@/lib/auth-cookies";
import { getNewTokens } from "@/service/refreshToken";
import type { AuthTokens } from "@/types";
import { jwtUtils } from "@/utils/jwt";

const AUTH_ROUTES = ["/login", "/register"];

const DASHBOARD_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  PATIENT: "/patient",
  DONOR: "/donor",
};

const ROLE_GUARDS = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/patient", role: "PATIENT" },
  { prefix: "/donor", role: "DONOR" },
];

const isUnder = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Proxy providing:
 * 1. Automatic token refresh when the access token expired but the refresh token is valid
 * 2. Redirection away from login/register for authenticated users
 * 3. Route guarding for the role dashboards (/admin, /patient, /donor)
 * 4. Strict role-based access control
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  let refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const accessSecret = process.env.JWT_ACCESS_SECRET as string;
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

  let decodedAccess = accessToken
    ? jwtUtils.verifyToken(accessToken, accessSecret)
    : null;
  const decodedRefresh = refreshToken
    ? jwtUtils.verifyToken(refreshToken, refreshSecret)
    : null;

  // 1. Auto-refresh
  let refreshed: AuthTokens | null = null;
  if (!decodedAccess?.success && decodedRefresh?.success && refreshToken) {
    refreshed = await getNewTokens(refreshToken);
    if (refreshed) {
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      decodedAccess = jwtUtils.verifyToken(accessToken, accessSecret);
    }
  }

  const userRole = decodedAccess?.success ? decodedAccess.data.role : null;

  // Cookies exist but none of them gave us a valid session -> clear them
  const hasStaleSession =
    !userRole &&
    (request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE));

  const withSession = (response: NextResponse) => {
    if (refreshed) {
      response.cookies.set(ACCESS_COOKIE, refreshed.accessToken, {
        ...baseCookieOptions,
        maxAge: ACCESS_MAX_AGE,
      });
      response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
        ...baseCookieOptions,
        maxAge: REFRESH_MAX_AGE,
      });
    }
    if (hasStaleSession) {
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
    }
    return response;
  };

  const redirectTo = (url: URL) => withSession(NextResponse.redirect(url));

  // 2. Authenticated user on /login or /register -> their dashboard
  if (userRole && AUTH_ROUTES.some((route) => isUnder(pathname, route))) {
    const dashboard = DASHBOARD_BY_ROLE[userRole];
    if (dashboard) return redirectTo(new URL(dashboard, request.url));
  }

  // 3 + 4. Guard dashboards and enforce the role
  const guard = ROLE_GUARDS.find((g) => isUnder(pathname, g.prefix));
  if (guard) {
    if (!userRole) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return redirectTo(loginUrl);
    }
    if (userRole !== guard.role) {
      return redirectTo(
        new URL(DASHBOARD_BY_ROLE[userRole] ?? "/login", request.url),
      );
    }
  }

  // Let the freshly refreshed tokens reach server components in this same request
  if (refreshed) {
    request.cookies.set(ACCESS_COOKIE, refreshed.accessToken);
    request.cookies.set(REFRESH_COOKIE, refreshed.refreshToken);
  }
  return withSession(
    NextResponse.next({ request: { headers: request.headers } }),
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
