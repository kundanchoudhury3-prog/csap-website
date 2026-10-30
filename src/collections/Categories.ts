import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { slugField } from './fields'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Blog category', plural: 'Blog categories' },
  admin: { useAsTitle: 'title', group: 'Blog & Pages' },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [{ name: 'title', type: 'text', required: true }, slugField],
}
