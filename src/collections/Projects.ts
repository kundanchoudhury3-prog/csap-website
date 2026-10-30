import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { seoField, slugField, statusField } from './fields'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Government Projects' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'partner', 'projectStatus', 'showOnHome', 'order'],
    description:
      'Government / institutional projects. Projects with "Show on homepage" ticked appear in the big homepage slideshow; every project has its own page at /projects/<slug>.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    statusField,
    { name: 'showOnHome', label: 'Show on homepage slideshow', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        { name: 'partner', label: 'Department / partner', type: 'text', admin: { width: '50%', description: 'e.g. Bodoland Territorial Council' } },
        { name: 'location', type: 'text', admin: { width: '50%', description: 'e.g. Kokrajhar, Assam' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'period', label: 'Period', type: 'text', admin: { width: '50%', description: 'e.g. 2024 – 2025' } },
        {
          name: 'projectStatus',
          label: 'Project status',
          type: 'select',
          defaultValue: 'ongoing',
          options: [
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Completed', value: 'completed' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'summary', label: 'Short summary (shown on the slideshow)', type: 'textarea', required: true, maxLength: 260 },
    {
      name: 'coverImage',
      label: 'Big cover photo (wide, landscape — ideally 1920×1080)',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'highlights',
      label: 'Key numbers',
      type: 'array',
      maxRows: 4,
      admin: { description: 'e.g. "500+" / "Students trained", "12" / "Districts covered"' },
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    { name: 'content', label: 'Project story (what was done, impact)', type: 'richText' },
    {
      name: 'gallery',
      label: 'Photo gallery',
      type: 'array',
      admin: { description: 'Add as many photos as you like — they appear as a grid that opens full screen.' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    seoField,
  ],
}
