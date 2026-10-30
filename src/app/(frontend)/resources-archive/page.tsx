import { PageHero, Shell } from '@/components/Shell'
import { payloadClient } from '@/lib/content'
import { resourceTypes } from '@/lib/resourceTypes'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Free Resources — Question papers, news analysis, syllabus | CSAP IAS Academy',
  description: 'Free APSC and UPSC resources: previous year question papers, daily CSAP News Analysis, monthly magazines, sample smartbooks and syllabus PDFs.',
}

export default async function ResourcesHub() {
  const payload = await payloadClient()
  const counts = await Promise.all(
    resourceTypes.map((t) => payload.count({ collection: 'resources', where: { and: [{ type: { equals: t.value } }, { status: { equals: 'published' } }] } })),
  )
  return (
    <Shell>
      <PageHero eyebrow="Free Resources" title="Everything you need to prepare, free" intro="Question papers, daily news analysis, magazines, sample smartbooks and syllabus — download as PDF." />
      <section className="section res-hub">
        <div className="wrap grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {resourceTypes.map((t, i) => (
            <a key={t.value} href={`/resources-archive/${t.listPath}`} className="card reveal" style={{ ['--d' as string]: `${i * 0.08}s` }}>
              <span className="ico" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--navy)', display: 'grid', placeItems: 'center' }}>
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F2D9A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
              </span>
              <h3>{t.label}</h3>
              <span>{counts[i].totalDocs} PDFs</span>
            </a>
          ))}
        </div>
      </section>
    </Shell>
  )
}
