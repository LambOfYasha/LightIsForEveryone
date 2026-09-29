import { asId } from '../slug'

type Doc = Record<string, any>

export function coverUrl(cover: unknown): string | null {
  if (!cover || typeof cover !== 'object') return null
  const url = (cover as { url?: string }).url
  return url || null
}

export function mapBlog(doc: Doc) {
  const cover = doc.cover && typeof doc.cover === 'object' ? doc.cover : null
  const url = coverUrl(cover)
  const tags = Array.isArray(doc.tags)
    ? doc.tags
        .filter((tag) => tag && typeof tag === 'object')
        .map((tag: Doc) => ({
          _id: asId(tag),
          name: tag.name || '',
          slug: tag.slug || '',
          color: tag.color || 'blue',
        }))
    : []

  return {
    _id: asId(doc),
    _type: 'blog',
    title: doc.title || '',
    slug: doc.slug || '',
    description: doc.description || '',
    content: doc.content || '',
    viewCount: doc.viewCount || 0,
    author: {
      _id: doc.authorId || '',
      username: doc.authorUsername || '',
      imageURL: doc.authorImageURL || '',
      role: doc.authorRole || '',
    },
    createdAt: doc.createdAt,
    publishedAt: doc.createdAt,
    _createdAt: doc.createdAt,
    _updatedAt: doc.updatedAt,
    image: url
      ? {
          url,
          alt: cover?.alt || doc.title || '',
          asset: { url, _ref: '' },
        }
      : undefined,
    imageUrl: url,
    tags,
    isDeleted: Boolean(doc.isDeleted),
  }
}
