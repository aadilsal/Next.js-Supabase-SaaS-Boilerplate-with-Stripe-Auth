/**
 * Returns `input` only if it is a same-origin relative path, otherwise `fallback`.
 * Use it on every `next` / `redirectTo` query parameter to prevent open redirects
 * like `/sign-in?next=https://evil.com`.
 */
export function safeRedirectPath(
  input: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!input) return fallback;

  // Must be a path: "/x". Reject "//evil.com", "/\evil.com" and control characters.
  if (!input.startsWith("/") || input.startsWith("//") || /[\\\u0000-\u001f]/.test(input)) {
    return fallback;
  }

  try {
    const base = "http://same-origin.invalid";
    const url = new URL(input, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
