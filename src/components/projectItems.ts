import type { Project } from '@/payload-types'
import { mediaUrl } from '@/lib/media'
import type { ShowcaseItem } from './ProjectsShowcase'

export const toShowcase = (p: Project): ShowcaseItem => ({
  title: p.title,
  href: `/projects/${p.slug}`,
  partner: p.partner,
  location: p.location,
  period: p.period,
  status: p.projectStatus,
  summary: p.summary,
  img: mediaUrl(p.coverImage, 'hero'),
  thumb: mediaUrl(p.coverImage, 'card'),
})
