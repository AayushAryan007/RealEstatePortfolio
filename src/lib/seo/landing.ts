import type { PropertyFilters } from "@/lib/data/properties"
import { site } from "@/lib/site"

/**
 * Search-intent landing pages: one per area × category, matching what people
 * actually type ("flats for sale in Vasundhara", "plots in Ghaziabad"…).
 * Copy is generated from facts only (areas served, services, years, contacts).
 */
export const landingCategories = {
  "flats-for-sale": {
    label: "Flats for Sale",
    noun: "flats and apartments for sale",
    filters: { type: "apartment", purpose: "sale" },
    blurb: "From compact 2 BHKs to spacious 3 and 4 BHK homes and penthouses",
  },
  "flats-for-rent": {
    label: "Flats for Rent",
    noun: "flats and apartments for rent",
    filters: { type: "apartment", purpose: "rent" },
    blurb: "Furnished, semi-furnished and unfurnished homes for families and working professionals",
  },
  "plots-for-sale": {
    label: "Plots for Sale",
    noun: "residential and commercial plots for sale",
    filters: { type: "plot", purpose: "sale" },
    blurb: "Clear-title plots ready for your own home or investment",
  },
  "commercial-property": {
    label: "Commercial Property",
    noun: "commercial property: shops, offices and showrooms",
    filters: { type: "commercial" },
    blurb: "Offices, shops and showrooms for sale or rent on prime roads",
  },
} as const satisfies Record<string, { label: string; noun: string; filters: Partial<PropertyFilters>; blurb: string }>

export type LandingCategory = keyof typeof landingCategories
export const landingSlugs = Object.keys(landingCategories) as LandingCategory[]

export function isLandingCategory(value: string): value is LandingCategory {
  return value in landingCategories
}

/** Plain-language FAQs for an area page, built only from known business facts. */
export function areaFaqs(area: string) {
  return [
    {
      q: `Is Gupta Properties a property dealer in ${area}?`,
      a: `Yes. Gupta Properties has helped families and investors buy, sell and rent property in ${area} and across ${site.localities.join(", ")} since ${site.since}.`,
    },
    {
      q: `What kind of property can I find in ${area}?`,
      a: `Flats and apartments for sale and rent, residential plots, and commercial property such as shops and offices. Browse current listings on this page or tell us your budget and we'll shortlist options for you.`,
    },
    {
      q: `Do you also help with building design and construction?`,
      a: `Yes. Along with sale, purchase and rent, Gupta Properties offers building design and construction services.`,
    },
    {
      q: `How do I contact Gupta Properties about property in ${area}?`,
      a: `Call or WhatsApp ${site.contact.phone} or ${site.contact.phone2}, email ${site.contact.email}, or visit our office at ${site.contact.address}.`,
    },
  ]
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }
}
