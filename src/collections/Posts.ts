import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { seoField, slugField, statusField, wpIdField } from './fields'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog post', plural: 'Blog posts' },
  admin: {
    useAsTitle: 'title',
    group: 'Blog & Pages',
    defaultColumns: ['title', 'type', 'status', 'publishedAt'],
    description: 'Blog posts open at csap.co.in/<slug>. Announcements open at csap.co.in/announcements/<slug>.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    statusField,
    {
      name: 'type',
      type: 'select',
      defaultValue: 'blog',
      options: [
        { label: 'Blog post', value: 'blog' },
        { label: 'Announcement', value: 'announcement' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'textarea', admin: { description: 'Short summary for the blog list (optional)' } },
    { name: 'content', type: 'richText' },
    { name: 'ctaLink', label: 'Button link (e.g. enroll / payment page)', type: 'text' },
    seoField,
    wpIdField,
  ],
}
