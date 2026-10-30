import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: { useAsTitle: 'name', group: 'Content', defaultColumns: ['name', 'rank', 'featured'] },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'rank', type: 'text', admin: { description: 'e.g. APS Rank 04' } },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'featured', label: 'Show on homepage', type: 'checkbox', defaultValue: true },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
