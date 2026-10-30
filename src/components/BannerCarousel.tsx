'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'

export type Banner = { title: string; img: string; link: string; newTab?: boolean | null }

/** Sliding course/test banners: one big banner in the centre with the next/previous peeking in. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const perView = 1
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)

  const pages = Math.max(1, banners.length - perView + 1)
  const go = (d: number) => setIndex((i) => (i + d + pages) % pages)

  useEffect(() => {
    setIndex((i) => Math.min(i, pages - 1))
  }, [pages])

  useEffect(() => {
    if (paused || pages < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % pages), 4500)
    return () => clearInterval(t)
  }, [paused, pages])

  return (
    <div
      className="bc"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true) }}
      onTouchEnd={(e) => {
        if (touchX.current !== null) {
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        }
        touchX.current = null
        setPaused(false)
      }}
      aria-roledescription="carousel"
    >
      <div className="bc-viewport">
        <div className="bc-track" style={{ ['--i' as string]: index }}>
          {banners.map((b, i) => {
            const card = (
              <span className="bc-card">
                <img src={b.img} alt={b.title} loading={i < 2 ? 'eager' : 'lazy'} />
                {b.link && <span className="bc-cta">View details →</span>}
              </span>
            )
            const cls = `bc-slide${i === index ? ' on' : ''}`
            return b.link ? (
              <a
                key={i}
                href={b.link}
                className={cls}
                target={b.newTab ? '_blank' : undefined}
                rel={b.newTab ? 'noopener noreferrer' : undefined}
                aria-label={b.title}
                tabIndex={i === index ? 0 : -1}
                onClick={(e) => { if (i !== index) { e.preventDefault(); setIndex(i) } }}
              >
                {card}
              </a>
            ) : (
              <div key={i} className={cls} aria-label={b.title} onClick={() => setIndex(i)}>
                {card}
              </div>
            )
          })}
        </div>
      </div>
      {pages > 1 && (
        <>
          <button type="button" className="bc-arrow prev" aria-label="Previous banners" onClick={() => go(-1)}>‹</button>
          <button type="button" className="bc-arrow next" aria-label="Next banners" onClick={() => go(1)}>›</button>
          <div className="bc-dots">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} className={i === index ? 'on' : ''} onClick={() => setIndex(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
