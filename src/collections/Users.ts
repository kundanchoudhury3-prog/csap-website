import type { CollectionConfig } from 'payload'
import { adminOnly, isAdmin, isStaff, loggedIn } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Team member', plural: 'Team members' },
  admin: { useAsTitle: 'email', group: 'Settings', defaultColumns: ['name', 'email', 'role'] },
  auth: true,
  access: {
    read: loggedIn,
    create: adminOnly,
    update: ({ req, id }) => isAdmin(req) || (isStaff(req) && req.user?.id === id),
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin (full control)', value: 'admin' },
        { label: 'Staff (content & leads)', value: 'staff' },
      ],
      access: { update: ({ req }) => isAdmin(req) },
    },
  ],
}
