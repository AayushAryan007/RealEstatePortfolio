"use client"

import { useRef } from "react"

/**
 * Direction-aware hover (inspired by Aceternity's): records which edge the
 * pointer entered from as `data-dir`, so CSS can slide the overlay in from
 * that side. No re-renders; just a data attribute.
 */
export function DirectionHover({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerEnter = (event: React.PointerEvent) => {
    const el = ref.current
    if (!el || event.pointerType !== "mouse") return
    const rect = el.getBoundingClientRect()
    // Compare the entry point against the box centre, normalised for aspect ratio.
    const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    el.dataset.dir = Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : y > 0 ? "bottom" : "top"
  }

  return (
    <div ref={ref} data-dir="bottom" onPointerEnter={onPointerEnter} className={className}>
      {children}
    </div>
  )
}
