'use client'
import { useEffect, useState } from 'react'

export function Header({ logo }: { logo?: string | null }) {
  const [scrolled, setScrolled] = useState(false)
  const [me, setMe] = useState<{ name?: string } | null>(null)
  useEffect(() => {
    fetch('/api/students/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setMe(j?.user ?? null))
      .catch(() => setMe(null))
  }, [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <nav className="nav wrap" aria-label="Main">
        <a href="/" className="brand">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="brand-logo" src={logo} alt="CSAP IAS Academy logo" />
          ) : (
            <span className="brand-mark">C</span>
          )}
          <span className="brand-name">
            <b>CSAP IAS Academy</b>
            <span>Civil Services Achievers&apos; Point</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="/#courses">Courses</a>
          <a href="/projects">Projects</a>
          <a href="/gallery">Gallery</a>
          <a href="/resources-archive">Free Resources</a>
          <a href="/blogs">Blog</a>
          <a href="/#smartbook">Smartbook</a>
          <a href="/#contact">Contact</a>
        </div>
        <div className="nav-cta">
          {me ? (
            <a href="/account" className="btn btn-ghost">Hi, {(me.name || 'Student').split(' ')[0]}</a>
          ) : (
            <a href="/login" className="btn btn-ghost">Student Login</a>
          )}
          <a href="/#mentor" className="btn btn-gold">Free Mentorship</a>
        </div>
      </nav>
    </header>
  )
}
