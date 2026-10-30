import config from '@payload-config'
import { getPayload } from 'payload'

const clean = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  // Bots fill the hidden "company" field; pretend success and save nothing.
  if (clean(body.company)) return Response.json({ ok: true })

  const name = clean(body.name, 80)
  const phone = clean(body.phone, 20)
  const email = clean(body.email, 120)
  const exam = clean(body.exam, 80)

  if (!name) return Response.json({ error: 'Please enter your name.' }, { status: 400 })
  if (!/^[0-9+\s-]{10,15}$/.test(phone)) return Response.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Please enter a valid email.' }, { status: 400 })

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'leads',
    data: { name, phone, email: email || undefined, exam, source: 'Website — Free Mentorship form', status: 'new' },
  })
  return Response.json({ ok: true })
}
