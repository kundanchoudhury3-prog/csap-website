/* eslint-disable @next/next/no-img-element */
import { BuyButton } from '@/components/BuyButton'
import { BannerCarousel } from '@/components/BannerCarousel'
import { CentresSlider, type Slide } from '@/components/CentresSlider'
import { CourseArt } from '@/components/CourseArt'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PostCard } from '@/components/PostCard'
import { ProjectsShowcase } from '@/components/ProjectsShowcase'
import { toShowcase } from '@/components/projectItems'
import { listBanners, listPosts, listProjects, listTeam } from '@/lib/content'
import { resourceTypes } from '@/lib/resourceTypes'
import { LeadForm } from '@/components/LeadForm'
import { RevealObserver } from '@/components/RevealObserver'
import { TestimonialsSlider } from '@/components/TestimonialsSlider'
import { TeamSection } from '@/components/TeamSection'
import { formatINR, getHomeData } from '@/lib/data'
import { fallbackCourses, fallbackTestimonials, fallbackToppers } from '@/lib/fallback'
import { mediaAlt, mediaUrl } from '@/lib/media'

// Always show the latest content saved in /admin.
export const dynamic = 'force-dynamic'

const Check = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A6417" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
)

const features = [
  { title: 'Mentorship by IAS officers', text: 'Strategic guidance and insights from experienced officers.', icon: <><path d="M12 3l9 4-9 4-9-4z" /><path d="M7 9v5c0 1.7 2.2 3 5 3s5-1.3 5-3V9" /></> },
  { title: 'Top faculties of India', text: 'Building confidence and consistency, not just subject knowledge.', icon: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2c2.9.4 5 2.9 5 5.8" /></> },
  { title: 'Live + recorded classes', text: 'Learn at your own pace on the CSAP app, from anywhere.', icon: <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M10 9l4 2-4 2z" /><path d="M8 21h8" /></> },
  { title: '24/7 helpline', text: 'Preparation support whenever you need it, round the clock.', icon: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></> },
]

export default async function HomePage() {
  const [{ settings: s, courses, centres, toppers, testimonials }, latest, projects, team, banners] = await Promise.all([getHomeData(), listPosts({ limit: 3 }), listProjects({ homeOnly: true, limit: 8 }), listTeam({ homeOnly: true }), listBanners()])

  // Title with the highlighted words in gold italics
  const title = s.heroTitle || ''
  const hl = s.heroHighlight || ''
  const at = hl ? title.indexOf(hl) : -1
  const heroTitle =
    at >= 0 ? <>{title.slice(0, at)}<em>{hl}</em>{title.slice(at + hl.length)}</> : title

  const heroImg = mediaUrl(s.heroImage, 'hero')

  const slides: Slide[] = centres.length
    ? centres.map((c) => ({ name: c.name, address: c.address, img: mediaUrl(c.photo, 'hero'), alt: mediaAlt(c.photo, `${c.name} classroom`) }))
    : [{ name: 'Our centres across Assam', address: 'Add your centres in Admin → Centres & Gallery', img: null, alt: '' }]

  const tickerItems = toppers.length ? toppers.map((t) => `${t.name} · ${t.rank}`) : fallbackToppers.map((t) => `${t.name} · ${t.rank}`)
  const quotes = testimonials.length ? testimonials : fallbackTestimonials
  const smartbook = s.smartbook
  const sbProduct = smartbook?.product && typeof smartbook.product === 'object' ? smartbook.product : null
  const examOptions = courses.length ? courses.map((c) => c.title) : fallbackCourses.map((c) => c.title)

  return (
    <>
      <RevealObserver />
      {s.announcement?.enabled && s.announcement.text && (
        <div className="topbar">
          {s.announcement.text}
          {s.announcement.link && <> · <a href={s.announcement.link}>{s.announcement.linkLabel || 'View'}</a></>}
        </div>
      )}
      <Header />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="ring" style={{ right: -160, top: -120, width: 520, height: 520 }} />
          <div className="ring" style={{ right: -60, top: -20, width: 320, height: 320 }} />
          <div className="hero-grid wrap">
            <div className="hero-copy">
              {s.heroTag && <span className="pill rise"><span className="pulse" />{s.heroTag}</span>}
              <h1 className="rise" style={{ ['--d' as string]: '.1s' }}>{heroTitle}</h1>
              <p className="rise" style={{ ['--d' as string]: '.22s' }}>{s.heroText}</p>
              <div className="cta-row rise" style={{ ['--d' as string]: '.34s' }}>
                <a href="#courses" className="btn btn-gold">Explore Courses</a>
                <a href="#mentor" className="btn btn-ghost">Book Free Mentorship</a>
              </div>
              {!!s.stats?.length && (
                <div className="stats rise" style={{ ['--d' as string]: '.46s' }}>
                  {s.stats.map((st, i) => <div className="stat" key={i}><b>{st.value}</b><span>{st.label}</span></div>)}
                </div>
              )}
            </div>
            {heroImg && (
              <div className="hero-visual rise" style={{ ['--d' as string]: '.22s' }}>
                <div className="hero-photo">
                  <img src={heroImg} alt={mediaAlt(s.heroImage, 'CSAP IAS Academy students')} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FEATURED COURSE / TEST BANNERS */}
        {banners.docs.length > 0 && (
          <section className="featured" aria-label="Featured courses and tests">
            <BannerCarousel
              banners={banners.docs
                .map((b) => ({ title: b.title, img: mediaUrl(b.image, 'hero') || mediaUrl(b.image) || '', link: b.link || '', newTab: b.newTab }))
                .filter((b) => b.img)}
            />
          </section>
        )}

        {/* RESULTS TICKER */}
        <section id="results" className="ticker" aria-label="Recent toppers">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((t, i) => <span key={i} aria-hidden={i >= tickerItems.length}>★ {t}</span>)}
          </div>
        </section>

        {/* COURSES */}
        <section id="courses" className="section">
          <div className="wrap">
            <div className="head-row reveal">
              <div className="head">
                <span className="eyebrow">Our Programmes</span>
                <h2 className="h2">A clear path for every exam</h2>
              </div>
            </div>
            <div className="grid">
              {(courses.length ? courses : fallbackCourses).map((c, i) => {
                const img = 'image' in c ? mediaUrl(c.image, 'card') : null
                const id = 'id' in c ? c.id : null
                const fee = 'fee' in c ? formatINR(c.fee) : null
                const canBuy = id && fee && ('buyEnabled' in c ? c.buyEnabled : false)
                return (
                  <article key={id ?? c.title} className="card course reveal" style={{ ['--d' as string]: `${i * 0.12}s` }}>
                    <div className={`course-art${img ? ' photo' : ''}`}>
                      {img ? <img src={img} alt={'image' in c ? mediaAlt(c.image, c.title) : c.title} loading="lazy" /> : <CourseArt category={c.category} />}
                      {img && <span className="course-art-tag">{c.category}</span>}
                      <span className="shine" aria-hidden="true" />
                    </div>
                    {c.badge && <span className={`badge${i === 0 ? ' gold' : ''}`}>{c.badge}</span>}
                    <h3>{c.title}</h3>
                    <p>{c.shortDescription}</p>
                    {!!c.modes?.length && <div className="chips">{c.modes.map((m) => <span key={m}>{m}</span>)}</div>}
                    <div className="course-foot">
                      <span className="price">{fee ?? 'Call for fees'}</span>
                      {canBuy ? (
                        <BuyButton courseId={id!} courseTitle={c.title} label="Enroll" />
                      ) : (
                        <a href="#mentor" className="btn btn-navy btn-sm">Enquire</a>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section id="why" className="section tight">
          <div className="wrap">
            <div className="head reveal">
              <span className="eyebrow">Why choose CSAP</span>
              <h2 className="h2">Not just teaching — a complete strategy</h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {features.map((f, i) => (
                <div key={f.title} className="card feature reveal" style={{ ['--d' as string]: `${i * 0.1}s` }}>
                  <span className="ico"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F2D9A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg></span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM */}
        {team.docs.length > 0 && (
          <section id="team" className="section tight">
            <div className="wrap">
              <div className="head-row reveal">
                <div className="head">
                  <span className="eyebrow">CSAP Team</span>
                  <h2 className="h2">Meet the people behind your preparation</h2>
                </div>
                <a href="/team" className="link-strong">Full team →</a>
              </div>
              <TeamSection members={team.docs} />
            </div>
          </section>
        )}

        {/* GOVERNMENT PROJECTS */}
        {projects.docs.length > 0 && (
          <section id="projects" className="projects-band">
            <div className="wrap">
              <div className="head-row reveal">
                <div className="head">
                  <span className="eyebrow">Our work on the ground</span>
                  <h2 className="h2">Government projects</h2>
                </div>
                <a href="/projects" className="link-strong">All projects →</a>
              </div>
              <ProjectsShowcase items={projects.docs.map(toShowcase)} />
            </div>
          </section>
        )}

        {/* SMARTBOOK */}
        {smartbook?.enabled && (
          <section id="smartbook" className="section tight">
            <div className="wrap band reveal">
              <div className="band-copy">
                <span className="eyebrow">Study material</span>
                <h2 className="h2">{smartbook.title}</h2>
                {smartbook.text && <p>{smartbook.text}</p>}
                <div className="counts">
                  {smartbook.prelims ? <div className="stat"><b>{smartbook.prelims}</b><span>Prelims Smartbooks</span></div> : null}
                  {smartbook.mains ? <div className="stat"><b>{smartbook.mains}</b><span>Mains Smartbooks</span></div> : null}
                </div>
                <div className="cta-row" style={{ alignItems: 'center' }}>
                  {sbProduct && formatINR(sbProduct.fee) ? (
                    <BuyButton courseId={sbProduct.id} courseTitle={sbProduct.title} label={`Buy Now · ${formatINR(sbProduct.fee)}`} className="btn btn-gold" />
                  ) : (
                    <a href="#mentor" className="btn btn-gold">Enquire Now</a>
                  )}
                  <span className="note-dark">Secure payment via Razorpay</span>
                </div>
              </div>
              <div className="band-visual">
                <div className="ph">{mediaUrl(smartbook.image, 'card') && <img src={mediaUrl(smartbook.image, 'card')!} alt={mediaAlt(smartbook.image, smartbook.title || '')} />}</div>
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        <section className="section tight">
          <div className="wrap">
            <div className="head reveal">
              <span className="eyebrow">Success stories</span>
              <h2 className="h2">In our toppers&apos; own words</h2>
            </div>
            <div className="reveal">
              <TestimonialsSlider
                items={quotes.map((q) => ({ name: q.name, rank: q.rank, quote: q.quote, photo: 'photo' in q ? mediaUrl(q.photo, 'card') : null }))}
              />
            </div>
          </div>
        </section>

        {/* FREE RESOURCES */}
        <section className="section tight">
          <div className="wrap">
            <div className="head-row reveal">
              <div className="head">
                <span className="eyebrow">Free resources</span>
                <h2 className="h2">Question papers, news analysis &amp; more</h2>
              </div>
              <a href="/resources-archive" className="link-strong">All resources →</a>
            </div>
            <div className="filters reveal">
              {resourceTypes.map((t) => <a key={t.value} className="tag" style={{ fontSize: 14, padding: '10px 16px' }} href={`/resources-archive/${t.listPath}`}>{t.label}</a>)}
            </div>
          </div>
        </section>

        {/* LATEST BLOG */}
        {latest.docs.length > 0 && (
          <section className="section tight">
            <div className="wrap">
              <div className="head-row reveal">
                <div className="head">
                  <span className="eyebrow">From the blog</span>
                  <h2 className="h2">Latest preparation notes</h2>
                </div>
                <a href="/blogs" className="link-strong">Read the blog →</a>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
                {latest.docs.map((p, i) => <PostCard key={p.id} post={p} i={i} />)}
              </div>
            </div>
          </section>
        )}

        {/* CENTRES SLIDESHOW */}
        {centres.length > 0 && (
        <section id="centres" className="centres section tight" aria-label="Our centres">
          <div className="wrap">
            <CentresSlider slides={slides} />
            <div className="slider-foot">
              <span>Multiple centres across Assam — find the one nearest to you.</span>
              <a href="#contact" className="link-strong" style={{ color: 'var(--navy)' }}>Contact a centre →</a>
            </div>
          </div>
        </section>
        )}

        {/* LEAD FORM */}
        <section id="mentor" className="section tight">
          <div className="wrap panel reveal">
            <div className="panel-copy">
              <span className="eyebrow">Free Mentorship</span>
              <h2 className="h2">Build your preparation plan — for free</h2>
              <p>Share your details and our team will call you to suggest the right course and strategy.</p>
              <div className="ticks">
                <span><Check />One-on-one counselling call</span>
                <span><Check />Exam pattern + study plan</span>
                <span><Check />Batch and fee details</span>
              </div>
            </div>
            <LeadForm exams={examOptions} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
