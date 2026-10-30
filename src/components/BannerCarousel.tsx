'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'

export type Banner = { title: string; img: string; link: string; newTab?: boolean | null }

/** Sliding course/test banners: 2 per view on desktop, 1 on phones, auto-slides, swipeable. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [perView, setPerView] = useState(2)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 820px)')
    const apply = () => setPerView(mq.matches ? 2 : 1)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

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
        <div className="bc-track" style={{ transform: `translateX(-${(index * 100) / perView}%)` }}>
          {banners.map((b, i) => (
            <a
              key={i}
              href={b.link}
              className="bc-slide"
              style={{ flexBasis: `${100 / perView}%` }}
              target={b.newTab ? '_blank' : undefined}
              rel={b.newTab ? 'noopener noreferrer' : undefined}
              aria-label={b.title}
              tabIndex={i >= index && i < index + perView ? 0 : -1}
            >
              <span className="bc-card">
                <img src={b.img} alt={b.title} loading={i < 2 ? 'eager' : 'lazy'} />
                <span className="bc-cta">View details →</span>
              </span>
            </a>
          ))}
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
