import "server-only"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import type { Database } from "@/types/database"
import { supabaseEnv } from "./env"

/**
 * Per-request client that carries the admin's login session from cookies.
 * Use it in admin pages and Server Actions; never inside `"use cache"`.
 */
export async function createSessionClient() {
  const { url, key } = supabaseEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy refreshes the session, so this is safe to ignore.
        }
      },
    },
  })
}
