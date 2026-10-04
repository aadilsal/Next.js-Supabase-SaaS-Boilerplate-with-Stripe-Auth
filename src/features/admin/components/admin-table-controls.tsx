"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

/** Search box for admin tables. Updates the `?q=` query param. */
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
      <Input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </form>
  );
}
