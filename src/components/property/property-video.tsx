"use client"

import { useState } from "react"
import { PlayIcon } from "lucide-react"

/** Extract the 11-character id from any common YouTube URL form. */
export function youtubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  return match?.[1] ?? null
}

/**
 * Property video. YouTube links show a lightweight thumbnail "facade" and
 * only load the real player when clicked (saves ~500 kB). Uploaded files use
 * the native player with metadata-only preload.
 */
export function PropertyVideo({ url, fileUrl, title }: { url?: string | null; fileUrl?: string | null; title: string }) {
  const [playing, setPlaying] = useState(false)
  const id = url ? youtubeId(url) : null

  if (id) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-md border border-gold/15 bg-ink-raised">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={`${title}: video tour`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 grid place-items-center"
            aria-label={`Play video tour of ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external thumbnail, sized by CSS */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            />
            <span className="relative grid size-20 place-items-center rounded-full border border-gold bg-ink/70 text-gold backdrop-blur-md transition-transform duration-500 ease-luxe group-hover:scale-110">
              <PlayIcon className="ml-1 size-8 fill-gold" />
            </span>
          </button>
        )}
      </div>
    )
  }

  if (fileUrl) {
    return (
      <video
        src={fileUrl}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full rounded-md border border-gold/15 bg-ink-raised"
        aria-label={`${title}: video tour`}
      />
    )
  }

  return null
}
