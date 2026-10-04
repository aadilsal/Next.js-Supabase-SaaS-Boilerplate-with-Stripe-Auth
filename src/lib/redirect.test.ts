import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";

describe("safeRedirectPath", () => {
  it("allows same-origin paths", () => {
    expect(safeRedirectPath("/dashboard/acme")).toBe("/dashboard/acme");
    expect(safeRedirectPath("/invite/abc?x=1#top")).toBe("/invite/abc?x=1#top");
  });

  it("falls back for missing input", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath("", "/account")).toBe("/account");
  });

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/foo\nbar",
  ])("rejects %s", (input) => {
    expect(safeRedirectPath(input)).toBe("/dashboard");
  });
});
