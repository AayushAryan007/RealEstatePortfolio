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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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

/** Build a WhatsApp click-to-chat link with a prefilled message. */
export function whatsappLink(message = "Hi, I'm interested in a property listed on Gupta Properties.") {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`
}
