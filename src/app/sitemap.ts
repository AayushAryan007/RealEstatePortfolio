import type { MetadataRoute } from "next"

import { getLocalities } from "@/lib/data/content"
import { getAllPropertySlugs } from "@/lib/data/properties"
import { absoluteUrl } from "@/lib/seo/json-ld"

/** Every public page, regenerated as listings change. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, localities] = await Promise.all([getAllPropertySlugs(), getLocalities()])

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/properties"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ]

  return [
    ...pages,
    ...localities.map((l) => ({ url: absoluteUrl(`/areas/${l.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...properties.map((p) => ({
      url: absoluteUrl(`/properties/${p.slug}`),
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
