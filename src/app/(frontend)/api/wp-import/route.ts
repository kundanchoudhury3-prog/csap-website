import config from '@payload-config'
import { getPayload } from 'payload'
import { bannerJobs, courseJobs, galleryJobs, logoJobs, parseExport, projectJobs, runImport, teamJobs, testimonialJobs } from '@/lib/wpImport'

// One-time WordPress import, run in batches on the server.
// Disabled unless IMPORT_TOKEN and WP_EXPORT_URL are set — remove both after importing.
export const maxDuration = 300
export const dynamic = 'force-dynamic'

let cache: { url: string; parsed: ReturnType<typeof parseExport>; only?: string } | null = null

export async function POST(req: Request) {
  const token = process.env.IMPORT_TOKEN
  const url = process.env.WP_EXPORT_URL
  if (!token || !url) return new Response('Not found', { status: 404 })
  if (req.headers.get('authorization') !== `Bearer ${token}`) return new Response('Unauthorized', { status: 401 })

  const q = new URL(req.url).searchParams
  const only = (q.get('only') || undefined) as 'posts' | 'pages' | 'resources' | 'projects' | 'testimonials' | 'gallery' | 'team' | 'banners' | 'courses' | 'logo' | undefined
  const start = Number(q.get('start') || 0)

  if (only === 'projects' || only === 'testimonials' || only === 'gallery' || only === 'team' || only === 'banners' || only === 'courses' || only === 'logo') {
    const jobs = { projects: projectJobs, testimonials: testimonialJobs, gallery: galleryJobs, team: teamJobs, banners: bannerJobs, courses: courseJobs, logo: logoJobs }[only]
    cache = { url: only, only, parsed: jobs() }
  } else if (!cache || cache.url !== url || cache.only !== only) {
    const res = await fetch(url)
    if (!res.ok) return Response.json({ error: `Could not read export: HTTP ${res.status}` }, { status: 500 })
    cache = { url, only, parsed: parseExport(await res.text(), only) }
  }

  const payload = await getPayload({ config })
  const log: string[] = []
  const r = await runImport(payload, cache.parsed, {
    start,
    deadline: Date.now() + 230_000,
    skipFiles: q.get('skipFiles') === '1',
    skipPdfs: q.get('skipPdfs') === '1',
    thumbsOnly: q.get('thumbsOnly') === '1',
    log: (s) => log.push(s),
  })
  return Response.json({ ...r, log: log.slice(-5) })
}
