import type { MetadataRoute } from "next";
import { features } from "@/config/features";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = features.marketing
    ? ["", ...(features.billing ? ["/pricing"] : []), "/privacy", "/terms", "/sign-in", "/sign-up"]
    : ["/sign-in", "/sign-up"];

  return pages.map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: new Date() }));
}
