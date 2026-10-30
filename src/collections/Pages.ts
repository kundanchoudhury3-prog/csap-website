import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { seoField, slugField, statusField, wpIdField } from './fields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    group: 'Blog & Pages',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    description:
      'Simple pages such as About Us, a course page or a project page — open at csap.co.in/<slug>. Draft pages temporarily send visitors to the homepage.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    statusField,
    { name: 'intro', type: 'textarea', admin: { description: 'Short line under the title' } },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },
    {
      name: 'cta',
      label: 'Button',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'link', type: 'text' },
      ],
    },
    seoField,
    wpIdField,
  ],
}
