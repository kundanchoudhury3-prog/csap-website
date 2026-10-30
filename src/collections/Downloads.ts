import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn } from '../access'

export const Downloads: CollectionConfig = {
  slug: 'downloads',
  labels: { singular: 'Download', plural: 'Downloads log' },
  admin: {
    useAsTitle: 'title',
    group: 'Students & Sales',
    defaultColumns: ['student', 'title', 'resourceType', 'action', 'createdAt'],
    description: 'Every time a registered student opens or downloads a free resource. Filter by student or resource.',
  },
  // Written only by the website itself, never by hand.
  access: { read: loggedIn, create: () => false, update: () => false, delete: adminOnly },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'students', required: true, index: true },
    { name: 'resource', type: 'relationship', relationTo: 'resources', index: true },
    { name: 'title', label: 'Resource', type: 'text' },
    { name: 'resourceType', label: 'Type', type: 'text' },
    {
      name: 'action',
      type: 'select',
      defaultValue: 'download',
      options: [
        { label: 'Downloaded', value: 'download' },
        { label: 'Viewed online', value: 'view' },
      ],
    },
  ],
}
