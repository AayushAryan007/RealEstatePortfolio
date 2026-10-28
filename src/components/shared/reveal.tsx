"use client"

import { useInViewOnce } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Seconds to wait before animating (for staggered lists). */
  delay?: number
  as?: "div" | "li" | "section"
}

/**
 * Fades and lifts content into place the first time it scrolls into view.
 * CSS transitions on opacity + transform only (see `.reveal` in globals.css);
 * reduced-motion visitors see the content immediately.
 */
export function Reveal({ children, className, delay = 0, as: Component = "div" }: RevealProps) {
  const [ref, inView] = useInViewOnce<HTMLElement>()
  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- polymorphic ref
      ref={ref as any}
      data-revealed={inView || undefined}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </Component>
  )
}
