'use client'
import { useState } from 'react'

export function LeadForm({ exams }: { exams: string[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState('sending')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong')
      setState('ok')
      setMsg('Thank you! Our team will call you shortly.')
      form.reset()
    } catch (err) {
      setState('err')
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>Full name<input name="name" required maxLength={80} placeholder="Your full name" autoComplete="name" /></label>
      <label>Phone<input name="phone" type="tel" required pattern="[0-9+\s-]{10,15}" placeholder="10-digit mobile" autoComplete="tel" /></label>
      <label>Email<input name="email" type="email" placeholder="you@email.com" autoComplete="email" /></label>
      <label>Exam
        <select name="exam" defaultValue={exams[0]}>
          {exams.map((x) => <option key={x}>{x}</option>)}
        </select>
      </label>
      {/* Hidden field that only bots fill in */}
      <input name="company" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn btn-navy full" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Request Free Call'}
      </button>
      {state === 'ok' || state === 'err' ? (
        <div role="status" className={`form-msg full ${state === 'ok' ? 'ok' : 'err'}`}>{msg}</div>
      ) : (
        <span className="full" style={{ fontSize: 13, color: 'var(--muted)' }}>Your details are safe with us. No spam.</span>
      )}
    </form>
  )
}
