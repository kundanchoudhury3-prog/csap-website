import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/AuthForms'
import { PageHero, Shell } from '@/components/Shell'
import { fmtDate } from '@/lib/content'
import { resourceTypeByValue } from '@/lib/resourceTypes'
import { getViewer } from '@/lib/viewer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My account | CSAP IAS Academy' }

export default async function AccountPage() {
  const { payload, student } = await getViewer()
  if (!student) redirect('/login?next=/account')
  const downloads = await payload.find({
    collection: 'downloads',
    where: { student: { equals: student.id } },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
    overrideAccess: true,
  })
  return (
    <Shell>
      <PageHero eyebrow="My account" title={`Hello, ${student.name}`} intro={`${student.email} · ${student.phone}`}>
        <div className="cta-row">
          <a className="btn btn-gold" href="/resources-archive">Browse free resources</a>
        </div>
      </PageHero>
      <section className="section">
        <div className="wrap">
          <div className="head-row">
            <div className="head" style={{ marginBottom: 0 }}><span className="eyebrow">History</span><h2 className="h2">Your recent downloads</h2></div>
            <LogoutButton />
          </div>
          <div className="res-list" style={{ marginTop: 24 }}>
            {downloads.docs.map((d) => {
              const r = typeof d.resource === 'object' ? d.resource : null
              const rt = r ? resourceTypeByValue(r.type) : null
              const href = r && rt ? `/${rt.itemPrefix}/${r.slug}` : '/resources-archive'
              return (
                <a key={d.id} className="res-row" href={href}>
                  <span className="l"><span><b>{d.title}</b><small>{[d.resourceType, d.action === 'view' ? 'Viewed' : 'Downloaded', fmtDate(d.createdAt)].filter(Boolean).join('  ·  ')}</small></span></span>
                  <span className="tag">Open →</span>
                </a>
              )
            })}
            {!downloads.docs.length && <p>No downloads yet.</p>}
          </div>
        </div>
      </section>
    </Shell>
  )
}
