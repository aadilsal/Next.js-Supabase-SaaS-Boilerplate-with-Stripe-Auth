import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const social = Object.entries(siteConfig.social).filter(([, href]) => href);

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.company.legalName}. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          {marketingConfig.footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
          {social.map(([name, href]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground capitalize hover:text-foreground"
            >
              {name}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
