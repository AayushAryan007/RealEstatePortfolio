"use client"

import { m } from "motion/react"

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  /** Distance in px to rise from. */
  y?: number
  as?: "div" | "li" | "section"
}

/**
 * Fades and lifts content into place the first time it scrolls into view.
 * Uses only opacity + transform. Reduced-motion users see it instantly
 * (handled globally by MotionConfig).
 */
export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: RevealProps) {
  const Component = m[as]
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}
