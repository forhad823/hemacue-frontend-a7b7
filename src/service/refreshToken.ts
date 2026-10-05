import type { ApiResponse, AuthTokens } from "@/types";

export async function getNewTokens(
  refreshToken: string,
): Promise<AuthTokens | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as ApiResponse<AuthTokens>;
    const tokens = json.data;
    return tokens?.accessToken && tokens?.refreshToken ? tokens : null;
  } catch {
    return null;
  }
}
