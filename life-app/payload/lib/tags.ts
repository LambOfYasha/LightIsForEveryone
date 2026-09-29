import { getPayloadClient } from './client'
import { asId, slugify } from './slug'

export async function getTags() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tags',
    sort: 'name',
    limit: 500,
    overrideAccess: true,
  })
  return result.docs.map((tag) => ({
    _id: asId(tag),
    name: tag.name,
    slug: tag.slug,
    color: tag.color || 'blue',
    description: tag.description || '',
    createdAt: tag.createdAt,
    _createdAt: tag.createdAt,
  }))
}

export async function getTagInfo(tagSlug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tags',
    where: { slug: { equals: tagSlug } },
    limit: 1,
    overrideAccess: true,
  })
  const tag = result.docs[0]
  if (!tag) return null
  return {
    _id: asId(tag),
    name: tag.name,
    slug: tag.slug,
    color: tag.color || 'blue',
    description: tag.description || '',
    createdAt: tag.createdAt,
  }
}

export async function createTag(input: { name: string; description?: string; color: string }) {
  const payload = await getPayloadClient()
  const created = await payload.create({
    collection: 'tags',
    data: {
      name: input.name,
      slug: slugify(input.name),
      description: input.description || '',
      color: input.color,
    },
    overrideAccess: true,
  })
  return {
    _id: asId(created),
    name: created.name,
    slug: created.slug,
    color: created.color,
    description: created.description,
    createdAt: created.createdAt,
  }
}
