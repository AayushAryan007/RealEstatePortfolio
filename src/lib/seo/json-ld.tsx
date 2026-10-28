import { site } from "@/lib/site"

/**
 * Renders structured data for search engines.
 * `<` is escaped so content can never close the script tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}

export const absoluteUrl = (path: string) => new URL(path, site.url).toString()

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/** The business itself: helps local search (Google Maps / "near me"). */
export function organizationLd(
  contact: { phone: string; phone2?: string; email: string; address: string; hours?: string },
  sameAs: string[] = [],
) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": absoluteUrl("/#organization"),
    name: site.name,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    image: absoluteUrl("/media/samples/sunken-living.webp"),
    telephone: contact.phone,
    contactPoint: [contact.phone, contact.phone2]
      .filter(Boolean)
      .map((telephone) => ({ "@type": "ContactPoint", telephone, contactType: "sales", areaServed: "IN", availableLanguage: ["en", "hi"] })),
    foundingDate: String(site.since),
    founder: { "@type": "Person", name: site.owner },
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: "Vasundhara, Ghaziabad",
      postalCode: "201012",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    areaServed: site.localities.map((name) => ({ "@type": "City", name })),
    priceRange: "₹₹₹",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "19:00",
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`,
    knowsAbout: ["Residential property", "Commercial property", "Plots", "Rentals", "Building design and construction"],
    ...(sameAs.length ? { sameAs } : {}),
  }
}
