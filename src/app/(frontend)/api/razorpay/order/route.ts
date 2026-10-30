import config from '@payload-config'
import { getPayload } from 'payload'
import { razorpay } from '@/lib/razorpay'

const clean = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const courseId = Number(body.courseId)
    const name = clean(body.name, 80)
    const phone = clean(body.phone, 20)
    const email = clean(body.email)
    if (!courseId || !name || !phone) {
      return Response.json({ error: 'Please fill in your name and phone.' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const course = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 }).catch(() => null)
    // The price always comes from the admin panel — never from the browser.
    if (!course || course.status !== 'published' || !course.buyEnabled || !course.fee) {
      return Response.json({ error: 'This course is not available for online payment.' }, { status: 400 })
    }

    const order = await razorpay().orders.create({
      amount: Math.round(course.fee * 100), // paise
      currency: 'INR',
      receipt: `csap_${course.id}_${Date.now()}`,
      notes: { course: course.title, name, phone },
    })

    await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        customerName: name,
        phone,
        email: email || undefined,
        course: course.id,
        amount: course.fee,
        status: 'created',
        razorpayOrderId: order.id,
      },
    })

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Razorpay order error', err)
    return Response.json({ error: 'Could not start the payment. Please try again.' }, { status: 500 })
  }
}
