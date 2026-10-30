/* eslint-disable @next/next/no-img-element */
import type { Team } from '@/payload-types'
import { mediaUrl } from '@/lib/media'

const Check = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D9A441" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
)

function Photo({ m, size = 'card' }: { m: Team; size?: 'card' | 'hero' }) {
  const src = mediaUrl(m.photo, size) || mediaUrl(m.photo)
  return src ? <img src={src} alt={m.name} loading="lazy" /> : <span className="tm-initial">{m.name.charAt(0)}</span>
}

/** Director spotlight + faculty cards that flip up their qualifications on hover. */
export function TeamSection({ members }: { members: Team[] }) {
  if (!members.length) return null
  const [lead, ...rest] = members
  return (
    <div className="team">
      <article className="tm-lead reveal">
        <div className="tm-lead-photo"><Photo m={lead} size="hero" /></div>
        <div className="tm-lead-copy">
          <span className="tm-role">{lead.role}</span>
          <h3>{lead.name}</h3>
          {lead.subjects && <p className="tm-subj">{lead.subjects}</p>}
          {lead.bio && <p className="tm-bio">{lead.bio}</p>}
          {!!lead.highlights?.length && (
            <ul>{lead.highlights.map((h, i) => <li key={i}><Check />{h.text}</li>)}</ul>
          )}
          {lead.linkedin && <a className="tm-link" href={lead.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn →</a>}
        </div>
      </article>

      {rest.length > 0 && (
        <div className="tm-grid">
          {rest.map((m, i) => (
            <article key={m.id} className="tm-card reveal" style={{ ['--d' as string]: `${i * 0.08}s` }} tabIndex={0}>
              <div className="tm-photo">
                <Photo m={m} />
                {m.experience && <span className="tm-exp">{m.experience}</span>}
              </div>
              <div className="tm-info">
                <span className="tm-role">{m.role}</span>
                <h3>{m.name}</h3>
                {m.subjects && <p className="tm-subj">{m.subjects}</p>}
              </div>
              {!!m.highlights?.length && (
                <div className="tm-more">
                  <b>{m.name}</b>
                  <ul>{m.highlights.map((h, j) => <li key={j}><Check />{h.text}</li>)}</ul>
                  {m.linkedin && <a className="tm-link" href={m.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn →</a>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
