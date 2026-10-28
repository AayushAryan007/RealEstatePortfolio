import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

/** Admin pages anyone may open (the login flow itself). */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/auth/callback"]

/**
 * Runs before every /admin request:
 * 1. refreshes the Supabase session cookie so admins stay signed in,
 * 2. sends signed-out visitors to the login page.
 * Real authorisation still happens on the server (requireAdmin + RLS);
 * this is only the first gate.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = path === "/admin" ? "" : `?next=${encodeURIComponent(path)}`
    return NextResponse.redirect(url)
  }

  if (user && path === "/admin/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    url.search = ""
    return NextResponse.redirect(url)
  }

  // Keep the admin area out of search engines entirely.
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
