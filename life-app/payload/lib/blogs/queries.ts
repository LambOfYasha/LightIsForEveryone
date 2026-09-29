import type { Where } from 'payload'
import { getPayloadClient } from '../client'
import { asId } from '../slug'
import { mapBlog } from './mapBlog'

export async function getBlogs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'blogs',
    where: { isDeleted: { not_equals: true } },
    sort: '-createdAt',
    depth: 1,
    limit: 200,
    overrideAccess: true,
  })
  return result.docs.map(mapBlog)
}

export async function getBlogsServer() {
  return getBlogs()
}

export async function getBlogBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'blogs',
    where: {
      and: [{ slug: { equals: slug } }, { isDeleted: { not_equals: true } }],
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const doc = result.docs[0]
  return doc ? mapBlog(doc) : null
}

export async function getBlogById(id: string) {
  const payload = await getPayloadClient()
  try {
    const doc = await payload.findByID({
      collection: 'blogs',
      id,
      depth: 1,
      overrideAccess: true,
    })
    return doc ? mapBlog(doc) : null
  } catch {
    return null
  }
}

export async function getBlogsByTag(tagSlug: string) {
  const payload = await getPayloadClient()
  const tags = await payload.find({
    collection: 'tags',
    where: { slug: { equals: tagSlug } },
    limit: 1,
    overrideAccess: true,
  })
  const tag = tags.docs[0]
  if (!tag) return []
  const result = await payload.find({
    collection: 'blogs',
    where: {
      and: [{ isDeleted: { not_equals: true } }, { tags: { contains: tag.id } }],
    },
    sort: '-createdAt',
    depth: 1,
    limit: 200,
    overrideAccess: true,
  })
  return result.docs.map(mapBlog)
}

export async function searchBlogs(searchTerm: string, limit: number) {
  const payload = await getPayloadClient()
  const where: Where = {
    and: [
      { isDeleted: { not_equals: true } },
      {
        or: [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { content: { contains: searchTerm } },
        ],
      },
    ],
  }
  const result = await payload.find({
    collection: 'blogs',
    where,
    sort: '-createdAt',
    depth: 1,
    limit,
    overrideAccess: true,
  })
  return result.docs.map((doc) => {
    const blog = mapBlog(doc)
    const text = String(blog.content || '').replace(/<[^>]+>/g, ' ')
    return { ...blog, _type: 'blog', excerpt: text.slice(0, 180).trim() }
  })
}

export async function countBlogs() {
  const payload = await getPayloadClient()
  const result = await payload.count({
    collection: 'blogs',
    where: { isDeleted: { not_equals: true } },
    overrideAccess: true,
  })
  return result.totalDocs
}

export async function incrementBlogViews(id: string) {
  const payload = await getPayloadClient()
  const doc = await payload.findByID({ collection: 'blogs', id, overrideAccess: true })
  const viewCount = Number(doc.viewCount || 0) + 1
  const updated = await payload.update({
    collection: 'blogs',
    id,
    data: { viewCount },
    overrideAccess: true,
  })
  return mapBlog(updated)
}

export { asId }
