import "server-only"

import { redirect } from "next/navigation"

import { createSessionClient } from "@/lib/supabase/server"

/**
 * Confirms the current request comes from a signed-in admin and returns a
 * Supabase client acting as them (so RLS applies). Call this at the top of
 * every admin page and Server Action. Never trust the client.
 */
export async function requireAdmin() {
  const supabase = await createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle()
  if (!admin) {
    await supabase.auth.signOut()
    redirect("/admin/login?error=not-admin")
  }

  return { supabase, user }
}
