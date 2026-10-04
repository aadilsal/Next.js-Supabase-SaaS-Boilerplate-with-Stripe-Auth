import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Your logo. Replace <LogoMark /> with your own SVG; the name comes from
 * src/config/site.ts.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      {siteConfig.name.charAt(0)}
    </span>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
