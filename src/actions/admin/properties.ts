"use server"

import { updateTag } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { tags } from "@/lib/data/tags"
import { sanitizeDescription } from "@/lib/sanitize"
import { propertySchema, slugify } from "@/lib/validations/property"
import type { PropertyImageRow, PropertyRow } from "@/types/database"

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string; fieldErrors?: Record<string, string> }

const BUCKET = "media"

/** Storage keys under a property's folder (sample photos in /public are skipped). */
function storageKeys(paths: (string | null | undefined)[]) {
  return paths.filter((p): p is string => Boolean(p) && !p!.startsWith("/") && !p!.startsWith("http"))
}

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"]

/** Drop keys still referenced by any photo or video row (e.g. shared by a duplicate). */
async function unusedKeys(supabase: AdminClient, keys: string[]) {
  if (!keys.length) return []
  const list = keys.map((k) => `"${k.replace(/"/g, "")}"`).join(",")
  const [{ data: imgs }, { data: vids }] = await Promise.all([
    supabase.from("property_images").select("path_full, path_thumb").or(`path_full.in.(${list}),path_thumb.in.(${list})`),
    supabase.from("properties").select("video_path").in("video_path", keys),
  ])
  const used = new Set([
    ...(imgs ?? []).flatMap((i) => [i.path_full, i.path_thumb]),
    ...(vids ?? []).map((v) => v.video_path),
  ])
  return keys.filter((k) => !used.has(k))
}

function refresh(...slugs: (string | undefined)[]) {
  updateTag(tags.properties)
  for (const slug of slugs) if (slug) updateTag(tags.property(slug))
}

/** Create or update a property, its photos, and clean up removed files. */
export async function saveProperty(raw: unknown): Promise<Result<{ id: string; slug: string }>> {
  const { supabase } = await requireAdmin()

  const parsed = propertySchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors }
  }
  const { images, ...data } = parsed.data

  // Existing row (if editing): needed for slug changes and file clean-up.
  type Files = { slug: string; video_path: string | null; images: { path_full: string; path_thumb: string }[] }
  const { data: existingRow } = await supabase
    .from("properties")
    .select("slug, video_path, images:property_images ( path_full, path_thumb )")
    .eq("id", data.id)
    .maybeSingle()
  const existing = existingRow as unknown as Files | null

  // Make the slug unique by appending -2, -3… if another property uses it.
  let slug = slugify(data.slug) || slugify(data.title)
  for (let n = 2; ; n++) {
    const { data: clash } = await supabase.from("properties").select("id").eq("slug", slug).neq("id", data.id).maybeSingle()
    if (!clash) break
    slug = `${slugify(data.slug)}-${n}`
  }

  // Featured items go to the end of the featured order when first featured.
  let featured_order: number | undefined
  if (data.is_featured) {
    const { data: current } = await supabase.from("properties").select("is_featured, featured_order").eq("id", data.id).maybeSingle()
    if (!current?.is_featured) {
      const { data: last } = await supabase
        .from("properties")
        .select("featured_order")
        .eq("is_featured", true)
        .order("featured_order", { ascending: false })
        .limit(1)
        .maybeSingle()
      featured_order = (last?.featured_order ?? 0) + 1
    }
  }

  const row = {
    ...data,
    slug,
    description: data.description ? sanitizeDescription(data.description) : null,
    short_description: data.short_description || null,
    address: data.address || null,
    video_url: data.video_url || null,
    video_path: data.video_path || null,
    ...(featured_order !== undefined ? { featured_order } : {}),
  }

  const { error } = await supabase.from("properties").upsert(row)
  if (error) {
    console.error("saveProperty", error)
    return { ok: false, error: "Could not save the property. Please try again." }
  }

  // Replace the photo list (simple and safe for ≤20 photos).
  await supabase.from("property_images").delete().eq("property_id", data.id)
  if (images.length) {
    const hasCover = images.some((img) => img.is_cover)
    const { error: imgError } = await supabase.from("property_images").insert(
      images.map((img, i) => ({
        property_id: data.id,
        path_full: img.path_full,
        path_thumb: img.path_thumb,
        width: img.width,
        height: img.height,
        alt: img.alt || null,
        sort_order: i,
        is_cover: hasCover ? img.is_cover : i === 0,
      })),
    )
    if (imgError) {
      console.error("saveProperty images", imgError)
      return { ok: false, error: "Saved, but the photos could not be updated. Please try again." }
    }
  }

  // Delete files that are no longer used by this property.
  if (existing) {
    const kept = new Set(images.flatMap((img) => [img.path_full, img.path_thumb]).concat(row.video_path ?? []))
    const old = storageKeys([
      ...(existing.images ?? []).flatMap((img) => [img.path_full, img.path_thumb]),
      existing.video_path,
    ])
    const removed = await unusedKeys(supabase, old.filter((key) => !kept.has(key)))
    if (removed.length) await supabase.storage.from(BUCKET).remove(removed)
  }

  refresh(slug, existing?.slug)
  return { ok: true, id: data.id, slug }
}

/** Move to Trash (hidden from the site, restorable for 30 days). */
export async function trashProperties(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("properties").update({ deleted_at: new Date().toISOString() }).in("id", ids)
  if (error) return { ok: false, error: "Could not move to Trash." }
  refresh()
  return { ok: true }
}

export async function restoreProperties(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("properties").update({ deleted_at: null }).in("id", ids)
  if (error) return { ok: false, error: "Could not restore." }
  refresh()
  return { ok: true }
}

/** Permanently delete properties and their uploaded files. */
export async function deletePropertiesForever(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from("properties")
    .select("video_path, images:property_images ( path_full, path_thumb )")
    .in("id", ids)
  const rows = data as unknown as { video_path: string | null; images: { path_full: string; path_thumb: string }[] }[] | null

  const keys = storageKeys((rows ?? []).flatMap((r) => [r.video_path, ...(r.images ?? []).flatMap((i) => [i.path_full, i.path_thumb])]))
  const { error } = await supabase.from("properties").delete().in("id", ids)
  if (error) return { ok: false, error: "Could not delete." }
  // Rows are gone now, so anything still referenced belongs to another property.
  const removable = await unusedKeys(supabase, keys)
  if (removable.length) await supabase.storage.from(BUCKET).remove(removable)
  refresh()
  return { ok: true }
}

/** Copy a property as a new draft (photos are shared until replaced). */
export async function duplicateProperty(id: string): Promise<Result<{ id: string }>> {
  const { supabase } = await requireAdmin()
  const { data: sourceRow } = await supabase.from("properties").select("*, images:property_images ( * )").eq("id", id).single()
  const source = sourceRow as unknown as (PropertyRow & { images: PropertyImageRow[] }) | null
  if (!source) return { ok: false, error: "Property not found." }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropped from the copy
  const { images, id: _oldId, created_at: _c, updated_at: _u, published_at: _p, ...rest } = source
  const newId = crypto.randomUUID()
  const { error } = await supabase.from("properties").insert({
    ...rest,
    id: newId,
    title: `${rest.title} (copy)`.slice(0, 140),
    slug: `${rest.slug}-copy-${newId.slice(0, 4)}`,
    status: "draft",
    is_featured: false,
    is_sample: false,
  })
  if (error) return { ok: false, error: "Could not duplicate." }

  if (images?.length) {
    // Photos are shared with the original. Remove them from storage only when no property uses them.
    await supabase.from("property_images").insert(
      images.map(({ path_full, path_thumb, width, height, alt, sort_order, is_cover }) => ({
        property_id: newId,
        path_full,
        path_thumb,
        width,
        height,
        alt,
        sort_order,
        is_cover,
      })),
    )
  }
  refresh()
  return { ok: true, id: newId }
}

export async function setFeatured(id: string, featured: boolean): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("properties").update({ is_featured: featured }).eq("id", id)
  if (error) return { ok: false, error: "Could not update." }
  refresh()
  return { ok: true }
}

export async function setStatus(ids: string[], status: "draft" | "published"): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("properties").update({ status }).in("id", ids)
  if (error) return { ok: false, error: "Could not update status." }
  refresh()
  return { ok: true }
}

/** Save the drag-and-drop order of featured listings. */
export async function reorderFeatured(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin()
  await Promise.all(ids.map((id, i) => supabase.from("properties").update({ featured_order: i + 1 }).eq("id", id)))
  refresh()
  return { ok: true }
}

/** One click before launch: remove every sample listing and testimonial. */
export async function removeSampleData(): Promise<Result> {
  const { supabase } = await requireAdmin()
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("properties").delete().eq("is_sample", true),
    supabase.from("testimonials").delete().eq("is_sample", true),
  ])
  if (e1 || e2) return { ok: false, error: "Could not remove all sample data." }
  refresh()
  updateTag(tags.testimonials)
  return { ok: true }
}
