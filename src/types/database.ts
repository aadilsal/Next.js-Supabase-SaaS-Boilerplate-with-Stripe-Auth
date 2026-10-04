// Database types.
//
// `database.generated.ts` is produced by `pnpm db:types` from your local schema.
// Never edit it by hand. Regenerate it after every migration.
// This file re-exports it and adds short app-level aliases.

export * from "./database.generated";

import type { Enums, Tables } from "./database.generated";

export type TeamRole = Enums<"team_role">;
export type Team = Tables<"teams">;
export type Profile = Tables<"profiles">;
export type AuditLog = Tables<"audit_logs">;
export type AppLog = Tables<"app_logs">;
export type CatalogPrice = Tables<"prices">;
export type CatalogProduct = Tables<"products">;
