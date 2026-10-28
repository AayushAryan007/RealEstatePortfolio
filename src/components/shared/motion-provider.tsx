"use client"

import { LazyMotion, MotionConfig, domAnimation } from "motion/react"

/**
 * Loads only the DOM animation features (~15 kB instead of ~34 kB) and makes
 * every animation honour the visitor's "reduce motion" setting.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
