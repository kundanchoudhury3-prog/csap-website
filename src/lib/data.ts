import config from '@payload-config'
import { getPayload } from 'payload'

export async function getHomeData() {
  const payload = await getPayload({ config })
  const [settings, courses, centres, toppers, testimonials] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
    payload.find({ collection: 'courses', where: { status: { equals: 'published' } }, sort: 'order', limit: 12, depth: 1 }),
    payload.find({ collection: 'centres', where: { showInSlider: { equals: true } }, sort: 'order', limit: 12, depth: 1 }),
    payload.find({ collection: 'toppers', where: { showInTicker: { equals: true } }, sort: 'order', limit: 40, depth: 0 }),
    payload.find({ collection: 'testimonials', where: { featured: { equals: true } }, sort: 'order', limit: 6, depth: 1 }),
  ])
  return {
    settings,
    courses: courses.docs,
    centres: centres.docs,
    toppers: toppers.docs,
    testimonials: testimonials.docs,
  }
}

export const formatINR = (n?: number | null) =>
  typeof n === 'number' ? '₹' + n.toLocaleString('en-IN') : null
