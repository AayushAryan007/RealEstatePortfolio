import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { FeaturedOrder } from "@/components/admin/featured-order"
import { PropertiesTable } from "@/components/admin/properties-table"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { getAdminProperties } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Properties" }

export default function AdminPropertiesPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <PropertiesContent />
    </Suspense>
  )
}

async function PropertiesContent() {
  const rows = await getAdminProperties()
  const featured = rows
    .filter((r) => r.is_featured && r.status === "published")
    .sort((a, b) => a.featured_order - b.featured_order)
    .map(({ id, title }) => ({ id, title }))

  return (
    <>
      <AdminHeader
        title="Properties"
        description="Add, edit, publish and feature listings."
        actions={
          <Button asChild>
            <Link href="/admin/properties/new">
              <PlusIcon aria-hidden="true" /> Add property
            </Link>
          </Button>
        }
      />
      <FeaturedOrder key={featured.map((f) => f.id).join()} items={featured} />
      <PropertiesTable rows={rows} />
    </>
  )
}
