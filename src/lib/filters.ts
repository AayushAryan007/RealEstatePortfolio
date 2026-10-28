import type { PropertyFilters, SortOption } from "@/lib/data/properties"
import type { PropertyType } from "@/types/database"

type RawParams = Record<string, string | string[] | undefined>

const TYPES: PropertyType[] = ["apartment", "plot", "commercial"]
const SORTS: SortOption[] = ["newest", "price_asc", "price_desc"]

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function toNumber(value: string | undefined) {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

/**
 * Turn URL search params into validated filters. Unknown values are ignored,
 * so a hand-edited URL can never break the query. Accepts the hero's
 * `budget=min-max` shortcut as well as separate `min` / `max`.
 */
export function parseFilters(params: RawParams): PropertyFilters {
  const type = first(params.type)
  const purpose = first(params.purpose)
  const sort = first(params.sort)
  const [budgetMin, budgetMax] = (first(params.budget) ?? "").split("-")
  const page = Math.max(1, Math.floor(toNumber(first(params.page)) ?? 1))
  const bhk = toNumber(first(params.bhk))

  return {
    q: first(params.q)?.trim().slice(0, 60) || undefined,
    type: TYPES.includes(type as PropertyType) ? (type as PropertyType) : undefined,
    purpose: purpose === "sale" || purpose === "rent" ? purpose : undefined,
    locality: first(params.locality)?.match(/^[a-z0-9-]{1,60}$/) ? first(params.locality) : undefined,
    min: toNumber(first(params.min)) ?? toNumber(budgetMin),
    max: toNumber(first(params.max)) ?? toNumber(budgetMax),
    bhk: bhk && bhk >= 1 && bhk <= 4 ? Math.floor(bhk) : undefined,
    sort: SORTS.includes(sort as SortOption) ? (sort as SortOption) : "newest",
    page,
  }
}

/** Serialise filters back into a clean query string (defaults omitted). */
export function filtersToQuery(filters: Partial<PropertyFilters>) {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.type) params.set("type", filters.type)
  if (filters.purpose) params.set("purpose", filters.purpose)
  if (filters.locality) params.set("locality", filters.locality)
  if (filters.min !== undefined) params.set("min", String(filters.min))
  if (filters.max !== undefined) params.set("max", String(filters.max))
  if (filters.bhk) params.set("bhk", String(filters.bhk))
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort)
  if (filters.page && filters.page > 1) params.set("page", String(filters.page))
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function hasActiveFilters(filters: PropertyFilters) {
  return Boolean(
    filters.q || filters.type || filters.purpose || filters.locality || filters.min !== undefined || filters.max !== undefined || filters.bhk,
  )
}
