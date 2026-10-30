'use client'
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from 'react'

export type GalleryImage = { src: string; full: string; caption?: string | null; alt: string }

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, step])

  return (
    <>
      <div className="gallery">
        {images.map((g, i) => (
          <button key={i} type="button" className="g-item reveal" style={{ ['--d' as string]: `${(i % 6) * 0.06}s` }} onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}${g.caption ? `: ${g.caption}` : ''}`}>
            <img src={g.src} alt={g.alt} loading="lazy" />
            {g.caption && <span className="g-cap">{g.caption}</span>}
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={images[open].full} alt={images[open].alt} />
            <figcaption>
              <span>{images[open].caption}</span>
              <span>{open + 1} / {images.length}</span>
            </figcaption>
          </figure>
          <button type="button" className="lb-btn lb-close" aria-label="Close" onClick={close}>×</button>
          {images.length > 1 && (
            <>
              <button type="button" className="lb-btn lb-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1) }}>‹</button>
              <button type="button" className="lb-btn lb-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1) }}>›</button>
            </>
          )}
        </div>
      )}
    </>
  )
}
