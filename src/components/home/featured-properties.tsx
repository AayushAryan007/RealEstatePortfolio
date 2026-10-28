import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { PropertyCard } from "@/components/property/property-card"
import { Reveal } from "@/components/shared/reveal"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import type { PropertyCardData } from "@/lib/data/properties"

export function FeaturedProperties({ properties }: { properties: PropertyCardData[] }) {
  if (!properties.length) return null

  return (
    <section aria-labelledby="featured-title" className="section-y relative bg-ink-raised/30">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Featured properties"
          title={<span id="featured-title">Handpicked for discerning buyers</span>}
          description="Verified listings with honest pricing, chosen by our advisors for location, quality and value."
        />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, i) => (
            <Reveal as="li" key={property.id} delay={(i % 3) * 0.08}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </ul>

        <div className="mt-14 text-center">
          <Button size="lg" variant="gold" asChild>
            <Link href="/properties">
              View all properties <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
