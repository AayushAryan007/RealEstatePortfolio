/**
 * Static brand details and navigation.
 *
 * Contact details here are the fallback. Once the admin panel exists, the
 * values saved in `site_settings` take priority so they can be edited
 * without a redeploy.
 */
export const site = {
  name: "Gupta Properties",
  shortName: "Gupta",
  tagline: "Built on Trust. Bound by Loyalty.",
  description:
    "Premium apartments, plots, commercial spaces and rentals across Noida, Vasundhara, Indirapuram and Ghaziabad. Built on trust, bound by loyalty.",
  url: resolveSiteUrl(),
  locale: "en_IN",

  /** Year the business was founded (shown as "Since 2006" and used for years of experience). */
  since: 2006,
  owner: "Rajeev Gupta",

  contact: {
    phone: "+91 70111 91639",
    phone2: "+91 99115 50651",
    email: "unitedestates.ncr@gmail.com",
    address: "1267, Sector-3, Vasundhara, Ghaziabad, Uttar Pradesh 201012",
    hours: "Mon – Sun, 10:00 am – 7:00 pm",
  },

  /** Placeholder handles until the real profiles are shared. */
  socials: {
    instagram: "#",
    facebook: "#",
    youtube: "#",
    linkedin: "#",
  },

  localities: ["Noida", "Vasundhara", "Indirapuram", "Ghaziabad"],
} as const

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const

export const propertyTypeLinks = [
  { label: "Apartments & Flats", href: "/properties?type=apartment" },
  { label: "Plots", href: "/properties?type=plot" },
  { label: "Commercial", href: "/properties?type=commercial" },
  { label: "Rentals", href: "/properties?purpose=rent" },
] as const

/**
 * Public base URL used for SEO and share links. Order of preference:
 * NEXT_PUBLIC_SITE_URL → the host's production domain (Vercel) → localhost.
 * Empty or malformed values are skipped instead of breaking the build.
 */
function resolveSiteUrl() {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    vercelHost ? `https://${vercelHost}` : undefined,
  ]
  for (const candidate of candidates) {
    if (!candidate?.trim()) continue
    try {
      return new URL(candidate.trim()).origin
    } catch {
      // Not a valid URL; try the next option.
    }
  }
  return "http://localhost:3000"
}

