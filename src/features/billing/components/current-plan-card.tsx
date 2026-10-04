"use client";

import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/badges";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "@/hooks/use-action";
import { createPortalSession } from "../actions";

export interface CurrentPlanSummary {
  planName: string;
  source: "free" | "subscription" | "lifetime";
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function CurrentPlanCard({
  teamSlug,
  summary,
  canManage,
  hasCustomer,
}: {
  teamSlug: string;
  summary: CurrentPlanSummary;
  canManage: boolean;
  hasCustomer: boolean;
}) {
  const { execute, isPending } = useAction(createPortalSession, {
    onSuccess: ({ url }) => window.location.assign(url),
  });

  let detail = "You're on the free plan.";
  if (summary.source === "lifetime") detail = "Lifetime access. No renewals, ever.";
  if (summary.source === "subscription" && summary.currentPeriodEnd) {
    detail = summary.cancelAtPeriodEnd
      ? `Cancels on ${formatDate(summary.currentPeriodEnd)}.`
      : `Renews on ${formatDate(summary.currentPeriodEnd)}.`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {summary.planName}
          {summary.status && <StatusBadge status={summary.status} />}
        </CardTitle>
        <CardDescription>{detail}</CardDescription>
        {canManage && hasCustomer && (
          <CardAction>
            <SubmitButton
              type="button"
              variant="outline"
              pending={isPending}
              onClick={() => execute({ teamSlug })}
            >
              Manage billing
              <ExternalLink className="size-4" />
            </SubmitButton>
          </CardAction>
        )}
      </CardHeader>
      {!canManage && (
        <CardContent className="text-sm text-muted-foreground">
          Only team owners can change the plan or payment details.
        </CardContent>
      )}
    </Card>
  );
}
