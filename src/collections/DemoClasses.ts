import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../access'
import { fetchYtTitle, ytId } from '../lib/youtube'

export const DemoClasses: CollectionConfig = {
  slug: 'demo-classes',
  labels: { singular: 'Demo class', plural: 'Demo Classes (YouTube)' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'subject', 'showOnHome', 'active', 'order'],
    description:
      'Free YouTube lectures shown in the "Free demo classes" section and on /demo-classes. Just paste the YouTube link — the title and thumbnail are picked up automatically.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: 'order',
  hooks: {
    beforeChange: [
      async ({ data }) => {
        const id = ytId(data.youtubeUrl)
        if (id) {
          data.videoId = id
          if (!data.title?.trim()) data.title = (await fetchYtTitle(id)) || 'CSAP free demo class'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'youtubeUrl',
      label: 'YouTube video link',
      type: 'text',
      required: true,
      admin: { description: 'e.g. https://youtu.be/xxxxxxxxxxx or https://www.youtube.com/watch?v=xxxxxxxxxxx' },
      validate: (v: string | null | undefined) => (ytId(v) ? true : 'Please paste a valid YouTube video link'),
    },
    { name: 'title', type: 'text', admin: { description: 'Leave empty to use the YouTube title automatically' } },
    { name: 'subject', label: 'Subject / tag', type: 'text', admin: { description: 'Optional, e.g. Polity, Current Affairs, Assam History' } },
    {
      name: 'thumbnail',
      label: 'Custom thumbnail (optional)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Leave empty to use the YouTube thumbnail' },
    },
    { name: 'videoId', type: 'text', admin: { hidden: true } },
    { name: 'showOnHome', label: 'Show on homepage', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'active', label: 'Visible on website', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar', description: 'Smaller number shows first' } },
  ],
}
