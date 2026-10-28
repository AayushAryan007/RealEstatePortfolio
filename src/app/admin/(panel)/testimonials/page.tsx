import type { Metadata } from "next"
import { Suspense } from "react"

import { TestimonialsEditor } from "@/components/admin/testimonials-editor"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { getAdminTestimonials } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Testimonials" }

export default function TestimonialsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Content />
    </Suspense>
  )
}

async function Content() {
  const rows = await getAdminTestimonials()
  return (
    <>
      <AdminHeader title="Testimonials" description="Client reviews shown in the moving carousel on the homepage." />
      <TestimonialsEditor rows={rows} />
    </>
  )
}
