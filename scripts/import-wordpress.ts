/**
 * Imports content from a WordPress export (.xml) into the CSAP admin panel.
 *
 *   npm run import:wordpress -- ./csapiasacademy.WordPress.xml
 *   npm run import:wordpress -- ./export.xml skip-files   (fast test, keeps PDFs/images on old site)
 *   npm run import:wordpress -- ./export.xml skip-pdfs    (images copied, PDFs stay linked to old site)
 *
 * Safe to run again: items are matched by their WordPress ID and updated, files already
 * downloaded are reused. Keep the old WordPress site online until the import finishes.
 */
import fs from 'fs'
import path from 'path'
import { XMLParser } from 'fast-xml-parser'
import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { resourceTypes } from '../src/lib/resourceTypes'

// Options come as plain words after the file name (Payload's runner drops "--" flags):
//   npm run import:wordpress -- export.xml skip-files only=posts
const args = process.argv.slice(2)
const xmlPath = args.find((a) => a.toLowerCase().endsWith('.xml'))
const SKIP_FILES = args.some((a) => a.replace(/^-+/, '') === 'skip-files') || process.env.SKIP_FILES === '1'
const SKIP_PDFS = args.some((a) => a.replace(/^-+/, '') === 'skip-pdfs')
const ONLY = args.find((a) => a.replace(/^-+/, '').startsWith('only='))?.split('=')[1] // posts | pages | resources

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
  if (!rawUrl || SKIP_FILES) return null
  if (!/^https?:\/\//.test(rawUrl)) return null
  // skip-pdfs: bring images now, keep PDFs linked to the old site (move them later, e.g. to R2)
  if (SKIP_PDFS && !/\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(rawUrl)) return null
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
let editorConfig: Awaited<ReturnType<typeof editorConfigFactory.default>>

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
  const state = convertHTMLToLexical({ editorConfig, html: doc.body.innerHTML, JSDOM })
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

const stats = { posts: 0, announcements: 0, pages: 0, resources: {} as Record<string, number>, categories: 0, files: 0, redirects: 0, fileErrors: [] as string[], errors: [] as string[] }

async function main() {
  if (!xmlPath || !fs.existsSync(xmlPath)) {
    console.error('Give the path of the WordPress export file, e.g.\n  npm run import:wordpress -- ./export.xml')
    process.exit(1)
  }
  const payload = await getPayload({ config })
  editorConfig = await editorConfigFactory.default({ config: payload.config })

  console.log('Reading', xmlPath)
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', cdataPropName: false as any, parseTagValue: false, trimValues: false, processEntities: true, htmlEntities: true })
  const xml = parser.parse(fs.readFileSync(xmlPath, 'utf8'))
  const items: Item[] = arr(xml.rss.channel.item)
  const published = (i: Item) => txt(i['wp:status']) === 'publish'
  const ofType = (t: string) => items.filter((i) => txt(i['wp:post_type']) === t && published(i))
  const attachments = new Map<string, string>()
  for (const i of items) if (txt(i['wp:post_type']) === 'attachment') attachments.set(txt(i['wp:post_id']), txt(i['wp:attachment_url']))

  // --- blog posts + announcements ---
  if (!ONLY || ONLY === 'posts') {
    const catIds = new Map<string, number>()
    const toImport = [...ofType('post').map((i) => ['blog', i] as const), ...ofType('announcements').map((i) => ['announcement', i] as const)]
    console.log(`\nBlog posts & announcements: ${toImport.length}`)
    for (const [kind, item] of toImport) {
      const title = decode(txt(item.title))
      const slug = txt(item['wp:post_name'])
      try {
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
          title, slug, status: 'published', type: kind, publishedAt: wpDate(item),
          categories: cats, featuredImage: featuredImage ?? undefined, excerpt: excerpt || undefined, content,
          ctaLink: meta(item, 'payment_link'),
          seo: { title: seoText(meta(item, 'rank_math_title'), title), description: seoText(meta(item, 'rank_math_description'), title) },
        })
        const base = kind === 'announcement' ? '/announcements/' : '/'
        for (const m of arr(item['wp:postmeta']).filter((x: Item) => txt(x['wp:meta_key']) === '_wp_old_slug')) {
          await addRedirect(payload, base + txt(m['wp:meta_value']), base + slug)
        }
        if (kind === 'blog') stats.posts++
        else stats.announcements++
        process.stdout.write(`  ✓ ${title.slice(0, 70)}\n`)
      } catch (e) {
        stats.errors.push(`Post "${title}": ${e instanceof Error ? e.message : e}`)
        console.log(`  ✗ ${title}`)
      }
    }
  }

  // --- pages (built with Bricks — their layout can't be copied, so they come in as drafts with SEO kept) ---
  if (!ONLY || ONLY === 'pages') {
    const pages = ofType('page').filter((p) => txt(p['wp:post_parent']) === '0' && !SKIP_PAGES.has(txt(p['wp:post_name'])) && txt(p['wp:post_name']))
    console.log(`\nPages: ${pages.length} (imported as drafts to rebuild)`)
    for (const item of pages) {
      const title = decode(txt(item.title)).trim() || txt(item['wp:post_name']).replace(/-/g, ' ')
      try {
        const html = txt(item['content:encoded'])
        await upsert(payload, 'pages', Number(txt(item['wp:post_id'])), {
          title,
          slug: txt(item['wp:post_name']),
          status: 'draft',
          intro: undefined,
          content: html.trim().length > 50 ? await htmlToRichText(payload, html, title) : undefined,
          seo: { title: seoText(meta(item, 'rank_math_title'), title), description: seoText(meta(item, 'rank_math_description'), title) },
        })
        stats.pages++
        console.log(`  ✓ ${title}`)
      } catch (e) {
        stats.errors.push(`Page "${title}": ${e instanceof Error ? e.message : e}`)
      }
    }
    // Old nested archive pages → new listing pages
    await addRedirect(payload, '/resources-archive/question-papers/apsc-question-paper', '/resources-archive/question-papers?category=APSC')
    await addRedirect(payload, '/resources-archive/question-papers/apsc-question-paper/apsc-mains-questions', '/resources-archive/question-papers?category=APSC Mains Questions')
    await addRedirect(payload, '/resources-archive/question-papers/apsc-question-paper/apsc-sample-papers', '/resources-archive/question-papers?category=APSC')
    await addRedirect(payload, '/resources-archive/question-papers/apsc-question-paper/apsc-year-wise-questions', '/resources-archive/question-papers?category=APSC')
    await addRedirect(payload, '/resources-archive/question-papers/upsc-question-paper', '/resources-archive/question-papers?category=UPSC')
    await addRedirect(payload, '/resources-archive/question-papers/upsc-question-paper/upsc-assamese-questions', '/resources-archive/question-papers?category=UPSC')
    await addRedirect(payload, '/resources-archive/question-papers/upsc-question-paper/upsc-topic-wise-solved', '/resources-archive/question-papers?category=UPSC')
    await addRedirect(payload, '/resources-archive/question-papers/upsc-question-paper/upsc-year-wise-questions', '/resources-archive/question-papers?category=UPSC')
    await addRedirect(payload, '/all-announcemens', '/blogs?type=announcement')
    await addRedirect(payload, '/courses', '/#courses')
    await addRedirect(payload, '/contact', '/#contact')
  }

  // --- resources (PDF libraries) ---
  if (!ONLY || ONLY === 'resources') {
    for (const rt of resourceTypes) {
      const list = ofType(rt.wpType)
      console.log(`\n${rt.label}: ${list.length}`)
      stats.resources[rt.label] = 0
      for (const item of list) {
        const title = decode(txt(item.title))
        try {
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
          stats.resources[rt.label]++
          if (stats.resources[rt.label] % 25 === 0) console.log(`  … ${stats.resources[rt.label]} done`)
        } catch (e) {
          stats.errors.push(`${rt.label} "${title}": ${e instanceof Error ? e.message : e}`)
        }
      }
    }
  }

  console.log('\n========== Import finished ==========')
  console.log(`Blog posts: ${stats.posts}   Announcements: ${stats.announcements}   New categories: ${stats.categories}`)
  console.log(`Pages (drafts to rebuild): ${stats.pages}`)
  for (const [k, v] of Object.entries(stats.resources)) console.log(`${k}: ${v}`)
  console.log(`Files downloaded: ${stats.files}${SKIP_FILES ? ' (skipped — --skip-files)' : ''}   Redirects added: ${stats.redirects}`)
  if (stats.fileErrors.length) {
    fs.writeFileSync('import-file-errors.txt', stats.fileErrors.join('\n'))
    console.log(`Files that could not be downloaded: ${stats.fileErrors.length} (list saved in import-file-errors.txt)`)
  }
  if (stats.errors.length) {
    fs.writeFileSync('import-errors.txt', stats.errors.join('\n'))
    console.log(`Items with errors: ${stats.errors.length} (list saved in import-errors.txt)`)
  }
  process.exit(0)
}

// Top-level await: Payload's runner exits as soon as this module finishes loading.
try {
  await main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
