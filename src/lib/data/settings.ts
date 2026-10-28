import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { site } from "@/lib/site"
import { createPublicClient } from "@/lib/supabase/public"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { tags } from "./tags"

export type HeroSettings = { eyebrow: string; title: string; subtitle: string }
export type AboutSettings = { years: number; title: string; body: string }
export type Stat = { label: string; value: number; suffix: string }
export type ContactSettings = {
  phone: string
  /** Optional second number; visitors can choose either for calls and WhatsApp. */
  phone2: string
  email: string
  address: string
  hours: string
}
export type SocialSettings = Record<"instagram" | "facebook" | "youtube" | "linkedin", string>

export type SiteSettings = {
  hero: HeroSettings
  about: AboutSettings
  stats: Stat[]
  contact: ContactSettings
  socials: SocialSettings
}

/** Used when a key is missing in the database (or before it is set up). */
const defaults: SiteSettings = {
  hero: {
    eyebrow: "Gupta Properties · Delhi NCR",
    title: "Find an address worthy of your trust",
    subtitle:
      "Handpicked apartments, plots, commercial spaces and rentals across Noida, Vasundhara, Indirapuram and Ghaziabad.",
  },
  about: {
    years: 20, // since 2006
    title: "A family name the NCR has trusted for years",
    body: "Gupta Properties began with a simple promise: treat every client like family.",
  },
  stats: [
    { label: "Years of experience", value: 20, suffix: "+" },
    { label: "Properties sold", value: 500, suffix: "+" },
    { label: "Happy families", value: 1200, suffix: "+" },
    { label: "Localities covered", value: 4, suffix: "" },
  ],
  contact: {
    phone: site.contact.phone,
    phone2: site.contact.phone2,
    email: site.contact.email,
    address: site.contact.address,
    hours: site.contact.hours,
  },
  socials: { instagram: "", facebook: "", youtube: "", linkedin: "" },
}

/** All editable site text, merged over sensible defaults. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.settings)

  if (!hasSupabaseEnv()) return defaults

  const { data, error } = await createPublicClient().from("site_settings").select("key, value")
  if (error || !data) return defaults

  const stored = Object.fromEntries(data.map((row) => [row.key, row.value])) as Partial<SiteSettings>
  return {
    hero: { ...defaults.hero, ...stored.hero },
    about: { ...defaults.about, ...stored.about },
    stats: Array.isArray(stored.stats) && stored.stats.length ? stored.stats : defaults.stats,
    contact: { ...defaults.contact, ...stored.contact },
    socials: { ...defaults.socials, ...stored.socials },
  }
}
