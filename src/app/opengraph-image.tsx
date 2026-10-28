import { ImageResponse } from "next/og"

import { OG_SIZE, ogColors as c, ogFonts, photoDataUrl } from "@/lib/seo/og"
import { site } from "@/lib/site"

export const alt = `${site.name}: ${site.tagline}`
export const size = OG_SIZE
export const contentType = "image/png"

/** Default share image for every page that doesn't define its own. */
export default async function Image() {
  const [fonts, photo] = await Promise.all([ogFonts(), photoDataUrl("/media/samples/sunken-living.webp", 1200, 630)])

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: c.ink, position: "relative", fontFamily: "Manrope" }}>
        {photo && (
          <img src={photo} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover", opacity: 0.35 }} />
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, rgba(14,13,11,0.95) 35%, rgba(14,13,11,0.4))" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: c.gold }}>SINCE {site.since} · DELHI NCR</div>
          <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 104, color: c.cream, marginTop: 18, letterSpacing: 6 }}>GUPTA PROPERTIES</div>
          <div style={{ display: "flex", width: 220, height: 2, background: c.gold, marginTop: 18 }} />
          <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 46, color: c.goldLight, marginTop: 26 }}>{site.tagline}</div>
          <div style={{ display: "flex", fontSize: 24, color: c.taupe, marginTop: 30 }}>
            Sale · Purchase · Rent · Building Design &amp; Construction
          </div>
          <div style={{ display: "flex", fontSize: 26, color: c.cream, marginTop: 40 }}>
            {site.contact.phone} · {site.contact.phone2}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
