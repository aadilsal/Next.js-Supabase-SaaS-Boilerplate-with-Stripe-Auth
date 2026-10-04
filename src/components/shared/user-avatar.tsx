import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function initials(name: string | null | undefined, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export function UserAvatar({
  name,
  email,
  src,
  className,
}: {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback className="text-xs">{initials(name, email)}</AvatarFallback>
    </Avatar>
  );
}
