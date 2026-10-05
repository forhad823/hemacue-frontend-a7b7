export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

// Match the lifetimes the backend uses in auth.controller.ts
export const ACCESS_MAX_AGE = 60 * 60 * 24; // 1 day
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
