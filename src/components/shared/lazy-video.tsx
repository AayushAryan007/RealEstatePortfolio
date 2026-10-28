"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type Source = { src: string; type: string }

type LazyVideoProps = {
  sources: Source[]
  poster: string
  className?: string
  label: string
}

/**
 * Muted, looping background video that:
 * - downloads nothing until it's close to the viewport,
 * - plays only while on screen and pauses when scrolled away,
 * - stays a still poster image for reduced-motion or data-saver visitors,
 * - never loads at all while hidden (e.g. the desktop copy on a phone).
 */
export function LazyVideo({ sources, poster, className, label }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    // Poster only: simply never start observing, so the video never loads.
    if (reduceMotion || saveData) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setLoad(true)
      },
      { rootMargin: "200px 0px" },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  // Sources are attached after mount, so the element must be told to load them.
  useEffect(() => {
    if (load) ref.current?.load()
  }, [load])

  useEffect(() => {
    const video = ref.current
    if (!video || !load) return
    if (inView) {
      video.play().catch(() => {
        // Autoplay can be blocked (e.g. low-power mode); the poster stays visible.
      })
    } else {
      video.pause()
    }
  }, [inView, load])

  return (
    <video
      ref={ref}
      className={cn("h-full w-full object-cover", className)}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      disablePictureInPicture
    >
      {load && sources.map((source) => <source key={source.src} {...source} />)}
    </video>
  )
}
