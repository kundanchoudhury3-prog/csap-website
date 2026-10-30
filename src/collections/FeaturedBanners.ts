import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const FeaturedBanners: CollectionConfig = {
  slug: 'featured-banners',
  labels: { singular: 'Featured banner', plural: 'Featured Banners' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'image', 'link', 'active', 'order'],
    description: 'Course / test banners in the sliding carousel below the homepage hero. Clicking a banner opens its link.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'For your reference and for screen readers, e.g. "Prelims Test Series 2026"' } },
    { name: 'image', label: 'Banner image (landscape 16:9, e.g. 1600×900)', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'link',
      label: 'Course / test link (opens when the banner is clicked)',
      type: 'text',
      admin: {
        description:
          'Paste the course or test page address, e.g. https://csapiasacademy.akamai.net.in/new-courses/165. Leave empty and the banner just shows (not clickable).',
      },
    },
    { name: 'newTab', label: 'Open link in a new tab', type: 'checkbox', defaultValue: true },
    { name: 'active', label: 'Show on website', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'sourceUrl', type: 'text', index: true, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
