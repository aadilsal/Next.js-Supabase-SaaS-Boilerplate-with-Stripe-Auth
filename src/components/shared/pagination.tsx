"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Previous / next links for paginated tables. Keeps other query params
 * (search, filters) and drops `page=1` for clean URLs.
 */
export function Pagination({
  page,
  pageSize,
  total,
  params = {},
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Extra query params to preserve, e.g. { q: "search" }. */
  params?: Record<string, string | undefined>;
}) {
  const pathname = usePathname();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const step = (target: number, label: string, icon: React.ReactNode, enabled: boolean) =>
    enabled ? (
      <Button variant="outline" size="icon" asChild aria-label={label}>
        <Link href={href(target)}>{icon}</Link>
      </Button>
    ) : (
      <Button variant="outline" size="icon" disabled aria-label={label}>
        {icon}
      </Button>
    );

  return (
    <nav className="flex items-center justify-end gap-2" aria-label="Pagination">
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      {step(page - 1, "Previous page", <ChevronLeft className="size-4" />, page > 1)}
      {step(page + 1, "Next page", <ChevronRight className="size-4" />, page < pages)}
    </nav>
  );
}
