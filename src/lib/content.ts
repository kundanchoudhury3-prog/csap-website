import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import type { ResourceTypeValue } from './resourceTypes'

export const payloadClient = () => getPayload({ config })

/** WordPress slugs can contain encoded characters; try both forms. */
const slugVariants = (slug: string) => {
  const s = new Set([slug])
  try { s.add(decodeURIComponent(slug)) } catch {}
  s.add(encodeURIComponent(slug).toLowerCase())
  return [...s]
}

export async function findPost(slug: string, type: 'blog' | 'announcement') {
  const payload = await payloadClient()
  const r = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { in: slugVariants(slug) } }, { type: { equals: type } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })
  return r.docs[0] ?? null
}

export async function findPage(slug: string) {
  const payload = await payloadClient()
  const r = await payload.find({ collection: 'pages', where: { slug: { in: slugVariants(slug) } }, limit: 1, depth: 2 })
  return r.docs[0] ?? null
}

export async function findResource(type: ResourceTypeValue, slug: string) {
  const payload = await payloadClient()
  const r = await payload.find({
    collection: 'resources',
    where: { and: [{ slug: { in: slugVariants(slug) } }, { type: { equals: type } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
  })
  return r.docs[0] ?? null
}

export async function findRedirect(path: string) {
  const payload = await payloadClient()
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
  const r = await payload.find({ collection: 'redirects', where: { from: { in: slugVariants(clean) } }, limit: 1, depth: 0 })
  return r.docs[0] ?? null
}

export async function listPosts({ page = 1, category, type = 'blog', limit = 12 }: { page?: number; category?: string; type?: 'blog' | 'announcement'; limit?: number }) {
  const payload = await payloadClient()
  const and: Where[] = [{ status: { equals: 'published' } }, { type: { equals: type } }]
  if (category) {
    const c = await payload.find({ collection: 'categories', where: { slug: { equals: category } }, limit: 1, depth: 0 })
    if (c.docs[0]) and.push({ categories: { in: [c.docs[0].id] } })
  }
  return payload.find({ collection: 'posts', where: { and }, sort: '-publishedAt', page, limit, depth: 1 })
}

export async function listResources({ type, page = 1, tag, q, limit = 30 }: { type: ResourceTypeValue; page?: number; tag?: string; q?: string; limit?: number }) {
  const payload = await payloadClient()
  const and: Where[] = [{ status: { equals: 'published' } }, { type: { equals: type } }]
  if (tag) and.push({ tags: { in: [tag] } })
  if (q) and.push({ title: { like: q } })
  return payload.find({ collection: 'resources', where: { and }, sort: '-date', page, limit, depth: 1 })
}

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : ''

export async function listProjects({ homeOnly = false, limit = 50 }: { homeOnly?: boolean; limit?: number } = {}) {
  const payload = await payloadClient()
  const and: Where[] = [{ status: { equals: 'published' } }]
  if (homeOnly) and.push({ showOnHome: { equals: true } })
  return payload.find({ collection: 'projects', where: { and }, sort: 'order', limit, depth: 1 })
}

export async function findProject(slug: string) {
  const payload = await payloadClient()
  const r = await payload.find({
    collection: 'projects',
    where: { and: [{ slug: { in: slugVariants(slug) } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })
  return r.docs[0] ?? null
}

export async function listTeam({ homeOnly = false }: { homeOnly?: boolean } = {}) {
  const payload = await payloadClient()
  return payload.find({ collection: 'team', where: homeOnly ? { showOnHome: { equals: true } } : {}, sort: 'order', limit: 100, depth: 1 })
}

export async function listBanners() {
  const payload = await payloadClient()
  return payload.find({ collection: 'featured-banners', where: { active: { equals: true } }, sort: 'order', limit: 30, depth: 1 })
}

export async function listDemoClasses({ homeOnly = false, limit = 100 }: { homeOnly?: boolean; limit?: number } = {}) {
  const payload = await payloadClient()
  return payload.find({
    collection: 'demo-classes',
    where: { and: [{ active: { equals: true } }, ...(homeOnly ? [{ showOnHome: { equals: true } }] : [])] },
    sort: 'order',
    limit,
    depth: 1,
  })
}
