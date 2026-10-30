/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Gallery } from '@/components/Gallery'
import { RichTextView } from '@/components/RichTextView'
import { Shell } from '@/components/Shell'
import { findProject, listProjects } from '@/lib/content'
import { mediaAlt, mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'
type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await findProject((await params).slug)
  if (!p) return {}
  const title = p.seo?.title || `${p.title} | CSAP IAS Academy`
  const description = p.seo?.description || p.summary
  const image = mediaUrl(p.coverImage, 'hero')
  return { title, description, openGraph: { title, description, images: image ? [image] : undefined } }
}

export default async function ProjectPage({ params }: { params: Params }) {
  const p = await findProject((await params).slug)
  if (!p) notFound()
  const cover = mediaUrl(p.coverImage, 'hero')
  const images = (p.gallery || [])
    .map((g) => ({ src: mediaUrl(g.image, 'card') || '', full: mediaUrl(g.image, 'hero') || mediaUrl(g.image) || '', caption: g.caption, alt: g.caption || mediaAlt(g.image, p.title) }))
    .filter((g) => g.src)
  const others = (await listProjects({ limit: 4 })).docs.filter((x) => x.id !== p.id).slice(0, 3)

  return (
    <Shell>
      <section className="project-hero">
        {cover && <img src={cover} alt={mediaAlt(p.coverImage, p.title)} />}
        <div className="showcase-shade" />
        <div className="inner">
          <div className="wrap">
            <div className="meta-row rise">
              <a href="/projects">← All projects</a>
              <span className={`status-pill ${p.projectStatus}`}>{p.projectStatus === 'completed' ? 'Completed' : 'Ongoing'}</span>
              {p.partner && <span>{p.partner}</span>}
              {p.location && <span>· {p.location}</span>}
              {p.period && <span>· {p.period}</span>}
            </div>
            <h1 className="rise" style={{ ['--d' as string]: '.1s' }}>{p.title}</h1>
            <p className="rise" style={{ ['--d' as string]: '.2s' }}>{p.summary}</p>
          </div>
        </div>
      </section>

      {!!p.highlights?.length && (
        <div className="project-stats">
          {p.highlights.map((h, i) => (
            <div key={i} className="stat reveal" style={{ ['--d' as string]: `${i * 0.08}s` }}><b>{h.value}</b><span>{h.label}</span></div>
          ))}
        </div>
      )}

      {p.content ? (
        <section className="section" style={{ paddingBottom: images.length ? 48 : undefined }}>
          <div className="article"><RichTextView data={p.content} /></div>
        </section>
      ) : null}

      {images.length > 0 && (
        <section className="section" style={{ paddingTop: p.content ? 0 : undefined }}>
          <div className="wrap">
            <div className="head reveal"><span className="eyebrow">Gallery</span><h2 className="h2">Photos from the project</h2></div>
            <Gallery images={images} />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section tight">
          <div className="wrap">
            <div className="head"><span className="eyebrow">More work</span><h2 className="h2">Other projects</h2></div>
            <div className="grid project-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {others.map((o) => (
                <a key={o.id} href={`/projects/${o.slug}`} className="card">
                  <div className="thumb">{mediaUrl(o.coverImage, 'card') && <img src={mediaUrl(o.coverImage, 'card')!} alt="" loading="lazy" />}</div>
                  <div className="body"><h3>{o.title}</h3>{o.partner && <p>{o.partner}</p>}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </Shell>
  )
}
