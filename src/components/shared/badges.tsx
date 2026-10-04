import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/features/teams/lib/permissions";
import { cn } from "@/lib/utils";
import type { TeamRole } from "@/types/database";

export function RoleBadge({ role }: { role: TeamRole }) {
  return <Badge variant={role === "owner" ? "default" : "secondary"}>{ROLE_LABELS[role]}</Badge>;
}

export function PlanBadge({ name, className }: { name: string; className?: string }) {
  return (
    <Badge variant="outline" className={className}>
      {name}
    </Badge>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/15 text-success",
  trialing: "bg-success/15 text-success",
  paid: "bg-success/15 text-success",
  past_due: "bg-warning/20 text-warning-foreground dark:text-warning",
  pending: "bg-warning/20 text-warning-foreground dark:text-warning",
  canceled: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
  banned: "bg-destructive/15 text-destructive",
};

/** Colored status pill. Color is never the only signal: the label is always shown. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={cn("capitalize", STATUS_STYLES[status])}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
