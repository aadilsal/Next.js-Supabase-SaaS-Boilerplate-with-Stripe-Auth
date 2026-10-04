"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminSearch({ placeholder, defaultValue }: { placeholder: string; defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <form
      role="search"
      className="relative max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const q = new FormData(event.currentTarget).get("q")?.toString().trim();
        router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
      }}
    >
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input name="q" type="search" defaultValue={defaultValue} placeholder={placeholder} className="pl-9" aria-label={placeholder} />
    </form>
  );
}

export function AdminPagination({
  page,
  pageSize,
  total,
  query,
}: {
  page: number;
  pageSize: number;
  total: number;
  query: string;
}) {
  const pathname = usePathname();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (target > 1) params.set("page", String(target));
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  return (
    <nav className="flex items-center justify-end gap-2" aria-label="Pagination">
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      <Button variant="outline" size="icon" disabled={page <= 1} asChild={page > 1} aria-label="Previous page">
        {page > 1 ? (
          <Link href={href(page - 1)}>
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </Button>
      <Button variant="outline" size="icon" disabled={page >= pages} asChild={page < pages} aria-label="Next page">
        {page < pages ? (
          <Link href={href(page + 1)}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>
    </nav>
  );
}
