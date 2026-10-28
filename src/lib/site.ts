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

  contact: {
    phone: "+91 70111 91639",
    phoneHref: "tel:+917011191639",
    whatsapp: "917011191639",
    email: "unitedestates.ncr@gmail.com",
    address: "Office address coming soon, Ghaziabad, Uttar Pradesh",
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

/** Build a WhatsApp click-to-chat link with a prefilled message. */
export function whatsappLink(message = "Hi, I'm interested in a property listed on Gupta Properties.") {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`
}
