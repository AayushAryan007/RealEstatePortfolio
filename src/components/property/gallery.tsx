"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Dialog } from "radix-ui"
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type GalleryImage = { full: string; thumb: string; width: number; height: number; alt: string }

/**
 * Property photo gallery: a 16:9 main image with arrows and swipe, a strip of
 * thumbnails, and a full-screen lightbox with keyboard navigation, swipe and
 * tap-to-zoom. Built on Radix Dialog for focus handling.
 */
export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const count = images.length

  const go = useCallback(
    (delta: number) => {
      setZoomed(false)
      setIndex((i) => (i + delta + count) % count)
    },
    [count],
  )

  // Arrow keys while the lightbox is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, go])

  const swipe = useSwipe(go)

  if (!count) {
    return <div className="aspect-[16/9] rounded-md border border-gold/10 bg-card" />
  }

  const current = images[index]

  return (
    <div>
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-md border border-gold/15 bg-ink-raised sm:aspect-[16/9]"
        {...swipe}
      >
        {/* Only the visible photo is rendered, so others download on demand. */}
        <Image
          key={current.full}
          src={current.full}
          alt={current.alt || `${title}, photo ${index + 1}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className={cn("object-cover", index > 0 && "animate-in duration-500 fade-in")}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />

        {count > 1 && (
          <>
            <ArrowButton side="left" onClick={() => go(-1)} />
            <ArrowButton side="right" onClick={() => go(1)} />
          </>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-xs bg-ink/75 px-3 py-2 text-xs font-semibold tracking-[0.16em] text-cream uppercase backdrop-blur-md transition-colors hover:text-gold"
        >
          <ExpandIcon className="size-3.5" aria-hidden="true" /> View all {count} photos
        </button>
        <p className="absolute bottom-4 left-4 rounded-xs bg-ink/75 px-2.5 py-1.5 text-xs text-cream/80 tabular-nums backdrop-blur-md" aria-live="polite">
          {index + 1} / {count}
        </p>
      </div>

      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Photo thumbnails">
          {images.map((img, i) => (
            <li key={img.thumb} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block h-16 w-24 overflow-hidden rounded-xs border transition-[border-color,opacity] sm:h-20 sm:w-28",
                  i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.thumb} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog.Root
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          setZoomed(false)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex flex-col outline-none data-open:animate-in data-open:fade-in-0"
            aria-describedby={undefined}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <Dialog.Title className="truncate pr-4 text-sm text-cream/80">
                {title} · <span className="tabular-nums">{index + 1} / {count}</span>
              </Dialog.Title>
              <div className="flex items-center gap-1">
                <LightboxButton label={zoomed ? "Zoom out" : "Zoom in"} onClick={() => setZoomed((z) => !z)}>
                  {zoomed ? <ZoomOutIcon className="size-5" /> : <ZoomInIcon className="size-5" />}
                </LightboxButton>
                <Dialog.Close asChild>
                  <LightboxButton label="Close gallery">
                    <XIcon className="size-5" />
                  </LightboxButton>
                </Dialog.Close>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden" {...swipe}>
              <div
                className={cn(
                  "absolute inset-0 transition-transform duration-500 ease-luxe",
                  zoomed ? "scale-[1.8] cursor-zoom-out" : "cursor-zoom-in",
                )}
                onClick={() => setZoomed((z) => !z)}
              >
                <Image
                  key={current.full}
                  src={current.full}
                  alt={current.alt || `${title}, photo ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="animate-in object-contain duration-300 fade-in"
                />
              </div>
              {count > 1 && !zoomed && (
                <>
                  <ArrowButton side="left" onClick={() => go(-1)} always />
                  <ArrowButton side="right" onClick={() => go(1)} always />
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function ArrowButton({ side, onClick, always = false }: { side: "left" | "right"; onClick: () => void; always?: boolean }) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-ink/60 text-cream backdrop-blur-md transition-[opacity,color] duration-300 hover:text-gold focus-visible:opacity-100",
        side === "left" ? "left-3 sm:left-4" : "right-3 sm:right-4",
        !always && "pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100",
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}

function LightboxButton({ label, children, ...props }: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-11 place-items-center rounded-xs text-cream transition-colors hover:text-gold"
      {...props}
    >
      {children}
    </button>
  )
}

/** Horizontal swipe detection with pointer events (no library). */
function useSwipe(go: (delta: number) => void) {
  const start = useRef<{ x: number; y: number } | null>(null)
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") start.current = { x: e.clientX, y: e.clientY }
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!start.current) return
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
    },
  }
}
