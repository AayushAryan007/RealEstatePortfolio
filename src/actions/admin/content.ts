"use server"

import { updateTag } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { tags } from "@/lib/data/tags"
import { localitySchema, settingsSchemas, testimonialSchema, type SettingsKey } from "@/lib/validations/content"
import type { EnquiryStatus } from "@/types/database"

type Result = { ok: true } | { ok: false; error: string }

function firstIssue(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const issue = error.issues[0]
  return issue ? `${issue.path.join(" › ") || "Value"}: ${issue.message}` : "Invalid input"
}

// ---------------------------------------------------------------- settings
export async function saveSettings(key: SettingsKey, value: unknown): Promise<Result> {
  const { supabase } = await requireAdmin()
  const parsed = settingsSchemas[key].safeParse(value)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }

  const { error } = await supabase.from("site_settings").upsert({ key, value: parsed.data })
  if (error) return { ok: false, error: "Could not save. Please try again." }
  updateTag(tags.settings)
  return { ok: true }
}

// ---------------------------------------------------------------- enquiries
export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id)
  return error ? { ok: false, error: "Could not update." } : { ok: true }
}

export async function deleteEnquiries(ids: string[]): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("enquiries").delete().in("id", ids)
  return error ? { ok: false, error: "Could not delete." } : { ok: true }
}

// ---------------------------------------------------------------- testimonials
export async function saveTestimonial(value: unknown): Promise<Result> {
  const { supabase } = await requireAdmin()
  const parsed = testimonialSchema.safeParse(value)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const { id, location, ...rest } = parsed.data
  const row = { ...rest, location: location || null, ...(id ? { id } : {}) }
  const { error } = await supabase.from("testimonials").upsert(row)
  if (error) return { ok: false, error: "Could not save." }
  updateTag(tags.testimonials)
  return { ok: true }
}

export async function deleteTestimonial(id: string): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("testimonials").delete().eq("id", id)
  if (error) return { ok: false, error: "Could not delete." }
  updateTag(tags.testimonials)
  return { ok: true }
}

// ---------------------------------------------------------------- localities
export async function saveLocality(value: unknown): Promise<Result> {
  const { supabase } = await requireAdmin()
  const parsed = localitySchema.safeParse(value)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const { id, intro, ...rest } = parsed.data
  const { error } = await supabase.from("localities").upsert({ ...rest, intro: intro || null, ...(id ? { id } : {}) })
  if (error) {
    return { ok: false, error: error.code === "23505" ? "An area with this name or web address already exists." : "Could not save." }
  }
  updateTag(tags.localities)
  updateTag(tags.properties)
  return { ok: true }
}

export async function deleteLocality(id: string): Promise<Result> {
  const { supabase } = await requireAdmin()
  const { count } = await supabase.from("properties").select("id", { count: "exact", head: true }).eq("locality_id", id)
  if (count) return { ok: false, error: `${count} propert${count === 1 ? "y uses" : "ies use"} this area. Move them to another area first.` }
  const { error } = await supabase.from("localities").delete().eq("id", id)
  if (error) return { ok: false, error: "Could not delete." }
  updateTag(tags.localities)
  return { ok: true }
}
