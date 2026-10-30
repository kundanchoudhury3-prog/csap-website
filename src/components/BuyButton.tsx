'use client'
import { useRef, useState } from 'react'

type Props = { courseId: number | string; courseTitle: string; label: string; className?: string }

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void }
  }
}

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export function BuyButton({ courseId, courseTitle, label, className = 'btn btn-navy btn-sm' }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function pay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const customer = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    setBusy(true)
    setMsg(null)
    try {
      if (!(await loadCheckout())) throw new Error('Could not load the payment window. Check your internet and try again.')
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...customer }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error || 'Could not start the payment')

      const rzp = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'CSAP IAS Academy',
        description: courseTitle,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: '#0B1A3A' },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(r),
          })
          setMsg(
            v.ok
              ? { ok: true, text: 'Payment successful! Our team will contact you with the next steps.' }
              : { ok: false, text: 'We could not confirm the payment. If money was deducted, please contact us.' },
          )
        },
        modal: { ondismiss: () => setBusy(false) },
      })
      rzp.on('payment.failed', () => setMsg({ ok: false, text: 'Payment failed. Please try again.' }))
      rzp.open()
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Something went wrong' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={() => { setMsg(null); dialog.current?.showModal() }}>
        {label}
      </button>
      <dialog ref={dialog} className="buy-dialog" aria-label={`Enroll in ${courseTitle}`}>
        <form className="form" onSubmit={pay}>
          <div className="full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
            <div>
              <span className="eyebrow">Enroll</span>
              <h3 style={{ margin: '4px 0 0', fontSize: 22 }}>{courseTitle}</h3>
            </div>
            <button type="button" className="close" aria-label="Close" onClick={() => dialog.current?.close()}>×</button>
          </div>
          <label className="full">Full name<input name="name" required maxLength={80} autoComplete="name" /></label>
          <label>Phone<input name="phone" type="tel" required pattern="[0-9+\s-]{10,15}" autoComplete="tel" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <button type="submit" className="btn btn-gold full" disabled={busy}>{busy ? 'Opening payment…' : 'Continue to payment'}</button>
          {msg && <div role="status" className={`form-msg full ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
          <span className="full" style={{ fontSize: 13, color: 'var(--muted)' }}>Secure payment via Razorpay — UPI, cards, net banking.</span>
        </form>
      </dialog>
    </>
  )
}
