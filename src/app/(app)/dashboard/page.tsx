import { redirect } from "next/navigation";
import { teamPath } from "@/config/navigation";
import { getUserTeams } from "@/features/teams/queries";

/** /dashboard sends people to their first team (their personal workspace). */
export default async function DashboardIndexPage() {
  const [firstTeam] = await getUserTeams();
  redirect(firstTeam ? teamPath(firstTeam.slug) : "/sign-in");
}
