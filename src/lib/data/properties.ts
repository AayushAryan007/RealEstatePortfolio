import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { createPublicClient } from "@/lib/supabase/public"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { LocalityRow, PropertyImageRow, PropertyRow, PropertyType } from "@/types/database"
import { tags } from "./tags"

/** Fields a listing card needs: kept small so pages stay light. */
export type PropertyCardData = Pick<
  PropertyRow,
  | "id"
  | "slug"
  | "title"
  | "price"
  | "price_on_request"
  | "purpose"
  | "type"
  | "bhk"
  | "area"
  | "area_unit"
  | "availability"
  | "is_featured"
> & {
  locality: Pick<LocalityRow, "name" | "slug"> | null
  cover: Pick<PropertyImageRow, "path_thumb" | "width" | "height" | "alt"> | null
}

const CARD_SELECT = `
  id, slug, title, price, price_on_request, purpose, type, bhk, area, area_unit, availability, is_featured,
  locality:localities ( name, slug ),
  images:property_images ( path_thumb, width, height, alt, is_cover, sort_order )
`

type CardQueryRow = Omit<PropertyCardData, "cover"> & {
  images: (Pick<PropertyImageRow, "path_thumb" | "width" | "height" | "alt" | "is_cover" | "sort_order">)[]
}

/** Pick the cover photo (or the first photo) for a card. */
function toCard({ images, ...row }: CardQueryRow): PropertyCardData {
  const sorted = [...(images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const cover = sorted.find((img) => img.is_cover) ?? sorted[0] ?? null
  return {
    ...row,
    cover: cover && { path_thumb: cover.path_thumb, width: cover.width, height: cover.height, alt: cover.alt },
  }
}

/** Featured listings for the homepage, in the admin's chosen order. */
export async function getFeaturedProperties(limit = 6): Promise<PropertyCardData[]> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.properties)

  if (!hasSupabaseEnv()) return []

  const { data, error } = await createPublicClient()
    .from("properties")
    .select(CARD_SELECT)
    .eq("is_featured", true)
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return (data as unknown as CardQueryRow[]).map(toCard)
}

/** Number of live listings per category, for the property-type tiles. */
export async function getCategoryCounts() {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.properties)

  const counts = { apartment: 0, plot: 0, commercial: 0, rent: 0 }
  if (!hasSupabaseEnv()) return counts

  const { data } = await createPublicClient()
    .from("properties")
    .select("type, purpose, availability")
    .eq("availability", "available")

  for (const row of data ?? []) {
    counts[row.type as PropertyType] += 1
    if (row.purpose === "rent") counts.rent += 1
  }
  return counts
}

// ---------------------------------------------------------------------------
// Listing search
// ---------------------------------------------------------------------------

export const PAGE_SIZE = 12

export type SortOption = "newest" | "price_asc" | "price_desc"

export type PropertyFilters = {
  q?: string
  type?: PropertyType
  purpose?: "sale" | "rent"
  locality?: string // locality slug
  min?: number
  max?: number
  bhk?: number // 4 means "4 or more"
  sort: SortOption
  page: number
}

/** Strip characters that have meaning in PostgREST filter syntax. */
function safeSearchTerm(q: string) {
  return q.replace(/[%,().*:\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60)
}

/** Paginated, filtered listings. Arguments form the cache key. */
export async function searchProperties(filters: PropertyFilters): Promise<{
  items: PropertyCardData[]
  total: number
}> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.properties)

  if (!hasSupabaseEnv()) return { items: [], total: 0 }
  const supabase = createPublicClient()

  let query = supabase.from("properties").select(CARD_SELECT, { count: "exact" })

  if (filters.locality) {
    const { data: locality } = await supabase.from("localities").select("id").eq("slug", filters.locality).maybeSingle()
    if (!locality) return { items: [], total: 0 }
    query = query.eq("locality_id", locality.id)
  }
  if (filters.type) query = query.eq("type", filters.type)
  if (filters.purpose) query = query.eq("purpose", filters.purpose)
  if (filters.min !== undefined) query = query.gte("price", filters.min)
  if (filters.max !== undefined) query = query.lte("price", filters.max)
  if (filters.bhk) query = filters.bhk >= 4 ? query.gte("bhk", 4) : query.eq("bhk", filters.bhk)

  const term = filters.q ? safeSearchTerm(filters.q) : ""
  if (term) query = query.or(`title.ilike.%${term}%,address.ilike.%${term}%`)

  // Available listings first, then the chosen order.
  query = query.order("availability", { ascending: true })
  if (filters.sort === "price_asc") query = query.order("price", { ascending: true, nullsFirst: false })
  else if (filters.sort === "price_desc") query = query.order("price", { ascending: false, nullsFirst: false })
  else query = query.order("published_at", { ascending: false, nullsFirst: false })
  query = query.order("created_at", { ascending: false })

  const from = (filters.page - 1) * PAGE_SIZE
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)
  if (error || !data) return { items: [], total: 0 }

  return { items: (data as unknown as CardQueryRow[]).map(toCard), total: count ?? 0 }
}

// ---------------------------------------------------------------------------
// Property detail
// ---------------------------------------------------------------------------

export type PropertyDetail = PropertyRow & {
  locality: Pick<LocalityRow, "id" | "name" | "slug"> | null
  images: PropertyImageRow[]
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail | null> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.properties, tags.property(slug))

  if (!hasSupabaseEnv()) return null
  const { data } = await createPublicClient()
    .from("properties")
    .select("*, locality:localities ( id, name, slug ), images:property_images ( * )")
    .eq("slug", slug)
    .maybeSingle()

  if (!data) return null
  const detail = data as unknown as PropertyDetail
  detail.images = [...(detail.images ?? [])].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  )
  return detail
}

/** Up to `limit` other listings of the same type, preferring the same locality. */
export async function getSimilarProperties(property: PropertyDetail, limit = 3): Promise<PropertyCardData[]> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.properties)

  if (!hasSupabaseEnv()) return []
  const { data } = await createPublicClient()
    .from("properties")
    .select(CARD_SELECT)
    .eq("type", property.type)
    .eq("purpose", property.purpose)
    .neq("id", property.id)
    .eq("availability", "available")
    .limit(12)

  const cards = ((data ?? []) as unknown as CardQueryRow[]).map(toCard)
  const sameArea = cards.filter((c) => c.locality?.slug === property.locality?.slug)
  const others = cards.filter((c) => c.locality?.slug !== property.locality?.slug)
  return [...sameArea, ...others].slice(0, limit)
}

/** Every published slug, for prerendering and the sitemap. */
export async function getAllPropertySlugs(): Promise<{ slug: string; updated_at: string }[]> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.properties)

  if (!hasSupabaseEnv()) return []
  const { data } = await createPublicClient().from("properties").select("slug, updated_at")
  return data ?? []
}
