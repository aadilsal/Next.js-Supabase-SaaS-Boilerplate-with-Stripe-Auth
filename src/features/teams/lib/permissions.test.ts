import { describe, expect, it } from "vitest";
import {
  assignableRoles,
  canChangeRole,
  canDeleteTeam,
  canManageBilling,
  canRemoveMember,
} from "./permissions";

describe("team permissions", () => {
  it("only owners manage billing", () => {
    expect(canManageBilling("owner")).toBe(true);
    expect(canManageBilling("admin")).toBe(false);
    expect(canManageBilling("member")).toBe(false);
  });

  it("personal teams can't be deleted", () => {
    expect(canDeleteTeam("owner", false)).toBe(true);
    expect(canDeleteTeam("owner", true)).toBe(false);
    expect(canDeleteTeam("admin", false)).toBe(false);
  });

  it("admins can't promote to or demote from owner", () => {
    expect(canChangeRole("admin", "member", "admin")).toBe(true);
    expect(canChangeRole("admin", "member", "owner")).toBe(false);
    expect(canChangeRole("admin", "owner", "member")).toBe(false);
    expect(canChangeRole("owner", "owner", "admin")).toBe(true);
    expect(canChangeRole("member", "member", "admin")).toBe(false);
  });

  it("no-op role changes are rejected", () => {
    expect(canChangeRole("owner", "admin", "admin")).toBe(false);
  });

  it("admins can't remove owners", () => {
    expect(canRemoveMember("admin", "owner")).toBe(false);
    expect(canRemoveMember("admin", "member")).toBe(true);
    expect(canRemoveMember("owner", "owner")).toBe(true);
    expect(canRemoveMember("member", "member")).toBe(false);
  });

  it("lists assignable roles per actor", () => {
    expect(assignableRoles("owner")).toEqual(["owner", "admin", "member"]);
    expect(assignableRoles("admin")).toEqual(["admin", "member"]);
    expect(assignableRoles("member")).toEqual([]);
  });
});
