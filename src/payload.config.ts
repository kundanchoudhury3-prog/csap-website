import { postgresAdapter } from '@payloadcms/db-postgres'
import { EXPERIMENTAL_TableFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Courses } from './collections/Courses'
import { Centres } from './collections/Centres'
import { Toppers } from './collections/Toppers'
import { Testimonials } from './collections/Testimonials'
import { Leads } from './collections/Leads'
import { Orders } from './collections/Orders'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Pages } from './collections/Pages'
import { Resources } from './collections/Resources'
import { Redirects } from './collections/Redirects'
import { Projects } from './collections/Projects'
import { GalleryPhotos } from './collections/GalleryPhotos'
import { Team } from './collections/Team'
import { FeaturedBanners } from './collections/FeaturedBanners'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || '',
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — CSAP Admin' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [FeaturedBanners, Courses, Team, Projects, GalleryPhotos, Centres, Toppers, Testimonials, Posts, Categories, Pages, Resources, Media, Leads, Orders, Redirects, Users],
  globals: [SiteSettings],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Creates/updates the database tables automatically when the live site starts.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Images & PDFs are stored in Cloudflare R2 (S3-compatible) when R2 keys are set.
    // Without keys (e.g. on your computer) files are saved in the local /media folder.
    s3Storage({
      enabled: Boolean(process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID),
      collections: {
        media: process.env.R2_PUBLIC_URL
          ? { generateFileURL: ({ filename, prefix }) => [process.env.R2_PUBLIC_URL, prefix, filename].filter(Boolean).join('/') }
          : true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
    }),
    // Fallback on Vercel when R2 is not set up yet: Vercel Blob (token is added when a Blob store is connected).
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN) && !(process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
