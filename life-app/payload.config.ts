import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'
import type { Plugin } from 'payload'

import { CmsUsers } from './payload/collections/CmsUsers'
import { Media } from './payload/collections/Media'
import { Tags } from './payload/collections/Tags'
import { Blogs } from './payload/collections/Blogs'
import { LessonCategories } from './payload/collections/LessonCategories'
import { Lessons } from './payload/collections/Lessons'
import { Pages } from './payload/collections/Pages'
import { SiteSettings } from './payload/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const plugins: Plugin[] = []

if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      },
    }),
  )
} else if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  )
}

export default buildConfig({
  admin: {
    user: CmsUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Light Is For Everyone',
    },
  },
  routes: {
    admin: '/admin',
    api: '/cms-api',
  },
  collections: [CmsUsers, Media, Tags, Blogs, LessonCategories, Lessons, Pages],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || 'dev-only-change-me',
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  sharp,
  plugins,
})
