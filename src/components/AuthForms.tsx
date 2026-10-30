'use client'
import { useState } from 'react'

async function login(email: string, password: string) {
  const res = await fetch('/api/students/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.errors?.[0]?.message === 'The email or password provided is incorrect.' ? 'Wrong email or password.' : json?.errors?.[0]?.message || 'Could not log in.')
}

export function RegisterForm({ next }: { next: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    setErr('')
    if (!/^[0-9+\s-]{10,15}$/.test(f.phone)) return setErr('Please enter a valid 10-digit mobile number.')
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.')
    if (f.password !== f.confirm) return setErr('Passwords do not match.')
    setBusy(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim().toLowerCase(), password: f.password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = JSON.stringify(json)
        throw new Error(/email/i.test(msg) && /unique|already|registered|exists/i.test(msg) ? 'This email is already registered — please log in.' : json?.errors?.[0]?.message || 'Could not register.')
      }
      await login(f.email.trim().toLowerCase(), f.password)
      window.location.href = next
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <form className="form auth-form" onSubmit={onSubmit}>
      <label className="full">Your name<input name="name" required maxLength={80} autoComplete="name" placeholder="Full name" /></label>
      <label className="full">Mobile number *<input name="phone" type="tel" required autoComplete="tel" placeholder="10-digit mobile" /></label>
      <label className="full">E-mail address *<input name="email" type="email" required autoComplete="email" placeholder="you@email.com" /></label>
      <label>Password *<input name="password" type="password" required minLength={6} autoComplete="new-password" /></label>
      <label>Confirm password *<input name="confirm" type="password" required minLength={6} autoComplete="new-password" /></label>
      {err && <div role="alert" className="form-msg err full">{err}</div>}
      <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Register'}</button>
      <a className="btn btn-ghost-dark" href={`/login?next=${encodeURIComponent(next)}`}>Login</a>
    </form>
  )
}

export function LoginForm({ next }: { next: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    setErr('')
    setBusy(true)
    try {
      await login(f.email.trim().toLowerCase(), f.password)
      window.location.href = next
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setBusy(false)
    }
  }
  return (
    <form className="form auth-form" onSubmit={onSubmit}>
      <label className="full">E-mail address<input name="email" type="email" required autoComplete="email" placeholder="you@email.com" /></label>
      <label className="full">Password<input name="password" type="password" required autoComplete="current-password" /></label>
      <a className="full forgot-link" href="/forgot-password">Forgot password?</a>
      {err && <div role="alert" className="form-msg err full">{err}</div>}
      <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      <a className="btn btn-ghost-dark" href={`/register?next=${encodeURIComponent(next)}`}>Register</a>
    </form>
  )
}

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn btn-ghost-dark btn-sm"
      onClick={async () => {
        await fetch('/api/students/logout', { method: 'POST', credentials: 'include' })
        window.location.href = '/'
      }}
    >
      Log out
    </button>
  )
}

export function ForgotForm() {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') || '').trim().toLowerCase()
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/students/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status >= 500) throw new Error('Could not send the email right now. Please try again in a few minutes.')
      setDone(true) // same message whether or not the email is registered
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }
  if (done)
    return (
      <div className="form-msg ok" role="status" style={{ maxWidth: 520 }}>
        If this email is registered with us, a password reset link has been sent. Please check your inbox (and the Spam folder). The link works for 1 hour.
      </div>
    )
  return (
    <form className="form auth-form" onSubmit={onSubmit}>
      <label className="full">Registered e-mail address<input name="email" type="email" required autoComplete="email" placeholder="you@email.com" /></label>
      {err && <div role="alert" className="form-msg err full">{err}</div>}
      <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
      <a className="btn btn-ghost-dark" href="/login">Back to login</a>
    </form>
  )
}

export function ResetForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    setErr('')
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.')
    if (f.password !== f.confirm) return setErr('Passwords do not match.')
    setBusy(true)
    try {
      const res = await fetch('/api/students/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: f.password }),
      })
      if (!res.ok) throw new Error('This reset link is invalid or has expired. Please ask for a new one.')
      window.location.href = '/account'
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setBusy(false)
    }
  }
  return (
    <form className="form auth-form" onSubmit={onSubmit}>
      <label>New password<input name="password" type="password" required minLength={6} autoComplete="new-password" /></label>
      <label>Confirm new password<input name="confirm" type="password" required minLength={6} autoComplete="new-password" /></label>
      {err && <div role="alert" className="form-msg err full">{err} {err.includes('expired') && <a href="/forgot-password">Send a new link</a>}</div>}
      <button className="btn btn-gold full" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
    </form>
  )
}
