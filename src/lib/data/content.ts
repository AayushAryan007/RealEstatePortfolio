import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { createPublicClient } from "@/lib/supabase/public"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { LocalityRow, TestimonialRow } from "@/types/database"
import { tags } from "./tags"

export async function getLocalities(): Promise<LocalityRow[]> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.localities)

  if (!hasSupabaseEnv()) return []
  const { data } = await createPublicClient()
    .from("localities")
    .select("*")
    .order("sort_order", { ascending: true })
  return data ?? []
}

export async function getTestimonials(): Promise<TestimonialRow[]> {
  "use cache"
  cacheLife("hours")
  cacheTag(tags.testimonials)

  if (!hasSupabaseEnv()) return []
  const { data } = await createPublicClient()
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
  return data ?? []
}
