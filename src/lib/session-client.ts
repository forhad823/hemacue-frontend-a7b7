/** biome-ignore-all lint/suspicious/noDocumentCookie: <explanation> */
export function setRoleCookie(role: string) {
  document.cookie = `user-role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}
export function clearRoleCookie() {
  document.cookie = `user-role=; path=/; max-age=0`;
}
