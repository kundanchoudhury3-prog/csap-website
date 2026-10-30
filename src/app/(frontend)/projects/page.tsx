/* eslint-disable @next/next/no-img-element */
import { ProjectsShowcase } from '@/components/ProjectsShowcase'
import { toShowcase } from '@/components/projectItems'
import { PageHero, Shell } from '@/components/Shell'
import { listProjects } from '@/lib/content'
import { mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Government Projects | CSAP IAS Academy',
  description: 'Government and institutional projects delivered by CSAP IAS Academy across Assam — with photos and outcomes.',
}

export default async function ProjectsPage() {
  const projects = (await listProjects()).docs
  return (
    <Shell>
      <PageHero eyebrow="Our work" title="Government projects" intro="Programmes we run with government departments and institutions across Assam." />
      {projects.length > 0 && (
        <section className="projects-band" style={{ paddingTop: 48 }}>
          <div className="wrap">
            <ProjectsShowcase items={projects.slice(0, 6).map(toShowcase)} />
          </div>
        </section>
      )}
      <section className="section">
        <div className="wrap grid project-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {projects.map((p, i) => (
            <a key={p.id} href={`/projects/${p.slug}`} className="card reveal" style={{ ['--d' as string]: `${(i % 3) * 0.1}s` }}>
              <div className="thumb">{mediaUrl(p.coverImage, 'card') && <img src={mediaUrl(p.coverImage, 'card')!} alt="" loading="lazy" />}</div>
              <div className="body">
                <span className="tag" style={{ alignSelf: 'flex-start' }}>{p.projectStatus === 'completed' ? 'Completed' : 'Ongoing'}{p.period ? ` · ${p.period}` : ''}</span>
                <h3>{p.title}</h3>
                {p.partner && <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold-text)' }}>{p.partner}</span>}
                <p>{p.summary}</p>
              </div>
            </a>
          ))}
          {!projects.length && <p>Projects will appear here once added in Admin → Government Projects.</p>}
        </div>
      </section>
    </Shell>
  )
}
