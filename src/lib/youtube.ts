/** Pull the 11-character video id out of any YouTube link (watch, youtu.be, shorts, live, embed). */
export function ytId(url?: string | null): string | null {
  if (!url) return null
  const m = url.trim().match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  return /^[A-Za-z0-9_-]{11}$/.test(url.trim()) ? url.trim() : null
}

export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const ytWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`

/** Video title from YouTube (no API key needed). Returns null if YouTube can't be reached. */
export async function fetchYtTitle(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(ytWatch(id))}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const j = (await res.json()) as { title?: string }
    return j.title?.trim() || null
  } catch {
    return null
  }
}
