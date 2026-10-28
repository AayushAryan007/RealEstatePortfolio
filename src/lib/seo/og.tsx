import "server-only"

import { readFile } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"

/**
 * Helpers for generated share images (WhatsApp / Facebook / X previews).
 * The image renderer needs static font files and JPEG/PNG images, so photos
 * (stored as WebP) are converted on the fly.
 */

export const OG_SIZE = { width: 1200, height: 630 }

export async function ogFonts() {
  const dir = join(process.cwd(), "src/assets/fonts")
  const [serif, sans] = await Promise.all([
    readFile(join(dir, "cormorant-garamond-latin-600-normal.woff")),
    readFile(join(dir, "manrope-latin-600-normal.woff")),
  ])
  return [
    { name: "Cormorant", data: serif, weight: 600 as const, style: "normal" as const },
    { name: "Manrope", data: sans, weight: 600 as const, style: "normal" as const },
  ]
}

/** Load a photo (bundled /public path or remote URL) as a JPEG data URL sized for the card. */
export async function photoDataUrl(src: string | null, width: number, height: number) {
  if (!src) return null
  try {
    const input = src.startsWith("/")
      ? await readFile(join(process.cwd(), "public", src))
      : Buffer.from(await (await fetch(src)).arrayBuffer())
    const jpeg = await sharp(input).resize(width, height, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`
  } catch {
    return null
  }
}

export const ogColors = { ink: "#0e0d0b", raised: "#1a1814", gold: "#c9a45c", goldLight: "#e3c88a", cream: "#f3ede2", taupe: "#a39b8b" }
