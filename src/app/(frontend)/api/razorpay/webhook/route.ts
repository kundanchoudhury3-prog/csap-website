import config from '@payload-config'
import { getPayload } from 'payload'
import { isValidWebhookSignature } from '@/lib/razorpay'

// Backup confirmation straight from Razorpay's servers — works even if the
// student closes the browser right after paying.
export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''
  if (!isValidWebhookSignature(raw, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(raw)
  const payment = event?.payload?.payment?.entity
  const orderId: string | undefined = payment?.order_id
  if (!orderId) return Response.json({ ok: true })

  const status =
    event.event === 'payment.captured' || event.event === 'order.paid'
      ? 'paid'
      : event.event === 'payment.failed'
        ? 'failed'
        : null

  if (status) {
    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'orders',
      where: { razorpayOrderId: { equals: orderId } },
      limit: 1,
      overrideAccess: true,
    })
    const doc = existing.docs[0]
    // Never downgrade an order that is already paid.
    if (doc && !(doc.status === 'paid' && status === 'failed')) {
      await payload.update({
        collection: 'orders',
        id: doc.id,
        data: { status, razorpayPaymentId: payment.id },
        overrideAccess: true,
      })
    }
  }
  return Response.json({ ok: true })
}
