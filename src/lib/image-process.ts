/**
 * Browser-side image processing for admin uploads.
 * Each photo becomes two compressed files: a 1920px "full" image and an
 * 800px thumbnail. WebP where the browser can encode it, JPEG otherwise
 * (older Safari). Keeps storage tiny and pages fast.
 */

export type Crop = { x: number; y: number; width: number; height: number }

export type ProcessedImage = {
  full: Blob
  thumb: Blob
  width: number
  height: number
  ext: "webp" | "jpg"
}

async function encode(canvas: HTMLCanvasElement, quality: number): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality))
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" }
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
  if (!jpeg) throw new Error("This browser could not process the image.")
  return { blob: jpeg, ext: "jpg" }
}

function draw(source: ImageBitmap, crop: Crop, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(crop.width, crop.height))
  const width = Math.round(crop.width * scale)
  const height = Math.round(crop.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height)
  return canvas
}

export async function processImage(file: Blob, crop?: Crop): Promise<ProcessedImage> {
  // imageOrientation honours the EXIF rotation from phone cameras.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
  const area = crop ?? { x: 0, y: 0, width: bitmap.width, height: bitmap.height }

  const fullCanvas = draw(bitmap, area, 1920)
  const thumbCanvas = draw(bitmap, area, 800)
  bitmap.close()

  const [full, thumb] = await Promise.all([encode(fullCanvas, 0.8), encode(thumbCanvas, 0.76)])
  return { full: full.blob, thumb: thumb.blob, width: fullCanvas.width, height: fullCanvas.height, ext: full.ext }
}

export const MAX_INPUT_BYTES = 15 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024
