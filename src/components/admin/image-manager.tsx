"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CropIcon, GripVerticalIcon, ImagePlusIcon, Loader2Icon, StarIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { MAX_INPUT_BYTES, processImage, type Crop } from "@/lib/image-process"
import { mediaUrl } from "@/lib/media"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { cn } from "@/lib/utils"
import { CropDialog } from "./crop-dialog"

export type ManagedImage = {
  path_full: string
  path_thumb: string
  width: number
  height: number
  alt?: string | null
  is_cover: boolean
}

const MAX_IMAGES = 20

/**
 * Photo manager for a property: drag-and-drop or pick files (compressed in
 * the browser, then uploaded straight to Supabase Storage), drag to reorder,
 * star a cover, crop, add alt text, remove. Changes apply when the form is saved.
 */
export function ImageManager({
  propertyId,
  value,
  onChange,
  error,
}: {
  propertyId: string
  value: ManagedImage[]
  onChange: (images: ManagedImage[]) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [cropping, setCropping] = useState<number | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /** Compress + upload one image; returns its stored paths. */
  async function upload(file: Blob, crop?: Crop): Promise<ManagedImage> {
    const processed = await processImage(file, crop)
    const id = crypto.randomUUID().slice(0, 8)
    const base = `properties/${propertyId}/${id}`
    const contentType = processed.ext === "webp" ? "image/webp" : "image/jpeg"
    const storage = createBrowserSupabase().storage.from("media")
    const options = { contentType, cacheControl: "31536000", upsert: false }

    const [full, thumb] = await Promise.all([
      storage.upload(`${base}-1920.${processed.ext}`, processed.full, options),
      storage.upload(`${base}-800.${processed.ext}`, processed.thumb, options),
    ])
    if (full.error || thumb.error) throw new Error(full.error?.message ?? thumb.error?.message)

    return {
      path_full: full.data.path,
      path_thumb: thumb.data.path,
      width: processed.width,
      height: processed.height,
      alt: "",
      is_cover: false,
    }
  }

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
    const room = MAX_IMAGES - value.length
    if (list.length > room) toast.warning(`Only ${room} more photo${room === 1 ? "" : "s"} allowed (max ${MAX_IMAGES}).`)
    const accepted = list.slice(0, Math.max(0, room))

    const tooBig = accepted.filter((f) => f.size > MAX_INPUT_BYTES)
    if (tooBig.length) toast.error(`${tooBig.length} photo(s) over 15 MB were skipped.`)
    const queue = accepted.filter((f) => f.size <= MAX_INPUT_BYTES)
    if (!queue.length) return

    setUploading((n) => n + queue.length)
    let images = [...value]
    // Upload a few at a time so phones don't run out of memory.
    for (let i = 0; i < queue.length; i += 3) {
      const batch = queue.slice(i, i + 3)
      const results = await Promise.allSettled(batch.map((file) => upload(file)))
      for (const result of results) {
        if (result.status === "fulfilled") images = [...images, result.value]
        else toast.error(`Upload failed: ${result.reason instanceof Error ? result.reason.message : "unknown error"}`)
      }
      if (!images.some((img) => img.is_cover) && images.length) images[0] = { ...images[0], is_cover: true }
      onChange(images)
      setUploading((n) => n - batch.length)
    }
  }

  function update(index: number, patch: Partial<ManagedImage>) {
    onChange(value.map((img, i) => (i === index ? { ...img, ...patch } : img)))
  }

  function setCover(index: number) {
    onChange(value.map((img, i) => ({ ...img, is_cover: i === index })))
  }

  function remove(index: number) {
    const next = value.filter((_, i) => i !== index)
    if (value[index].is_cover && next.length) next[0] = { ...next[0], is_cover: true }
    onChange(next)
  }

  async function applyCrop(index: number, crop: Crop) {
    const source = mediaUrl(value[index].path_full)!
    const blob = await (await fetch(source)).blob()
    const cropped = await upload(blob, crop)
    update(index, { ...cropped, alt: value[index].alt, is_cover: value[index].is_cover })
    toast.success("Photo cropped")
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = value.findIndex((img) => img.path_full === active.id)
    const to = value.findIndex((img) => img.path_full === over.id)
    onChange(arrayMove(value, from, to))
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-8 text-center transition-colors",
          dragOver ? "border-gold bg-gold/5" : error ? "border-destructive/60" : "border-gold/25",
        )}
      >
        <ImagePlusIcon className="size-8 text-gold/80" strokeWidth={1.25} aria-hidden="true" />
        <p className="mt-3 text-sm text-cream/85">Drag photos here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={value.length >= MAX_IMAGES}
          className="mt-2 rounded-xs border border-gold/50 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-gold uppercase hover:bg-gold/10 disabled:opacity-50"
        >
          Choose photos
        </button>
        <p className="mt-3 text-xs text-taupe">
          JPG, PNG, WebP or HEIC · up to 15 MB each · {value.length}/{MAX_IMAGES} used · auto-compressed
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      {(value.length > 0 || uploading > 0) && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={value.map((img) => img.path_full)} strategy={rectSortingStrategy}>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {value.map((img, i) => (
                <SortableTile
                  key={img.path_full}
                  image={img}
                  index={i}
                  onCover={() => setCover(i)}
                  onRemove={() => remove(i)}
                  onCrop={() => setCropping(i)}
                  onAlt={(alt) => update(i, { alt })}
                />
              ))}
              {Array.from({ length: uploading }, (_, i) => (
                <li key={`uploading-${i}`} className="grid aspect-[4/3] place-items-center rounded-xs border border-gold/15 bg-ink-raised">
                  <Loader2Icon className="size-6 animate-spin text-gold" aria-label="Uploading" />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      {value.length > 1 && <p className="mt-2 text-xs text-taupe">Drag photos to reorder. The starred photo is the cover.</p>}

      <CropDialog
        src={cropping !== null && value[cropping] ? mediaUrl(value[cropping].path_full) : null}
        open={cropping !== null}
        onOpenChange={(open) => !open && setCropping(null)}
        onApply={async (crop) => {
          if (cropping !== null) await applyCrop(cropping, crop)
        }}
      />
    </div>
  )
}

function SortableTile({
  image,
  index,
  onCover,
  onRemove,
  onCrop,
  onAlt,
}: {
  image: ManagedImage
  index: number
  onCover: () => void
  onRemove: () => void
  onCrop: () => void
  onAlt: (alt: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.path_full })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("overflow-hidden rounded-xs border bg-ink-raised", image.is_cover ? "border-gold" : "border-gold/15", isDragging && "z-10 opacity-80 shadow-2xl")}
    >
      <div className="relative aspect-[4/3]">
        <Image src={mediaUrl(image.path_thumb)!} alt="" fill sizes="240px" className="object-cover" />
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder photo ${index + 1}`}
          className="absolute top-1.5 left-1.5 grid size-8 cursor-grab place-items-center rounded-xs bg-ink/75 text-cream active:cursor-grabbing"
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          <TileButton label={image.is_cover ? "Cover photo" : "Make cover"} onClick={onCover} active={image.is_cover}>
            <StarIcon className={cn("size-4", image.is_cover && "fill-ink")} />
          </TileButton>
          <TileButton label="Crop" onClick={onCrop}>
            <CropIcon className="size-4" />
          </TileButton>
          <TileButton label="Remove photo" onClick={onRemove} danger>
            <Trash2Icon className="size-4" />
          </TileButton>
        </div>
        {image.is_cover && (
          <span className="absolute bottom-1.5 left-1.5 rounded-xs bg-gold px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider text-ink uppercase">
            Cover
          </span>
        )}
      </div>
      <input
        value={image.alt ?? ""}
        onChange={(e) => onAlt(e.target.value)}
        placeholder="Describe the photo (optional)"
        aria-label={`Description for photo ${index + 1}`}
        maxLength={200}
        className="w-full border-t border-gold/10 bg-transparent px-2 py-1.5 text-xs text-cream placeholder:text-taupe/60 focus-visible:outline-gold"
      />
    </li>
  )
}

function TileButton({
  label,
  onClick,
  children,
  active,
  danger,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-xs backdrop-blur-md transition-colors",
        active ? "bg-gold text-ink" : "bg-ink/75 text-cream hover:text-gold",
        danger && "hover:text-destructive",
      )}
    >
      {children}
    </button>
  )
}
