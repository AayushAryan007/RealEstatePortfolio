import type { Metadata } from "next"
import { Suspense } from "react"

import { Results, ResultsSkeleton } from "@/components/listing/results"
import { PageHero } from "@/components/shared/page-hero"
import { getLocalities } from "@/lib/data/content"
import { parseFilters } from "@/lib/filters"

export const metadata: Metadata = {
  title: "Properties for Sale & Rent in Noida, Indirapuram & Ghaziabad",
  description:
    "Browse verified apartments, plots, commercial spaces and rentals in Noida, Vasundhara, Indirapuram and Ghaziabad. Filter by budget, BHK and location.",
  alternates: { canonical: "/properties" },
}

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <>
      <PageHero
        eyebrow="Our listings"
        title="Properties across the NCR"
        description="Verified apartments, plots, commercial spaces and rentals, handpicked by our advisors."
        crumbs={[{ label: "Properties" }]}
        image="/media/samples/walnut-hallway.webp"
      />
      <section className="container-luxe py-12 sm:py-16">
        {/* Filters come from the URL, so the results stream in at request time. */}
        <Suspense fallback={<ResultsSkeleton />}>
          <FilteredResults searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  )
}

async function FilteredResults({ searchParams }: { searchParams: PageProps<"/properties">["searchParams"] }) {
  const [params, localities] = await Promise.all([searchParams, getLocalities()])
  return <Results filters={parseFilters(params)} localities={localities} />
}
