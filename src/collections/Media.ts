import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image / File', plural: 'Media Library' },
  admin: { group: 'Content' },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    {
      name: 'alt',
      label: 'Description (for Google & screen readers)',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceUrl',
      label: 'Original WordPress address',
      type: 'text',
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'card', width: 640 },
      { name: 'hero', width: 1600 },
    ],
  },
}
