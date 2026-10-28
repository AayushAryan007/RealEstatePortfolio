"use client"

import { useRef, useState } from "react"
import { FilmIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { MAX_VIDEO_BYTES } from "@/lib/image-process"
import { mediaUrl } from "@/lib/media"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { adminInput, adminLabel, FieldError } from "./ui"

/** YouTube link (recommended, free bandwidth) or an uploaded MP4/WebM up to 50 MB. */
export function VideoField({
  propertyId,
  url,
  path,
  onUrlChange,
  onPathChange,
  error,
}: {
  propertyId: string
  url: string
  path: string | null
  onUrlChange: (url: string) => void
  onPathChange: (path: string | null) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function upload(file: File) {
    if (!["video/mp4", "video/webm"].includes(file.type)) return toast.error("Please choose an MP4 or WebM video.")
    if (file.size > MAX_VIDEO_BYTES) return toast.error("Video is over 50 MB. Please compress it or use a YouTube link.")
    setUploading(true)
    const ext = file.type === "video/webm" ? "webm" : "mp4"
    const { data, error } = await createBrowserSupabase()
      .storage.from("media")
      .upload(`properties/${propertyId}/video-${Date.now()}.${ext}`, file, { contentType: file.type, cacheControl: "31536000" })
    setUploading(false)
    if (error) return toast.error(`Upload failed: ${error.message}`)
    onPathChange(data.path)
    toast.success("Video uploaded")
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="video_url" className={adminLabel}>
          YouTube link <span className="text-taupe">(recommended)</span>
        </label>
        <input
          id="video_url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          className={adminInput}
        />
        <FieldError message={error} />
        <p className="mt-1.5 text-xs text-taupe">Upload the walkthrough to YouTube (it can be &ldquo;Unlisted&rdquo;) and paste the link.</p>
      </div>

      <div>
        <p className={adminLabel}>Or upload a video file</p>
        {path ? (
          <div className="flex items-center gap-3 rounded-xs border border-gold/15 p-3">
            <video src={mediaUrl(path)!} className="h-16 w-28 rounded-xs bg-black object-cover" muted preload="metadata" />
            <span className="flex-1 truncate text-xs text-cream/80">{path.split("/").pop()}</span>
            <button type="button" onClick={() => onPathChange(null)} className="grid size-9 place-items-center text-taupe hover:text-destructive" aria-label="Remove video">
              <Trash2Icon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xs border border-dashed border-gold/30 px-4 py-3 text-sm text-cream/80 hover:border-gold disabled:opacity-60"
          >
            {uploading ? <Loader2Icon className="size-4 animate-spin text-gold" /> : <FilmIcon className="size-4 text-gold" />}
            {uploading ? "Uploading…" : "Choose MP4 / WebM (max 50 MB)"}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file)
            e.target.value = ""
          }}
        />
        <p className="mt-1.5 text-xs text-taupe">If both are set, the YouTube link is shown.</p>
      </div>
    </div>
  )
}
