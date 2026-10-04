import "server-only";

import { createHash, randomBytes } from "node:crypto";

/**
 * Invitation tokens: the raw token goes in the email link, and only its
 * SHA-256 hash is stored. The hash must match Postgres:
 *   encode(extensions.digest(token, 'sha256'), 'hex')
 */
export function generateInvitationToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInvitationToken(token) };
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
