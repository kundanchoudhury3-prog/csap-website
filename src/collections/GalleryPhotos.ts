import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const GalleryPhotos: CollectionConfig = {
  slug: 'gallery-photos',
  labels: { singular: 'Gallery photo', plural: 'Gallery' },
  admin: {
    useAsTitle: 'caption',
    group: 'Content',
    defaultColumns: ['image', 'caption', 'album', 'order'],
    description: 'Photos on the /gallery page. Use "Album" to group them (e.g. Our Events, Classroom, Seminars) — each album becomes a tab.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    { name: 'album', type: 'text', required: true, defaultValue: 'Our Events', index: true },
    { name: 'date', type: 'date', admin: { position: 'sidebar' } },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'sourceUrl', type: 'text', index: true, admin: { readOnly: true, position: 'sidebar', description: 'Imported from WordPress' } },
  ],
}
