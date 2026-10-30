import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { resourceTypes } from '../lib/resourceTypes'
import { seoField, slugField, statusField, wpIdField } from './fields'

export const Resources: CollectionConfig = {
  slug: 'resources',
  labels: { singular: 'Resource / PDF', plural: 'Resources (PDFs)' },
  admin: {
    useAsTitle: 'title',
    group: 'Resources',
    defaultColumns: ['title', 'type', 'date', 'status'],
    listSearchableFields: ['title', 'slug'],
    description: 'Daily news analysis, question papers, monthly magazines, sample smartbooks and syllabus PDFs.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: '-date',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    statusField,
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: resourceTypes.map((t) => ({ label: t.label, value: t.value })),
      admin: { position: 'sidebar' },
    },
    { name: 'date', type: 'date', defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar' } },
    {
      name: 'tags',
      label: 'Categories (e.g. APSC, Sociology, GS-I)',
      type: 'text',
      hasMany: true,
    },
    { name: 'file', label: 'PDF / file', type: 'upload', relationTo: 'media' },
    {
      name: 'externalUrl',
      label: 'Or a link to the file',
      type: 'text',
      admin: { description: 'Used only when no file is uploaded above' },
    },
    { name: 'description', type: 'textarea' },
    seoField,
    wpIdField,
  ],
}
