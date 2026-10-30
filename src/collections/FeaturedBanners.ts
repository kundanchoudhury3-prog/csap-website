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
      type: 'text',
      required: true,
      defaultValue: '/#courses',
      admin: { description: 'Where a click goes: a course/test page or app link, e.g. https://csapiasacademy.akamai.net.in/new-courses/165 or /#courses' },
    },
    { name: 'newTab', label: 'Open in a new tab', type: 'checkbox', defaultValue: false },
    { name: 'active', label: 'Show on website', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'sourceUrl', type: 'text', index: true, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
