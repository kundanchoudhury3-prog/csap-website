import { notFound } from 'next/navigation'
import { Pagination } from '@/components/Pagination'
import { PageHero, Shell } from '@/components/Shell'
import { fmtDate, listResources, payloadClient } from '@/lib/content'
import { resourceTypeByListPath } from '@/lib/resourceTypes'

export const dynamic = 'force-dynamic'

type Params = Promise<{ type: string }>
type SP = Promise<{ page?: string; category?: string; q?: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const t = resourceTypeByListPath((await params).type)
  return t ? { title: `${t.label} — Free PDFs | CSAP IAS Academy`, description: `Download ${t.label} PDFs for APSC and UPSC preparation from CSAP IAS Academy.` } : {}
}

export default async function ResourceList({ params, searchParams }: { params: Params; searchParams: SP }) {
  const t = resourceTypeByListPath((await params).type)
  if (!t) notFound()
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const q = sp.q?.trim().slice(0, 80)
  const res = await listResources({ type: t.value, page, tag: sp.category, q })

  // Category chips from the tags used in this library
  const payload = await payloadClient()
  const all = await payload.find({ collection: 'resources', where: { type: { equals: t.value } }, limit: 1000, depth: 0, select: { tags: true } })
  const tagCounts = new Map<string, number>()
  all.docs.forEach((d) => d.tags?.forEach((x) => tagCounts.set(x, (tagCounts.get(x) || 0) + 1)))
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24).map(([x]) => x)

  const href = (p: number) => {
    const u = new URLSearchParams()
    if (sp.category) u.set('category', sp.category)
    if (q) u.set('q', q)
    if (p > 1) u.set('page', String(p))
    const s = u.toString()
    return `/resources-archive/${t.listPath}${s ? `?${s}` : ''}`
  }

  return (
    <Shell>
      <PageHero eyebrow="Free Resources" title={t.label} intro={`${res.totalDocs} PDFs — view online or download.`}>
        <div className="meta-row"><a href="/resources-archive">← All resources</a></div>
      </PageHero>
      <section className="section">
        <div className="wrap">
          <form className="search" action={`/resources-archive/${t.listPath}`}>
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            <input name="q" defaultValue={q} placeholder="Search by title, e.g. 2019 or Sociology" aria-label="Search" />
            <button className="btn btn-navy btn-sm" type="submit">Search</button>
          </form>
          {tags.length > 1 && (
            <div className="filters">
              <a href={`/resources-archive/${t.listPath}`} className={`tag${!sp.category ? ' on' : ''}`}>All</a>
              {tags.map((x) => (
                <a key={x} href={`/resources-archive/${t.listPath}?category=${encodeURIComponent(x)}`} className={`tag${sp.category === x ? ' on' : ''}`}>{x}</a>
              ))}
            </div>
          )}
          <div className="res-list">
            {res.docs.map((r) => (
              <a key={r.id} href={`/${t.itemPrefix}/${r.slug}`} className="res-row">
                <span className="l">
                  <span className="ico"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A6417" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg></span>
                  <span><b>{r.title}</b><small>{[fmtDate(r.date), r.tags?.slice(0, 3).join(' · ')].filter(Boolean).join('  ·  ')}</small></span>
                </span>
                <span className="tag">View PDF →</span>
              </a>
            ))}
            {!res.docs.length && <p>No PDFs found.</p>}
          </div>
          <Pagination page={res.page || 1} totalPages={res.totalPages} makeHref={href} />
        </div>
      </section>
    </Shell>
  )
}
