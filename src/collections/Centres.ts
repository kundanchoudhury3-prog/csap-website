import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const Centres: CollectionConfig = {
  slug: 'centres',
  labels: { singular: 'Centre', plural: 'Centres & Gallery' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'city', 'showInSlider', 'order'],
    description: 'Each centre with a photo appears in the big homepage slideshow.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'city', type: 'text', defaultValue: 'Guwahati' },
    { name: 'address', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'mapLink', label: 'Google Maps link', type: 'text' },
    { name: 'photo', label: 'Classroom photo (wide, landscape)', type: 'upload', relationTo: 'media', required: true },
    { name: 'gallery', label: 'More photos', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'showInSlider', label: 'Show in homepage slideshow', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
