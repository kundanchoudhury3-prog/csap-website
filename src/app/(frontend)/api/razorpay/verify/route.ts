import config from '@payload-config'
import { getPayload } from 'payload'
import { isValidPaymentSignature } from '@/lib/razorpay'

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json().catch(() => ({}))
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ error: 'Missing payment details' }, { status: 400 })
  }
  if (!isValidPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return Response.json({ error: 'Payment could not be verified' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  await payload.update({
    collection: 'orders',
    where: { razorpayOrderId: { equals: razorpay_order_id } },
    data: { status: 'paid', razorpayPaymentId: razorpay_payment_id },
    overrideAccess: true,
  })
  return Response.json({ ok: true })
}
