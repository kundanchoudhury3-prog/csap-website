import { Shell } from './Shell'

export function AuthLayout({ pill, title, children }: { pill: string; title: string; children: React.ReactNode }) {
  return (
    <Shell>
      <section className="auth-wrap">
        <div className="auth-card rise">
          <span className="auth-pill">{pill}</span>
          <h1>{title}</h1>
          {children}
        </div>
      </section>
    </Shell>
  )
}
