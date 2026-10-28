import type { Metadata } from "next"
import { Suspense } from "react"

import { TrashList } from "@/components/admin/trash-list"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { getTrashedProperties } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Trash" }

export default function TrashPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <TrashContent />
    </Suspense>
  )
}

async function TrashContent() {
  const { rows, daysLeft } = await getTrashedProperties()
  return (
    <>
      <AdminHeader title="Trash" description="Deleted properties stay here for 30 days, then are removed permanently." />
      <TrashList rows={rows} daysLeft={daysLeft} />
    </>
  )
}
