import { Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { marketingConfig } from "@/config/marketing";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Main">
          {marketingConfig.headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {marketingConfig.headerLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-md px-2 py-2 hover:bg-accent">
                    {link.label}
                  </Link>
                ))}
                <Link href="/sign-in" className="rounded-md px-2 py-2 hover:bg-accent">
                  Sign in
                </Link>
                <Button asChild className="mt-2">
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
