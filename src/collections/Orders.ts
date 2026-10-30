import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn } from '../access'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders (Razorpay)' },
  admin: {
    useAsTitle: 'customerName',
    group: 'Students & Sales',
    defaultColumns: ['customerName', 'phone', 'course', 'amount', 'status', 'createdAt'],
    description: 'Created automatically when someone pays on the website. Status turns "Paid" only after Razorpay confirms.',
  },
  // Orders are written only by the server (payment routes), never edited by hand.
  access: { read: loggedIn, create: () => false, update: adminOnly, delete: adminOnly },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    { name: 'customerName', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'course', type: 'relationship', relationTo: 'courses' },
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'created',
      options: [
        { label: 'Created (not paid yet)', value: 'created' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'razorpayOrderId', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'razorpayPaymentId', type: 'text', admin: { readOnly: true } },
  ],
}
