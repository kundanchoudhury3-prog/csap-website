import { NextResponse } from 'next/server'
import { resourceTypeByValue } from '@/lib/resourceTypes'
import { getViewer } from '@/lib/viewer'

// Opens a resource file for logged-in students and records it in Admin → Downloads log.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const mode = new URL(req.url).searchParams.get('mode') === 'view' ? 'view' : 'download'
  const { payload, student, staff } = await getViewer()

  const resource = await payload.findByID({ collection: 'resources', id: Number(id), depth: 1 }).catch(() => null)
  if (!resource || resource.status !== 'published') return new NextResponse('Not found', { status: 404 })
  const rt = resourceTypeByValue(resource.type)

  if (!student && !staff) {
    const back = rt ? `/${rt.itemPrefix}/${resource.slug}` : '/resources-archive'
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(back)}`, req.url))
  }

  const fileUrl = (typeof resource.file === 'object' && resource.file?.url) || resource.externalUrl
  if (!fileUrl) return new NextResponse('File not available yet', { status: 404 })

  if (student) {
    await payload.create({
      collection: 'downloads',
      overrideAccess: true,
      data: { student: student.id, resource: resource.id, title: resource.title, resourceType: rt?.label, action: mode },
    })
  }
  return NextResponse.redirect(new URL(fileUrl, req.url))
}
