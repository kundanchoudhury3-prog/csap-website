import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const Toppers: CollectionConfig = {
  slug: 'toppers',
  labels: { singular: 'Topper', plural: 'Results & Toppers' },
  admin: { useAsTitle: 'name', group: 'Content', defaultColumns: ['name', 'rank', 'year', 'showInTicker'] },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'rank', type: 'text', required: true, admin: { description: 'e.g. ACS Rank 26' } },
    { name: 'exam', type: 'text', admin: { description: 'e.g. APSC CCE 2024' } },
    { name: 'year', type: 'number' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'showInTicker', label: 'Show in the gold results strip', type: 'checkbox', defaultValue: true },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
