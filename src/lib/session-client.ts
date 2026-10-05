/** biome-ignore-all lint/suspicious/noDocumentCookie: <explanation> */
export function setRoleCookie(role: string) {
  document.cookie = `user-role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}
export function clearRoleCookie() {
  document.cookie = `user-role=; path=/; max-age=0`;
}

export async function persistSession(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  try {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens),
    });
  } catch {
    // non-fatal: the next proxy refresh or login will retry
  }
}

export async function clearSession() {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {}
}
