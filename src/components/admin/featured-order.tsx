"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { reorderFeatured } from "@/actions/admin/properties"
import { AdminCard } from "./ui"

type Item = { id: string; title: string }

/** Drag to set the order of featured listings on the homepage. */
export function FeaturedOrder({ items: initial }: { items: Item[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [pending, start] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  if (initial.length < 2) return null

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const next = arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id))
    setItems(next)
    start(async () => {
      const result = await reorderFeatured(next.map((i) => i.id))
      if (result.ok) {
        toast.success("Homepage order saved")
        router.refresh()
      } else toast.error(result.error)
    })
  }

  return (
    <AdminCard className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-heading text-xl text-cream">Homepage order</h2>
        {pending && <Loader2Icon className="size-4 animate-spin text-gold" aria-label="Saving" />}
      </div>
      <p className="mb-3 text-xs text-taupe">Drag to reorder. The first 6 featured listings appear on the homepage.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-1.5">
            {items.map((item, i) => (
              <Row key={item.id} item={item} position={i + 1} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </AdminCard>
  )
}

function Row({ item, position }: { item: Item; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xs border border-gold/10 bg-ink-raised px-3 py-2 text-sm ${isDragging ? "z-10 shadow-xl" : ""}`}
    >
      <button type="button" {...attributes} {...listeners} aria-label={`Reorder ${item.title}`} className="cursor-grab text-taupe active:cursor-grabbing">
        <GripVerticalIcon className="size-4" />
      </button>
      <span className={`w-5 text-xs tabular-nums ${position <= 6 ? "text-gold" : "text-taupe"}`}>{position}</span>
      <span className="truncate text-cream">{item.title}</span>
    </li>
  )
}
