import type { Metadata } from "next"
import { Suspense } from "react"

import { ContentEditor } from "@/components/admin/content-editor"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { getAdminSettings } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Site content" }

export default function ContentPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  const settings = await getAdminSettings()
  return (
    <>
      <AdminHeader title="Site content" description="Edit the text and contact details shown across the website." />
      <ContentEditor settings={settings} />
    </>
  )
}
