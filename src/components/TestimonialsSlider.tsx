'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

export type TItem = { name: string; rank?: string | null; quote: string; photo: string | null }

/** Big topper testimonial slideshow: photo + quote, auto-plays, with arrows and avatar strip. */
export function TestimonialsSlider({ items }: { items: TItem[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = items.length
  const go = (d: number) => setActive((i) => (i + d + n) % n)

  useEffect(() => {
    if (paused || n < 2) return
    const t = setInterval(() => setActive((i) => (i + 1) % n), 6000)
    return () => clearInterval(t)
  }, [paused, n])

  if (!n) return null
  return (
    <div className="tslider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
      <div className="tstage">
        {items.map((t, i) => (
          <figure key={t.name + i} className={`tslide${i === active ? ' on' : ''}`} aria-hidden={i !== active}>
            <div className="tphoto">
              {t.photo ? <img src={t.photo} alt={t.name} loading={i === 0 ? 'eager' : 'lazy'} /> : <span>{t.name.charAt(0)}</span>}
              {t.rank && <span className="trank">{t.rank}</span>}
            </div>
            <div className="tcopy">
              <svg className="tq" aria-hidden="true" width="56" height="44" viewBox="0 0 56 44"><path d="M0 44V26C0 11 8 2 22 0l3 6C16 9 12 15 12 22h11v22zm31 0V26c0-15 8-24 22-26l3 6c-9 3-13 9-13 16h11v22z" fill="#D9A441" /></svg>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <b>{t.name}</b>
                {t.rank && <span>{t.rank}</span>}
              </figcaption>
            </div>
          </figure>
        ))}
        {n > 1 && (
          <div className="tnav">
            <button type="button" aria-label="Previous" onClick={() => go(-1)}>‹</button>
            <span>{active + 1} / {n}</span>
            <button type="button" aria-label="Next" onClick={() => go(1)}>›</button>
          </div>
        )}
      </div>
      {n > 1 && (
        <div className="tstrip" role="tablist" aria-label="Toppers">
          {items.map((t, i) => (
            <button key={t.name + i} type="button" role="tab" aria-selected={i === active} aria-label={t.name} className={i === active ? 'on' : ''} onClick={() => setActive(i)}>
              {t.photo ? <img src={t.photo} alt="" /> : <span>{t.name.charAt(0)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
