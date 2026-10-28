import "server-only"

import { requireAdmin } from "@/lib/auth"
import { getSiteSettings } from "@/lib/data/settings"
import type { PropertyImageRow, PropertyRow } from "@/types/database"

/**
 * Admin-side reads. Never cached: admins should always see the latest data.
 * Each call re-checks admin access.
 */

export type AdminPropertyRow = Pick<
  PropertyRow,
  "id" | "slug" | "title" | "price" | "price_on_request" | "purpose" | "type" | "status" | "availability" | "is_featured" | "featured_order" | "is_sample" | "updated_at" | "deleted_at"
> & { locality: { name: string } | null; thumb: string | null }

const LIST_SELECT = `id, slug, title, price, price_on_request, purpose, type, status, availability, is_featured, featured_order, is_sample, updated_at, deleted_at,
  locality:localities ( name ), images:property_images ( path_thumb, is_cover, sort_order )`

type ListRow = Omit<AdminPropertyRow, "thumb"> & { images: Pick<PropertyImageRow, "path_thumb" | "is_cover" | "sort_order">[] }

function withThumb({ images, ...row }: ListRow): AdminPropertyRow {
  const sorted = [...(images ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
  return { ...row, thumb: sorted[0]?.path_thumb ?? null }
}

export async function getAdminProperties(trashed = false): Promise<AdminPropertyRow[]> {
  const { supabase } = await requireAdmin()
  let query = supabase.from("properties").select(LIST_SELECT).order("updated_at", { ascending: false })
  query = trashed ? query.not("deleted_at", "is", null) : query.is("deleted_at", null)
  const { data } = await query
  return ((data ?? []) as unknown as ListRow[]).map(withThumb)
}

/** Trashed properties plus how many days remain before automatic deletion. */
export async function getTrashedProperties() {
  const rows = await getAdminProperties(true)
  const now = Date.now()
  const daysLeft = Object.fromEntries(
    rows.map((r) => [r.id, Math.max(0, 30 - Math.floor((now - new Date(r.deleted_at!).getTime()) / 86_400_000))]),
  )
  return { rows, daysLeft }
}

export async function getPropertyForEdit(id: string) {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from("properties").select("*, images:property_images ( * )").eq("id", id).maybeSingle()
  if (!data) return null
  const property = data as unknown as PropertyRow & { images: PropertyImageRow[] }
  property.images = [...(property.images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  return property
}

export async function getAdminLocalities() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from("localities").select("*").order("sort_order")
  return data ?? []
}

export async function getDashboardStats() {
  const { supabase } = await requireAdmin()
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0)
  const head = { count: "exact" as const, head: true }

  const [total, published, drafts, closed, featured, samples, newEnquiries, monthEnquiries, recent] = await Promise.all([
    count(supabase.from("properties").select("id", head).is("deleted_at", null)),
    count(supabase.from("properties").select("id", head).is("deleted_at", null).eq("status", "published")),
    count(supabase.from("properties").select("id", head).is("deleted_at", null).eq("status", "draft")),
    count(supabase.from("properties").select("id", head).is("deleted_at", null).neq("availability", "available")),
    count(supabase.from("properties").select("id", head).is("deleted_at", null).eq("is_featured", true)),
    count(supabase.from("properties").select("id", head).eq("is_sample", true)),
    count(supabase.from("enquiries").select("id", head).eq("status", "new")),
    count(supabase.from("enquiries").select("id", head).gte("created_at", monthStart.toISOString())),
    supabase
      .from("enquiries")
      .select("id, name, phone, message, status, created_at, property:properties ( title, slug )")
      .order("created_at", { ascending: false })
      .limit(5)
      .then((r) => r.data ?? []),
  ])

  return { total, published, drafts, closed, featured, samples, newEnquiries, monthEnquiries, recent }
}

export async function getAdminEnquiries() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from("enquiries")
    .select("id, name, phone, message, status, source_url, created_at, property:properties ( title, slug )")
    .order("created_at", { ascending: false })
    .limit(500)
  return (data ?? []) as unknown as {
    id: string
    name: string
    phone: string
    message: string | null
    status: "new" | "contacted" | "closed"
    source_url: string | null
    created_at: string
    property: { title: string; slug: string } | null
  }[]
}

export async function getAdminTestimonials() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from("testimonials").select("*").order("sort_order")
  return data ?? []
}

export async function getAdminSettings() {
  await requireAdmin()
  // Same merged view the public site uses, so the form shows exactly what's live.
  return getSiteSettings()
}
