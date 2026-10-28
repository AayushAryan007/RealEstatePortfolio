import dynamic from "next/dynamic"

import { About } from "@/components/home/about"
import { Areas } from "@/components/home/areas"
import { FeaturedProperties } from "@/components/home/featured-properties"
import { Hero } from "@/components/home/hero"
import { LampCta } from "@/components/home/lamp-cta"
import { PropertyTypes } from "@/components/home/property-types"
import { Stats } from "@/components/home/stats"
import { Testimonials } from "@/components/home/testimonials"
import { getLocalities, getTestimonials } from "@/lib/data/content"
import { getCategoryCounts, getFeaturedProperties } from "@/lib/data/properties"
import { getSiteSettings } from "@/lib/data/settings"

// Below-the-fold interactive sections ship as separate chunks.
const Showcase = dynamic(() => import("@/components/home/showcase").then((m) => m.Showcase))
const WhyChooseUs = dynamic(() => import("@/components/home/why-choose-us").then((m) => m.WhyChooseUs))

/**
 * Homepage. All data comes from cached readers, so the whole page is
 * prerendered and refreshed whenever the admin edits content.
 */
export default async function HomePage() {
  const [settings, featured, counts, localities, testimonials] = await Promise.all([
    getSiteSettings(),
    getFeaturedProperties(6),
    getCategoryCounts(),
    getLocalities(),
    getTestimonials(),
  ])

  return (
    <>
      <Hero hero={settings.hero} localities={localities} />
      <PropertyTypes counts={counts} />
      <FeaturedProperties properties={featured} />
      <About about={settings.about} />
      <Showcase />
      <WhyChooseUs />
      <Stats stats={settings.stats} />
      <Areas localities={localities} />
      <Testimonials testimonials={testimonials} />
      <LampCta phone={settings.contact.phone} phoneHref={`tel:${settings.contact.phone.replace(/[^\d+]/g, "")}`} />
    </>
  )
}
