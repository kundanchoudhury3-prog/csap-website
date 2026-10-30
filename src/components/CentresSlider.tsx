'use client'
import { useEffect, useState } from 'react'

export type Slide = { name: string; address?: string | null; img: string | null; alt: string }

export function CentresSlider({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length < 2) return
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [paused, slides.length])

  return (
    <div
      className="slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => (
        <div key={i} className={`slide${i === active ? ' on' : ''}`} aria-hidden={i !== active}>
          {s.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.img} alt={s.alt} loading={i === 0 ? 'eager' : 'lazy'} />
          ) : (
            <div className="slide-empty">Add a classroom photo in Admin → Centres &amp; Gallery</div>
          )}
          <div className="caption">
            <span className="eyebrow">Our centres</span>
            <b>{s.name}</b>
            {s.address ? <span>{s.address}</span> : null}
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <div className="dots">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? 'on' : ''}
              aria-label={`Show ${s.name}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
