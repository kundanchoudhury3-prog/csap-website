import { PageHero, Shell } from '@/components/Shell'

export default function NotFound() {
  return (
    <Shell>
      <PageHero eyebrow="404" title="This page could not be found" intro="It may have moved. Try the blog or our free resources.">
        <div className="cta-row">
          <a className="btn btn-gold" href="/">Go to homepage</a>
          <a className="btn btn-ghost" href="/resources-archive">Free resources</a>
        </div>
      </PageHero>
    </Shell>
  )
}
