import { ImageResponse } from "next/og"

import { getPropertyBySlug } from "@/lib/data/properties"
import { formatArea, formatPrice, propertyTypeLabel, purposeLabel } from "@/lib/format"
import { mediaUrl } from "@/lib/media"
import { OG_SIZE, ogColors as c, ogFonts, photoDataUrl } from "@/lib/seo/og"
import { site } from "@/lib/site"

export const alt = "Property photo, price and location"
export const size = OG_SIZE
export const contentType = "image/png"

/** Per-listing share card: cover photo, title, price, key facts and contact numbers. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)
  const cover = property?.images[0]
  const [fonts, photo] = await Promise.all([ogFonts(), photoDataUrl(mediaUrl(cover?.path_full) ?? null, 560, 630)])

  if (!property) {
    return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: c.ink }} />, { ...size, fonts })
  }

  const facts = [
    property.bhk ? `${property.bhk} BHK` : null,
    formatArea(property.area, property.area_unit),
    property.locality?.name,
  ].filter(Boolean)

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: c.ink, fontFamily: "Manrope" }}>
        <div style={{ display: "flex", width: 560, height: 630, background: c.raised }}>
          {photo && (
            <img src={photo} alt="" width={560} height={630} style={{ objectFit: "cover" }} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 56px 48px", width: 640, borderLeft: `3px solid ${c.gold}` }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 20, letterSpacing: 5, color: c.gold }}>
              {purposeLabel[property.purpose].toUpperCase()} · {propertyTypeLabel[property.type].toUpperCase()}
            </div>
            <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 58, lineHeight: 1.05, color: c.cream, marginTop: 20 }}>
              {property.title}
            </div>
            <div style={{ display: "flex", fontSize: 24, color: c.taupe, marginTop: 22 }}>{facts.join("  ·  ")}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Price text={formatPrice(property.price, property.purpose, property.price_on_request)} />
            <div style={{ display: "flex", width: "100%", height: 1, background: "rgba(201,164,92,0.35)", margin: "22px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, color: c.cream }}>
              <span style={{ letterSpacing: 4 }}>GUPTA PROPERTIES</span>
              <span style={{ color: c.taupe }}>{site.contact.phone}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}

/** The share-image font has no "₹" glyph, so the symbol is drawn as a small vector. */
function Price({ text }: { text: string }) {
  const rupee = text.startsWith("₹")
  return (
    <div style={{ display: "flex", alignItems: "center", fontFamily: "Cormorant", fontSize: 72, color: c.gold }}>
      {rupee && (
        <svg width="44" height="58" viewBox="0 0 24 32" style={{ marginRight: 10 }}>
          <path d="M3 4h18M3 11h18M3 4h6a7 7 0 0 1 0 14H3l13 12" fill="none" stroke={c.gold} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {rupee ? text.slice(1) : text}
    </div>
  )
}
