"use client"

import { useState } from "react"
import { CrosshairIcon, MapPinIcon } from "lucide-react"

import { adminInput, adminLabel } from "./ui"

/** Pull coordinates out of a pasted Google Maps link (several URL formats). */
export function parseMapsLink(text: string): { lat: number; lng: number } | null {
  const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&](?:q|query|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/, /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/]
  for (const pattern of patterns) {
    const m = text.match(pattern)
    if (m) {
      const lat = Number(m[1])
      const lng = Number(m[2])
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }
    }
  }
  return null
}

/**
 * Map pin without any paid map API: paste a Google Maps link (or "lat, lng"),
 * or use this device's location when on site. Shows a live preview.
 */
export function MapPinField({
  lat,
  lng,
  onChange,
}: {
  lat: number | null
  lng: number | null
  onChange: (coords: { lat: number | null; lng: number | null }) => void
}) {
  const [paste, setPaste] = useState("")
  const [message, setMessage] = useState("")
  const hasPin = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="maps-link" className={adminLabel}>
          Paste a Google Maps link
        </label>
        <div className="flex gap-2">
          <input
            id="maps-link"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="https://maps.google.com/…  or  28.6417, 77.3713"
            className={adminInput}
          />
          <button
            type="button"
            onClick={() => {
              const coords = parseMapsLink(paste)
              if (coords) {
                onChange(coords)
                setMessage("Pin set from link.")
                setPaste("")
              } else {
                setMessage("Couldn't find coordinates. In Google Maps, long-press the spot, copy the numbers shown, and paste them here.")
              }
            }}
            className="shrink-0 rounded-xs border border-gold/50 px-3 text-xs font-semibold text-gold hover:bg-gold/10"
          >
            Set pin
          </button>
        </div>
        <p className="mt-1.5 text-xs text-taupe">
          Short links (maps.app.goo.gl) don&apos;t contain coordinates. Open them first, then copy the full URL or the numbers.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
        <div>
          <label htmlFor="lat" className={adminLabel}>
            Latitude
          </label>
          <input
            id="lat"
            inputMode="decimal"
            value={lat ?? ""}
            onChange={(e) => onChange({ lat: e.target.value === "" ? null : Number(e.target.value), lng })}
            className={adminInput}
          />
        </div>
        <div>
          <label htmlFor="lng" className={adminLabel}>
            Longitude
          </label>
          <input
            id="lng"
            inputMode="decimal"
            value={lng ?? ""}
            onChange={(e) => onChange({ lat, lng: e.target.value === "" ? null : Number(e.target.value) })}
            className={adminInput}
          />
        </div>
        <button
          type="button"
          title="Use my current location"
          aria-label="Use my current location"
          onClick={() =>
            navigator.geolocation?.getCurrentPosition(
              (pos) => {
                onChange({ lat: Number(pos.coords.latitude.toFixed(6)), lng: Number(pos.coords.longitude.toFixed(6)) })
                setMessage("Pin set to your current location.")
              },
              () => setMessage("Location permission was denied."),
              { enableHighAccuracy: true },
            )
          }
          className="grid size-10 place-items-center rounded-xs border border-input text-gold hover:border-gold"
        >
          <CrosshairIcon className="size-4" />
        </button>
      </div>
      {message && <p className="text-xs text-taupe">{message}</p>}

      {hasPin ? (
        <div className="space-y-2">
          <iframe
            title="Pin preview"
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            loading="lazy"
            className="aspect-[16/9] w-full rounded-xs border border-gold/15"
          />
          <button type="button" onClick={() => onChange({ lat: null, lng: null })} className="text-xs text-taupe hover:text-destructive">
            Remove pin
          </button>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-xs text-taupe">
          <MapPinIcon className="size-3.5 text-gold" aria-hidden="true" /> No pin yet. The map section is hidden on the listing until you add one.
        </p>
      )}
    </div>
  )
}
