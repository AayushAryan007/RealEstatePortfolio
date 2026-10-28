"use client"

import { useRouter } from "next/navigation"

import type { PropertyFilters, SortOption } from "@/lib/data/properties"
import { filtersToQuery } from "@/lib/filters"

export function SortSelect({ filters }: { filters: PropertyFilters }) {
  const router = useRouter()
  return (
    <label className="flex items-center gap-3 text-sm text-taupe">
      <span className="hidden sm:inline">Sort by</span>
      <span className="relative">
        <select
          aria-label="Sort properties"
          value={filters.sort}
          onChange={(event) =>
            router.push(`/properties${filtersToQuery({ ...filters, sort: event.target.value as SortOption, page: 1 })}`, {
              scroll: false,
            })
          }
          className="h-10 cursor-pointer appearance-none rounded-xs border border-input bg-ink/60 pr-8 pl-3 text-sm text-cream focus-visible:border-gold [&>option]:bg-ink-raised"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
        </svg>
      </span>
    </label>
  )
}
