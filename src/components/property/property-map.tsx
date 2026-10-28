"use client"

import { useState } from "react"
import { MapPinIcon, NavigationIcon } from "lucide-react"

/**
 * Google Maps pin. The heavy embed (~1 MB of scripts) loads only when the
 * visitor asks for it; until then a styled placeholder is shown.
 * Uses the key-free embed URL, so no API key or billing is needed.
 */
export function PropertyMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const [show, setShow] = useState(false)
  const directions = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-gold/15 bg-ink-raised">
        {show ? (
          <iframe
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            title={`Map showing ${label}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full [filter:grayscale(0.4)_contrast(1.05)]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShow(true)}
            className="group absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgb(201_164_92/0.12),transparent_60%)]"
          >
            {/* Decorative street grid */}
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-gold opacity-10" preserveAspectRatio="none" viewBox="0 0 400 225" fill="none" stroke="currentColor">
              <path d="M0 60h400M0 140h400M0 190h400M80 0v225M200 0v225M310 0v225M0 0l400 225" />
            </svg>
            <span className="relative flex flex-col items-center gap-3">
              <span className="grid size-14 place-items-center rounded-full border border-gold bg-ink/80 text-gold transition-transform duration-500 group-hover:-translate-y-1">
                <MapPinIcon className="size-6" strokeWidth={1.5} />
              </span>
              <span className="text-xs font-semibold tracking-[0.24em] text-cream uppercase">Show on map</span>
            </span>
          </button>
        )}
      </div>
      <a
        href={directions}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light"
      >
        <NavigationIcon className="size-4" aria-hidden="true" /> Open in Google Maps
      </a>
    </div>
  )
}
