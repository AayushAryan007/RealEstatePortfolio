import { NextResponse, type NextRequest } from "next/server"

import { createSessionClient } from "@/lib/supabase/server"

/**
 * Landing point for Supabase email links (password reset). Swaps the one-time
 * code for a session cookie, then continues to `next` (admin paths only).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next")
  const destination = next?.startsWith("/admin") ? next : "/admin"

  if (code) {
    const supabase = await createSessionClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${destination}`)
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link-expired`)
}
