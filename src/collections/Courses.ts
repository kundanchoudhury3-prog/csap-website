import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Course', plural: 'Courses' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'fee', 'status', 'order'],
    description: 'Courses shown on the homepage. Lower "Display order" shows first.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar', description: 'Used in the web address, e.g. apsc-cce' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft (hidden)', value: 'draft' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'order', label: 'Display order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['APSC', 'UPSC', 'Interview', 'Govt jobs', 'Study material'].map((v) => ({ label: v, value: v })),
    },
    { name: 'badge', type: 'text', admin: { description: 'Optional label, e.g. "Most popular"' } },
    { name: 'shortDescription', type: 'textarea', required: true, maxLength: 160 },
    { name: 'details', type: 'richText', admin: { description: 'Full course details (optional)' } },
    {
      name: 'modes',
      type: 'select',
      hasMany: true,
      options: ['Live', 'Recorded', 'Offline', 'Mock panel', 'Test series'].map((v) => ({ label: v, value: v })),
    },
    {
      type: 'row',
      fields: [
        { name: 'fee', label: 'Fee (₹)', type: 'number', min: 0, admin: { width: '50%' } },
        { name: 'batchStart', label: 'Batch start date', type: 'date', admin: { width: '50%' } },
      ],
    },
    { name: 'image', label: 'Course image', type: 'upload', relationTo: 'media' },
    {
      name: 'buyEnabled',
      label: 'Show "Enroll / Buy Now" (Razorpay)',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Untick to show an "Enquire" button instead of online payment' },
    },
  ],
}
