"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { removeSampleData } from "@/actions/admin/properties"
import { ConfirmButton } from "./confirm-button"

export function RemoveSamplesButton() {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <ConfirmButton
      title="Remove all sample content?"
      description="This permanently deletes every sample listing and sample testimonial. Your own listings are not affected."
      confirmLabel="Remove samples"
      destructive
      onConfirm={() =>
        start(async () => {
          const result = await removeSampleData()
          if (result.ok) {
            toast.success("Sample content removed")
            router.refresh()
          } else toast.error(result.error)
        })
      }
    >
      {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <Trash2Icon aria-hidden="true" />}
      Remove sample content
    </ConfirmButton>
  )
}
