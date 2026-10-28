"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, PlusIcon, SaveIcon, StarIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deleteTestimonial, saveTestimonial } from "@/actions/admin/content"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { TestimonialRow } from "@/types/database"
import { cn } from "@/lib/utils"
import { ConfirmButton } from "./confirm-button"
import { AdminCard, adminInput, adminLabel } from "./ui"

type Draft = Omit<TestimonialRow, "id" | "created_at" | "is_sample"> & { id?: string; is_sample?: boolean }

const blank = (order: number): Draft => ({ name: "", location: "", quote: "", rating: 5, sort_order: order, is_published: true })

export function TestimonialsEditor({ rows }: { rows: TestimonialRow[] }) {
  const [adding, setAdding] = useState(false)
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <TestimonialCard key={row.id} initial={row} />
      ))}
      {adding ? (
        <TestimonialCard initial={blank(rows.length + 1)} onDone={() => setAdding(false)} isNew />
      ) : (
        <Button variant="gold" onClick={() => setAdding(true)}>
          <PlusIcon aria-hidden="true" /> Add testimonial
        </Button>
      )}
    </div>
  )
}

function TestimonialCard({ initial, isNew, onDone }: { initial: Draft; isNew?: boolean; onDone?: () => void }) {
  const router = useRouter()
  const [t, setT] = useState<Draft>(initial)
  const [pending, start] = useTransition()
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

  return (
    <AdminCard className={cn(isNew && "border-gold/40")}>
      <form
        className="grid gap-4 md:grid-cols-[1fr_1fr_8rem_6rem]"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => saveTestimonial({ ...t, location: t.location ?? "" }), "Testimonial saved")
        }}
      >
        <div>
          <label htmlFor={`t-name-${id}`} className={adminLabel}>Name</label>
          <input id={`t-name-${id}`} value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} className={adminInput} required />
        </div>
        <div>
          <label htmlFor={`t-loc-${id}`} className={adminLabel}>Location</label>
          <input id={`t-loc-${id}`} value={t.location ?? ""} onChange={(e) => setT({ ...t, location: e.target.value })} className={adminInput} />
        </div>
        <div>
          <p className={adminLabel}>Rating</p>
          <div className="flex h-10 items-center gap-0.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={t.rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setT({ ...t, rating: n })}>
                <StarIcon className={cn("size-5", n <= t.rating ? "fill-gold text-gold" : "text-gold/30")} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor={`t-order-${id}`} className={adminLabel}>Order</label>
          <input id={`t-order-${id}`} type="number" min={0} value={t.sort_order} onChange={(e) => setT({ ...t, sort_order: Number(e.target.value) })} className={adminInput} />
        </div>
        <div className="md:col-span-4">
          <label htmlFor={`t-quote-${id}`} className={adminLabel}>Quote</label>
          <textarea id={`t-quote-${id}`} rows={3} value={t.quote} onChange={(e) => setT({ ...t, quote: e.target.value })} className={cn(adminInput, "h-auto py-2")} required />
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-4">
          <label className="flex items-center gap-2 text-sm text-cream/85">
            <Switch checked={t.is_published} onCheckedChange={(v) => setT({ ...t, is_published: v })} /> Show on website
          </label>
          {initial.is_sample && <span className="rounded-xs border border-gold/30 px-1.5 text-[0.65rem] text-gold uppercase">Sample</span>}
          <div className="ml-auto flex gap-2">
            {isNew ? (
              <Button type="button" variant="ghost" onClick={onDone}>
                Cancel
              </Button>
            ) : (
              <ConfirmButton
                variant="ghost"
                className="text-taupe hover:text-destructive"
                title="Delete testimonial?"
                description={`The review from ${initial.name} will be removed.`}
                confirmLabel="Delete"
                destructive
                onConfirm={() => run(() => deleteTestimonial(initial.id!), "Deleted")}
              >
                <Trash2Icon aria-hidden="true" /> Delete
              </ConfirmButton>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <SaveIcon aria-hidden="true" />} Save
            </Button>
          </div>
        </div>
      </form>
    </AdminCard>
  )
}
