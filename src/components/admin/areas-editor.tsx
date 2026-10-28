"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ImagePlusIcon, Loader2Icon, PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deleteLocality, saveLocality } from "@/actions/admin/content"
import { Button } from "@/components/ui/button"
import { processImage } from "@/lib/image-process"
import { mediaUrl } from "@/lib/media"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { cn } from "@/lib/utils"
import { slugify } from "@/lib/validations/property"
import type { LocalityRow } from "@/types/database"
import { ConfirmButton } from "./confirm-button"
import { AdminCard, adminInput, adminLabel } from "./ui"

type Draft = { id?: string; name: string; slug: string; intro: string; image_path: string | null; sort_order: number }

export function AreasEditor({ rows }: { rows: LocalityRow[] }) {
  const [adding, setAdding] = useState(false)
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <AreaCard key={row.id} initial={{ ...row, intro: row.intro ?? "" }} />
      ))}
      {adding ? (
        <AreaCard isNew onDone={() => setAdding(false)} initial={{ name: "", slug: "", intro: "", image_path: null, sort_order: rows.length + 1 }} />
      ) : (
        <Button variant="gold" onClick={() => setAdding(true)}>
          <PlusIcon aria-hidden="true" /> Add area
        </Button>
      )}
    </div>
  )
}

function AreaCard({ initial, isNew, onDone }: { initial: Draft; isNew?: boolean; onDone?: () => void }) {
  const router = useRouter()
  const [area, setArea] = useState<Draft>(initial)
  const [pending, start] = useTransition()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const id = initial.id ?? "new"

  const run = (task: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const result = await task()
      if (result.ok) {
        toast.success(success)
        onDone?.()
        router.refresh()
      } else toast.error(result.error ?? "Something went wrong")
    })

  async function upload(file: File) {
    setUploading(true)
    try {
      const processed = await processImage(file)
      const path = `areas/${slugify(area.name || "area")}-${crypto.randomUUID().slice(0, 6)}.${processed.ext}`
      const { error } = await createBrowserSupabase()
        .storage.from("media")
        .upload(path, processed.full, { contentType: processed.ext === "webp" ? "image/webp" : "image/jpeg", cacheControl: "31536000" })
      if (error) throw error
      setArea((a) => ({ ...a, image_path: path }))
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : "unknown error"}`)
    } finally {
      setUploading(false)
    }
  }

  const image = mediaUrl(area.image_path)

  return (
    <AdminCard className={cn(isNew && "border-gold/40")}>
      <form
        className="grid gap-5 md:grid-cols-[12rem_1fr]"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => saveLocality(area), "Area saved")
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-xs border border-dashed border-gold/30 bg-ink-raised text-xs text-taupe hover:border-gold"
            aria-label="Change area photo"
          >
            {image && <Image src={image} alt="" fill sizes="192px" className="object-cover" />}
            <span className="relative flex items-center gap-1.5 rounded-xs bg-ink/70 px-2 py-1">
              {uploading ? <Loader2Icon className="size-3.5 animate-spin" /> : <ImagePlusIcon className="size-3.5" />}
              {image ? "Change photo" : "Add photo"}
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_6rem]">
            <div>
              <label htmlFor={`a-name-${id}`} className={adminLabel}>Name</label>
              <input
                id={`a-name-${id}`}
                value={area.name}
                required
                onChange={(e) => setArea((a) => ({ ...a, name: e.target.value, slug: isNew ? slugify(e.target.value) : a.slug }))}
                className={adminInput}
              />
            </div>
            <div>
              <label htmlFor={`a-slug-${id}`} className={adminLabel}>Web address</label>
              <div className="flex items-center rounded-xs border border-input bg-ink/60 focus-within:border-gold">
                <span className="pl-3 text-xs text-taupe">/areas/</span>
                <input id={`a-slug-${id}`} value={area.slug} onChange={(e) => setArea({ ...area, slug: e.target.value })} className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-sm text-cream outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor={`a-order-${id}`} className={adminLabel}>Order</label>
              <input id={`a-order-${id}`} type="number" min={0} value={area.sort_order} onChange={(e) => setArea({ ...area, sort_order: Number(e.target.value) })} className={adminInput} />
            </div>
          </div>
          <div>
            <label htmlFor={`a-intro-${id}`} className={adminLabel}>Introduction (shown on the area page, good for Google)</label>
            <textarea id={`a-intro-${id}`} rows={3} value={area.intro} onChange={(e) => setArea({ ...area, intro: e.target.value })} className={cn(adminInput, "h-auto py-2")} />
          </div>
          <div className="flex justify-end gap-2">
            {isNew ? (
              <Button type="button" variant="ghost" onClick={onDone}>
                Cancel
              </Button>
            ) : (
              <ConfirmButton
                variant="ghost"
                className="text-taupe hover:text-destructive"
                title={`Delete ${initial.name}?`}
                description="Only possible when no property uses this area."
                confirmLabel="Delete"
                destructive
                onConfirm={() => run(() => deleteLocality(initial.id!), "Area deleted")}
              >
                <Trash2Icon aria-hidden="true" /> Delete
              </ConfirmButton>
            )}
            <Button type="submit" disabled={pending || uploading}>
              {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <SaveIcon aria-hidden="true" />} Save
            </Button>
          </div>
        </div>
      </form>
    </AdminCard>
  )
}
