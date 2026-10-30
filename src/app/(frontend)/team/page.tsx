import { PageHero, Shell } from '@/components/Shell'
import { TeamSection } from '@/components/TeamSection'
import { listTeam } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Our Team — Director & Faculty | CSAP IAS Academy',
  description: 'Meet the director, senior faculty and mentors of CSAP IAS Academy, Guwahati.',
}

export default async function TeamPage() {
  const team = await listTeam()
  return (
    <Shell>
      <PageHero eyebrow="CSAP Team" title="The people behind your preparation" intro="Experienced faculty and mentors guiding UPSC and APSC aspirants across Assam." />
      <section className="section">
        <div className="wrap">
          {team.docs.length ? <TeamSection members={team.docs} /> : <p>Team members will appear here once added in Admin → CSAP Team.</p>}
        </div>
      </section>
    </Shell>
  )
}
