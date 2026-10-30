import type { GlobalConfig } from 'payload'
import { anyone, loggedIn } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Homepage & Site Settings',
  admin: { group: 'Settings' },
  access: { read: anyone, update: loggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Top bar & Hero',
          fields: [
            { name: 'logo', label: 'Logo (transparent PNG, shown in the header)', type: 'upload', relationTo: 'media' },
            {
              name: 'announcement',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                { name: 'text', type: 'text', defaultValue: 'APSC CCE Smartbook now available — 10 Prelims + 7 Mains Smartbooks' },
                { name: 'linkLabel', type: 'text', defaultValue: 'View now' },
                { name: 'link', type: 'text', defaultValue: '#smartbook' },
              ],
            },
            { name: 'heroTag', type: 'text', defaultValue: 'UPSC · APSC · SSC · Banking' },
            { name: 'heroTitle', type: 'text', defaultValue: "North-East's No. 1 Choice for Civil Services Success" },
            { name: 'heroHighlight', type: 'text', defaultValue: 'Civil Services', admin: { description: 'Words from the title shown in gold italics' } },
            {
              name: 'heroText',
              type: 'textarea',
              defaultValue:
                'Prep smart with CSAP IAS Academy. Attend live sessions or watch recorded classes at your convenience, and get the best civil services resources in Assam.',
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            {
              name: 'stats',
              type: 'array',
              maxRows: 4,
              defaultValue: [
                { value: '50%+', label: 'Selection rate' },
                { value: '7 yrs', label: 'Trusted across Assam' },
                { value: '24/7', label: 'Helpline support' },
              ],
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Smartbook',
          fields: [
            {
              name: 'smartbook',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                { name: 'title', type: 'text', defaultValue: 'APSC CCE Smartbook' },
                { name: 'text', type: 'textarea', defaultValue: 'A complete set for the Assam-specific syllabus. Order from home.' },
                { name: 'prelims', label: 'Prelims books', type: 'number', defaultValue: 10 },
                { name: 'mains', label: 'Mains books', type: 'number', defaultValue: 7 },
                { name: 'image', type: 'upload', relationTo: 'media' },
                {
                  name: 'product',
                  label: 'Course record to sell (sets the price)',
                  type: 'relationship',
                  relationTo: 'courses',
                },
              ],
            },
          ],
        },
        {
          label: 'Contact & Footer',
          fields: [
            { name: 'address', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'phone', label: 'Phone 1', type: 'text', admin: { width: '50%' } },
                { name: 'phone2', label: 'Phone 2', type: 'text', admin: { width: '50%' } },
              ],
            },
            { name: 'email', type: 'email' },
            { name: 'whatsapp', type: 'text', admin: { description: 'Number with country code, e.g. 919XXXXXXXXX' } },
            { name: 'appLink', label: 'App download link', type: 'text' },
            {
              name: 'follow',
              label: 'Follow us (social media links — leave empty to hide an icon)',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'facebook', type: 'text', admin: { width: '33%' } },
                    { name: 'instagram', type: 'text', admin: { width: '33%' } },
                    { name: 'youtube', label: 'YouTube', type: 'text', admin: { width: '33%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'telegram', type: 'text', admin: { width: '33%' } },
                    { name: 'x', label: 'X (Twitter)', type: 'text', admin: { width: '33%' } },
                    { name: 'linkedin', label: 'LinkedIn', type: 'text', admin: { width: '33%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
