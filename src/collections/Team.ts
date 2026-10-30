import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'CSAP Team' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'role', 'subjects', 'showOnHome', 'order'],
    description: 'Director, faculty and mentors shown in the "Meet the team" section and on /team.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'role', type: 'text', required: true, admin: { width: '50%', description: 'e.g. Director, Senior Faculty' } },
        { name: 'experience', type: 'text', admin: { width: '50%', description: 'e.g. 7+ years' } },
      ],
    },
    { name: 'subjects', label: 'Subjects / expertise', type: 'text', admin: { description: 'e.g. History, Art & Culture' } },
    { name: 'photo', label: 'Photo (portrait, at least 600×750)', type: 'upload', relationTo: 'media' },
    {
      name: 'highlights',
      label: 'Qualifications & highlights',
      type: 'array',
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    { name: 'bio', label: 'Short bio (optional)', type: 'textarea' },
    { name: 'linkedin', label: 'LinkedIn link (optional)', type: 'text' },
    { name: 'showOnHome', label: 'Show on homepage', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
