"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { teamPath } from "@/config/navigation";
import { useAction } from "@/hooks/use-action";
import { updateTeam } from "../actions";
import { updateTeamSchema, type UpdateTeamInput } from "../schemas";

export function TeamSettingsForm({
  team,
  canEdit,
}: {
  team: { name: string; slug: string };
  canEdit: boolean;
}) {
  const router = useRouter();
  const form = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: { teamSlug: team.slug, name: team.name, slug: team.slug },
  });
  const slug = useWatch({ control: form.control, name: "slug" });
  const { execute, isPending } = useAction(updateTeam, {
    form,
    successMessage: "Team updated",
    onSuccess: ({ slug }) => {
      if (slug !== team.slug) router.replace(teamPath(slug, "/settings"));
    },
  });

  return (
    <Card>
      <form onSubmit={form.handleSubmit(execute)} noValidate>
        <fieldset disabled={!canEdit} className="contents">
          <CardHeader>
            <CardTitle>Team details</CardTitle>
            <CardDescription>
              {canEdit ? "Visible to everyone on the team." : "Only owners and admins can change these."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <TextField control={form.control} name="name" label="Team name" />
            <TextField
              control={form.control}
              name="slug"
              label="Team URL"
              description={`${siteConfig.url.replace(/^https?:\/\//, "")}${teamPath(slug || "…")}`}
            />
          </CardContent>
          {canEdit && (
            <CardFooter className="justify-end">
              <SubmitButton pending={isPending}>Save changes</SubmitButton>
            </CardFooter>
          )}
        </fieldset>
      </form>
    </Card>
  );
}
