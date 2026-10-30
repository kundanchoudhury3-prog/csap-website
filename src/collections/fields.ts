import type { Field } from 'payload'

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
  admin: { position: 'sidebar', description: 'Web address part, e.g. the-varman-dynasty. Keep old ones unchanged for Google.' },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const src = (value as string) || (data?.title as string) || ''
        return src
          .toString()
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9ঀ-৿%-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      },
    ],
  },
}

export const seoField: Field = {
  name: 'seo',
  label: 'SEO (Google)',
  type: 'group',
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Title shown in Google. Leave empty to use the page title.' } },
    { name: 'description', type: 'textarea', maxLength: 300 },
  ],
}

export const statusField: Field = {
  name: 'status',
  type: 'select',
  defaultValue: 'published',
  options: [
    { label: 'Published', value: 'published' },
    { label: 'Draft (hidden)', value: 'draft' },
  ],
  admin: { position: 'sidebar' },
}

/** WordPress ID — lets the importer update instead of duplicating when re-run. */
export const wpIdField: Field = {
  name: 'wpId',
  type: 'number',
  index: true,
  admin: { position: 'sidebar', readOnly: true, description: 'Imported from WordPress' },
}
