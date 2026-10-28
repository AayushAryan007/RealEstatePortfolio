"use client"

import { useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Crop } from "@/lib/image-process"
import { cn } from "@/lib/utils"

const aspects = [
  { label: "4:3 (cards)", value: 4 / 3 },
  { label: "16:9 (wide)", value: 16 / 9 },
  { label: "1:1", value: 1 },
  { label: "3:4 (portrait)", value: 3 / 4 },
]

/** Crop an image with drag + zoom. Returns pixel coordinates of the chosen area. */
export function CropDialog({
  src,
  open,
  onOpenChange,
  onApply,
}: {
  src: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (crop: Crop) => Promise<void>
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(4 / 3)
  const [area, setArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-gold/20 bg-ink">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-medium">Crop photo</DialogTitle>
          <DialogDescription>Drag to position and use the slider to zoom.</DialogDescription>
        </DialogHeader>
        <div className="relative h-80 overflow-hidden rounded-xs bg-black sm:h-96">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {aspects.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => setAspect(a.value)}
              className={cn(
                "rounded-xs border px-3 py-1.5 text-xs",
                aspect === a.value ? "border-gold bg-gold text-ink" : "border-input text-cream/80 hover:border-gold/50",
              )}
            >
              {a.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-taupe">
            Zoom
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="accent-[var(--gold)]" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!area || saving}
            onClick={async () => {
              if (!area) return
              setSaving(true)
              try {
                await onApply({ x: Math.round(area.x), y: Math.round(area.y), width: Math.round(area.width), height: Math.round(area.height) })
                onOpenChange(false)
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving && <Loader2Icon className="animate-spin" aria-hidden="true" />}
            Apply crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
