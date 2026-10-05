import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  baseCookieOptions,
} from "@/lib/auth-cookies";
import { jwtUtils } from "@/utils/jwt";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const accessToken = body?.accessToken;
  const refreshToken = body?.refreshToken;

  if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const access = jwtUtils.verifyToken(
    accessToken,
    process.env.JWT_ACCESS_SECRET as string,
  );
  const refresh = jwtUtils.verifyToken(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string,
  );
  if (!access.success || !refresh.success) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
