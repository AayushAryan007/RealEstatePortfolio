"use client"

import { useEffect, useRef, useState } from "react"

/**
 * True once the element has scrolled into view (then stops observing).
 * A few lines of IntersectionObserver instead of an animation library.
 */
export function useInViewOnce<T extends Element>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return [ref, inView] as const
}
