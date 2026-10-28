/**
 * Resolve a stored media path to a URL.
 * Paths starting with "/" are bundled files in /public (sample content);
 * anything else is a key in the Supabase "media" storage bucket.
 */
export function mediaUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith("/") || path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`
}
