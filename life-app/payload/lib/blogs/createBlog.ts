import { getPayloadClient } from '../client'
import { slugify } from '../slug'
import { mapBlog } from './mapBlog'

type ImageData = {
  base64: string
  fileName: string
  contentType: string
} | null

export async function createBlog(
  title: string,
  authorId: string,
  imageData: ImageData | null,
  customSlug?: string,
  customDescription?: string,
  content?: string,
  tags?: string[],
  author?: { username?: string; imageURL?: string; role?: string },
) {
  const payload = await getPayloadClient()
  const slug = customSlug || slugify(title)

  const existingTitle = await payload.find({
    collection: 'blogs',
    where: { title: { equals: title } },
    limit: 1,
    overrideAccess: true,
  })
  if (existingTitle.docs[0]) {
    return { error: 'Blog with this title already exists' }
  }

  const existingSlug = await payload.find({
    collection: 'blogs',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  if (existingSlug.docs[0]) {
    return { error: 'A blog with this URL already exists' }
  }

  let coverId: number | string | undefined
  if (imageData?.base64) {
    const base64Data = imageData.base64.includes(',') ? imageData.base64.split(',')[1] : imageData.base64
    const buffer = Buffer.from(base64Data, 'base64')
    const media = await payload.create({
      collection: 'media',
      data: { alt: title },
      file: {
        data: buffer,
        mimetype: imageData.contentType || 'image/jpeg',
        name: imageData.fileName || 'cover.jpg',
        size: buffer.length,
      },
      overrideAccess: true,
    })
    coverId = media.id
  }

  const created = await payload.create({
    collection: 'blogs',
    data: {
      title,
      slug,
      description: customDescription || `A blog post about ${title}`,
      content: content || 'Blog content will be added here.',
      cover: coverId,
      authorId,
      authorUsername: author?.username || '',
      authorImageURL: author?.imageURL || '',
      authorRole: author?.role || '',
      tags: tags && tags.length > 0 ? tags : undefined,
      viewCount: 0,
      isDeleted: false,
    },
    overrideAccess: true,
  })

  return { createdBlog: mapBlog(created) }
}
