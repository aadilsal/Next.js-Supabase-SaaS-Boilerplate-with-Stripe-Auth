/**
 * Make a user a platform admin (access to /admin).
 *
 *   pnpm admin:grant you@example.com
 *   pnpm admin:grant you@example.com --revoke
 *
 * Uses NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * The user must have signed up already.
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const [email, flag] = process.argv.slice(2);
  if (!email) {
    console.error("Usage: pnpm admin:grant <email> [--revoke]");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const isAdmin = flag !== "--revoke";

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_platform_admin: isAdmin })
    .eq("email", email.toLowerCase())
    .select("id");

  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
  if (!data?.length) {
    console.error(`No user with email ${email}. Sign up first, then run this again.`);
    process.exit(1);
  }

  console.log(isAdmin ? `✓ ${email} is now a platform admin.` : `✓ ${email} is no longer a platform admin.`);
}

main();
