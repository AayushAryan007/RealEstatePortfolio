import type { Metadata } from "next"
import { Suspense } from "react"

import { EnquiriesTable } from "@/components/admin/enquiries-table"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { getAdminEnquiries } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Enquiries" }

export default function EnquiriesPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EnquiriesContent />
    </Suspense>
  )
}

async function EnquiriesContent() {
  const rows = await getAdminEnquiries()
  return (
    <>
      <AdminHeader title="Enquiries" description="Messages from the website's enquiry forms. Replying on WhatsApp marks them as contacted." />
      <EnquiriesTable rows={rows} />
    </>
  )
}
