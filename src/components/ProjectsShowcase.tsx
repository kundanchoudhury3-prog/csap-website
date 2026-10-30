'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

export type ShowcaseItem = {
  title: string
  href: string
  partner?: string | null
  location?: string | null
  period?: string | null
  status?: string | null
  summary: string
  img: string | null
  thumb: string | null
}

/** Big, hero-sized project slideshow with thumbnails. */
export function ProjectsShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || items.length < 2) return
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 6500)
    return () => clearInterval(t)
  }, [paused, items.length])

  return (
    <div className="showcase" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="showcase-stage" aria-roledescription="carousel">
        {items.map((p, i) => (
          <div key={p.href} className={`slide${i === active ? ' on' : ''}`} aria-hidden={i !== active}>
            {p.img ? <img src={p.img} alt={p.title} loading={i === 0 ? 'eager' : 'lazy'} /> : <div className="slide-empty" />}
            <div className="showcase-shade" />
            <div className="showcase-copy">
              <div className="meta-row">
                {p.status && <span className={`status-pill ${p.status}`}>{p.status === 'completed' ? 'Completed' : 'Ongoing'}</span>}
                {p.partner && <span>{p.partner}</span>}
                {p.location && <span>· {p.location}</span>}
                {p.period && <span>· {p.period}</span>}
              </div>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <a className="btn btn-gold" href={p.href}>View project &amp; photos →</a>
            </div>
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="showcase-thumbs" role="tablist" aria-label="Projects">
          {items.map((p, i) => (
            <button
              key={p.href}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={i === active ? 'on' : ''}
              onClick={() => setActive(i)}
            >
              <span className="t-img">{p.thumb ? <img src={p.thumb} alt="" /> : null}</span>
              <span className="t-text">{p.title}</span>
              <span className="t-bar" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
