import type { Metadata } from "next"
import { Suspense } from "react"

import { PropertyForm } from "@/components/admin/property-form"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { getAdminLocalities } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Add property" }

export default function NewPropertyPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewProperty />
    </Suspense>
  )
}

async function NewProperty() {
  const localities = await getAdminLocalities()
  return (
    <>
      <AdminHeader title="Add property" description="Fill in the details, add photos, then publish." />
      <PropertyForm
        isNew
        localities={localities}
        initial={{
          // The id is created up-front so photos can be uploaded before the first save.
          id: crypto.randomUUID(),
          title: "",
          slug: "",
          short_description: "",
          description: "",
          price: null,
          price_on_request: false,
          purpose: "sale",
          type: "apartment",
          locality_id: "",
          address: "",
          lat: null,
          lng: null,
          bhk: null,
          bathrooms: null,
          area: null,
          area_unit: "sqft",
          floor: null,
          total_floors: null,
          furnishing: "",
          facing: "",
          possession: "",
          availability: "available",
          amenities: [],
          video_url: "",
          video_path: null,
          is_featured: false,
          status: "draft",
          images: [],
        }}
      />
    </>
  )
}
