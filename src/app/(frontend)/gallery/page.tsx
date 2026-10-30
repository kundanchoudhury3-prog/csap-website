import { Gallery } from '@/components/Gallery'
import { PageHero, Shell } from '@/components/Shell'
import { payloadClient } from '@/lib/content'
import { mediaAlt, mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Gallery — Our Events | CSAP IAS Academy',
  description: 'Photos from CSAP IAS Academy events, seminars, classes and programmes across Assam.',
}

type SP = Promise<{ album?: string }>

export default async function GalleryPage({ searchParams }: { searchParams: SP }) {
  const { album } = await searchParams
  const payload = await payloadClient()
  const all = await payload.find({ collection: 'gallery-photos', sort: 'order', limit: 1000, depth: 1 })
  const albums = [...new Set(all.docs.map((d) => d.album).filter(Boolean))]
  const current = album && albums.includes(album) ? album : albums[0]
  const photos = all.docs
    .filter((d) => d.album === current)
    .map((d) => ({
      src: mediaUrl(d.image, 'card') || mediaUrl(d.image) || '',
      full: mediaUrl(d.image, 'hero') || mediaUrl(d.image) || '',
      caption: d.caption,
      alt: d.caption || mediaAlt(d.image, 'CSAP IAS Academy event'),
    }))
    .filter((p) => p.src)

  return (
    <Shell>
      <PageHero eyebrow="Gallery" title={current || 'Our Events'} intro="Moments from our classes, seminars, events and programmes across Assam." />
      <section className="section">
        <div className="wrap">
          {albums.length > 1 && (
            <div className="filters">
              {albums.map((a) => (
                <a key={a} href={`/gallery?album=${encodeURIComponent(a)}`} className={`tag${a === current ? ' on' : ''}`} style={{ fontSize: 14, padding: '10px 16px' }}>{a}</a>
              ))}
            </div>
          )}
          {photos.length ? <Gallery images={photos} /> : <p>Photos will appear here once added in Admin → Gallery.</p>}
        </div>
      </section>
    </Shell>
  )
}
