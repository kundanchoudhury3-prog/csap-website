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
    forgotPassword: {
      expiration: 60 * 60 * 1000, // link works for 1 hour
      generateEmailSubject: () => 'Reset your CSAP IAS Academy password',
      generateEmailHTML: (args) => {
        const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://csap.co.in'
        const url = `${site}/reset-password?token=${encodeURIComponent(args?.token || '')}`
        const name = String((args?.user as { name?: string } | undefined)?.name || 'Student').split(' ')[0]
        return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0b1a3a">
  <h2 style="margin:0 0 12px">Hello ${name.replace(/[<>&"]/g, '')},</h2>
  <p>We received a request to reset the password of your CSAP IAS Academy account.</p>
  <p style="margin:28px 0"><a href="${url}" style="background:#d9a441;color:#0b1a3a;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Set a new password</a></p>
  <p style="color:#4a5571;font-size:14px">This link works for 1 hour. If you did not ask for this, you can ignore this email.</p>
  <p style="color:#4a5571;font-size:13px">CSAP IAS Academy · csap.co.in</p>
</div>`
      },
    },
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
