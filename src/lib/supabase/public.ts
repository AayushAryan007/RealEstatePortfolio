import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import { supabaseEnv } from "./env"

/**
 * Cookie-free client for public, cacheable reads (listings, settings).
 * Because it never touches request data it can run inside `"use cache"`.
 * Row Level Security limits it to published content.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv()
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
