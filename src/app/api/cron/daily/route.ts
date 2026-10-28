import { NextResponse, type NextRequest } from "next/server"
import { connection } from "next/server"

import { createPublicClient } from "@/lib/supabase/public"
import { createServiceClient } from "@/lib/supabase/admin"

/**
 * Daily maintenance, called by a GitHub Actions schedule (works on any host):
 * 1. A tiny database read, so the free Supabase project never pauses for inactivity.
 * 2. Permanently removes properties that have been in Trash for 30+ days (needs SUPABASE_SECRET_KEY).
 * Protected by a shared secret in the Authorization header.
 */
export async function GET(request: NextRequest) {
  await connection() // always run at request time, never cached
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error: pingError } = await createPublicClient().from("localities").select("id").limit(1)

  let purged = 0
  const service = createServiceClient()
  if (service) {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await service
      .from("properties")
      .select("id, video_path, images:property_images ( path_full, path_thumb )")
      .lt("deleted_at", cutoff)
    const rows = (data ?? []) as unknown as { id: string; video_path: string | null; images: { path_full: string; path_thumb: string }[] }[]

    if (rows.length) {
      const ids = rows.map((r) => r.id)
      const keys = rows
        .flatMap((r) => [r.video_path, ...r.images.flatMap((i) => [i.path_full, i.path_thumb])])
        .filter((k): k is string => Boolean(k) && !k!.startsWith("/"))
      await service.from("properties").delete().in("id", ids)
      // Keep files still used by another property (e.g. a duplicate).
      if (keys.length) {
        const { data: stillUsed } = await service.from("property_images").select("path_full, path_thumb")
        const used = new Set((stillUsed ?? []).flatMap((i) => [i.path_full, i.path_thumb]))
        const removable = keys.filter((k) => !used.has(k))
        if (removable.length) await service.storage.from("media").remove(removable)
      }
      purged = ids.length
    }
  }

  return NextResponse.json({ ok: !pingError, purged, trashCleanup: Boolean(service) })
}
