import config from '@payload-config'
import { getPayload } from 'payload'
import { resourceTypes } from '@/lib/resourceTypes'
import { SocialIcons } from './SocialIcons'

export async function Footer() {
  const payload = await getPayload({ config })
  const [s, courses, centres] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.find({ collection: 'courses', where: { status: { equals: 'published' } }, sort: 'order', limit: 5, depth: 0 }),
    payload.find({ collection: 'centres', sort: 'order', limit: 12, depth: 0 }),
  ])
  return (
    <footer id="contact" className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <span className="big">CSAP IAS Academy</span>
            <span>Premier coaching institute in Guwahati for UPSC, APSC, SSC and Banking aspirants.</span>
          </div>
          <div>
            <h4>Courses</h4>
            {courses.docs.map((c) => <a key={c.id} href="/#courses">{c.title}</a>)}
            <a href="/blogs">Blog</a>
            <a href="/projects">Government projects</a>
            <a href="/demo-classes">Free demo classes</a>
            <a href="/gallery">Gallery</a>
            <a href="/team">Our team</a>
          </div>
          <div>
            <h4>Free resources</h4>
            {resourceTypes.map((t) => <a key={t.value} href={`/resources-archive/${t.listPath}`}>{t.label}</a>)}
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            {s.address && <span style={{ whiteSpace: 'pre-line' }}>{s.address}</span>}
            {s.email && (
              <span className="fc-line">
                <small>Mail us at</small>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </span>
            )}
            {(s.phone || s.phone2) && (
              <span className="fc-line">
                <small>Call us at</small>
                <span>
                  {[s.phone, s.phone2].filter(Boolean).map((p, i) => (
                    <span key={p}>
                      {i > 0 && <span className="sep"> | </span>}
                      <a href={`tel:${p!.replace(/[^\d+]/g, '')}`}>{p}</a>
                    </span>
                  ))}
                </span>
              </span>
            )}
            {s.whatsapp && <a href={`https://wa.me/${s.whatsapp}`}>WhatsApp us</a>}
            {centres.docs.map((c) => <span key={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</span>)}
            {s.appLink && <a href={s.appLink} className="btn btn-gold btn-sm" style={{ alignSelf: 'flex-start' }}>Get the app</a>}
            {s.follow && Object.values(s.follow).some((v) => typeof v === 'string' && v.trim()) && (
              <div className="follow">
                <h4>Follow us</h4>
                <SocialIcons follow={s.follow} />
              </div>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} CSAP IAS Academy · Civil Services Achievers&apos; Point</span>
          <span>Privacy · Terms · Refund policy</span>
        </div>
      </div>
    </footer>
  )
}
