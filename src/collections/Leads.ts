import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn } from '../access'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'name',
    group: 'Students & Sales',
    defaultColumns: ['name', 'phone', 'exam', 'status', 'createdAt'],
    description: 'Every "Free Mentorship" form submission from the website lands here.',
  },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: adminOnly },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'exam', type: 'text' },
    { name: 'source', type: 'text', defaultValue: 'Website', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'Not interested', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'notes', type: 'textarea', admin: { description: 'Call notes from the counsellor' } },
  ],
}
