import { Pagination } from '@/components/Pagination'
import { PostCard } from '@/components/PostCard'
import { PageHero, Shell } from '@/components/Shell'
import { listPosts, payloadClient } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Blog — APSC & UPSC preparation notes | CSAP IAS Academy',
  description: 'Exam-focused articles on APSC CCE and UPSC: Assam history, polity, economy, current affairs and strategy from CSAP IAS Academy.',
}

type SP = Promise<{ page?: string; category?: string; type?: string }>

export default async function BlogPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const type = sp.type === 'announcement' ? 'announcement' : 'blog'
  const [posts, cats] = await Promise.all([
    listPosts({ page, category: sp.category, type }),
    (await payloadClient()).find({ collection: 'categories', sort: 'title', limit: 100, depth: 0 }),
  ])
  const q = (p: number) => {
    const u = new URLSearchParams()
    if (sp.category) u.set('category', sp.category)
    if (type === 'announcement') u.set('type', 'announcement')
    if (p > 1) u.set('page', String(p))
    const s = u.toString()
    return `/blogs${s ? `?${s}` : ''}`
  }
  return (
    <Shell>
      <PageHero eyebrow={type === 'announcement' ? 'Announcements' : 'CSAP Blog'} title={type === 'announcement' ? 'Latest announcements' : 'Notes & insights for APSC and UPSC'} intro="Exam-focused articles written by the CSAP faculty." />
      <section className="section">
        <div className="wrap">
          <div className="filters">
            <a href="/blogs" className={`tag${!sp.category && type === 'blog' ? ' on' : ''}`}>All posts</a>
            <a href="/blogs?type=announcement" className={`tag${type === 'announcement' ? ' on' : ''}`}>Announcements</a>
            {type === 'blog' && cats.docs.map((c) => (
              <a key={c.id} href={`/blogs?category=${c.slug}`} className={`tag${sp.category === c.slug ? ' on' : ''}`}>{c.title}</a>
            ))}
          </div>
          {posts.docs.length ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
              {posts.docs.map((p, i) => <PostCard key={p.id} post={p} i={i} />)}
            </div>
          ) : (
            <p>No posts yet.</p>
          )}
          <Pagination page={posts.page || 1} totalPages={posts.totalPages} makeHref={q} />
        </div>
      </section>
    </Shell>
  )
}
