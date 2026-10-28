import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import type { PropertyFilters } from "@/lib/data/properties"
import { filtersToQuery } from "@/lib/filters"
import { cn } from "@/lib/utils"

/** Page numbers with ellipses: 1 … 4 5 6 … 12 */
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["…", p] as const) : [p]))
}

/** Numbered pagination with real links (crawlable, works without JS). */
export function Pagination({
  filters,
  totalPages,
  basePath = "/properties",
}: {
  filters: PropertyFilters
  totalPages: number
  basePath?: string
}) {
  if (totalPages <= 1) return null
  const href = (page: number) => `${basePath}${filtersToQuery({ ...filters, page })}`
  const current = filters.page

  const linkClass =
    "grid h-11 min-w-11 place-items-center rounded-xs border px-3 text-sm transition-colors duration-300"

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
      {current > 1 && (
        <Link href={href(current - 1)} aria-label="Previous page" className={cn(linkClass, "border-gold/20 text-gold hover:border-gold")}>
          <ChevronLeftIcon className="size-4" />
        </Link>
      )}
      {pageList(current, totalPages).map((page, i) =>
        page === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-taupe" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={href(page)}
            aria-current={page === current ? "page" : undefined}
            className={cn(
              linkClass,
              page === current ? "border-gold bg-gold font-semibold text-ink" : "border-gold/20 text-cream/80 hover:border-gold hover:text-cream",
            )}
          >
            {page}
          </Link>
        ),
      )}
      {current < totalPages && (
        <Link href={href(current + 1)} aria-label="Next page" className={cn(linkClass, "border-gold/20 text-gold hover:border-gold")}>
          <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </nav>
  )
}
