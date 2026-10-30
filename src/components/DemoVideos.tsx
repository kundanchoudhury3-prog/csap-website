'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

export type DemoVideo = { id: string; title: string; subject?: string | null; thumb: string }

/** YouTube lecture cards; clicking one plays it in a pop-up without leaving the site. */
export function DemoVideos({ videos }: { videos: DemoVideo[] }) {
  const [open, setOpen] = useState<DemoVideo | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div className="demo-grid">
        {videos.map((v, i) => (
          <a
            key={v.id + i}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            className="demo-card reveal"
            style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            onClick={(e) => { e.preventDefault(); setOpen(v) }}
          >
            <span className="demo-thumb">
              <img src={v.thumb} alt="" loading="lazy" />
              <span className="demo-play" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
              </span>
              <span className="demo-badge">Free class</span>
            </span>
            <span className="demo-body">
              {v.subject && <span className="tag">{v.subject}</span>}
              <b>{v.title}</b>
            </span>
          </a>
        ))}
      </div>
      {open && (
        <div className="demo-modal" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <div className="demo-modal-in" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="demo-close" aria-label="Close video" onClick={() => setOpen(null)}>×</button>
            <div className="demo-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1&rel=0`}
                title={open.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="demo-modal-foot">
              <b>{open.title}</b>
              <a href={`https://www.youtube.com/watch?v=${open.id}`} target="_blank" rel="noopener noreferrer" className="link-strong">Watch on YouTube →</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
