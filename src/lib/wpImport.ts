/**
 * WordPress → Payload importer (shared by the CLI script and the /api/wp-import route).
 * Work is split into "jobs" (one per post/page/PDF) so it can run in time-limited batches.
 */
import path from 'path'
import { XMLParser } from 'fast-xml-parser'
import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'
import { resourceTypes } from './resourceTypes'
import { projectSeeds } from './projectSeeds'
import { testimonialSeeds } from './testimonialSeeds'
import { gallerySeeds } from './gallerySeeds'
import { teamRemoved, teamSeeds } from './teamSeeds'
import { bannerSeeds } from './bannerSeeds'

export type ImportOptions = { skipFiles?: boolean; skipPdfs?: boolean; only?: 'posts' | 'pages' | 'resources' | 'projects' | 'testimonials' | 'gallery' | 'team' | 'banners' }
let opts: ImportOptions = {}

// WordPress pages that are user-account screens or are now built into the new site.
const SKIP_PAGES = new Set([
  'account', 'login', 'logout', 'members', 'password-reset', 'register', 'user', 'home-7',
  'blogs', 'resources-archive', 'home',
])

type Item = Record<string, any>
const arr = <T,>(v: T | T[] | undefined): T[] => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v])
const txt = (v: unknown): string => (v === undefined || v === null ? '' : typeof v === 'object' ? String((v as any)['#text'] ?? '') : String(v))

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

function meta(item: Item, key: string): string | undefined {
  const m = arr(item['wp:postmeta']).find((x: Item) => txt(x['wp:meta_key']) === key)
  const v = m ? txt(m['wp:meta_value']).trim() : ''
  return v || undefined
}

function terms(item: Item, domain?: string) {
  return arr(item.category)
    .filter((c: Item) => !domain || c['@_domain'] === domain)
    .map((c: Item) => ({ domain: c['@_domain'] as string, slug: c['@_nicename'] as string, name: decode(txt(c)) }))
}

function wpDate(item: Item) {
  const d = txt(item['wp:post_date_gmt'])
  const local = txt(item['wp:post_date'])
  const iso = d && !d.startsWith('0000') ? d.replace(' ', 'T') + 'Z' : local.replace(' ', 'T') + '+05:30'
  const date = new Date(iso)
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function seoText(s: string | undefined, title: string) {
  if (!s) return undefined
  const out = s
    .replace(/%title%/g, title)
    .replace(/%sep%/g, '-')
    .replace(/%sitename%/g, 'CSAP IAS Academy')
    .replace(/%[a-z_]+%/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return out || undefined
}

/** WordPress stores paragraphs as blank lines; this adds the <p> tags back (like wpautop). */
function autop(html: string) {
  html = html.replace(/\r\n/g, '\n')
  // [caption]<img ...> Caption text[/caption]  →  <img ...><p><em>Caption text</em></p>
  html = html.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g, (_, inner: string) => {
    const img = inner.match(/<a[^>]*>\s*<img[^>]*>\s*<\/a>|<img[^>]*>/)?.[0] || ''
    const caption = inner.replace(img, '').trim()
    return `${img}${caption ? `\n\n<em>${caption}</em>\n\n` : ''}`
  })
  html = html.replace(/\[\/?[a-z_-]+[^\]]*\]/g, '') // any other shortcode
  const block = /^\s*<(h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|figure|blockquote|p|div|pre|hr|img|iframe)[\s>/]/i
  return html
    .split(/\n\s*\n/)
    .map((chunk) => {
      const c = chunk.trim()
      if (!c) return ''
      if (block.test(c)) return c
      return `<p>${c.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')
}

// ---------- files ----------
const fileCache = new Map<string, number | null>()

function cleanUrl(u: string) {
  return u.trim().replace(/^http:\/\//, 'https://').replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1') // prefer the full-size original
}

async function fetchWithRetry(url: string, tries = 3): Promise<Response> {
  let last: unknown
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'CSAP-Importer/1.0' } })
      if (res.ok) return res
      last = new Error(`HTTP ${res.status}`)
      if (res.status === 404) break
    } catch (e) {
      last = e
    }
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
  }
  throw last
}

async function importFile(payload: Payload, rawUrl: string | undefined, alt: string): Promise<number | null> {
  if (!rawUrl || opts.skipFiles) return null
  if (!/^https?:\/\//.test(rawUrl)) return null
  // skip-pdfs: bring images now, keep PDFs linked to the old site (move them later, e.g. to R2)
  if (opts.skipPdfs && !/\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(rawUrl)) return null
  const url = cleanUrl(rawUrl)
  if (fileCache.has(url)) return fileCache.get(url)!

  const existing = await payload.find({ collection: 'media', where: { sourceUrl: { equals: url } }, limit: 1, depth: 0 })
  if (existing.docs[0]) {
    fileCache.set(url, existing.docs[0].id)
    return existing.docs[0].id
  }
  try {
    let res: Response
    try {
      res = await fetchWithRetry(url)
    } catch {
      res = await fetchWithRetry(rawUrl) // resized copy as a fallback
    }
    const data = Buffer.from(await res.arrayBuffer())
    const name = decodeURIComponent(path.basename(new URL(url).pathname))
    const MIME: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif' }
    const header = res.headers.get('content-type')?.split(';')[0]
    const ext = name.split('.').pop()?.toLowerCase() || ''
    const mimetype = header && header !== 'application/octet-stream' && header !== 'binary/octet-stream' ? header : MIME[ext] || 'application/octet-stream'
    const doc = await payload.create({
      collection: 'media',
      data: { alt: alt.slice(0, 200) || name, sourceUrl: url },
      file: { data, mimetype, name, size: data.length },
    })
    stats.files++
    fileCache.set(url, doc.id)
    return doc.id
  } catch (e) {
    stats.fileErrors.push(`${url} (${e instanceof Error ? e.message : e})`)
    fileCache.set(url, null)
    return null
  }
}

// ---------- rich text ----------
let editorConfig: Awaited<ReturnType<typeof editorConfigFactory.default>> | undefined

async function htmlToRichText(payload: Payload, html: string, title: string) {
  const dom = new JSDOM(`<body>${autop(html)}</body>`)
  const doc = dom.window.document
  for (const img of Array.from(doc.querySelectorAll('img'))) {
    const src = img.getAttribute('src') || ''
    const id = await importFile(payload, src, img.getAttribute('alt') || title)
    if (id) {
      img.setAttribute('data-lexical-upload-relation-to', 'media')
      img.setAttribute('data-lexical-upload-id', String(id))
      // Unwrap <a><img></a> so the image is kept as its own block
      const a = img.parentElement
      if (a?.tagName === 'A' && a.children.length === 1) a.replaceWith(img)
    } else {
      // Not downloaded (skip-files mode or a broken link): keep a link to the original image instead
      const link = doc.createElement('a')
      link.setAttribute('href', src)
      link.textContent = `[Image: ${img.getAttribute('alt') || 'view'}]`
      const p = doc.createElement('p')
      p.appendChild(link)
      const holder = img.parentElement?.tagName === 'A' ? img.parentElement : img
      holder.replaceWith(p)
    }
  }
  // Inline style-only spans add nothing in the new design
  for (const span of Array.from(doc.querySelectorAll('span'))) span.replaceWith(...Array.from(span.childNodes))
  const state = convertHTMLToLexical({ editorConfig: editorConfig!, html: doc.body.innerHTML, JSDOM })
  // Image IDs come out of the HTML as text; the database expects numbers.
  const fix = (node: any) => {
    if (node?.type === 'upload' && typeof node.value === 'string' && /^\d+$/.test(node.value)) node.value = Number(node.value)
    node?.children?.forEach(fix)
  }
  fix(state.root)
  return state
}

// ---------- upsert helper ----------
async function upsert(payload: Payload, collection: 'posts' | 'pages' | 'resources', wpId: number, data: Record<string, unknown>) {
  const found = await payload.find({ collection, where: { wpId: { equals: wpId } }, limit: 1, depth: 0 })
  if (found.docs[0]) {
    await payload.update({ collection, id: found.docs[0].id, data: data as any })
    return 'updated'
  }
  await payload.create({ collection, data: { ...data, wpId } as any })
  return 'created'
}

async function addRedirect(payload: Payload, from: string, to: string) {
  if (!from || from === to) return
  const exists = await payload.find({ collection: 'redirects', where: { from: { equals: from.replace(/\/+$/, '') } }, limit: 1 })
  if (exists.docs[0]) return
  try {
    await payload.create({ collection: 'redirects', data: { from, to, permanent: true } })
    stats.redirects++
  } catch {
    /* duplicate — ignore */
  }
}

let stats = { posts: 0, announcements: 0, pages: 0, resources: {} as Record<string, number>, categories: 0, files: 0, redirects: 0, fileErrors: [] as string[], errors: [] as string[] }


type Job =
  | { kind: 'post'; type: 'blog' | 'announcement'; item: Item }
  | { kind: 'page'; item: Item }
  | { kind: 'resource'; rt: (typeof resourceTypes)[number]; item: Item }
  | { kind: 'fixed-redirects' }
  | { kind: 'project'; seed: (typeof projectSeeds)[number] }
  | { kind: 'testimonial'; seed: (typeof testimonialSeeds)[number] }
  | { kind: 'gallery'; url: string; order: number }
  | { kind: 'team'; seed: (typeof teamSeeds)[number] }
  | { kind: 'team-cleanup' }
  | { kind: 'banner'; url: string; order: number }

type Parsed = { jobs: Job[]; attachments: Map<string, string> }

/** Jobs that rebuild the old WordPress project pages as Government Projects (no XML needed). */
export function projectJobs(): Parsed {
  return { jobs: projectSeeds.map((seed) => ({ kind: 'project' as const, seed })), attachments: new Map() }
}

/** Jobs that bring the old homepage testimonials in as Testimonials + Toppers. */
export function testimonialJobs(): Parsed {
  return { jobs: testimonialSeeds.map((seed) => ({ kind: 'testimonial' as const, seed })), attachments: new Map() }
}

/** Jobs that bring the old gallery page photos into Gallery (album "Our Events"). */
export function galleryJobs(): Parsed {
  return { jobs: gallerySeeds.map((url, i) => ({ kind: 'gallery' as const, url, order: (i + 1) * 10 })), attachments: new Map() }
}

/** Jobs that bring the old CSAP Team into Admin → CSAP Team. */
export function teamJobs(): Parsed {
  return { jobs: [...teamSeeds.map((seed) => ({ kind: 'team' as const, seed })), { kind: 'team-cleanup' as const }], attachments: new Map() }
}

/** Jobs that bring the old homepage banner slider into Featured Banners. */
export function bannerJobs(): Parsed {
  return { jobs: bannerSeeds.map((url, i) => ({ kind: 'banner' as const, url, order: (i + 1) * 10 })), attachments: new Map() }
}

export function parseExport(xmlText: string, only?: ImportOptions['only']): Parsed {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: false, trimValues: false, processEntities: true, htmlEntities: true })
  const xml = parser.parse(xmlText)
  const items: Item[] = arr(xml.rss.channel.item)
  const published = (i: Item) => txt(i['wp:status']) === 'publish'
  const ofType = (t: string) => items.filter((i) => txt(i['wp:post_type']) === t && published(i))
  const attachments = new Map<string, string>()
  for (const i of items) if (txt(i['wp:post_type']) === 'attachment') attachments.set(txt(i['wp:post_id']), txt(i['wp:attachment_url']))
  const jobs: Job[] = []
  if (!only || only === 'posts') {
    ofType('post').forEach((item) => jobs.push({ kind: 'post', type: 'blog', item }))
    ofType('announcements').forEach((item) => jobs.push({ kind: 'post', type: 'announcement', item }))
  }
  if (!only || only === 'pages') {
    ofType('page')
      .filter((p) => txt(p['wp:post_parent']) === '0' && !SKIP_PAGES.has(txt(p['wp:post_name'])) && txt(p['wp:post_name']))
      .forEach((item) => jobs.push({ kind: 'page', item }))
    jobs.push({ kind: 'fixed-redirects' })
  }
  if (!only || only === 'resources') {
    for (const rt of resourceTypes) ofType(rt.wpType).forEach((item) => jobs.push({ kind: 'resource', rt, item }))
  }
  return { jobs, attachments }
}

const catIds = new Map<string, number>()

async function runJob(payload: Payload, job: Job, attachments: Map<string, string>) {
  if (job.kind === 'fixed-redirects') {
    const fixed: [string, string][] = [
      ['/resources-archive/question-papers/apsc-question-paper', '/resources-archive/question-papers?category=APSC'],
      ['/resources-archive/question-papers/apsc-question-paper/apsc-mains-questions', '/resources-archive/question-papers?category=APSC Mains Questions'],
      ['/resources-archive/question-papers/apsc-question-paper/apsc-sample-papers', '/resources-archive/question-papers?category=APSC'],
      ['/resources-archive/question-papers/apsc-question-paper/apsc-year-wise-questions', '/resources-archive/question-papers?category=APSC'],
      ['/resources-archive/question-papers/upsc-question-paper', '/resources-archive/question-papers?category=UPSC'],
      ['/resources-archive/question-papers/upsc-question-paper/upsc-assamese-questions', '/resources-archive/question-papers?category=UPSC'],
      ['/resources-archive/question-papers/upsc-question-paper/upsc-topic-wise-solved', '/resources-archive/question-papers?category=UPSC'],
      ['/resources-archive/question-papers/upsc-question-paper/upsc-year-wise-questions', '/resources-archive/question-papers?category=UPSC'],
      ['/all-announcemens', '/blogs?type=announcement'],
      ['/courses', '/#courses'],
      ['/contact', '/#contact'],
    ]
    for (const [f, t] of fixed) await addRedirect(payload, f, t)
    return
  }
  if (job.kind === 'banner') {
    const exists = await payload.find({ collection: 'featured-banners', where: { sourceUrl: { equals: job.url } }, limit: 1, depth: 0 })
    if (exists.docs[0]) {
      // Remove the placeholder link set during the first import — real links are added in the admin.
      if (exists.docs[0].link === '/#courses') await payload.update({ collection: 'featured-banners', id: exists.docs[0].id, data: { link: '' } })
      return 'link cleared'
    }
    const name = decodeURIComponent(job.url.split('/').pop() || 'banner').replace(/\.(jpe?g|png|webp)(\.jpe?g)?$/i, '')
    const image = await importFile(payload, job.url, 'CSAP course banner')
    if (!image) throw new Error('Banner could not be downloaded: ' + job.url)
    await payload.create({ collection: 'featured-banners', data: { title: name.replace(/[-_]+/g, ' '), image, link: '', active: true, order: job.order, sourceUrl: job.url } })
    return name
  }
  if (job.kind === 'team-cleanup') {
    for (const name of teamRemoved) await payload.delete({ collection: 'team', where: { name: { equals: name } } })
    return 'removed: ' + teamRemoved.join(', ')
  }
  if (job.kind === 'team') {
    const m = job.seed
    const photo = await importFile(payload, m.photo, m.name)
    const data = {
      name: m.name, role: m.role, experience: m.experience || '', subjects: m.subjects || '',
      photo: photo ?? undefined, highlights: m.highlights.map((text) => ({ text })), showOnHome: true, order: m.order,
    }
    const f = await payload.find({ collection: 'team', where: { name: { equals: m.name } }, limit: 1, depth: 0 })
    if (f.docs[0]) await payload.update({ collection: 'team', id: f.docs[0].id, data })
    else await payload.create({ collection: 'team', data })
    return m.name
  }
  if (job.kind === 'gallery') {
    const exists = await payload.find({ collection: 'gallery-photos', where: { sourceUrl: { equals: job.url } }, limit: 1, depth: 0 })
    if (exists.docs[0]) return 'already imported'
    const image = await importFile(payload, job.url, 'CSAP IAS Academy event')
    if (!image) throw new Error('Photo could not be downloaded: ' + job.url)
    await payload.create({ collection: 'gallery-photos', data: { image, album: 'Our Events', order: job.order, sourceUrl: job.url } })
    return job.url.split('/').pop()
  }
  if (job.kind === 'testimonial') {
    const t = job.seed
    const photo = await importFile(payload, t.photo, t.name)
    const tData = { name: t.name, rank: t.rank, quote: t.quote, photo: photo ?? undefined, featured: true, order: t.order }
    const ft = await payload.find({ collection: 'testimonials', where: { name: { equals: t.name } }, limit: 1, depth: 0 })
    if (ft.docs[0]) await payload.update({ collection: 'testimonials', id: ft.docs[0].id, data: tData })
    else await payload.create({ collection: 'testimonials', data: tData })
    const pData = { name: t.name, rank: t.rank, photo: photo ?? undefined, showInTicker: true, order: t.order }
    const fp = await payload.find({ collection: 'toppers', where: { name: { equals: t.name } }, limit: 1, depth: 0 })
    if (fp.docs[0]) await payload.update({ collection: 'toppers', id: fp.docs[0].id, data: pData })
    else await payload.create({ collection: 'toppers', data: pData })
    return t.name
  }
  if (job.kind === 'project') {
    const sd = job.seed
    const coverUrl = 'cover' in sd && sd.cover ? sd.cover : sd.gallery[0][0]
    const coverImage = await importFile(payload, coverUrl, sd.title)
    if (!coverImage) throw new Error('Cover photo could not be downloaded')
    const gallery: { image: number; caption?: string }[] = []
    for (const [url, caption] of sd.gallery) {
      const id = await importFile(payload, url, caption || sd.title)
      if (id) gallery.push({ image: id, caption: caption || undefined })
    }
    const content = await htmlToRichText(payload, sd.html, sd.title)
    const data = {
      title: sd.title, slug: sd.slug, status: 'published', showOnHome: true, order: sd.order,
      partner: sd.partner, location: sd.location, period: sd.period, projectStatus: sd.projectStatus,
      summary: sd.summary, coverImage, content, gallery,
      highlights: sd.highlights.map(([value, label]) => ({ value, label })),
    }
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: sd.slug } }, limit: 1, depth: 0 })
    if (found.docs[0]) await payload.update({ collection: 'projects', id: found.docs[0].id, data: data as any })
    else await payload.create({ collection: 'projects', data: data as any })
    await addRedirect(payload, '/' + sd.wpSlug, '/projects/' + sd.slug)
    return sd.title
  }
  const item = job.item
  if (job.kind === 'post') {
    const title = decode(txt(item.title))
    const slug = txt(item['wp:post_name'])
    const cats: number[] = []
    for (const t of terms(item, 'category')) {
      if (!catIds.has(t.slug)) {
        const f = await payload.find({ collection: 'categories', where: { slug: { equals: t.slug } }, limit: 1 })
        const id = f.docs[0]?.id ?? (await payload.create({ collection: 'categories', data: { title: t.name, slug: t.slug } })).id
        if (!f.docs[0]) stats.categories++
        catIds.set(t.slug, id)
      }
      cats.push(catIds.get(t.slug)!)
    }
    const thumbId = meta(item, '_thumbnail_id')
    const featuredImage = await importFile(payload, thumbId ? attachments.get(thumbId) : meta(item, 'icon'), title)
    const content = await htmlToRichText(payload, txt(item['content:encoded']), title)
    const excerpt = decode(txt(item['excerpt:encoded']).replace(/<[^>]+>/g, '')).trim()
    await upsert(payload, 'posts', Number(txt(item['wp:post_id'])), {
      title, slug, status: 'published', type: job.type, publishedAt: wpDate(item),
      categories: cats, featuredImage: featuredImage ?? undefined, excerpt: excerpt || undefined, content,
      ctaLink: meta(item, 'payment_link'),
      seo: { title: seoText(meta(item, 'rank_math_title'), title), description: seoText(meta(item, 'rank_math_description'), title) },
    })
    const base = job.type === 'announcement' ? '/announcements/' : '/'
    for (const m of arr(item['wp:postmeta']).filter((x: Item) => txt(x['wp:meta_key']) === '_wp_old_slug')) {
      await addRedirect(payload, base + txt(m['wp:meta_value']), base + slug)
    }
    if (job.type === 'blog') stats.posts++
    else stats.announcements++
    return title
  }
  if (job.kind === 'page') {
    const title = decode(txt(item.title)).trim() || txt(item['wp:post_name']).replace(/-/g, ' ')
    const html = txt(item['content:encoded'])
    await upsert(payload, 'pages', Number(txt(item['wp:post_id'])), {
      title, slug: txt(item['wp:post_name']), status: 'draft',
      content: html.trim().length > 50 ? await htmlToRichText(payload, html, title) : undefined,
      seo: { title: seoText(meta(item, 'rank_math_title'), title), description: seoText(meta(item, 'rank_math_description'), title) },
    })
    stats.pages++
    return title
  }
  // resource
  const rt = job.rt
  const title = decode(txt(item.title))
  const raw = meta(item, rt.wpFileKey)
  const fileUrl = raw && /^\d+$/.test(raw) ? attachments.get(raw) : raw
  const file = await importFile(payload, fileUrl, title)
  const slug = txt(item['wp:post_name'])
  await upsert(payload, 'resources', Number(txt(item['wp:post_id'])), {
    title, slug, status: 'published', type: rt.value, date: wpDate(item),
    tags: [...new Set(terms(item).map((t) => t.name))],
    file: file ?? undefined,
    externalUrl: file ? undefined : fileUrl ? cleanUrl(fileUrl) : undefined,
    seo: { title: seoText(meta(item, 'rank_math_title'), title), description: seoText(meta(item, 'rank_math_description'), title) },
  })
  for (const m of arr(item['wp:postmeta']).filter((x: Item) => txt(x['wp:meta_key']) === '_wp_old_slug')) {
    await addRedirect(payload, `/${rt.itemPrefix}/${txt(m['wp:meta_value'])}`, `/${rt.itemPrefix}/${slug}`)
  }
  stats.resources[rt.label] = (stats.resources[rt.label] || 0) + 1
  return title
}

/**
 * Runs jobs from `start` until all are done or `deadline` (ms timestamp) passes.
 * Returns where to continue next time.
 */
export async function runImport(
  payload: Payload,
  parsed: Parsed,
  { start = 0, deadline = Infinity, log = () => {}, ...options }: ImportOptions & { start?: number; deadline?: number; log?: (s: string) => void },
) {
  opts = options
  stats = { posts: 0, announcements: 0, pages: 0, resources: {}, categories: 0, files: 0, redirects: 0, fileErrors: [], errors: [] }
  editorConfig ??= await editorConfigFactory.default({ config: payload.config })
  let i = start
  for (; i < parsed.jobs.length; i++) {
    if (Date.now() > deadline) break
    const job = parsed.jobs[i]
    try {
      const title = await runJob(payload, job, parsed.attachments)
      if (title) log(`  ✓ [${i + 1}/${parsed.jobs.length}] ${String(title).slice(0, 70)}`)
    } catch (e) {
      const name = job.kind === 'fixed-redirects' ? 'redirects' : job.kind === 'team-cleanup' ? 'team cleanup' : job.kind === 'banner' ? job.url : job.kind === 'project' ? job.seed.title : job.kind === 'testimonial' ? job.seed.name : job.kind === 'gallery' ? job.url : job.kind === 'team' ? job.seed.name : decode(txt(job.item.title))
      stats.errors.push(`${job.kind} "${name}": ${e instanceof Error ? e.message : e}`)
      log(`  ✗ ${name}`)
    }
  }
  return { next: i, total: parsed.jobs.length, done: i >= parsed.jobs.length, stats }
}
