/* eslint-disable @next/next/no-img-element */
import type { Post } from '@/payload-types'
import { fmtDate } from '@/lib/content'
import { mediaUrl } from '@/lib/media'

export function PostCard({ post, i = 0 }: { post: Post; i?: number }) {
  const img = mediaUrl(post.featuredImage, 'card')
  const href = post.type === 'announcement' ? `/announcements/${post.slug}` : `/${post.slug}`
  const cat = post.categories?.find((c) => typeof c === 'object')
  return (
    <a href={href} className="card post-card reveal" style={{ ['--d' as string]: `${(i % 3) * 0.1}s` }}>
      <div className="thumb">{img ? <img src={img} alt="" loading="lazy" /> : <div className="ph">C</div>}</div>
      <div className="body">
        {cat && typeof cat === 'object' && <span className="tag" style={{ alignSelf: 'flex-start' }}>{cat.title}</span>}
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt.slice(0, 140)}{post.excerpt.length > 140 ? '…' : ''}</p>}
        <span className="date">{fmtDate(post.publishedAt)}</span>
      </div>
    </a>
  )
}
