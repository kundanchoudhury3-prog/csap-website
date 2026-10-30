import type { CollectionConfig } from 'payload'
import { adminOnly, anyone, isStaff, staffOrSelf } from '../access'

export const Students: CollectionConfig = {
  slug: 'students',
  labels: { singular: 'Student', plural: 'Students (registered)' },
  admin: {
    useAsTitle: 'name',
    group: 'Students & Sales',
    defaultColumns: ['name', 'phone', 'email', 'createdAt'],
    listSearchableFields: ['name', 'phone', 'email'],
    description: 'Students who registered on the website to download free resources. Open a student to see everything they downloaded.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // stay logged in for 30 days
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    admin: () => false, // students can never open /admin
    create: anyone, // the website register form
    read: staffOrSelf,
    update: staffOrSelf,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    { name: 'phone', label: 'Mobile number', type: 'text', required: true, maxLength: 15, index: true },
    {
      name: 'downloads',
      label: 'Downloads by this student',
      type: 'join',
      collection: 'downloads',
      on: 'student',
      admin: { defaultColumns: ['title', 'resourceType', 'action', 'createdAt'] },
      access: { read: ({ req }) => isStaff(req) },
    },
  ],
}
