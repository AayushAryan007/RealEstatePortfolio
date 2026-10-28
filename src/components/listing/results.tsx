import Link from "next/link"
import { SearchXIcon } from "lucide-react"

import { PropertyCard } from "@/components/property/property-card"
import { Button } from "@/components/ui/button"
import { PAGE_SIZE, searchProperties, type PropertyFilters } from "@/lib/data/properties"
import { filtersToQuery } from "@/lib/filters"
import { FilterForm } from "./filter-form"
import { MobileFilters } from "./mobile-filters"
import { Pagination } from "./pagination"
import { SortSelect } from "./sort-select"

type ResultsProps = {
  filters: PropertyFilters
  localities: { name: string; slug: string }[]
  /** Where pagination links point (area pages use their own path). */
  basePath?: string
  /** Area pages fix the locality, so they hide the filter and sort controls. */
  showFilters?: boolean
}

function activeFilterCount(f: PropertyFilters) {
  return [f.q, f.type, f.purpose, f.locality, f.min, f.max, f.bhk].filter((v) => v !== undefined && v !== "").length
}

/** Filters + result grid + pagination for a given set of filters. */
export async function Results({ filters, localities, basePath = "/properties", showFilters = true }: ResultsProps) {
  const { items, total } = await searchProperties(filters)
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const formKey = filtersToQuery(filters) // remount the form when the URL changes

  return (
    <div className={showFilters ? "grid gap-10 lg:grid-cols-[18rem_1fr] xl:gap-14" : ""}>
      {showFilters && (
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-28 rounded-md border border-gold/10 bg-card/60 p-6">
            <FilterForm key={formKey} filters={filters} localities={localities} idPrefix="d" />
          </div>
        </aside>
      )}

      <div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-taupe" aria-live="polite">
            <span className="font-heading text-2xl text-cream">{total}</span>{" "}
            {total === 1 ? "property" : "properties"} found
          </p>
          <div className="flex items-center gap-3">
            {showFilters && (
              <>
                <MobileFilters key={formKey} filters={filters} localities={localities} activeCount={activeFilterCount(filters)} />
                <SortSelect filters={filters} />
              </>
            )}
          </div>
        </div>

        <h2 className="sr-only">Property listings</h2>
        {items.length ? (
          <ul className={showFilters ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
            {items.map((property, i) => (
              <li key={property.id}>
                <PropertyCard property={property} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}

        <Pagination filters={filters} totalPages={totalPages} basePath={basePath} />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-gold/25 px-6 py-20 text-center">
      <SearchXIcon className="mx-auto size-10 text-gold/70" strokeWidth={1} aria-hidden="true" />
      <h2 className="mt-5 text-3xl text-cream">No matching properties yet</h2>
      <p className="mx-auto mt-3 max-w-md text-taupe">
        Try widening your filters, or tell us what you need. Many of our best listings never go online.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="gold" asChild>
          <Link href="/properties">Clear filters</Link>
        </Button>
        <Button asChild>
          <Link href="/contact">Tell us what you need</Link>
        </Button>
      </div>
    </div>
  )
}

/** Placeholder shown while results stream in: same shape, so nothing jumps. */
export function ResultsSkeleton({ withFilters = true }: { withFilters?: boolean }) {
  return (
    <div className={withFilters ? "grid gap-10 lg:grid-cols-[18rem_1fr] xl:gap-14" : ""} aria-hidden="true">
      {withFilters && <div className="hidden h-[34rem] animate-pulse rounded-md bg-card/60 lg:block" />}
      <div>
        <div className="mb-8 h-10 w-48 animate-pulse rounded-xs bg-card" />
        <div className={withFilters ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-gold/10 bg-card">
              <div className="aspect-[4/3] animate-pulse bg-ink-raised" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-1/3 animate-pulse rounded-xs bg-muted" />
                <div className="h-5 w-4/5 animate-pulse rounded-xs bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded-xs bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
