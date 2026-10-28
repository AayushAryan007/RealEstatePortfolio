"use client"

import { useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { RotateCcwIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deletePropertiesForever, restoreProperties } from "@/actions/admin/properties"
import { Button } from "@/components/ui/button"
import type { AdminPropertyRow } from "@/lib/data/admin"
import { mediaUrl } from "@/lib/media"
import { ConfirmButton } from "./confirm-button"
import { AdminCard } from "./ui"

export function TrashList({ rows, daysLeft: days }: { rows: AdminPropertyRow[]; daysLeft: Record<string, number> }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const run = (task: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const result = await task()
      if (result.ok) {
        toast.success(success)
        router.refresh()
      } else toast.error(result.error ?? "Something went wrong")
    })

  if (!rows.length) {
    return (
      <AdminCard className="py-16 text-center text-sm text-taupe">
        <Trash2Icon className="mx-auto mb-3 size-8 text-gold/60" strokeWidth={1.25} aria-hidden="true" />
        Trash is empty.
      </AdminCard>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ConfirmButton
          variant="destructive"
          disabled={pending}
          title="Empty Trash?"
          description={`Permanently delete ${rows.length} propert${rows.length === 1 ? "y" : "ies"} and their photos. This cannot be undone.`}
          confirmLabel="Delete forever"
          destructive
          onConfirm={() => run(() => deletePropertiesForever(rows.map((r) => r.id)), "Trash emptied")}
        >
          <Trash2Icon aria-hidden="true" /> Empty Trash
        </ConfirmButton>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => {
          const daysLeft = days[row.id] ?? 30
          return (
            <li key={row.id}>
              <AdminCard className="flex flex-wrap items-center gap-4 p-3 sm:p-4">
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xs bg-ink-raised">
                  {row.thumb && <Image src={mediaUrl(row.thumb)!} alt="" fill sizes="64px" className="object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-cream">{row.title}</p>
                  <p className="text-xs text-taupe">
                    Permanently deleted in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                  </p>
                </div>
                <Button size="sm" variant="gold" disabled={pending} onClick={() => run(() => restoreProperties([row.id]), "Restored")}>
                  <RotateCcwIcon aria-hidden="true" /> Restore
                </Button>
                <ConfirmButton
                  size="sm"
                  variant="ghost"
                  className="text-taupe hover:text-destructive"
                  disabled={pending}
                  title="Delete forever?"
                  description={`"${row.title}" and its photos will be permanently deleted.`}
                  confirmLabel="Delete forever"
                  destructive
                  onConfirm={() => run(() => deletePropertiesForever([row.id]), "Deleted permanently")}
                >
                  <Trash2Icon aria-hidden="true" /> Delete
                </ConfirmButton>
              </AdminCard>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
