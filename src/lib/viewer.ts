import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import type { Student } from '@/payload-types'

/** Who is looking at the page: a logged-in student, a staff member, or nobody. */
export async function getViewer() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const student = user?.collection === 'students' ? (user as Student & { collection: 'students' }) : null
  const staff = user?.collection === 'users'
  return { payload, student, staff, canDownload: Boolean(student || staff) }
}

/** Only allow redirects back into this site after login. */
export const safeNext = (n?: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/resources-archive')
