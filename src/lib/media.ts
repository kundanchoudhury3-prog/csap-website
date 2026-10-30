import type { Media } from '@/payload-types'

type Upload = number | Media | null | undefined

/** Returns the URL of an uploaded image (optionally a resized version), or null. */
export function mediaUrl(file: Upload, size?: 'card' | 'hero'): string | null {
  if (!file || typeof file === 'number') return null
  const sized = size ? file.sizes?.[size]?.url : null
  return sized || file.url || null
}

export function mediaAlt(file: Upload, fallback = ''): string {
  if (!file || typeof file === 'number') return fallback
  return file.alt || fallback
}
