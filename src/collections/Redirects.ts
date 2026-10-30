import type { CollectionConfig } from 'payload'
import { loggedIn, anyone } from '../access'

const normalise = (v?: string | null) => {
  if (!v) return v
  if (/^https?:\/\//.test(v)) return v
  let p = v.trim().replace(/^https?:\/\/(www\.)?csap\.co\.in/, '')
  if (!p.startsWith('/')) p = '/' + p
  return p.length > 1 ? p.replace(/\/+$/, '') : p
}

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  admin: {
    useAsTitle: 'from',
    group: 'Settings',
    defaultColumns: ['from', 'to', 'permanent'],
    description: 'Send an old web address to a new one, so old links and Google results never break.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [
    { name: 'from', label: 'Old address (e.g. /old-page)', type: 'text', required: true, unique: true, hooks: { beforeValidate: [({ value }) => normalise(value)] } },
    { name: 'to', label: 'New address (e.g. /new-page or full link)', type: 'text', required: true, hooks: { beforeValidate: [({ value }) => normalise(value)] } },
    { name: 'permanent', type: 'checkbox', defaultValue: true, admin: { description: 'Untick for a temporary redirect' } },
  ],
}
