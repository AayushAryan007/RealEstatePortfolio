"use client"

import { useEffect, useRef } from "react"

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, [data-cursor='grow']"

/**
 * Small gold dot that trails the mouse and grows over links and buttons.
 *
 * Only runs on devices with a precise pointer (never on touch screens) and
 * not when the visitor prefers reduced motion. It writes `transform`
 * directly in a requestAnimationFrame loop, so React never re-renders.
 * The native cursor stays visible, so nothing is lost if this is off.
 */
export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dot = dotRef.current
    if (!finePointer || reduceMotion || !dot) return

    let targetX = -100
    let targetY = -100
    let x = targetX
    let y = targetY
    let scale = 1
    let targetScale = 1
    let frame = 0

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      const target = event.target as Element | null
      targetScale = target?.closest(INTERACTIVE) ? 3.2 : 1
      dot.style.opacity = "1"
    }
    const onLeave = () => {
      dot.style.opacity = "0"
    }

    const tick = () => {
      // Ease towards the pointer for a soft, luxurious trail.
      x += (targetX - x) * 0.22
      y += (targetY - y) * 0.22
      scale += (targetScale - scale) * 0.18
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] size-2 rounded-full bg-gold/90 opacity-0 mix-blend-screen transition-opacity duration-300 will-change-transform"
    />
  )
}
