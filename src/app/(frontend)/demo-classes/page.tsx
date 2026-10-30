import { DemoVideos } from '@/components/DemoVideos'
import { PageHero, Shell } from '@/components/Shell'
import { listDemoClasses } from '@/lib/content'
import { toDemoVideos } from '@/lib/demoVideos'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Free Demo Classes | CSAP IAS Academy',
  description: 'Watch free UPSC and APSC lectures by CSAP IAS Academy faculty.',
}

export default async function DemoClassesPage() {
  const demos = await listDemoClasses()
  return (
    <Shell>
      <PageHero eyebrow="Free demo classes" title="Learn from CSAP faculty — free" intro="Current affairs, Assam history, polity and more. Click any lecture to watch it here." />
      <section className="section">
        <div className="wrap">
          {demos.docs.length ? <DemoVideos videos={toDemoVideos(demos.docs)} /> : <p>Demo classes will be added soon.</p>}
        </div>
      </section>
    </Shell>
  )
}
