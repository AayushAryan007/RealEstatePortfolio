import type { Metadata } from "next"
import { Suspense } from "react"

import { AreasEditor } from "@/components/admin/areas-editor"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { getAdminLocalities } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Areas" }

export default function AreasPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  const rows = await getAdminLocalities()
  return (
    <>
      <AdminHeader title="Areas" description="Localities you serve. Each gets its own page on the website and appears in search filters." />
      <AreasEditor rows={rows} />
    </>
  )
}
