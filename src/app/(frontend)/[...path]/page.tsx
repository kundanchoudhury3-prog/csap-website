/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { PostCard } from '@/components/PostCard'
import { RichTextView } from '@/components/RichTextView'
import { PageHero, Shell } from '@/components/Shell'
import { findPage, findPost, findRedirect, findResource, fmtDate, listPosts } from '@/lib/content'
import { mediaUrl } from '@/lib/media'
import { resourceTypeByPrefix } from '@/lib/resourceTypes'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

type Params = Promise<{ path: string[] }>

/**
 * One route for every old WordPress address:
 *   /<slug>                       → blog post or page
 *   /announcements/<slug>         → announcement
 *   /question-paper/<slug> etc.   → resource PDF
 *   anything else                 → Admin → Redirects, otherwise 404
 */
async function resolve(path: string[]) {
  const [a, b] = path
  if (path.length === 1) {
    const post = await findPost(a, 'blog')
    if (post) return { kind: 'post' as const, doc: post }
    const page = await findPage(a)
    if (page) return { kind: 'page' as const, doc: page }
  }
  if (path.length === 2) {
    if (a === 'announcements') {
      const post = await findPost(b, 'announcement')
      if (post) return { kind: 'post' as const, doc: post }
    }
    const rt = resourceTypeByPrefix(a)
    if (rt) {
      const res = await findResource(rt.value, b)
      if (res) return { kind: 'resource' as const, doc: res, rt }
    }
  }
  return null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await resolve((await params).path)
  if (!found) return {}
  const d = found.doc
  const title = d.seo?.title || `${d.title} | CSAP IAS Academy`
  const description =
    d.seo?.description ||
    (found.kind === 'post' ? found.doc.excerpt : found.kind === 'resource' ? `Download ${d.title} (PDF) — free resource from CSAP IAS Academy.` : found.doc.intro) ||
    undefined
  const image = found.kind === 'post' ? mediaUrl(found.doc.featuredImage, 'hero') : found.kind === 'page' ? mediaUrl(found.doc.heroImage, 'hero') : null
  return { title, description, openGraph: { title, description, images: image ? [image] : undefined } }
}

export default async function CatchAll({ params }: { params: Params }) {
  const { path } = await params
  const found = await resolve(path)

  if (!found) {
    const r = await findRedirect('/' + path.join('/'))
    if (r) (r.permanent ? permanentRedirect : redirect)(r.to)
    notFound()
  }

  if (found.kind === 'page') {
    const p = found.doc
    // Pages imported from WordPress start as drafts until rebuilt — send visitors home meanwhile.
    if (p.status !== 'published') {
      const r = await findRedirect('/' + path.join('/'))
      if (r) (r.permanent ? permanentRedirect : redirect)(r.to)
      redirect('/')
    }
    const hero = mediaUrl(p.heroImage, 'hero')
    return (
      <Shell>
        <PageHero title={p.title} intro={p.intro}>
          {p.cta?.label && p.cta.link && <div className="cta-row"><a className="btn btn-gold" href={p.cta.link}>{p.cta.label}</a></div>}
        </PageHero>
        <section className="section">
          <div className="article">
            {hero && <div className="cover"><img src={hero} alt="" /></div>}
            <RichTextView data={p.content} />
          </div>
        </section>
      </Shell>
    )
  }

  if (found.kind === 'post') {
    const p = found.doc
    const cover = mediaUrl(p.featuredImage, 'hero')
    const cats = (p.categories || []).filter((c) => typeof c === 'object')
    const related = (await listPosts({ limit: 4, type: p.type || 'blog' })).docs.filter((x) => x.id !== p.id).slice(0, 3)
    return (
      <Shell>
        <PageHero eyebrow={p.type === 'announcement' ? 'Announcement' : 'CSAP Blog'} title={p.title}>
          <div className="meta-row rise" style={{ ['--d' as string]: '.16s' }}>
            <span>{fmtDate(p.publishedAt)}</span>
            {cats.map((c) => typeof c === 'object' && <a key={c.id} className="tag tag-dark" href={`/blogs?category=${c.slug}`}>{c.title}</a>)}
          </div>
        </PageHero>
        <section className="section" style={{ paddingTop: cover ? 0 : undefined }}>
          <article className="article">
            {cover && <div className="cover"><img src={cover} alt="" /></div>}
            <RichTextView data={p.content} />
            {p.ctaLink && <p><a className="btn btn-gold" href={p.ctaLink}>Join now</a></p>}
            <div className="panel" style={{ marginTop: 48, padding: 28, gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <b style={{ fontSize: 19 }}>Preparing for APSC or UPSC?</b>
                <span style={{ color: 'var(--muted)' }}>Get a free mentorship call from the CSAP team.</span>
              </div>
              <a className="btn btn-navy" href="/#mentor">Book Free Mentorship</a>
            </div>
          </article>
        </section>
        {related.length > 0 && (
          <section className="section tight">
            <div className="wrap">
              <div className="head"><span className="eyebrow">Keep reading</span><h2 className="h2">More from the blog</h2></div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
                {related.map((r, i) => <PostCard key={r.id} post={r} i={i} />)}
              </div>
            </div>
          </section>
        )}
      </Shell>
    )
  }

  // Resource PDF — only for logged-in students (every view/download is recorded)
  const r = found.doc
  const rt = found.rt
  const { canDownload, student } = await getViewer()
  const here = `/${rt.itemPrefix}/${r.slug}`
  const rawUrl = (typeof r.file === 'object' && r.file?.url) || r.externalUrl || null
  const isPdf = rawUrl ? /\.pdf($|\?)/i.test(rawUrl) || (typeof r.file === 'object' && r.file?.mimeType === 'application/pdf') : false
  const viewUrl = `/api/res/${r.id}?mode=view`
  const downloadUrl = `/api/res/${r.id}?mode=download`
  return (
    <Shell>
      <PageHero eyebrow={rt.label} title={r.title} intro={r.description}>
        <div className="meta-row">
          <a href={`/resources-archive/${rt.listPath}`}>← All {rt.label}</a>
          {r.date && <span>· {fmtDate(r.date)}</span>}
          {r.tags?.map((t) => <a key={t} className="tag tag-dark" href={`/resources-archive/${rt.listPath}?category=${encodeURIComponent(t)}`}>{t}</a>)}
        </div>
        {rawUrl && canDownload && (
          <div className="cta-row">
            <a className="btn btn-gold" href={downloadUrl} target="_blank" rel="noopener">Download PDF</a>
            <a className="btn btn-ghost" href={viewUrl} target="_blank" rel="noopener">Open in new tab</a>
          </div>
        )}
      </PageHero>
      <section className="section">
        <div className="wrap">
          {!rawUrl ? (
            <p>The file for this resource will be added soon.</p>
          ) : !canDownload ? (
            <div className="gate reveal">
              <span className="gate-ico" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0B1A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              </span>
              <h2>Free for registered students</h2>
              <p>Register or log in once to view and download this PDF and all other CSAP free resources.</p>
              <div className="cta-row" style={{ justifyContent: 'center' }}>
                <a className="btn btn-gold" href={`/register?next=${encodeURIComponent(here)}`}>Register free</a>
                <a className="btn btn-ghost-dark" href={`/login?next=${encodeURIComponent(here)}`}>Login</a>
              </div>
            </div>
          ) : isPdf ? (
            <>
              {student && <p className="gate-note">Logged in as <b>{student.name}</b> · <a href="/account">My downloads</a></p>}
              <iframe className="pdf-frame" src={viewUrl} title={r.title} loading="lazy" />
            </>
          ) : (
            <a className="btn btn-gold" href={downloadUrl}>Open file</a>
          )}
        </div>
      </section>
    </Shell>
  )
}
