import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import { PropertyForm } from "@/components/admin/property-form"
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { getAdminLocalities, getPropertyForEdit } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Edit property" }

export default function EditPropertyPage(props: PageProps<"/admin/properties/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditProperty params={props.params} />
    </Suspense>
  )
}

async function EditProperty({ params }: { params: PageProps<"/admin/properties/[id]">["params"] }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const [property, localities] = await Promise.all([getPropertyForEdit(id), getAdminLocalities()])
  if (!property) notFound()

  return (
    <>
      <AdminHeader
        title="Edit property"
        description={property.deleted_at ? "This property is in Trash. Restore it to show it on the site." : property.title}
      />
      <PropertyForm
        key={property.updated_at}
        isNew={false}
        localities={localities}
        initial={{
          id: property.id,
          title: property.title,
          slug: property.slug,
          short_description: property.short_description ?? "",
          description: property.description ?? "",
          price: property.price,
          price_on_request: property.price_on_request,
          purpose: property.purpose,
          type: property.type,
          locality_id: property.locality_id ?? "",
          address: property.address ?? "",
          lat: property.lat,
          lng: property.lng,
          bhk: property.bhk,
          bathrooms: property.bathrooms,
          area: property.area,
          area_unit: property.area_unit,
          floor: property.floor,
          total_floors: property.total_floors,
          furnishing: property.furnishing ?? "",
          facing: property.facing ?? "",
          possession: property.possession ?? "",
          availability: property.availability,
          amenities: property.amenities,
          video_url: property.video_url ?? "",
          video_path: property.video_path,
          is_featured: property.is_featured,
          status: property.status,
          images: property.images.map(({ path_full, path_thumb, width, height, alt, is_cover }) => ({
            path_full,
            path_thumb,
            width,
            height,
            alt,
            is_cover,
          })),
        }}
      />
    </>
  )
}
