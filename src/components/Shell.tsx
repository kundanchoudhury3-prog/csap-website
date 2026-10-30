import { Footer } from './Footer'
import { Header } from './Header'
import { RevealObserver } from './RevealObserver'

/** Header + footer for every inner page (blog, resources, pages). */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RevealObserver />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string | null; children?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        {eyebrow && <span className="pill rise">{eyebrow}</span>}
        <h1 className="rise" style={{ ['--d' as string]: '.08s' }}>{title}</h1>
        {intro && <p className="rise" style={{ ['--d' as string]: '.16s' }}>{intro}</p>}
        {children}
      </div>
    </section>
  )
}
