import type { MetadataRoute } from 'next'
import { payloadClient } from '@/lib/content'
import { resourceTypes, resourceTypeByValue } from '@/lib/resourceTypes'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://csap.co.in'
  const payload = await payloadClient()
  const published = { status: { equals: 'published' } } as const
  const [posts, pages, resources] = await Promise.all([
    payload.find({ collection: 'posts', where: published, limit: 5000, depth: 0, select: { slug: true, type: true, updatedAt: true } }),
    payload.find({ collection: 'pages', where: published, limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'resources', where: published, limit: 10000, depth: 0, select: { slug: true, type: true, updatedAt: true } }),
  ])
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/blogs`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/resources-archive`, changeFrequency: 'daily', priority: 0.8 },
    ...resourceTypes.map((t) => ({ url: `${base}/resources-archive/${t.listPath}`, changeFrequency: 'daily' as const, priority: 0.7 })),
    ...posts.docs.map((p) => ({ url: `${base}${p.type === 'announcement' ? '/announcements' : ''}/${p.slug}`, lastModified: p.updatedAt })),
    ...pages.docs.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt })),
    ...resources.docs.map((r) => ({ url: `${base}/${resourceTypeByValue(r.type)?.itemPrefix}/${r.slug}`, lastModified: r.updatedAt })),
  ]
}
