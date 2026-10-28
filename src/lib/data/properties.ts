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
